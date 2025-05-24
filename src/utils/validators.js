const Joi = require('joi');

// User validation schemas
const userSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Nama minimal 2 karakter',
      'string.max': 'Nama maksimal 50 karakter',
      'any.required': 'Nama harus diisi'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Format email tidak valid',
      'any.required': 'Email harus diisi'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password minimal 6 karakter',
      'any.required': 'Password harus diisi'
    })
  }),
  
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Format email tidak valid',
      'any.required': 'Email harus diisi'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password harus diisi'
    })
  }),
  
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional()
  })
};

// Project validation schemas
const projectSchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(100).required().messages({
      'string.min': 'Nama project harus diisi',
      'string.max': 'Nama project maksimal 100 karakter',
      'any.required': 'Nama project harus diisi'
    }),
    description: Joi.string().max(500).optional().allow(''),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional().messages({
      'string.pattern.base': 'Format warna harus berupa hex color (contoh: #3B82F6)'
    })
  }),
  
  update: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    description: Joi.string().max(500).optional().allow(''),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    isActive: Joi.boolean().optional()
  })
};

// Work session validation schemas
const workSessionSchemas = {
  start: Joi.object({
    projectId: Joi.string().required().messages({
      'any.required': 'Project ID harus diisi'
    }),
    notes: Joi.string().max(500).optional().allow('')
  }),
  
  update: Joi.object({
    notes: Joi.string().max(500).optional().allow('')
  })
};

// Query validation schemas
const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),
  
  dateRange: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    period: Joi.string().valid('week', 'month', 'year').default('week')
  })
};

module.exports = {
  userSchemas,
  projectSchemas,
  workSessionSchemas,
  querySchemas
};