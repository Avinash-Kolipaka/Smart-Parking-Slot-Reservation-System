const User = require('../models/User');
const ParkingLocation = require('../models/ParkingLocation');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @desc    Get dashboard counts & basic summaries
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Run parallel counts to speed up API response
    const [
      totalUsers,
      totalLocations,
      totalSlots,
      availableSlots,
      occupiedSlots,
      todaysBookings,
      pendingBookings,
      cancelledBookings
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      ParkingLocation.countDocuments({}),
      Slot.countDocuments({}),
      Slot.countDocuments({ status: 'Available' }),
      Slot.countDocuments({ status: 'Occupied' }),
      Booking.countDocuments({ createdAt: { $gte: today } }),
      Booking.countDocuments({ bookingStatus: 'Pending' }),
      Booking.countDocuments({ bookingStatus: 'Cancelled' })
    ]);

    // Aggregate revenues
    const todayPayments = await Payment.aggregate([
      {
        $match: {
          status: 'Success',
          paymentDate: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const monthPayments = await Payment.aggregate([
      {
        $match: {
          status: 'Success',
          paymentDate: { $gte: firstOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const revenueToday = todayPayments[0]?.total || 0;
    const revenueThisMonth = monthPayments[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalParkingAreas: totalLocations,
        totalSlots,
        availableSlots,
        occupiedSlots,
        todaysBookings,
        pendingBookings,
        cancelledBookings,
        revenueToday,
        revenueThisMonth
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get visual graph analytics datasets
// @route   GET /api/dashboard/analytics
// @access  Private/Admin
const getAnalytics = async (req, res, next) => {
  try {
    // 1. Vehicle Type Distribution
    const vehicleDistribution = await Booking.aggregate([
      { $match: { bookingStatus: { $in: ['Confirmed', 'Active', 'Completed'] } } },
      {
        $group: {
          _id: '$vehicleType',
          count: { $sum: 1 }
        }
      }
    ]);

    // 2. Daily revenue in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'Success',
          paymentDate: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 3. Peak hours of check-ins
    const peakHours = await Booking.aggregate([
      { $match: { bookingStatus: { $in: ['Confirmed', 'Active', 'Completed'] } } },
      {
        $group: {
          _id: { $hour: '$startTime' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 4. Top Locations by Revenue
    const topLocations = await Booking.aggregate([
      { $match: { paymentStatus: 'Paid', bookingStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: '$locationId',
          revenue: { $sum: '$amount' },
          bookingsCount: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'parkinglocations',
          localField: '_id',
          foreignField: '_id',
          as: 'location'
        }
      },
      { $unwind: '$location' },
      {
        $project: {
          name: '$location.name',
          revenue: 1,
          bookingsCount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        vehicleDistribution: vehicleDistribution.map(item => ({
          type: item._id,
          count: item.count
        })),
        dailyRevenue: dailyRevenue.map(item => ({
          date: item._id,
          revenue: item.revenue
        })),
        peakHours: peakHours.map(item => ({
          hour: `${item._id}:00`,
          count: item.count
        })),
        topLocations
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getAnalytics
};
