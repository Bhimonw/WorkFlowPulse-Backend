const { TIME_FORMATS } = require('./constants');

/**
 * Format date to specified format
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string
 * @returns {string} Formatted date
 */
const formatDate = (date, format = TIME_FORMATS.FULL_DATE) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * Get start of day
 * @param {Date|string} date - Input date
 * @returns {Date} Start of day
 */
const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day
 * @param {Date|string} date - Input date
 * @returns {Date} End of day
 */
const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get start of week
 * @param {Date|string} date - Input date
 * @returns {Date} Start of week (Monday)
 */
const getStartOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  return getStartOfDay(monday);
};

/**
 * Get end of week
 * @param {Date|string} date - Input date
 * @returns {Date} End of week (Sunday)
 */
const getEndOfWeek = (date = new Date()) => {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return getEndOfDay(endOfWeek);
};

/**
 * Get start of month
 * @param {Date|string} date - Input date
 * @returns {Date} Start of month
 */
const getStartOfMonth = (date = new Date()) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

/**
 * Get end of month
 * @param {Date|string} date - Input date
 * @returns {Date} End of month
 */
const getEndOfMonth = (date = new Date()) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
};

/**
 * Calculate duration between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Object} Duration object with days, hours, minutes, seconds
 */
const calculateDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  
  if (diffMs < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, totalMs: diffMs };
};

/**
 * Format duration to human readable string
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} Formatted duration
 */
const formatDuration = (milliseconds) => {
  if (!milliseconds || milliseconds < 0) return '0 seconds';
  
  const duration = calculateDuration(new Date(0), new Date(milliseconds));
  const parts = [];
  
  if (duration.days > 0) parts.push(`${duration.days} day${duration.days > 1 ? 's' : ''}`);
  if (duration.hours > 0) parts.push(`${duration.hours} hour${duration.hours > 1 ? 's' : ''}`);
  if (duration.minutes > 0) parts.push(`${duration.minutes} minute${duration.minutes > 1 ? 's' : ''}`);
  if (duration.seconds > 0 && parts.length === 0) parts.push(`${duration.seconds} second${duration.seconds > 1 ? 's' : ''}`);
  
  return parts.length > 0 ? parts.join(', ') : '0 seconds';
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} Is today
 */
const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  
  return today.getDate() === checkDate.getDate() &&
         today.getMonth() === checkDate.getMonth() &&
         today.getFullYear() === checkDate.getFullYear();
};

/**
 * Check if date is this week
 * @param {Date|string} date - Date to check
 * @returns {boolean} Is this week
 */
const isThisWeek = (date) => {
  const startOfWeek = getStartOfWeek();
  const endOfWeek = getEndOfWeek();
  const checkDate = new Date(date);
  
  return checkDate >= startOfWeek && checkDate <= endOfWeek;
};

/**
 * Check if date is this month
 * @param {Date|string} date - Date to check
 * @returns {boolean} Is this month
 */
const isThisMonth = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  
  return today.getMonth() === checkDate.getMonth() &&
         today.getFullYear() === checkDate.getFullYear();
};

/**
 * Add time to date
 * @param {Date|string} date - Base date
 * @param {number} amount - Amount to add
 * @param {string} unit - Unit (days, hours, minutes, seconds)
 * @returns {Date} New date
 */
const addTime = (date, amount, unit) => {
  const d = new Date(date);
  
  switch (unit) {
    case 'days':
      d.setDate(d.getDate() + amount);
      break;
    case 'hours':
      d.setHours(d.getHours() + amount);
      break;
    case 'minutes':
      d.setMinutes(d.getMinutes() + amount);
      break;
    case 'seconds':
      d.setSeconds(d.getSeconds() + amount);
      break;
    default:
      throw new Error('Invalid time unit');
  }
  
  return d;
};

module.exports = {
  formatDate,
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  calculateDuration,
  formatDuration,
  isToday,
  isThisWeek,
  isThisMonth,
  addTime
};