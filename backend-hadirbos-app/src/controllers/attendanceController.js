const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");

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

// @desc    Get attendance stats for current employee
// @route   GET /api/attendance/stats
// @access  Private
const getAttendanceStats = asyncHandler(async (req, res) => {
  const employeeId = req.user._id;

  // Get current month range
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get attendance stats for current month
  const monthlyStats = await Attendance.aggregate([
    {
      $match: {
        employeeId: new mongoose.Types.ObjectId(employeeId),
        date: { $gte: firstDay, $lte: lastDay },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Convert to more readable format
  const stats = {
    present: 0,
    late: 0,
    sick: 0,
    leave: 0,
    absent: 0,
    total: 0,
  };

  monthlyStats.forEach((stat) => {
    stats[stat._id] = stat.count;
    stats.total += stat.count;
  });

  res.json({
    month: now.toLocaleString("default", { month: "long" }),
    year: now.getFullYear(),
    stats,
  });
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

const getAttendancesByUser = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const { employeeId } = req.params;

  const query = { employeeId: employeeId };

  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  } else if (year && !month) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  const attendances = await Attendance.find(query);

  res.json(attendances);
});

module.exports = {
  getAllAttendances,
  createAttendance,
  getAttendances,
  getAttendanceById,
  updateAttendance,
  getAttendanceStats,
  getAttendancesByUser,
};
