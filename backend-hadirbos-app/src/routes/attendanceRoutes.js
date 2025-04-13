const express = require('express');
const router = express.Router();
const { 
  getAllAttendances,
  createAttendance, 
  getAttendances, 
  getAttendanceById, 
  updateAttendance,
  getAttendanceStats 
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const checkWorkingDay = require('../middleware/checkWorkingDayMiddleware');

router.route('/')
  .post(protect, checkWorkingDay, createAttendance)
  .get(protect, getAttendances);

router.get('/all', protect, getAllAttendances);

router.route('/stats')
  .get(protect, getAttendanceStats);

router.route('/:id')
  .get(protect, getAttendanceById)
  .put(protect, updateAttendance);

module.exports = router;