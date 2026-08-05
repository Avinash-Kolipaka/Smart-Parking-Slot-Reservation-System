const ParkingLocation = require('../models/ParkingLocation');
const Slot = require('../models/Slot');
const AdminLog = require('../models/AdminLog');

// @desc    Get all parking locations (with search & filter)
// @route   GET /api/parking
// @access  Public
const getParkingLocations = async (req, res, next) => {
  try {
    const { search, vehicleType, parkingType, minPrice, maxPrice } = req.query;
    let query = { status: 'Active' };

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

    const locations = await ParkingLocation.find(query);

    // Dynamic slot count lookup to attach available vs total details
    const locationsWithSlotCounts = await Promise.all(
      locations.map(async (loc) => {
        const total = await Slot.countDocuments({ parkingLocationId: loc._id });
        const available = await Slot.countDocuments({ parkingLocationId: loc._id, status: 'Available' });
        const occupied = await Slot.countDocuments({ parkingLocationId: loc._id, status: 'Occupied' });
        
        return {
          ...loc.toObject(),
          totalSlots: total,
          availableSlots: available,
          occupiedSlots: occupied
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

// @desc    Get single parking location details
// @route   GET /api/parking/:id
// @access  Public
const getParkingLocation = async (req, res, next) => {
  try {
    const location = await ParkingLocation.findOne({
      _id: req.params.id,
      status: 'Active'
    });
    if (!location) {
      return res.status(404).json({ success: false, message: 'Parking location not found' });
    }

    // Lookup slots configuration
    const slots = await Slot.find({ parkingLocationId: location._id });

    // Aggregate counts
    const totalSlots = slots.length;
    const availableSlots = slots.filter(s => s.status === 'Available').length;
    const occupiedSlots = slots.filter(s => s.status === 'Occupied').length;

    res.status(200).json({
      success: true,
      data: {
        ...location.toObject(),
        totalSlots,
        availableSlots,
        occupiedSlots,
        slots
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get parking locations listed by the logged in user
// @route   GET /api/parking/my-slots
// @access  Private
const getMyParkingLocations = async (req, res, next) => {
  try {
    const locations = await ParkingLocation.find({ createdBy: req.user.id });

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

// @desc    Create parking location (Admin or User Apartment Slot)
// @route   POST /api/parking
// @access  Private
const createParkingLocation = async (req, res, next) => {
  try {
    const locationData = {
      ...req.body,
      createdBy: req.user.id
    };

    const location = await ParkingLocation.create(locationData);

    // If slotNumber or isApartmentSlot is provided, create the initial slot automatically
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

    // Log admin action if admin created it
    if (req.user.role === 'admin') {
      await AdminLog.create({
        adminId: req.user.id,
        action: 'CREATE_LOCATION',
        details: `Created parking location '${location.name}' at '${location.address}'`
      });
    }

    res.status(201).json({
      success: true,
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
    let location = await ParkingLocation.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Parking location not found' });
    }

    // Check ownership or admin status
    if (req.user.role !== 'admin' && location.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this parking location' });
    }

    location = await ParkingLocation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (req.user.role === 'admin') {
      await AdminLog.create({
        adminId: req.user.id,
        action: 'UPDATE_LOCATION',
        details: `Updated parking location ID ${location._id} (${location.name})`
      });
    }

    res.status(200).json({
      success: true,
      data: location
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete parking location
// @route   DELETE /api/parking/:id
// @access  Private
const deleteParkingLocation = async (req, res, next) => {
  try {
    const location = await ParkingLocation.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Parking location not found' });
    }

    // Check ownership or admin status
    if (req.user.role !== 'admin' && location.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this parking location' });
    }

    // Cascade delete slots associated with this location
    await Slot.deleteMany({ parkingLocationId: location._id });
    await location.deleteOne();

    if (req.user.role === 'admin') {
      await AdminLog.create({
        adminId: req.user.id,
        action: 'DELETE_LOCATION',
        details: `Deleted parking location ID ${req.params.id} (${location.name}) and all its slots`
      });
    }

    res.status(200).json({
      success: true,
      message: `Location '${location.name}' and all associated slots deleted successfully`
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
