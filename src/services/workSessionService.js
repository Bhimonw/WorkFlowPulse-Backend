const WorkSession = require('../models/WorkSession');
const Project = require('../models/Project');

class WorkSessionService {
  // Start work session
  async startWorkSession(userId, sessionData) {
    const { projectId, notes } = sessionData;

    if (!projectId) {
      throw new Error('Project ID harus diisi');
    }

    // Check if project exists and belongs to user
    const project = await Project.findOne({ _id: projectId, user: userId });
    if (!project) {
      throw new Error('Project tidak ditemukan');
    }

    // Check if there's already an active session
    const activeSession = await WorkSession.findOne({
      user: userId,
      endTime: null,
      isActive: true
    });

    if (activeSession) {
      throw new Error('Masih ada sesi kerja yang aktif');
    }

    // Create new work session
    const workSession = await WorkSession.create({
      project: projectId,
      user: userId,
      startTime: new Date(),
      notes,
      isActive: true
    });

    return await WorkSession.findById(workSession._id).populate('project', 'name color');
  }

  // End work session
  async endWorkSession(sessionId, userId, endData = {}) {
    const { notes } = endData;
    
    const session = await WorkSession.findOne({
      _id: sessionId,
      user: userId,
      isActive: true,
      endTime: null
    });

    if (!session) {
      throw new Error('Sesi kerja tidak ditemukan atau sudah berakhir');
    }

    const endTime = new Date();
    const duration = Math.round((endTime - session.startTime) / (1000 * 60)); // in minutes

    session.endTime = endTime;
    session.duration = duration;
    session.isActive = false;
    if (notes) session.notes = notes;

    await session.save();

    // Update project total time
    await Project.findByIdAndUpdate(session.project, {
      $inc: { totalTimeSpent: duration }
    });

    return await WorkSession.findById(session._id).populate('project', 'name color');
  }

  // Get active session
  async getActiveSession(userId) {
    return await WorkSession.findOne({
      user: userId,
      endTime: null,
      isActive: true
    }).populate('project', 'name color');
  }

  // Get user work sessions
  async getUserWorkSessions(userId, filters = {}) {
    const { projectId, startDate, endDate, limit = 50, page = 1 } = filters;
    
    const query = { user: userId };
    
    if (projectId) query.project = projectId;
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    return await WorkSession.find(query)
      .populate('project', 'name color')
      .sort({ startTime: -1 })
      .limit(limit)
      .skip(skip);
  }
}

module.exports = new WorkSessionService();