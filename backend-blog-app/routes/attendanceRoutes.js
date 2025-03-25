const express = require('express');
const router = express.Router();
const { 
  createAttendance, 
  getAttendances, 
  getAttendanceById, 
  updateAttendance,
  getAttendanceStats 
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createAttendance)
  .get(protect, getAttendances);

router.route('/stats')
  .get(protect, getAttendanceStats);

router.route('/:id')
  .get(protect, getAttendanceById)
  .put(protect, updateAttendance);

module.exports = router;