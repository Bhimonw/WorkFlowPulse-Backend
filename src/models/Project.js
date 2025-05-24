const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nama project harus diisi'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    color: {
        type: String,
        default: '#3B82F6' // Default blue color
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    totalTimeSpent: {
        type: Number,
        default: 0 // in minutes
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);