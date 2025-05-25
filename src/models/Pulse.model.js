const mongoose = require('mongoose');

const pulseSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // in minutes
    min: [0, 'Duration cannot be negative'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  pausedDuration: {
    type: Number, // in minutes
    min: [0, 'Paused duration cannot be negative'],
    default: 0
  },
  pauseHistory: [{
    pausedAt: { type: Date, required: true },
    resumedAt: { type: Date, default: null },
    duration: { type: Number, default: 0 } // in minutes
  }],
  type: {
    type: String,
    enum: ['work', 'break', 'meeting', 'research', 'other'],
    default: 'work'
  },
  billable: {
    type: Boolean,
    default: true
  },
  hourlyRate: {
    type: Number,
    min: [0, 'Hourly rate cannot be negative'],
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
pulseSchema.index({ project: 1, startTime: -1 });
pulseSchema.index({ user: 1, startTime: -1 });
pulseSchema.index({ isActive: 1 });
pulseSchema.index({ startTime: -1 });

// Virtual for actual duration (excluding pauses)
pulseSchema.virtual('actualDuration').get(function() {
  return Math.max(this.duration - this.pausedDuration, 0);
});

// Virtual for earnings
pulseSchema.virtual('earnings').get(function() {
  if (!this.billable || !this.hourlyRate) return 0;
  return (this.actualDuration / 60) * this.hourlyRate;
});

// Virtual for formatted duration
pulseSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.actualDuration / 60);
  const minutes = this.actualDuration % 60;
  return `${hours}h ${minutes}m`;
});

// Pre-save middleware to calculate duration
pulseSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const diffMs = this.endTime - this.startTime;
    this.duration = Math.round(diffMs / (1000 * 60)); // Convert to minutes
    this.isActive = false;
  }
  next();
});

// Static method to get active pulse for user
pulseSchema.statics.getActivePulse = function(userId) {
  return this.findOne({ user: userId, isActive: true })
    .populate('project', 'name color')
    .populate('user', 'name email');
};

// Static method to get daily stats
pulseSchema.statics.getDailyStats = function(userId, date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        startTime: { $gte: startOfDay, $lte: endOfDay },
        isActive: false
      }
    },
    {
      $group: {
        _id: null,
        totalDuration: { $sum: '$duration' },
        totalPaused: { $sum: '$pausedDuration' },
        totalPulses: { $sum: 1 },
        totalEarnings: { $sum: { $multiply: [{ $divide: ['$duration', 60] }, '$hourlyRate'] } }
      }
    }
  ]);
};

// Instance method to pause pulse
pulseSchema.methods.pause = function() {
  if (!this.isActive) throw new Error('Pulse is not active');
  
  this.pauseHistory.push({
    pausedAt: new Date()
  });
  
  return this.save();
};

// Instance method to resume pulse
pulseSchema.methods.resume = function() {
  if (!this.isActive) throw new Error('Pulse is not active');
  
  const lastPause = this.pauseHistory[this.pauseHistory.length - 1];
  if (!lastPause || lastPause.resumedAt) {
    throw new Error('No active pause to resume');
  }
  
  const now = new Date();
  lastPause.resumedAt = now;
  lastPause.duration = Math.round((now - lastPause.pausedAt) / (1000 * 60));
  this.pausedDuration += lastPause.duration;
  
  return this.save();
};

// Instance method to stop pulse
pulseSchema.methods.stop = function(notes = '') {
  if (!this.isActive) throw new Error('Pulse is not active');
  
  // If there's an active pause, resume it first
  const lastPause = this.pauseHistory[this.pauseHistory.length - 1];
  if (lastPause && !lastPause.resumedAt) {
    this.resume();
  }
  
  this.endTime = new Date();
  this.notes = notes;
  this.isActive = false;
  
  return this.save();
};

module.exports = mongoose.model('Pulse', pulseSchema);