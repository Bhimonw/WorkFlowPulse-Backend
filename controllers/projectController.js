const Project = require('../models/Project');
const WorkSession = require('../models/WorkSession');

// @desc    Get all projects for user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
    try {
        const { name, description, color } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Nama project harus diisi' });
        }

        const project = await Project.create({
            name,
            description,
            color,
            user: req.user._id
        });

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project tidak ditemukan' });
        }

        // Check if user owns the project
        if (project.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Tidak memiliki akses ke project ini' });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project tidak ditemukan' });
        }

        // Check if user owns the project
        if (project.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Tidak memiliki akses ke project ini' });
        }

        await Project.findByIdAndDelete(req.params.id);

        // Also delete all work sessions for this project
        await WorkSession.deleteMany({ project: req.params.id });

        res.json({ message: 'Project berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getProjects,
    createProject,
    updateProject,
    deleteProject
};