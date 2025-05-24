const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../config/jwt');
const bcrypt = require('bcryptjs');

class AuthService {
  // Register new user
  async registerUser(userData) {
    const { name, email, password } = userData;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User dengan email ini sudah terdaftar');
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });
    
    // Generate tokens
    const token = generateToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id });
    
    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      token,
      refreshToken
    };
  }
  
  // Login user
  async loginUser(email, password) {
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Email atau password salah');
    }
    
    // Check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      throw new Error('Email atau password salah');
    }
    
    // Generate tokens
    const token = generateToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id });
    
    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      token,
      refreshToken
    };
  }
  
  // Get user profile
  async getUserProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User tidak ditemukan');
    }
    
    return user;
  }
}

module.exports = new AuthService();