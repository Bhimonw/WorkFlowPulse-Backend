const { asyncHandler } = require('../middleware/errorHandler');
const projectService = require('../services/project.service');
const { successResponse } = require('../utils/responseHandler');

/**
 * Get all projects for user
 */
const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const query = req.query;
  const projects = await projectService.getUserProjects(userId, query);
  
  successResponse(res, {
    message: 'Projects retrieved successfully',
    data: projects
  });
});

/**
 * Get project by ID
 */
const getProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const project = await projectService.getProjectById(id, userId);
  
  successResponse(res, {
    message: 'Project retrieved successfully',
    data: project
  });
});

/**
 * Create new project
 */
const createProject = asyncHandler(async (req, res) => {
  const projectData = {
    ...req.body,
    userId: req.user.id
  };
  
  const project = await projectService.createProject(projectData);
  
  successResponse(res, {
    message: 'Project created successfully',
    data: project
  }, 201);
});

/**
 * Update project
 */
const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const updateData = req.body;
  
  const project = await projectService.updateProject(id, userId, updateData);
  
  successResponse(res, {
    message: 'Project updated successfully',
    data: project
  });
});

/**
 * Delete project
 */
const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  await projectService.deleteProject(id, userId);
  
  successResponse(res, {
    message: 'Project deleted successfully'
  });
});

/**
 * Get project statistics
 */
const getProjectStats = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const stats = await projectService.getProjectStats(id, userId);
  
  successResponse(res, {
    message: 'Project statistics retrieved successfully',
    data: stats
  });
});

/**
 * Archive/Unarchive project
 */
const toggleArchive = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const project = await projectService.toggleArchive(id, userId);
  
  successResponse(res, {
    message: `Project ${project.isArchived ? 'archived' : 'unarchived'} successfully`,
    data: project
  });
});

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  toggleArchive
};