const mongoose = require('mongoose');

const ParkingLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a location name'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
      trim: true
    },
    city: {
      type: String,
      default: 'San Francisco',
      trim: true
    },
    zipCode: {
      type: String,
      default: '94102',
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required']
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required']
      }
    },
    openingHours: {
      type: String, // format: "HH:MM" (24h format, e.g. "08:00")
      required: [true, 'Opening hours are required']
    },
    closingHours: {
      type: String, // format: "HH:MM" (24h format, e.g. "22:00")
      required: [true, 'Closing hours are required']
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Price per hour is required'],
      min: [0, 'Price must be positive']
    },
    numberOfFloors: {
      type: Number,
      required: [true, 'Number of floors is required'],
      min: [1, 'Must have at least 1 floor'],
      default: 1
    },
    totalSlots: {
      type: Number,
      default: 0
    },
    parkingType: {
      type: String,
      enum: ['Open', 'Covered', 'Basement'],
      required: true
    },
    vehicleTypes: {
      type: [String],
      enum: ['Car', 'Bike', 'EV'],
      default: ['Car']
    },
    images: {
      type: [String],
      default: []
    },
    description: {
      type: String,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isApartmentSlot: {
      type: Boolean,
      default: false
    },
    apartmentDetails: {
      buildingName: { type: String, trim: true },
      unitNumber: { type: String, trim: true }
    },
    status: {
      type: String,
      enum: ['Active', 'Disabled'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ParkingLocation', ParkingLocationSchema);
