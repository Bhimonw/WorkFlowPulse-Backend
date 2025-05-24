const Project = require('../models/Project');
const WorkSession = require('../models/WorkSession');

class ProjectService {
  // Get all projects for user
  async getUserProjects(userId) {
    const projects = await Project.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    
    return projects;
  }
  
  // Create new project
  async createProject(userId, projectData) {
    const { name, description, color } = projectData;
    
    if (!name) {
      throw new Error('Nama project harus diisi');
    }
    
    const project = await Project.create({
      name,
      description,
      color,
      user: userId
    });
    
    return project;
  }
  
  // Update project
  async updateProject(projectId, userId, updateData) {
    const project = await Project.findOne({ _id: projectId, user: userId });
    
    if (!project) {
      throw new Error('Project tidak ditemukan');
    }
    
    Object.assign(project, updateData);
    await project.save();
    
    return project;
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
    const averageSessionTime = totalSessions > 0 ? totalTime / totalSessions : 0;
    
    return {
      project,
      totalSessions,
      totalTime,
      averageSessionTime
    };
  }
}

module.exports = new ProjectService();