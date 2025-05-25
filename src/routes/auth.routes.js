const express = require('express');
const { authController } = require('../controllers');
const { auth, validation, rateLimiter } = require('../middleware');
const router = express.Router();

// Public routes with rate limiting
router.post('/register', 
  rateLimiter.authLimiter,
  validation.validateUser,
  authController.register
);

router.post('/login', 
  rateLimiter.authLimiter,
  validation.validateLogin,
  authController.login
);

router.post('/refresh-token', 
  rateLimiter.authLimiter,
  authController.refreshToken
);

router.post('/forgot-password', 
  rateLimiter.passwordResetLimiter,
  validation.validateEmail,
  authController.forgotPassword
);

router.post('/reset-password', 
  rateLimiter.passwordResetLimiter,
  validation.validatePasswordReset,
  authController.resetPassword
);

router.post('/verify-email', 
  rateLimiter.authLimiter,
  validation.validateEmailVerification,
  authController.verifyEmail
);

router.post('/resend-verification', 
  rateLimiter.authLimiter,
  validation.validateEmail,
  authController.resendVerification
);

// Protected routes
router.post('/logout', 
  auth.authenticate,
  authController.logout
);

router.post('/logout-all', 
  auth.authenticate,
  authController.logoutAll
);

router.post('/change-password', 
  auth.authenticate,
  validation.validatePasswordChange,
  authController.changePassword
);

router.get('/me', 
  auth.authenticate,
  authController.getProfile
);

router.get('/sessions', 
  auth.authenticate,
  authController.getActiveSessions
);

router.delete('/sessions/:sessionId', 
  auth.authenticate,
  authController.terminateSession
);

module.exports = router;