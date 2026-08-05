const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema(
  {
    parkingLocationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingLocation',
      required: true
    },
    slotNumber: {
      type: String,
      required: true,
      trim: true
    },
    floor: {
      type: Number,
      required: true,
      min: 1
    },
    parkingZone: {
      type: String,
      required: true,
      trim: true,
      default: 'A'
    },
    vehicleType: {
      type: String,
      enum: ['Car', 'Bike', 'EV'],
      required: true
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Reserved', 'Disabled'],
      default: 'Available'
    },
    price: {
      type: Number, // Custom slot price if set, otherwise location price per hour applies
      min: 0
    },
    qrIdentifier: {
      type: String,
      unique: true,
      sparse: true // Allows nulls to be unique
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to guarantee uniqueness of slot number per parking location
SlotSchema.index({ parkingLocationId: 1, slotNumber: 1 }, { unique: true });

module.exports = mongoose.model('Slot', SlotSchema);
