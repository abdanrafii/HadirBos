const express = require('express');
const router = express.Router();
const { 
  getAllAttendances,
  createAttendance, 
  getAttendances, 
  getAttendanceById, 
  updateAttendance,
  getAttendanceStats, 
  getAttendancesByUser
} = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');
const checkWorkingDay = require('../middleware/checkWorkingDayMiddleware');

router.route('/')
  .post(protect, checkWorkingDay, createAttendance)
  .get(protect, getAttendances);

router.get('/all', protect, getAllAttendances);

router.route('/stats/employee/:employeeId')
  .get(protect, getAttendanceStats);

router.route('/:id')
  .get(protect, getAttendanceById)
  .put(protect, updateAttendance);

router.route('/employee/:employeeId')
  .get(protect, admin, getAttendancesByUser);

module.exports = router;