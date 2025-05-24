const WorkSession = require('../models/WorkSession');
const Project = require('../models/Project');

class AnalyticsService {
  // Get dashboard statistics
  async getDashboardStats(userId, period = 'week') {
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    
    // Get total time worked in period
    const totalTimeResult = await WorkSession.aggregate([
      {
        $match: {
          user: userId,
          startTime: { $gte: startDate },
          endTime: { $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          totalTime: { $sum: '$duration' },
          totalSessions: { $sum: 1 }
        }
      }
    ]);
    
    const totalTime = totalTimeResult[0]?.totalTime || 0;
    const totalSessions = totalTimeResult[0]?.totalSessions || 0;
    
    // Get project breakdown
    const projectBreakdown = await WorkSession.aggregate([
      {
        $match: {
          user: userId,
          startTime: { $gte: startDate },
          endTime: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$project',
          totalTime: { $sum: '$duration' },
          sessionCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project'
        }
      },
      {
        $unwind: '$project'
      },
      {
        $project: {
          projectName: '$project.name',
          projectColor: '$project.color',
          totalTime: 1,
          sessionCount: 1
        }
      },
      {
        $sort: { totalTime: -1 }
      }
    ]);
    
    // Get daily activity for the period
    const dailyActivity = await WorkSession.aggregate([
      {
        $match: {
          user: userId,
          startTime: { $gte: startDate },
          endTime: { $ne: null }
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
          totalTime: { $sum: '$duration' },
          sessionCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    // Get active projects count
    const activeProjectsCount = await Project.countDocuments({
      user: userId,
      isActive: true
    });
    
    return {
      totalTime,
      totalSessions,
      activeProjectsCount,
      averageSessionTime: totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0,
      projectBreakdown,
      dailyActivity,
      period
    };
  }
  
  // Get productivity insights
  async getProductivityInsights(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get hourly distribution
    const hourlyDistribution = await WorkSession.aggregate([
      {
        $match: {
          user: userId,
          startTime: { $gte: thirtyDaysAgo },
          endTime: { $ne: null }
        }
      },
      {
        $group: {
          _id: { $hour: '$startTime' },
          totalTime: { $sum: '$duration' },
          sessionCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    // Get most productive day of week
    const weeklyDistribution = await WorkSession.aggregate([
      {
        $match: {
          user: userId,
          startTime: { $gte: thirtyDaysAgo },
          endTime: { $ne: null }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$startTime' },
          totalTime: { $sum: '$duration' },
          sessionCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalTime: -1 }
      }
    ]);
    
    return {
      hourlyDistribution,
      weeklyDistribution
    };
  }
}

module.exports = new AnalyticsService();