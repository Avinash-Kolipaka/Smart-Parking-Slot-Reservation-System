/**
 * Centralized Pricing Engine for ParkOps Platform
 * Calculates precise fees on the backend based on location price, vehicle type,
 * duration, peak hours, EV charging fees, and taxes.
 */

const calculatePricing = ({
  basePricePerHour,
  startTime,
  endTime,
  vehicleType = 'Car',
  isEVChargingRequested = false,
  discountCode = null
}) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid start or end date format');
  }

  if (end <= start) {
    throw new Error('End time must be after start time');
  }

  // Calculate duration in hours (rounded up to nearest 0.5 hour, min 0.5 hour)
  const durationMs = end.getTime() - start.getTime();
  const rawHours = durationMs / (1000 * 60 * 60);
  const durationHours = Math.max(0.5, Math.ceil(rawHours * 2) / 2);

  // Vehicle type pricing multiplier
  let vehicleMultiplier = 1.0;
  if (vehicleType === 'Bike') {
    vehicleMultiplier = 0.5; // 50% of car price for bikes
  } else if (vehicleType === 'EV') {
    vehicleMultiplier = 1.1; // 10% premium for EV priority slot
  }

  let hourlyRate = basePricePerHour * vehicleMultiplier;

  // Check if booking falls into peak hours (e.g. 08:00 to 11:00 & 17:00 to 20:00)
  const startHour = start.getHours();
  const isPeakHour = (startHour >= 8 && startHour <= 11) || (startHour >= 17 && startHour <= 20);
  if (isPeakHour) {
    hourlyRate += 10; // Peak hour surcharge ₹10/hr
  }

  // Weekend pricing (+15%)
  const isWeekend = start.getDay() === 0 || start.getDay() === 6;
  if (isWeekend) {
    hourlyRate *= 1.15;
  }

  let subtotal = hourlyRate * durationHours;

  // Additional EV Charging fee if requested
  let evChargingFee = 0;
  if (vehicleType === 'EV' && isEVChargingRequested) {
    evChargingFee = 15 * durationHours; // ₹15/hr flat charging fee
  }

  subtotal += evChargingFee;

  // Discount calculation
  let discountAmount = 0;
  if (discountCode === 'PARK10') {
    discountAmount = subtotal * 0.10; // 10% discount
  } else if (discountCode === 'PARK20') {
    discountAmount = subtotal * 0.20; // 20% discount
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  
  // Tax calculation (18% GST/Tax)
  const taxRate = 0.18;
  const taxAmount = Math.round((taxableAmount * taxRate) * 100) / 100;

  const finalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

  return {
    durationHours,
    basePricePerHour,
    hourlyRate: Math.round(hourlyRate * 100) / 100,
    vehicleType,
    subtotal: Math.round(subtotal * 100) / 100,
    evChargingFee: Math.round(evChargingFee * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxAmount,
    finalAmount
  };
};

module.exports = {
  calculatePricing
};
