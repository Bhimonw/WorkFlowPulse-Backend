const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { AppError } = require('../utils/errorHandler');
const emailService = require('./email.service');

/**
 * Register new user
 */
const register = async (userData) => {
  const { email, username, password, ...otherData } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    throw new AppError('User with this email or username already exists', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await User.create({
    email,
    username,
    password: hashedPassword,
    ...otherData
  });

  // Generate tokens
  const accessToken = generateToken({ userId: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user._id });

  // Save refresh token
  user.refreshTokens.push(refreshToken);
  await user.save();

  // Send welcome email
  await emailService.sendWelcomeEmail(user.email, user.firstName);

  return {
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    },
    tokens: {
      accessToken,
      refreshToken
    }
  };
};

/**
 * Login user
 */
const login = async (email, password) => {
  // Find user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError('Account is deactivated', 401);
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Update last login
  user.lastLogin = new Date();
  user.loginCount += 1;

  // Generate tokens
  const accessToken = generateToken({ userId: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user._id });

  // Save refresh token
  user.refreshTokens.push(refreshToken);
  await user.save();

  return {
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      lastLogin: user.lastLogin
    },
    tokens: {
      accessToken,
      refreshToken
    }
  };
};

/**
 * Refresh access token
 */
const refreshToken = async (refreshToken) => {
  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Generate new access token
    const newAccessToken = generateToken({ userId: user._id, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user._id });

    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
};

/**
 * Logout user
 */
const logout = async (refreshToken) => {
  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);
      
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        await user.save();
      }
    } catch (error) {
      // Token might be invalid, but we still want to "logout"
    }
  }
};

/**
 * Get user profile
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password -refreshTokens');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

/**
 * Update user profile
 */
const updateProfile = async (userId, updateData) => {
  const allowedUpdates = ['firstName', 'lastName', 'preferences'];
  const updates = {};
  
  Object.keys(updateData).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = updateData[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    userId,
    updates,
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

/**
 * Change password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 12);
  
  // Update password and clear all refresh tokens
  user.password = hashedNewPassword;
  user.refreshTokens = [];
  user.passwordChangedAt = new Date();
  await user.save();

  // Send password change notification
  await emailService.sendPasswordChangeNotification(user.email, user.firstName);
};

/**
 * Request password reset
 */
const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if email exists or not
    return;
  }

  // Generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send reset email
  await emailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);
};

/**
 * Reset password
 */
const resetPassword = async (token, newPassword) => {
  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired', 400);
  }

  // Set new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = new Date();
  user.refreshTokens = []; // Clear all refresh tokens
  
  await user.save();

  // Send confirmation email
  await emailService.sendPasswordResetConfirmation(user.email, user.firstName);
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword
};