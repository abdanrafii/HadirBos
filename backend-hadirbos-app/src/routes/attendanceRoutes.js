const express = require("express");
const router = express.Router();
const {
  getAllAttendances,
  createAttendance,
  getAttendances,
  getAttendanceById,
  updateAttendance,
  getAttendanceStats,
  getAttendancesByUser,
  getAllAttendanceStats,
  getDepartmentStatistics,
  getEmployeePerformanceStats,
  getAttendanceTrend,
  createAttendanceAdminOnly,
} = require("../controllers/attendanceController");
const { protect, admin } = require("../middleware/authMiddleware");
const checkWorkingDay = require("../middleware/checkWorkingDayMiddleware");

router
  .route("/")
  .post(protect, checkWorkingDay, createAttendance)
  .get(protect, getAttendances);

router.get("/all", protect, getAllAttendances);

router.route("/admin").post(protect, admin, createAttendanceAdminOnly);

router.route("/trend").get(protect, admin, getAttendanceTrend);

router.route("/stats/employee/:employeeId").get(protect, getAttendanceStats);

router
  .route("/:id")
  .get(protect, getAttendanceById)
  .put(protect, updateAttendance);

router.route("/employee/:employeeId").get(protect, admin, getAttendancesByUser);

router.route("/stats/all").get(protect, admin, getAllAttendanceStats);

router.route("/stats/department").get(protect, admin, getDepartmentStatistics);

router
  .route("/stats/employee-performance")
  .get(protect, admin, getEmployeePerformanceStats);

module.exports = router;
