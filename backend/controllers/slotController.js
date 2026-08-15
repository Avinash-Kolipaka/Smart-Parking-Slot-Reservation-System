const Slot = require('../models/Slot');
const ParkingLocation = require('../models/ParkingLocation');
const AdminLog = require('../models/AdminLog');
const { notifySlotUpdate } = require('../config/socket');
const { delAsync } = require('../config/redisClient');

// @desc    Get slots (with filters)
// @route   GET /api/slots
// @access  Public
const getSlots = async (req, res, next) => {
  try {
    const { parkingLocationId, floor, vehicleType, status } = req.query;
    const query = {};

    if (parkingLocationId) query.parkingLocationId = parkingLocationId;
    if (floor) query.floor = Number(floor);
    if (vehicleType) query.vehicleType = vehicleType;
    if (status) query.status = status;

    const slots = await Slot.find(query).sort({ slotNumber: 1 });

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create individual slot
// @route   POST /api/slots
// @access  Private/Admin
const createSlot = async (req, res, next) => {
  try {
    const { parkingLocationId } = req.body;
    const location = await ParkingLocation.findById(parkingLocationId);

    if (!location) {
      return res.status(404).json({ success: false, message: 'Parking location not found' });
    }

    const slot = await Slot.create(req.body);

    location.totalSlots = await Slot.countDocuments({ parkingLocationId });
    await location.save();

    await delAsync(`parking:${parkingLocationId}`);
    notifySlotUpdate(parkingLocationId, { slotId: slot._id, status: slot.status, action: 'created' });

    res.status(201).json({
      success: true,
      message: 'Slot created successfully',
      data: slot
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk batch generate slots
// @route   POST /api/slots/generate-batch
// @access  Private/Admin
const generateBatchSlots = async (req, res, next) => {
  try {
    const { parkingLocationId, floor, parkingZone, vehicleType, count, startNumber, price } = req.body;
    
    const location = await ParkingLocation.findById(parkingLocationId);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Parking location not found' });
    }

    const numSlots = Number(count) || 10;
    const startNum = Number(startNumber) || 1;
    const createdSlots = [];

    for (let i = 0; i < numSlots; i++) {
      const slotNumIndex = startNum + i;
      const slotNumber = `${parkingZone}-${slotNumIndex}`;

      try {
        const slot = await Slot.create({
          parkingLocationId,
          slotNumber,
          floor: Number(floor) || 1,
          parkingZone: parkingZone || 'A',
          vehicleType: vehicleType || 'Car',
          price: price ? Number(price) : undefined,
          status: 'Available'
        });
        createdSlots.push(slot);
      } catch (err) {
        if (err.code !== 11000) {
          throw err;
        }
      }
    }

    location.totalSlots = await Slot.countDocuments({ parkingLocationId });
    await location.save();

    await delAsync(`parking:${parkingLocationId}`);
    notifySlotUpdate(parkingLocationId, { count: createdSlots.length, action: 'batch_created' });

    await AdminLog.create({
      adminId: req.user.id,
      action: 'BATCH_GENERATE_SLOTS',
      resource: 'Slot',
      details: `Generated batch of ${createdSlots.length} slots for location ID ${parkingLocationId} on Floor ${floor}`
    });

    res.status(201).json({
      success: true,
      message: `Successfully generated ${createdSlots.length} slots`,
      count: createdSlots.length,
      data: createdSlots
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update slot details
// @route   PUT /api/slots/:id
// @access  Private/Admin
const updateSlot = async (req, res, next) => {
  try {
    let slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    const oldStatus = slot.status;
    slot = await Slot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    await delAsync(`parking:${slot.parkingLocationId}`);
    notifySlotUpdate(slot.parkingLocationId, { slotId: slot._id, status: slot.status, action: 'updated' });

    if (oldStatus !== slot.status) {
      await AdminLog.create({
        adminId: req.user.id,
        action: 'UPDATE_SLOT_STATUS',
        resource: 'Slot',
        resourceId: slot._id.toString(),
        details: `Updated slot ${slot.slotNumber} status from ${oldStatus} to ${slot.status}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Slot updated successfully',
      data: slot
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete slot
// @route   DELETE /api/slots/:id
// @access  Private/Admin
const deleteSlot = async (req, res, next) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    const locationId = slot.parkingLocationId;
    await slot.deleteOne();

    const location = await ParkingLocation.findById(locationId);
    if (location) {
      location.totalSlots = await Slot.countDocuments({ parkingLocationId: locationId });
      await location.save();
    }

    await delAsync(`parking:${locationId}`);
    notifySlotUpdate(locationId, { slotId: req.params.id, action: 'deleted' });

    res.status(200).json({
      success: true,
      message: 'Slot deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSlots,
  createSlot,
  generateBatchSlots,
  updateSlot,
  deleteSlot
};
