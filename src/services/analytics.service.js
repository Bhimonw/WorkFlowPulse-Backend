const { User, Project, Pulse } = require('../models');
const moment = require('moment');

class AnalyticsService {
  // Get comprehensive analytics for a user
  async getUserAnalytics(userId, period = '30d', timezone = 'UTC') {
    const { startDate, endDate } = this.getPeriodDates(period);
    
    const [timeAnalytics, projectAnalytics, earningsAnalytics, productivityAnalytics] = await Promise.all([
      this.getTimeAnalytics(userId, startDate, endDate),
      this.getProjectAnalytics(userId, startDate, endDate),
      this.getEarningsAnalytics(userId, startDate, endDate),
      this.getProductivityAnalytics(userId, startDate, endDate)
    ]);

    return {
      period,
      startDate,
      endDate,
      timeAnalytics,
      projectAnalytics,
      earningsAnalytics,
      productivityAnalytics
    };
  }

  // Get time-based analytics
  async getTimeAnalytics(userId, startDate, endDate) {
    const pulses = await Pulse.aggregate([
      {
        $match: {
          userId,
          startTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
            hour: { $hour: '$startTime' }
          },
          totalDuration: { $sum: '$duration' },
          sessionCount: { $sum: 1 },
          totalEarnings: { $sum: '$earnings' }
        }
      },
      { $sort: { '_id.date': 1, '_id.hour': 1 } }
    ]);

    // Process data for daily and hourly patterns
    const dailyData = {};
    const hourlyData = Array(24).fill(0).map(() => ({ duration: 0, sessions: 0, earnings: 0 }));
    
    pulses.forEach(pulse => {
      const date = pulse._id.date;
      const hour = pulse._id.hour;
      
      // Daily aggregation
      if (!dailyData[date]) {
        dailyData[date] = { duration: 0, sessions: 0, earnings: 0 };
      }
      dailyData[date].duration += pulse.totalDuration;
      dailyData[date].sessions += pulse.sessionCount;
      dailyData[date].earnings += pulse.totalEarnings;
      
      // Hourly aggregation
      hourlyData[hour].duration += pulse.totalDuration;
      hourlyData[hour].sessions += pulse.sessionCount;
      hourlyData[hour].earnings += pulse.totalEarnings;
    });

    // Calculate totals and averages
    const totalDuration = Object.values(dailyData).reduce((sum, day) => sum + day.duration, 0);
    const totalSessions = Object.values(dailyData).reduce((sum, day) => sum + day.sessions, 0);
    const totalEarnings = Object.values(dailyData).reduce((sum, day) => sum + day.earnings, 0);
    const workingDays = Object.keys(dailyData).length;
    
