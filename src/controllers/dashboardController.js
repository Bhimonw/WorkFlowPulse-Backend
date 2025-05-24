const WorkSession = require('../models/WorkSession');
const Project = require('../models/Project');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const { period = 'week' } = req.query; // week, month, year

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
          user: req.user._id,
          startTime: { $gte: startDate },
          endTime: { $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: '$duration' }
        }
      }
    ]);

    const totalMinutes = totalTimeResult[0]?.totalMinutes || 0;

    // Get time by project
    const timeByProject = await WorkSession.aggregate([
      {
        $match: {
          user: req.user._id,
          startTime: { $gte: startDate },
          endTime: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$project',
          totalMinutes: { $sum: '$duration' },
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
          totalMinutes: 1,
          sessionCount: 1
        }
      },
      {
        $sort: { totalMinutes: -1 }
      }
    ]);

    // Get daily activity for the period
    const dailyActivity = await WorkSession.aggregate([
      {
        $match: {
          user: req.user._id,
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
          totalMinutes: { $sum: '$duration' },
          sessionCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      period,
      totalMinutes,
      totalHours: Math.round((totalMinutes / 60) * 100) / 100,
      timeByProject,
      dailyActivity
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardStats
};