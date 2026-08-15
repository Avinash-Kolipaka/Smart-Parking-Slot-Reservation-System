const ParkingLocation = require('../models/ParkingLocation');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');
const AdminLog = require('../models/AdminLog');
const { getAsync, setExAsync, delAsync } = require('../config/redisClient');
const logger = require('../utils/logger');

// @desc    Get all parking locations (with search, geolocation & filter)
// @route   GET /api/parking
// @access  Public
const getParkingLocations = async (req, res, next) => {
  try {
    const {
      search,
      city,
      vehicleType,
      parkingType,
      minPrice,
      maxPrice,
      lat,
      lng,
      maxDistance = 10000, // 10km default
      page = 1,
      limit = 20
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Check Redis cache if no dynamic search terms
    const cacheKey = `parking:list:${city || 'all'}:${vehicleType || 'all'}:${pageNum}:${limitNum}`;
    if (!search && !lat) {
      const cached = await getAsync(cacheKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
    }

    let query = { status: 'Active', isActive: { $ne: false } };

    if (city) {
      query.city = { $regex: new RegExp(city, 'i') };
    }

    // Apply search filter (name, address, city, zipcode, description)
    if (search) {
      const sanitizedSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { address: { $regex: sanitizedSearch, $options: 'i' } },
        { city: { $regex: sanitizedSearch, $options: 'i' } },
        { zipCode: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }

    // Apply vehicle type compatibility filter
    if (vehicleType) {
      query.vehicleTypes = vehicleType;
    }

    // Apply structure type filter
    if (parkingType) {
      query.parkingType = parkingType;
    }

    // Apply price bounds
    if (minPrice || maxPrice) {
      query.pricePerHour = {};
      if (minPrice) query.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
    }

    // Geolocation proximity search using 2dsphere
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance, 10)
        }
      };
    }

    const total = await ParkingLocation.countDocuments(query);
    const locations = await ParkingLocation.find(query)
      .skip(skip)
      .limit(limitNum);

    // Fetch slot counts for all locations in a single aggregation (avoids N+1)
    const locationIds = locations.map(l => l._id);
    const slotCounts = await Slot.aggregate([
      { $match: { parkingLocationId: { $in: locationIds } } },
      { $group: {
        _id: { locationId: '$parkingLocationId', status: '$status' },
        count: { $sum: 1 }
      }}
    ]);

    const countMap = {};
    for (const row of slotCounts) {
      const lid = row._id.locationId.toString();
      if (!countMap[lid]) countMap[lid] = { total: 0, available: 0, occupied: 0 };
      countMap[lid].total += row.count;
      if (row._id.status === 'Available') countMap[lid].available = row.count;
      if (row._id.status === 'Occupied') countMap[lid].occupied = row.count;
    }

    const locationsWithSlotCounts = locations.map(loc => ({
      ...loc.toObject(),
      totalSlots: countMap[loc._id.toString()]?.total || 0,
      availableSlots: countMap[loc._id.toString()]?.available || 0,
      occupiedSlots: countMap[loc._id.toString()]?.occupied || 0
    }));

    const responsePayload = {
      success: true,
      message: 'Parking locations retrieved successfully',
      data: {
        locations: locationsWithSlotCounts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    };

    if (!search && !lat) {
      await setExAsync(cacheKey, 60, JSON.stringify(responsePayload));
    }

    res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single parking location details
// @route   GET /api/parking/:id
// @access  Public
const getParkingLocation = async (req, res, next) => {
  try {
    const cacheKey = `parking:${req.params.id}`;
    const cached = await getAsync(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const location = await ParkingLocation.findOne({
      _id: req.params.id,
      tenantId: req.tenant._id,
      status: 'Active',
      isActive: { $ne: false }
    });

    if (!location) {
      return res.status(404).json({ success: false, message: 'Parking location not found' });
    }

    const slots = await Slot.find({ parkingLocationId: location._id });
    const totalSlots = slots.length;
    const availableSlots = slots.filter(s => s.status === 'Available').length;
    const occupiedSlots = slots.filter(s => s.status === 'Occupied').length;

    const responsePayload = {
      success: true,
      data: {
        ...location.toObject(),
        totalSlots,
        availableSlots,
        occupiedSlots,
        slots
      }
    };

    await setExAsync(cacheKey, 60, JSON.stringify(responsePayload));

    res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

// @desc    Get parking locations listed by the logged in user
// @route   GET /api/parking/my-slots
// @access  Private
const getMyParkingLocations = async (req, res, next) => {
  try {
    const locations = await ParkingLocation.find({
      tenantId: req.tenant._id,
      createdBy: req.user.id,
      isActive: { $ne: false }
    });

    const locationsWithSlotCounts = await Promise.all(
      locations.map(async (loc) => {
        const total = await Slot.countDocuments({ parkingLocationId: loc._id });
        const available = await Slot.countDocuments({ parkingLocationId: loc._id, status: 'Available' });
        const occupied = await Slot.countDocuments({ parkingLocationId: loc._id, status: 'Occupied' });
        const slots = await Slot.find({ parkingLocationId: loc._id });

        return {
          ...loc.toObject(),
          totalSlots: total,
          availableSlots: available,
          occupiedSlots: occupied,
          slots
        };
      })
    );

    res.status(200).json({
      success: true,
      count: locationsWithSlotCounts.length,
      data: locationsWithSlotCounts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create parking location
// @route   POST /api/parking
// @access  Private
const createParkingLocation = async (req, res, next) => {
  try {
    const { coordinates } = req.body;
    let locationPoint = {
      type: 'Point',
      coordinates: [-122.4194, 37.7749]
    };

    if (coordinates && coordinates.lat && coordinates.lng) {
      locationPoint.coordinates = [parseFloat(coordinates.lng), parseFloat(coordinates.lat)];
    }

    const locationData = {
      ...req.body,
      tenantId: req.tenant._id,
      location: locationPoint,
      createdBy: req.user.id
    };

    const location = await ParkingLocation.create(locationData);

    if (req.body.slotNumber || req.body.isApartmentSlot) {
      const initialSlotNumber = req.body.slotNumber || (req.body.apartmentDetails?.unitNumber ? `SLOT-${req.body.apartmentDetails.unitNumber}` : 'A-1');
      await Slot.create({
        parkingLocationId: location._id,
        slotNumber: initialSlotNumber,
        floor: Number(req.body.floor) || 1,
        parkingZone: req.body.parkingZone || 'A',
        vehicleType: (req.body.vehicleTypes && req.body.vehicleTypes[0]) ? req.body.vehicleTypes[0] : 'Car',
        status: 'Available',
        price: location.pricePerHour,
        createdBy: req.user.id
      });

      location.totalSlots = await Slot.countDocuments({ parkingLocationId: location._id });
      await location.save();
    }

    await delAsync(`parking:list:*`);

    const userRole = (req.user.role || '').toUpperCase();
    if (['ADMIN', 'SUPER_ADMIN', 'PARKING_MANAGER', 'admin'].includes(userRole)) {
      await AdminLog.create({
        adminId: req.user.id,
        action: 'CREATE_LOCATION',
        resource: 'ParkingLocation',
        resourceId: location._id.toString(),
        details: `Created parking location '${location.name}' at '${location.address}'`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Parking location created successfully',
      data: location
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update parking location
// @route   PUT /api/parking/:id
// @access  Private
const updateParkingLocation = async (req, res, next) => {
  try {
    let location = await ParkingLocation.findOne({ _id: req.params.id, tenantId: req.tenant._id });
    if (!location) {
      return res.status(404).json({ success: false, message: 'Parking location not found' });
    }

    const userRole = (req.user.role || '').toUpperCase();
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'PARKING_MANAGER', 'admin'].includes(userRole);
    if (!isAdmin && location.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this parking location' });
    }

    if (req.body.coordinates) {
      req.body.location = {
        type: 'Point',
        coordinates: [parseFloat(req.body.coordinates.lng), parseFloat(req.body.coordinates.lat)]
      };
    }

    location = await ParkingLocation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    await delAsync(`parking:${req.params.id}`);
    await delAsync(`parking:list:*`);

    if (isAdmin) {
      await AdminLog.create({
        adminId: req.user.id,
        action: 'UPDATE_LOCATION',
        resource: 'ParkingLocation',
        resourceId: location._id.toString(),
        details: `Updated parking location ID ${location._id} (${location.name})`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Parking location updated successfully',
      data: location
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete parking location (Soft delete if bookings exist)
// @route   DELETE /api/parking/:id
// @access  Private
const deleteParkingLocation = async (req, res, next) => {
  try {
    const location = await ParkingLocation.findOne({
      _id: req.params.id,
      tenantId: req.tenant._id
    });
    if (!location) {
      return res.status(404).json({ success: false, message: 'Parking location not found' });
    }

    const userRole = (req.user.role || '').toUpperCase();
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'PARKING_MANAGER', 'admin'].includes(userRole);
    if (!isAdmin && location.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this parking location' });
    }

    const hasBookings = await Booking.exists({ locationId: location._id });

    if (hasBookings) {
      location.isActive = false;
      location.status = 'Disabled';
      location.deletedAt = new Date();
      await location.save();

      await Slot.updateMany({ parkingLocationId: location._id }, { status: 'Disabled' });
    } else {
      await Slot.deleteMany({ parkingLocationId: location._id });
      await location.deleteOne();
    }

    await delAsync(`parking:${req.params.id}`);
    await delAsync(`parking:list:*`);

    if (isAdmin) {
      await AdminLog.create({
        adminId: req.user.id,
        action: 'DELETE_LOCATION',
        resource: 'ParkingLocation',
        resourceId: req.params.id,
        details: `${hasBookings ? 'Soft-deleted' : 'Hard-deleted'} location '${location.name}'`
      });
    }

    res.status(200).json({
      success: true,
      message: `Location '${location.name}' ${hasBookings ? 'disabled & archived' : 'deleted'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getParkingLocations,
  getParkingLocation,
  getMyParkingLocations,
  createParkingLocation,
  updateParkingLocation,
  deleteParkingLocation
};