    return {
      totalDuration,
      totalSessions,
      totalEarnings,
      workingDays,
      averageDailyDuration: workingDays > 0 ? totalDuration / workingDays : 0,
      averageDailySessions: workingDays > 0 ? totalSessions / workingDays : 0,
      averageDailyEarnings: workingDays > 0 ? totalEarnings / workingDays : 0,
      dailyData: Object.entries(dailyData).map(([date, data]) => ({ date, ...data })),
      hourlyData: hourlyData.map((data, hour) => ({ hour, ...data })),
      peakHour: hourlyData.reduce((peak, current, index) => 
        current.duration > hourlyData[peak].duration ? index : peak, 0
      )
    };
  }

  // Get project-based analytics
  async getProjectAnalytics(userId, startDate, endDate) {
    const projectStats = await Pulse.aggregate([
      {
        $match: {
          userId,
          startTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project'
        }
      },
      { $unwind: '$project' },
      {
        $group: {
          _id: '$projectId',
          projectName: { $first: '$project.name' },
          projectStatus: { $first: '$project.status' },
          totalDuration: { $sum: '$duration' },
          sessionCount: { $sum: 1 },
          totalEarnings: { $sum: '$earnings' },
          averageSessionDuration: { $avg: '$duration' },
          lastWorked: { $max: '$startTime' }
        }
      },
      { $sort: { totalDuration: -1 } }
    ]);

    const totalProjectTime = projectStats.reduce((sum, project) => sum + project.totalDuration, 0);
    
    return {
      projectCount: projectStats.length,
      totalTime: totalProjectTime,
      projects: projectStats.map(project => ({
        ...project,
        timePercentage: totalProjectTime > 0 ? (project.totalDuration / totalProjectTime) * 100 : 0
      })),
      mostWorkedProject: projectStats[0] || null,
      averageTimePerProject: projectStats.length > 0 ? totalProjectTime / projectStats.length : 0
    };
  }

  // Get earnings analytics
  async getEarningsAnalytics(userId, startDate, endDate) {
    const earningsData = await Pulse.aggregate([
      {
        $match: {
          userId,
          startTime: { $gte: startDate, $lte: endDate },
          earnings: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
            projectId: '$projectId'
          },
          dailyEarnings: { $sum: '$earnings' },
          duration: { $sum: '$duration' },
          sessions: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id.projectId',
          foreignField: '_id',
          as: 'project'
        }
      },
      { $unwind: '$project' },
      {
        $group: {
          _id: '$_id.date',
          totalEarnings: { $sum: '$dailyEarnings' },
          projectEarnings: {
            $push: {
              projectId: '$_id.projectId',
              projectName: '$project.name',
              earnings: '$dailyEarnings',
              duration: '$duration',
              sessions: '$sessions'
            }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const totalEarnings = earningsData.reduce((sum, day) => sum + day.totalEarnings, 0);
    const earningDays = earningsData.length;
    
    // Calculate hourly rates
    const totalDuration = await Pulse.aggregate([
      {
        $match: {
          userId,
          startTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalDuration: { $sum: '$duration' }
        }
      }
    ]);

    const totalHours = totalDuration[0]?.totalDuration / 3600000 || 0; // Convert to hours
    
    return {
      totalEarnings,
      earningDays,
      averageDailyEarnings: earningDays > 0 ? totalEarnings / earningDays : 0,
      averageHourlyRate: totalHours > 0 ? totalEarnings / totalHours : 0,
      dailyEarnings: earningsData.map(day => ({
        date: day._id,
        earnings: day.totalEarnings,
        projects: day.projectEarnings
      })),
      highestEarningDay: earningsData.reduce((highest, current) => 
        current.totalEarnings > (highest?.totalEarnings || 0) ? current : highest, null
      )
    };
  }

  // Get productivity analytics
  async getProductivityAnalytics(userId, startDate, endDate) {
    const productivityData = await Pulse.aggregate([
      {
        $match: {
          userId,
          startTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $addFields: {
          dayOfWeek: { $dayOfWeek: '$startTime' },
          sessionEfficiency: {
            $cond: {
              if: { $gt: ['$duration', 0] },
              then: { $divide: ['$duration', { $add: ['$duration', { $multiply: ['$pauseCount', 300000] }] }] },
              else: 0
            }
          }
        }
      },
      {
        $group: {
          _id: {
            dayOfWeek: '$dayOfWeek',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } }
          },
          dailyDuration: { $sum: '$duration' },
          sessionCount: { $sum: 1 },
          pauseCount: { $sum: '$pauseCount' },
          averageEfficiency: { $avg: '$sessionEfficiency' }
        }
      },
      {
        $group: {
          _id: '$_id.dayOfWeek',
          averageDailyDuration: { $avg: '$dailyDuration' },
          averageSessionCount: { $avg: '$sessionCount' },
          averagePauseCount: { $avg: '$pauseCount' },
          averageEfficiency: { $avg: '$averageEfficiency' },
          workingDays: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const weeklyPattern = productivityData.map(day => ({
      dayOfWeek: day._id,
      dayName: moment().day(day._id - 1).format('dddd'),
      averageDuration: day.averageDailyDuration,
      averageSessions: day.averageSessionCount,
      averagePauses: day.averagePauseCount,
      efficiency: day.averageEfficiency,
      workingDays: day.workingDays
    }));

    // Calculate focus metrics
    const focusMetrics = await this.getFocusMetrics(userId, startDate, endDate);
    
    return {
      weeklyPattern,
      mostProductiveDay: weeklyPattern.reduce((most, current) => 
        current.averageDuration > (most?.averageDuration || 0) ? current : most, null
      ),
      averageEfficiency: weeklyPattern.reduce((sum, day) => sum + day.efficiency, 0) / weeklyPattern.length || 0,
      focusMetrics
    };
  }

  // Get focus and concentration metrics
  async getFocusMetrics(userId, startDate, endDate) {
    const focusData = await Pulse.aggregate([
      {
        $match: {
          userId,
          startTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $addFields: {
          focusScore: {
            $cond: {
              if: { $eq: ['$pauseCount', 0] },
              then: 100,
              else: {
                $max: [0, { $subtract: [100, { $multiply: ['$pauseCount', 10] }] }]
              }
            }
          },
          sessionLength: {
            $switch: {
              branches: [
                { case: { $lt: ['$duration', 900000] }, then: 'short' }, // < 15 min
                { case: { $lt: ['$duration', 3600000] }, then: 'medium' }, // < 1 hour
                { case: { $gte: ['$duration', 3600000] }, then: 'long' } // >= 1 hour
              ],
              default: 'unknown'
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          averageFocusScore: { $avg: '$focusScore' },
          totalSessions: { $sum: 1 },
          shortSessions: {
            $sum: { $cond: [{ $eq: ['$sessionLength', 'short'] }, 1, 0] }
          },
          mediumSessions: {
            $sum: { $cond: [{ $eq: ['$sessionLength', 'medium'] }, 1, 0] }
          },
          longSessions: {
            $sum: { $cond: [{ $eq: ['$sessionLength', 'long'] }, 1, 0] }
          },
          totalPauses: { $sum: '$pauseCount' },
          longestSession: { $max: '$duration' }
        }
      }
    ]);

    const metrics = focusData[0] || {
      averageFocusScore: 0,
      totalSessions: 0,
      shortSessions: 0,
      mediumSessions: 0,
      longSessions: 0,
      totalPauses: 0,
      longestSession: 0
    };

    return {
      focusScore: metrics.averageFocusScore,
      sessionDistribution: {
        short: metrics.shortSessions,
        medium: metrics.mediumSessions,
        long: metrics.longSessions
      },
      averagePausesPerSession: metrics.totalSessions > 0 ? metrics.totalPauses / metrics.totalSessions : 0,
      longestSession: metrics.longestSession,
      concentrationLevel: this.calculateConcentrationLevel(metrics.averageFocusScore, metrics.totalPauses, metrics.totalSessions)
    };
  }

  // Get comparison analytics (current vs previous period)
  async getComparisonAnalytics(userId, period = '30d') {
    const { startDate: currentStart, endDate: currentEnd } = this.getPeriodDates(period);
    const periodDuration = currentEnd - currentStart;
    const previousStart = new Date(currentStart.getTime() - periodDuration);
    const previousEnd = currentStart;

    const [currentAnalytics, previousAnalytics] = await Promise.all([
      this.getUserAnalytics(userId, period),
      this.getTimeAnalytics(userId, previousStart, previousEnd)
    ]);

    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      current: currentAnalytics,
      previous: {
        totalDuration: previousAnalytics.totalDuration,
        totalSessions: previousAnalytics.totalSessions,
        totalEarnings: previousAnalytics.totalEarnings,
        workingDays: previousAnalytics.workingDays
      },
      changes: {
        duration: calculateChange(currentAnalytics.timeAnalytics.totalDuration, previousAnalytics.totalDuration),
        sessions: calculateChange(currentAnalytics.timeAnalytics.totalSessions, previousAnalytics.totalSessions),
        earnings: calculateChange(currentAnalytics.timeAnalytics.totalEarnings, previousAnalytics.totalEarnings),
        workingDays: calculateChange(currentAnalytics.timeAnalytics.workingDays, previousAnalytics.workingDays)
      }
    };
  }

  // Export analytics data
  async exportAnalytics(userId, period = '30d', format = 'json') {
    const analytics = await this.getUserAnalytics(userId, period);
    
    if (format === 'csv') {
      return this.convertToCSV(analytics);
    }
    
    return analytics;
  }

  // Helper methods
  getPeriodDates(period) {
    const endDate = new Date();
    let startDate;

    switch (period) {
      case '7d':
        startDate = moment().subtract(7, 'days').startOf('day').toDate();
        break;
      case '30d':
        startDate = moment().subtract(30, 'days').startOf('day').toDate();
        break;
      case '90d':
        startDate = moment().subtract(90, 'days').startOf('day').toDate();
        break;
      case '1y':
        startDate = moment().subtract(1, 'year').startOf('day').toDate();
        break;
      default:
        startDate = moment().subtract(30, 'days').startOf('day').toDate();
    }

    return { startDate, endDate };
  }

  calculateConcentrationLevel(focusScore, totalPauses, totalSessions) {
    const pauseRatio = totalSessions > 0 ? totalPauses / totalSessions : 0;
    
    if (focusScore >= 80 && pauseRatio <= 2) return 'Excellent';
    if (focusScore >= 60 && pauseRatio <= 4) return 'Good';
    if (focusScore >= 40 && pauseRatio <= 6) return 'Average';
    return 'Needs Improvement';
  }

  convertToCSV(analytics) {
    const { dailyData } = analytics.timeAnalytics;
    
    const headers = ['Date', 'Duration (hours)', 'Sessions', 'Earnings'];
    const rows = dailyData.map(day => [
      day.date,
      (day.duration / 3600000).toFixed(2), // Convert to hours
      day.sessions,
      day.earnings.toFixed(2)
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

module.exports = new AnalyticsService();