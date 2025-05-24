const WorkSession = require('../models/WorkSession');
const Project = require('../models/Project');

// @desc    Start work session
// @route   POST /api/work-sessions/start
// @access  Private
const startWorkSession = async (req, res) => {
  try {
    const { projectId, notes } = req.body;

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID harus diisi' });
    }

    // Check if project exists and belongs to user
    const project = await Project.findOne({ _id: projectId, user: req.user._id });
    if (!project) {
      return res.status(404).json({ message: 'Project tidak ditemukan' });
    }

    // Check if there's already an active session
    const activeSession = await WorkSession.findOne({
      user: req.user._id,
      endTime: null,
      isActive: true
    });

    if (activeSession) {
      return res.status(400).json({ message: 'Masih ada sesi kerja yang aktif' });
    }

    const workSession = await WorkSession.create({
      project: projectId,
      user: req.user._id,
      startTime: new Date(),
      notes
    });

    const populatedSession = await WorkSession.findById(workSession._id).populate('project', 'name color');
    res.status(201).json(populatedSession);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    End work session
// @route   PUT /api/work-sessions/:id/end
// @access  Private
const endWorkSession = async (req, res) => {
  try {
    const { notes } = req.body;
    const workSession = await WorkSession.findById(req.params.id);

    if (!workSession) {
      return res.status(404).json({ message: 'Sesi kerja tidak ditemukan' });
    }

    // Check if user owns the session
    if (workSession.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Tidak memiliki akses ke sesi kerja ini' });
    }

    if (workSession.endTime) {
      return res.status(400).json({ message: 'Sesi kerja sudah berakhir' });
    }

    workSession.endTime = new Date();
    workSession.notes = notes || workSession.notes;
    await workSession.save();

    // Update project total time
    await Project.findByIdAndUpdate(
      workSession.project,
      { $inc: { totalTimeSpent: workSession.duration } }
    );

    const populatedSession = await WorkSession.findById(workSession._id).populate('project', 'name color');
    res.json(populatedSession);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get active work session
// @route   GET /api/work-sessions/active
// @access  Private
const getActiveSession = async (req, res) => {
  try {
    const activeSession = await WorkSession.findOne({
      user: req.user._id,
      endTime: null,
      isActive: true
    }).populate('project', 'name color');

    res.json(activeSession);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get work sessions history
// @route   GET /api/work-sessions
// @access  Private
const getWorkSessions = async (req, res) => {
  try {
    const { page = 1, limit = 10, projectId, startDate, endDate } = req.query;
    
    let filter = { user: req.user._id };
    
    if (projectId) {
      filter.project = projectId;
    }
    
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    const workSessions = await WorkSession.find(filter)
      .populate('project', 'name color')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await WorkSession.countDocuments(filter);

    res.json({
      workSessions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  startWorkSession,
  endWorkSession,
  getActiveSession,
  getWorkSessions
};