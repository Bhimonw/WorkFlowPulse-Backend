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
    
    await workSession.populate('project', 'name color');
    
    return workSession;
  }
  
  // End work session
  async endWorkSession(sessionId, userId) {
    const session = await WorkSession.findOne({
      _id: sessionId,
      user: userId,
      isActive: true
    });
    
    if (!session) {
      throw new Error('Sesi kerja tidak ditemukan atau sudah berakhir');
    }
    
    const endTime = new Date();
    const duration = Math.round((endTime - session.startTime) / (1000 * 60)); // in minutes
    
    session.endTime = endTime;
    session.duration = duration;
    session.isActive = false;
    
    await session.save();
    
    // Update project total time
    await Project.findByIdAndUpdate(session.project, {
      $inc: { totalTimeSpent: duration }
    });
    
    await session.populate('project', 'name color');
    
    return session;
  }
  
  // Get active session
  async getActiveSession(userId) {
    const activeSession = await WorkSession.findOne({
      user: userId,
      endTime: null,
      isActive: true
    }).populate('project', 'name color description');
    
    return activeSession;
  }
  
  // Get work sessions
  async getWorkSessions(userId, filters = {}) {
    const { projectId, startDate, endDate, page = 1, limit = 10 } = filters;
    
    const query = { user: userId };
    
    if (projectId) {
      query.project = projectId;
    }
    
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }
    
    const sessions = await WorkSession.find(query)
      .populate('project', 'name color')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await WorkSession.countDocuments(query);
    
    return {
      sessions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    };
  }
}

module.exports = new WorkSessionService();