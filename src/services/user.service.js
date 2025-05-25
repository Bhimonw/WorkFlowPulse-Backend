const { User, Project, Pulse } = require('../models');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs').promises;

class UserService {
  // Get user profile with statistics
  async getUserProfile(userId) {
    const user = await User.findById(userId)
      .select('-password -refreshTokens')
      .populate('preferences');
    
    if (!user) {
      throw new Error('User not found');
    }

    // Get user statistics
    const stats = await this.getUserStats(userId);
    
    return {
      ...user.toObject(),
      stats
    };
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    const allowedUpdates = ['name', 'email', 'preferences', 'avatar'];
    const updates = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    if (updates.email) {
      const existingUser = await User.findOne({ 
        email: updates.email, 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    const user = await User.findByIdAndUpdate(
      userId, 
      updates, 
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  // Get user statistics
  async getUserStats(userId) {
    const [projectStats, pulseStats] = await Promise.all([
      this.getProjectStats(userId),
      this.getPulseStats(userId)
    ]);

    return {
      projects: projectStats,
      workSessions: pulseStats
    };
  }

  // Get project statistics for user
  async getProjectStats(userId) {
    const projects = await Project.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' }
        }
      }
    ]);

    const stats = {
      total: 0,
      active: 0,
      completed: 0,
      paused: 0,
      cancelled: 0,
      totalBudget: 0
    };

    projects.forEach(project => {
      stats[project._id] = project.count;
      stats.total += project.count;
      stats.totalBudget += project.totalBudget || 0;
    });

    return stats;
  }

  // Get pulse (work session) statistics for user
  async getPulseStats(userId) {
    const pulses = await Pulse.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalEarnings: { $sum: '$earnings' },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    const stats = pulses[0] || {
      totalSessions: 0,
      totalDuration: 0,
      totalEarnings: 0,
      avgDuration: 0
    };

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStats = await Pulse.aggregate([
      {
        $match: {
          userId,
          startTime: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          todaySessions: { $sum: 1 },
          todayDuration: { $sum: '$duration' },
          todayEarnings: { $sum: '$earnings' }
        }
      }
    ]);

    const todayData = todayStats[0] || {
      todaySessions: 0,
      todayDuration: 0,
      todayEarnings: 0
    };

    return {
      ...stats,
      ...todayData
    };
  }

  // Get dashboard data
  async getDashboardData(userId, period = '7d') {
    const user = await User.findById(userId).select('-password -refreshTokens');
    if (!user) {
      throw new Error('User not found');
    }

    const [recentProjects, recentPulses, analytics] = await Promise.all([
      this.getRecentProjects(userId),
      this.getRecentPulses(userId),
      this.getAnalytics(userId, period)
    ]);

    return {
      user,
      recentProjects,
      recentPulses,
      analytics
    };
  }

  // Get recent projects
  async getRecentProjects(userId, limit = 5) {
    return await Project.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('name status progress budget createdAt updatedAt');
  }

  // Get recent work sessions
  async getRecentPulses(userId, limit = 10) {
    return await Pulse.find({ userId })
      .sort({ startTime: -1 })
      .limit(limit)
      .populate('projectId', 'name')
      .select('startTime endTime duration earnings status projectId');
  }

  // Get analytics data
  async getAnalytics(userId, period) {
    const days = this.getPeriodDays(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await Pulse.aggregate([
      {
        $match: {
          userId,
          startTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$startTime'
            }
          },
          sessions: { $sum: 1 },
          duration: { $sum: '$duration' },
          earnings: { $sum: '$earnings' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return analytics;
  }

  // Helper to get period days
  getPeriodDays(period) {
    switch (period) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 7;
    }
  }

  // Handle avatar upload
  async uploadAvatar(userId, file) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Delete old avatar if exists
    if (user.avatar) {
      try {
        await fs.unlink(path.join(process.cwd(), 'uploads', user.avatar));
      } catch (error) {
        // Ignore if file doesn't exist
      }
    }

    // Update user with new avatar path
    user.avatar = file.filename;
    await user.save();

    return {
      message: 'Avatar uploaded successfully',
      avatar: user.avatar
    };
  }

  // Delete user account
  async deleteAccount(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Delete user's projects and pulses
    await Promise.all([
      Project.deleteMany({ userId }),
      Pulse.deleteMany({ userId })
    ]);

    // Delete avatar file if exists
    if (user.avatar) {
      try {
        await fs.unlink(path.join(process.cwd(), 'uploads', user.avatar));
      } catch (error) {
        // Ignore if file doesn't exist
      }
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    return { message: 'Account deleted successfully' };
  }

  // Export user data
  async exportUserData(userId) {
    const [user, projects, pulses] = await Promise.all([
      User.findById(userId).select('-password -refreshTokens'),
      Project.find({ userId }),
      Pulse.find({ userId }).populate('projectId', 'name')
    ]);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      user,
      projects,
      workSessions: pulses,
      exportDate: new Date().toISOString()
    };
  }
}

module.exports = new UserService();