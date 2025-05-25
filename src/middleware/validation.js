const Joi = require('joi');
const { AppError } = require('../utils/errorHandler');

/**
 * Generic validation middleware factory
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      return next(new AppError(errorMessage, 400));
    }

    req[property] = value;
    next();
  };
};

// User validation schemas
const userSchemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    role: Joi.string().valid('admin', 'user').default('user')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(1).max(50),
    lastName: Joi.string().min(1).max(50),
    preferences: Joi.object({
      theme: Joi.string().valid('light', 'dark'),
      language: Joi.string().valid('en', 'id'),
      timezone: Joi.string(),
      notifications: Joi.object({
        email: Joi.boolean(),
        push: Joi.boolean(),
        desktop: Joi.boolean()
      })
    })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  })
};

// Project validation schemas
const projectSchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500),
    status: Joi.string().valid('planning', 'active', 'on-hold', 'completed', 'cancelled').default('planning'),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    startDate: Joi.date(),
    endDate: Joi.date().greater(Joi.ref('startDate')),
    estimatedHours: Joi.number().min(0),
    hourlyRate: Joi.number().min(0),
    tags: Joi.array().items(Joi.string()),
    client: Joi.object({
      name: Joi.string().max(100),
      email: Joi.string().email(),
      phone: Joi.string()
    })
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(100),
    description: Joi.string().max(500),
    status: Joi.string().valid('planning', 'active', 'on-hold', 'completed', 'cancelled'),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
    startDate: Joi.date(),
    endDate: Joi.date(),
    estimatedHours: Joi.number().min(0),
    hourlyRate: Joi.number().min(0),
    tags: Joi.array().items(Joi.string()),
    client: Joi.object({
      name: Joi.string().max(100),
      email: Joi.string().email(),
      phone: Joi.string()
    })
  })
};

// Pulse (Work Session) validation schemas
const pulseSchemas = {
  start: Joi.object({
    projectId: Joi.string().hex().length(24).required(),
    description: Joi.string().max(200),
    tags: Joi.array().items(Joi.string())
  }),

  update: Joi.object({
    description: Joi.string().max(200),
    tags: Joi.array().items(Joi.string())
  }),

  addBreak: Joi.object({
    reason: Joi.string().max(100),
    duration: Joi.number().min(1) // minutes
  })
};

// Query validation schemas
const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().default('-createdAt'),
    search: Joi.string().max(100)
  }),

  dateRange: Joi.object({
    startDate: Joi.date(),
    endDate: Joi.date().greater(Joi.ref('startDate'))
  })
};

module.exports = {
  validate,
  userSchemas,
  projectSchemas,
  pulseSchemas,
  querySchemas
};