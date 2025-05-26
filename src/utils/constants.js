// Application constants and enums
module.exports = {
  // User roles
  USER_ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    MODERATOR: 'moderator'
  },

  // User status
  USER_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    PENDING: 'pending'
  },

  // Project status
  PROJECT_STATUS: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    PAUSED: 'paused',
    ARCHIVED: 'archived',
    CANCELLED: 'cancelled'
  },

  // Project priority
  PROJECT_PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  },

  // Pulse status
  PULSE_STATUS: {
    RUNNING: 'running',
    PAUSED: 'paused',
    STOPPED: 'stopped',
    COMPLETED: 'completed'
  },

  // Pulse types
  PULSE_TYPES: {
    WORK: 'work',
    BREAK: 'break',
    MEETING: 'meeting',
    RESEARCH: 'research',
    DEVELOPMENT: 'development',
    TESTING: 'testing',
    DOCUMENTATION: 'documentation'
  },

  // Time formats
  TIME_FORMATS: {
    FULL_DATE: 'YYYY-MM-DD HH:mm:ss',
    DATE_ONLY: 'YYYY-MM-DD',
    TIME_ONLY: 'HH:mm:ss',
    DISPLAY_DATE: 'DD/MM/YYYY',
    DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm'
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },

  // Rate limiting
  RATE_LIMITS: {
    API_REQUESTS_PER_HOUR: 1000,
    AUTH_REQUESTS_PER_HOUR: 50,
    PASSWORD_RESET_PER_HOUR: 5
  },

  // File upload limits
  FILE_LIMITS: {
    AVATAR_MAX_SIZE: 5 * 1024 * 1024, // 5MB
    EXPORT_MAX_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    ALLOWED_EXPORT_TYPES: ['application/pdf', 'text/csv', 'application/vnd.ms-excel']
  },

  // Email types
  EMAIL_TYPES: {
    VERIFICATION: 'verification',
    PASSWORD_RESET: 'password_reset',
    WELCOME: 'welcome',
    PROJECT_REMINDER: 'project_reminder',
    PULSE_SUMMARY: 'pulse_summary'
  },

  // Print formats
  PRINT_FORMATS: {
    RECEIPT: 'receipt',
    SUMMARY: 'summary',
    DETAILED_REPORT: 'detailed_report',
    INVOICE: 'invoice'
  },

  // Error codes
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
    DUPLICATE_ERROR: 'DUPLICATE_ERROR',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
    SERVER_ERROR: 'SERVER_ERROR'
  },

  // Success messages
  SUCCESS_MESSAGES: {
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    PROJECT_CREATED: 'Project created successfully',
    PROJECT_UPDATED: 'Project updated successfully',
    PROJECT_DELETED: 'Project deleted successfully',
    PULSE_STARTED: 'Pulse started successfully',
    PULSE_STOPPED: 'Pulse stopped successfully',
    PULSE_PAUSED: 'Pulse paused successfully',
    PULSE_RESUMED: 'Pulse resumed successfully'
  },

  // Regex patterns
  REGEX_PATTERNS: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    PHONE: /^\+?[1-9]\d{1,14}$/,
    MONGODB_ID: /^[0-9a-fA-F]{24}$/,
    HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  }
};