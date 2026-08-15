const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const VehicleSchema = new mongoose.Schema({
  licenseNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['Car', 'Bike', 'EV'],
    required: true
  },
  model: {
    type: String,
    trim: true
  }
});

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
        'Please add a valid email'
      ],
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false // Exclude from query results by default
    },
    phone: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN', 'PARKING_MANAGER', 'SUPER_ADMIN'],
      default: 'USER'
    },
    isBanned: {
      type: Boolean,
      default: false
    },
    accountStatus: {
      type: String,
      enum: ['active', 'banned'],
      default: 'active'
    },
    profileImage: {
      type: String,
      default: ''
    },
    vehicles: [VehicleSchema],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    refreshTokens: [String]
  },
  {
    timestamps: true
  }
);

// Encrypt password using bcrypt pre-save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
