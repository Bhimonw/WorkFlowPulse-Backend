const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project owner is required']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived', 'on-hold'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  deadline: {
    type: Date,
    default: null
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative'],
    default: 0
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  color: {
    type: String,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color'],
    default: '#3B82F6'
  },
  client: {
    name: { type: String, trim: true },
    email: { type: String, lowercase: true },
    company: { type: String, trim: true }
  },
  budget: {
    amount: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' },
    hourlyRate: { type: Number, min: 0 }
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
projectSchema.index({ owner: 1, status: 1 });
projectSchema.index({ deadline: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ createdAt: -1 });

// Virtual for project's pulses
projectSchema.virtual('pulses', {
  ref: 'Pulse',
  localField: '_id',
  foreignField: 'project'
});

// Virtual for completion percentage
projectSchema.virtual('completionPercentage').get(function() {
  if (this.estimatedHours === 0) return 0;
  return Math.min(Math.round((this.actualHours / this.estimatedHours) * 100), 100);
});

// Virtual for time remaining
projectSchema.virtual('timeRemaining').get(function() {
  return Math.max(this.estimatedHours - this.actualHours, 0);
});

// Virtual for deadline status
projectSchema.virtual('deadlineStatus').get(function() {
  if (!this.deadline) return 'no-deadline';
  
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 3) return 'urgent';
  if (diffDays <= 7) return 'soon';
  return 'normal';
});

// Pre-save middleware
projectSchema.pre('save', function(next) {
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  } else if (this.status !== 'completed') {
    this.completedAt = null;
  }
  next();
});

// Static method to get user's projects with stats
projectSchema.statics.getUserProjectsWithStats = function(userId) {
  return this.aggregate([
    { $match: { owner: mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'pulses',
        localField: '_id',
        foreignField: 'project',
        as: 'pulses'
      }
    },
    {
      $addFields: {
        totalPulses: { $size: '$pulses' },
        lastActivity: { $max: '$pulses.endTime' }
      }
    },
    { $sort: { createdAt: -1 } }
  ]);
};

module.exports = mongoose.model('Project', projectSchema);