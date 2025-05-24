class DateUtils {
  // Format duration from minutes to human readable
  static formatDuration(minutes) {
    if (!minutes || minutes < 0) return '0 menit';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} menit`;
    } else if (mins === 0) {
      return `${hours} jam`;
    } else {
      return `${hours} jam ${mins} menit`;
    }
  }
  
  // Get start of day
  static getStartOfDay(date = new Date()) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  
  // Get end of day
  static getEndOfDay(date = new Date()) {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  }
  
  // Get start of week (Monday)
  static getStartOfWeek(date = new Date()) {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  
  // Get start of month
  static getStartOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
  
  // Get date range for period
  static getDateRange(period = 'week') {
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'today':
        startDate = this.getStartOfDay(now);
        break;
      case 'week':
        startDate = this.getStartOfWeek(now);
        break;
      case 'month':
        startDate = this.getStartOfMonth(now);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = this.getStartOfWeek(now);
    }
    
    return { startDate, endDate: now };
  }
}

module.exports = DateUtils;