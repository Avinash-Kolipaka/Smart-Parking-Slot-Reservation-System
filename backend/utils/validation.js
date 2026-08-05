const { z } = require('zod');

// Authentication validations
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['customer', 'admin']).optional().default('customer')
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please provide a valid email')
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Parking locations validations
const parkingLocationSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().optional().default('San Francisco'),
  zipCode: z.string().optional().default('94102'),
  coordinates: z.object({
    lat: z.number().default(37.7749),
    lng: z.number().default(-122.4194)
  }).optional().default({ lat: 37.7749, lng: -122.4194 }),
  openingHours: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format must be HH:MM').optional().default('00:00'),
  closingHours: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format must be HH:MM').optional().default('23:59'),
  pricePerHour: z.number().min(0, 'Price must be positive'),
  numberOfFloors: z.number().min(1).default(1),
  parkingType: z.enum(['Open', 'Covered', 'Basement']),
  vehicleTypes: z.array(z.enum(['Car', 'Bike', 'EV'])).nonempty('Select at least one vehicle type'),
  description: z.string().optional(),
  isApartmentSlot: z.boolean().optional(),
  apartmentDetails: z.object({
    buildingName: z.string().optional(),
    unitNumber: z.string().optional()
  }).optional(),
  slotNumber: z.string().optional(),
  floor: z.number().optional().default(1),
  parkingZone: z.string().optional().default('A'),
  status: z.enum(['Active', 'Disabled']).optional()
});

// Parking slot validations
const slotSchema = z.object({
  slotNumber: z.string().min(1, 'Slot number is required'),
  floor: z.number().min(1, 'Floor must be at least 1'),
  parkingZone: z.string().min(1, 'Zone is required'),
  vehicleType: z.enum(['Car', 'Bike', 'EV']),
  status: z.enum(['Available', 'Occupied', 'Reserved', 'Disabled']).optional(),
  price: z.number().min(0).optional()
});

// Booking validations
const bookingSchema = z.object({
  locationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Location ID'),
  slotId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Slot ID'),
  vehicleNumber: z.string().min(3, 'Vehicle license number is required'),
  vehicleType: z.enum(['Car', 'Bike', 'EV']),
  bookingDate: z.string().datetime({ message: 'Invalid booking date' }),
  startTime: z.string().datetime({ message: 'Invalid start time' }),
  endTime: z.string().datetime({ message: 'Invalid end time' })
});

// Profile update validations
const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  vehicles: z.array(
    z.object({
      licenseNumber: z.string().min(3, 'License number is required'),
      vehicleType: z.enum(['Car', 'Bike', 'EV']),
      model: z.string().optional()
    })
  ).optional()
});

// Helper validation middleware
const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
      });
    }
    next(error);
  }
};

module.exports = {
  validateBody,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  parkingLocationSchema,
  slotSchema,
  bookingSchema,
  profileUpdateSchema
};
