const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const { getWorkingDays } = require("../scheduler/autoPayroll");
const User = require("../models/User");

// @desc    Create attendance record
// @route   POST /api/attendance
// @access  Private
const createAttendance = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const employeeId = req.user._id;

  // Check if already submitted for today
  const existingAttendance = await Attendance.checkTodayAttendance(employeeId);

  if (existingAttendance) {
    res.status(400);
    throw new Error("Attendance already submitted for today");
  }

  const attendance = await Attendance.create({
    employeeId,
    status,
    note,
  });

  if (attendance) {
    res.status(201).json(attendance);
  } else {
    res.status(400);
    throw new Error("Invalid attendance data");
  }
});

// @desc    Get all attendance records for current employee
// @route   GET /api/attendance
// @access  Private
const getAttendances = asyncHandler(async (req, res) => {
  const employeeId = req.user._id;

  const attendances = await Attendance.find({ employeeId })
    .sort({ date: -1 })
    .limit(30); // Get last 30 attendance records

  res.json(attendances);
});

// @desc    Get attendance by ID
// @route   GET /api/attendance/:id
// @access  Private
const getAttendanceById = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);

  if (attendance) {
    // Check if the attendance record belongs to the user
    // if (attendance.employeeId.toString() !== req.user._id.toString()) {
    //   res.status(401);
    //   throw new Error("Not authorized to access this attendance record");
    // }

    res.json(attendance);
  } else {
    res.status(404);
    throw new Error("Attendance record not found");
  }
});

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private/Admin
const updateAttendance = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  const attendance = await Attendance.findById(req.params.id);

  if (attendance) {
    // Only allow admins or the employee themselves to update
    if (
      attendance.employeeId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(401);
      throw new Error("Not authorized to update this attendance record");
    }

    // Check if it's the same day or admin (admins can update past records)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceDate = new Date(attendance.date);
    attendanceDate.setHours(0, 0, 0, 0);

    const isToday = today.getTime() === attendanceDate.getTime();

    if (!isToday && req.user.role !== "admin") {
      res.status(400);
      throw new Error("Cannot update past attendance records");
    }

    attendance.status = status || attendance.status;
    attendance.note = note !== undefined ? note : attendance.note;

    const updatedAttendance = await attendance.save();
    res.json(updatedAttendance);
  } else {
    res.status(404);
    throw new Error("Attendance record not found");
  }
});

// @desc    Get all attendance records (Admin only)
// @route   GET /api/attendance/all
// @access  Private/Admin
const getAllAttendances = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized as admin");
  }

  const attendances = await Attendance.find()
    .populate("employeeId", "name department position") // agar bisa tampil nama karyawan
    .sort({ date: -1 });

  res.json(attendances);
});

// @desc    Get attendance stats for current employee
// @route   GET /api/attendance/stats/employee/:employeeId
// @access  Private
const getAttendanceStats = asyncHandler(async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year, period } = req.query;

    // 1. Ambil date range (sudah otomatis ikut join date kalau allTime/YTD)
    const { startDate, endDate } = await getDateRange(employeeId, month, year, period);

    // 2. Hitung total hari kerja
    const totalWorkDays = await getWorkingDays(startDate, endDate);

    // 3. Ambil data absensi user dalam periode ini
    const data = await getAttendancesByUserData(employeeId, startDate, endDate);

    const safeData = data || [];
    
    // 4. Hitung statistik
    const daysWorked = safeData.filter(
      (record) => record.status !== "weekend"
    ).length;

    const stats = {
      present: safeData.filter((record) => record.status === "present").length,
      absent: safeData.filter((record) => record.status === "absent").length,
      leave: safeData.filter((record) => record.status === "leave").length,
      late: safeData.filter((record) => record.status === "late").length,
      sick: safeData.filter((record) => record.status === "sick").length,
      daysWorked,
      totalWorkDays,

      // 5. Hitung persentase kehadiran (present / totalWorkDays)
      attendanceRate:
        totalWorkDays > 0
          ? (
              (safeData.filter((r) => r.status === "present").length / totalWorkDays) * 100
            ).toFixed(2)
          : "0.00",
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// @desc    Get attendance stats for current employee
// @route   GET /api/attendance/employee/:employeeId
// @access  Private
const getAttendancesByUser = asyncHandler(async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year, period } = req.query;

    const { startDate, endDate } = await getDateRange(employeeId, month, year, period);

    const data = await getAttendancesByUserData(employeeId, startDate, endDate);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getAttendancesByUserData = async (employeeId, startDate, endDate) => {
  const query = { employeeId: employeeId };

  if (startDate && endDate) {
    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  const attendances = await Attendance.find(query);
  return attendances;
};

const getDateRange = async (employeeId, month, year, period) => {
  let startDate = null;
  let endDate = null;
  const today = new Date();

  const employee = await User.findById(employeeId);
  const joinDate = employee ? new Date(employee.joinDate) : null;

  if (!joinDate) {
    throw new Error("Employee join date not found.");
  }

  if (month && year) {
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0, 23, 59, 59, 999);
  } else if (period === "ytd") {
    startDate =
      joinDate > new Date(today.getFullYear(), 0, 1)
        ? joinDate
        : new Date(today.getFullYear(), 0, 1);
    endDate = today;
  } else if (period === "allTime" || !period) {
    startDate = joinDate;
    endDate = today;
  }

  return { startDate, endDate };
};

module.exports = {
  getAllAttendances,
  createAttendance,
  getAttendances,
  getAttendanceById,
  updateAttendance,
  getAttendanceStats,
  getAttendancesByUser,
};
