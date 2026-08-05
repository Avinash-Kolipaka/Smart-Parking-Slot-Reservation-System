const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingLocation',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating between 1 and 5'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent user from submitting multiple reviews for the same parking location
ReviewSchema.index({ locationId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
