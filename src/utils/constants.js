module.exports = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
  },
  
  // Error Messages
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: 'Email atau password salah',
    USER_NOT_FOUND: 'User tidak ditemukan',
    PROJECT_NOT_FOUND: 'Project tidak ditemukan',
    SESSION_NOT_FOUND: 'Sesi kerja tidak ditemukan',
    ACTIVE_SESSION_EXISTS: 'Masih ada sesi kerja yang aktif',
    UNAUTHORIZED_ACCESS: 'Akses tidak diizinkan',
    VALIDATION_ERROR: 'Data yang dikirim tidak valid'
  },
  
  // Success Messages
  SUCCESS_MESSAGES: {
    USER_REGISTERED: 'User berhasil didaftarkan',
    LOGIN_SUCCESS: 'Login berhasil',
    PROJECT_CREATED: 'Project berhasil dibuat',
    PROJECT_UPDATED: 'Project berhasil diupdate',
    PROJECT_DELETED: 'Project berhasil dihapus',
    SESSION_STARTED: 'Sesi kerja dimulai',
    SESSION_ENDED: 'Sesi kerja berakhir'
  },
  
  // Default Values
  DEFAULTS: {
    PROJECT_COLOR: '#3B82F6',
    PAGINATION_LIMIT: 50,
    SESSION_TIMEOUT: 8 * 60 * 60 * 1000 // 8 hours in milliseconds
  }
};
