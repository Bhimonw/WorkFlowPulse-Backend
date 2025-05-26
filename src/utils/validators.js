const Joi = require('joi');
const { REGEX_PATTERNS, USER_ROLES, PROJECT_STATUS, PULSE_TYPES } = require('./constants');

// Common validation schemas
const commonSchemas = {
  objectId: Joi.string().pattern(REGEX_PATTERNS.MONGODB_ID).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(REGEX_PATTERNS.PASSWORD).required(),
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(500).optional(),
  url: Joi.string().uri().optional(),
  phone: Joi.string().pattern(REGEX_PATTERNS.PHONE).optional(),
  color: Joi.string().pattern(REGEX_PATTERNS.HEX_COLOR).optional(),
  date: Joi.date().iso().optional(),
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }
};

// User validation schemas
const userSchemas = {
  register: Joi.object({
    name: commonSchemas.name,
    email: commonSchemas.email,
    password: commonSchemas.password,
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    acceptTerms: Joi.boolean().valid(true).required()
  }),
  
  login: Joi.object({
    email: commonSchemas.email,
    password: Joi.string().required(),
    rememberMe: Joi.boolean().default(false)
  }),
  
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    phone: commonSchemas.phone,
    bio: Joi.string().max(500).optional(),
    website: commonSchemas.url,
    location: Joi.string().max(100).optional(),
    timezone: Joi.string().optional()
  }),
  
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: commonSchemas.password,
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  }),
  
  forgotPassword: Joi.object({
    email: commonSchemas.email
  }),
  
  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: commonSchemas.password,
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
  })
};

// Project validation schemas
const projectSchemas = {
  create: Joi.object({
    name: commonSchemas.name,
    description: commonSchemas.description,
    status: Joi.string().valid(...Object.values(PROJECT_STATUS)).default('active'),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    startDate: commonSchemas.date,
    endDate: commonSchemas.date,
    estimatedHours: Joi.number().positive().optional(),
    hourlyRate: Joi.number().positive().optional(),
    color: commonSchemas.color,
    tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
    isPublic: Joi.boolean().default(false)
  }),
  
  update: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    description: Joi.string().max(500).optional(),
    status: Joi.string().valid(...Object.values(PROJECT_STATUS)).optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    startDate: commonSchemas.date,
    endDate: commonSchemas.date,
    estimatedHours: Joi.number().positive().optional(),
    hourlyRate: Joi.number().positive().optional(),
    color: commonSchemas.color,
    tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
    isPublic: Joi.boolean().optional()
  }),
  
  statusUpdate: Joi.object({
    status: Joi.string().valid(...Object.values(PROJECT_STATUS)).required()
  })
};

// Pulse validation schemas
const pulseSchemas = {
  start: Joi.object({
    projectId: commonSchemas.objectId,
    type: Joi.string().valid(...Object.values(PULSE_TYPES)).default('work'),
    description: Joi.string().max(200).optional(),
    tags: Joi.array().items(Joi.string().max(30)).max(5).optional()
  }),
  
  stop: Joi.object({
    pulseId: commonSchemas.objectId,
    description: Joi.string().max(200).optional(),
    tags: Joi.array().items(Joi.string().max(30)).max(5).optional()
  }),
  
  pause: Joi.object({
    pulseId: commonSchemas.objectId,
    reason: Joi.string().max(100).optional()
  }),
  
  resume: Joi.object({
    pulseId: commonSchemas.objectId
  }),
  
  update: Joi.object({
    description: Joi.string().max(200).optional(),
    tags: Joi.array().items(Joi.string().max(30)).max(5).optional(),
    startTime: Joi.date().iso().optional(),
    endTime: Joi.date().iso().optional()
  })
};

// Print validation schemas
const printSchemas = {
  receipt: Joi.object({
    pulseId: commonSchemas.objectId,
    template: Joi.string().valid('basic', 'detailed', 'summary').default('basic'),
    includeQR: Joi.boolean().default(false)
  }),
  
  summary: Joi.object({
    projectId: commonSchemas.objectId.optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    template: Joi.string().valid('daily', 'weekly', 'monthly', 'custom').default('daily'),
    includeCharts: Joi.boolean().default(true)
  }),
  
  report: Joi.object({
    type: Joi.string().valid('time', 'project', 'earnings', 'productivity').required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    projectIds: Joi.array().items(commonSchemas.objectId).optional(),
    format: Joi.string().valid('pdf', 'csv', 'excel').default('pdf'),
    template: Joi.string().optional()
  })
};

// Query validation schemas
const querySchemas = {
  pagination: Joi.object({
    page: commonSchemas.pagination.page,
    limit: commonSchemas.pagination.limit,
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),
  
  dateRange: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    timezone: Joi.string().optional()
  }).custom((value, helpers) => {
    if (new Date(value.startDate) >= new Date(value.endDate)) {
      return helpers.error('date.range');
    }
    return value;
  }),
  
  search: Joi.object({
    q: Joi.string().min(1).max(100).optional(),
    fields: Joi.array().items(Joi.string()).optional(),
    filters: Joi.object().optional()
  })
};

// File upload validation schemas
const fileSchemas = {
  avatar: Joi.object({
    mimetype: Joi.string().valid('image/jpeg', 'image/png', 'image/gif').required(),
    size: Joi.number().max(5 * 1024 * 1024).required() // 5MB
  }),
  
  document: Joi.object({
    mimetype: Joi.string().valid(
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ).required(),
    size: Joi.number().max(10 * 1024 * 1024).required() // 10MB
  })
};

// Bulk operation validation schemas
const bulkSchemas = {
  delete: Joi.object({
    ids: Joi.array().items(commonSchemas.objectId).min(1).max(100).required()
  }),
  
  export: Joi.object({
    ids: Joi.array().items(commonSchemas.objectId).min(1).max(1000).required(),
    format: Joi.string().valid('csv', 'excel', 'json').default('csv'),
    fields: Joi.array().items(Joi.string()).optional()
  })
};

module.exports = {
  commonSchemas,
  userSchemas,
  projectSchemas,
  pulseSchemas,
  printSchemas,
  querySchemas,
  fileSchemas,
  bulkSchemas
};