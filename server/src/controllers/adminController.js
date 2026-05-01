const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const AuditLog = require('../models/AuditLog');

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    return sendSuccess(res, 200, 'Users fetched', { count: users.length, users });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/v1/admin/users/:id/role
 * @desc    Update user role (admin only)
 * @access  Private/Admin
 */

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return sendError(res, 400, 'Invalid role');

    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, 'User not found');

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Audit log
    await AuditLog.create({
      action: 'ROLE_CHANGE',
      performedBy: req.user._id,
      targetUser: user._id,
      details: { oldRole, newRole: role },
    });

    return sendSuccess(res, 200, 'User role updated', { user });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/v1/admin/users/:id
 * @desc    Delete a user (admin only)
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return sendError(res, 404, 'User not found');
    return sendSuccess(res, 200, 'User deleted');
  } catch (err) {
    next(err);
  }
};
