const Project = require('../models/Project');
const WorkSession = require('../models/WorkSession');

class ProjectService {
  // Get all projects for user
  async getUserProjects(userId) {
    return await Project.find({ user: userId }).sort({ createdAt: -1 });
  }

  // Create new project
  async createProject(userId, projectData) {
    const { name, description, color } = projectData;
    
    if (!name) {
      throw new Error('Nama project harus diisi');
    }

    return await Project.create({
      name,
      description,
      color,
      user: userId,
    });
  }

  // Update project
  async updateProject(projectId, userId, updateData) {
    const project = await Project.findOne({ _id: projectId, user: userId });
    if (!project) {
      throw new Error('Project tidak ditemukan');
    }

    Object.assign(project, updateData);
    return await project.save();
  }

  // Delete project
  async deleteProject(projectId, userId) {
    const project = await Project.findOne({ _id: projectId, user: userId });
    if (!project) {
      throw new Error('Project tidak ditemukan');
    }

    // Check if there are active work sessions
    const activeSessions = await WorkSession.find({
      project: projectId,
      endTime: null,
      isActive: true
    });

    if (activeSessions.length > 0) {
      throw new Error('Tidak dapat menghapus project yang memiliki sesi kerja aktif');
    }

    await Project.findByIdAndDelete(projectId);
    return { message: 'Project berhasil dihapus' };
  }

  // Get project statistics
  async getProjectStats(projectId, userId) {
    const project = await Project.findOne({ _id: projectId, user: userId });
    if (!project) {
      throw new Error('Project tidak ditemukan');
    }

    const sessions = await WorkSession.find({ project: projectId });
    const totalSessions = sessions.length;
    const totalTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const avgSessionTime = totalSessions > 0 ? totalTime / totalSessions : 0;

    return {
      project,
      stats: {
        totalSessions,
        totalTime,
        avgSessionTime,
        lastSession: sessions[sessions.length - 1] || null
      }
    };
  }
}

module.exports = new ProjectService();