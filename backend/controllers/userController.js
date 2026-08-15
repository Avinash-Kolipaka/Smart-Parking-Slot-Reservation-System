const User = require('../models/User');
const AdminLog = require('../models/AdminLog');

// @desc    Get all users (paginated)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find({}).select('-refreshTokens -resetPasswordToken -resetPasswordExpire').sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, vehicles } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (vehicles) user.vehicles = vehicles;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        vehicles: user.vehicles
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details (Admin only, e.g. change role)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { name, phone, role } = req.body;
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if modifying root admin (self role modifications prevention)
    if (user._id.toString() === req.user.id && role && role !== user.role) {
      return res.status(400).json({ success: false, message: 'Cannot modify your own administrative role' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;

    await user.save();

    // Log admin action
    await AdminLog.create({
      adminId: req.user.id,
      action: 'UPDATE_USER_ROLE',
      details: `Modified user ${user.email} status/role to: ${user.role}`
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully by admin',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Safety checks
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own active admin account' });
    }

    await user.deleteOne();

    // Log admin action
    await AdminLog.create({
      adminId: req.user.id,
      action: 'DELETE_USER',
      details: `Deleted user account: ${user.email} (Name: ${user.name})`
    });

    res.status(200).json({
      success: true,
      message: `User '${user.name}' deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ban or Unban User
// @route   PUT /api/users/:id/ban
// @access  Private/Admin
const toggleBanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot ban your own admin account' });
    }

    const previousStatus = user.accountStatus || 'active';
    user.isBanned = !user.isBanned;
    user.accountStatus = user.isBanned ? 'banned' : 'active';
    
    // Clear active sessions if banned
    if (user.isBanned) {
      user.refreshTokens = [];
    }

    await user.save();

    await AdminLog.create({
      adminId: req.user.id,
      action: user.isBanned ? 'BAN_USER' : 'UNBAN_USER',
      resource: 'User',
      resourceId: user._id.toString(),
      details: `${user.isBanned ? 'Banned' : 'Unbanned'} user ${user.email}`,
      oldValue: previousStatus,
      newValue: user.accountStatus
    });

    res.status(200).json({
      success: true,
      message: `User '${user.name}' has been ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateProfile,
  updateUser,
  deleteUser,
  toggleBanUser
};
