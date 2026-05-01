const User = require('../models/User');
const { sendSuccess, sendError, generateToken } = require('../utils/response');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Prevent public admin registration
    const userRole = role === 'admin' ? 'user' : role || 'user';

    const user = await User.create({ name, email, password, role: userRole });
    const token = generateToken(user._id);

    return sendSuccess(res, 201, 'User registered successfully', {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user & return JWT
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const token = generateToken(user._id);

    return sendSuccess(res, 200, 'Login successful', {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get logged-in user profile
 * @access  Private
 */
exports.getMe = async (req, res) => {
  const user = req.user;
  return sendSuccess(res, 200, 'Profile fetched', {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};
