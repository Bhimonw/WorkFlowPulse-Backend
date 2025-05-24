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
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    password: Joi.string().min(6)
  })
};

// Project validation schemas
const projectSchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(100).required().messages({
      'any.required': 'Nama project harus diisi',
      'string.max': 'Nama project maksimal 100 karakter'
    }),
    description: Joi.string().max(500).allow(''),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#3B82F6')
  }),
  
  update: Joi.object({
    name: Joi.string().min(1).max(100),
    description: Joi.string().max(500).allow(''),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i)
  })
};

// Work session validation schemas
const workSessionSchemas = {
  start: Joi.object({
    projectId: Joi.string().required().messages({
      'any.required': 'Project ID harus diisi'
    }),
    notes: Joi.string().max(500).allow('')
  }),
  
  end: Joi.object({
    notes: Joi.string().max(500).allow('')
  })
};

module.exports = {
  userSchemas,
  projectSchemas,
  workSessionSchemas
};