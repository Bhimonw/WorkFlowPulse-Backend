/**
 * Logger Utility
 * Simple logging implementation for the application
 */

const environment = require('../config/environment');

class Logger {
  constructor() {
    this.isDevelopment = environment.NODE_ENV === 'development';
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta
    };

    if (this.isDevelopment) {
      return JSON.stringify(logEntry, null, 2);
    }
    return JSON.stringify(logEntry);
  }

  info(message, meta = {}) {
    console.log(this.formatMessage('info', message, meta));
  }

  error(message, meta = {}) {
    console.error(this.formatMessage('error', message, meta));
  }

  warn(message, meta = {}) {
    console.warn(this.formatMessage('warn', message, meta));
  }

  debug(message, meta = {}) {
    if (this.isDevelopment) {
      console.log(this.formatMessage('debug', message, meta));
    }
  }
}

module.exports = new Logger();