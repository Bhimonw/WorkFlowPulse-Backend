const express = require('express');
const {
    startWorkSession,
    endWorkSession,
    getActiveSession,
    getWorkSessions
} = require('../controllers/workSessionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, getWorkSessions);

router.route('/start')
    .post(protect, startWorkSession);

router.route('/active')
    .get(protect, getActiveSession);

router.route('/:id/end')
    .put(protect, endWorkSession);

module.exports = router;