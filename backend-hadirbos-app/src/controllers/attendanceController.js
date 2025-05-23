const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const { getWorkingDays } = require("../scheduler/autoPayroll");
const User = require("../models/User");
const Submission = require("../models/Submission");

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

// @desc    Create attendance record
// @route   POST /api/attendance/admin
// @access  Private
const createAttendanceAdminOnly = asyncHandler(async (req, res) => {
  const { status, note, date, employeeId } = req.body;

  if (!date) {
    res.status(400);
    throw new Error("Date is required");
  }

  const selectedDate = new Date(date);

  // Check if already submitted for the selected date
  const existingAttendance = await Attendance.findOne({
    employeeId,
    date: {
      $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
      $lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
    },
  });

  if (existingAttendance) {
    res.status(400);
    throw new Error("Attendance already submitted for this date");
  }

  const attendance = await Attendance.create({
    employeeId,
    status,
    note,
    date: selectedDate,
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
// @desc    Get attendance by ID
// @route   GET /api/attendance/:id
// @access  Private
const getAttendanceById = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id).populate(
    "employeeId",
    "name department position"
  );

  if (attendance) {
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
    if (
      attendance.employeeId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(401);
      throw new Error("Not authorized to update this attendance record");
    }

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

    const { startDate, endDate } = await getDateRange(
      employeeId,
      month,
      year,
      period
    );

    const totalWorkDays = await getWorkingDays(startDate, endDate);

    const data = await getAttendancesByUserData(employeeId, startDate, endDate);

    const safeData = data || [];

    const daysWorked = safeData.length;

    const stats = {
      present: safeData.filter((record) => record.status === "present").length,
      absent: safeData.filter((record) => record.status === "absent").length,
      leave: safeData.filter((record) => record.status === "leave").length,
      late: safeData.filter((record) => record.status === "late").length,
      sick: safeData.filter((record) => record.status === "sick").length,
      daysWorked,
      totalWorkDays,

      attendanceRate:
        totalWorkDays > 0
          ? (
              ((safeData.filter((r) => r.status === "present").length + safeData.filter((r) => r.status === "late").length) /
                totalWorkDays) *
              100
            ).toFixed(2)
          : "0.00",
    };

    res.json(stats);
  } catch (error) {
    console.error(error);
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

    const { startDate, endDate } = await getDateRange(
      employeeId,
      month,
      year,
      period
    );

    const data = await getAttendancesByUserData(employeeId, startDate, endDate);

    res.json(data);
  } catch (error) {
    console.error(error);
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
  } else if (year && !month) {
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    if (joinDate > startDate) {
      startDate = joinDate;
    }

    if (endDate > today) {
      endDate = today;
    }
  } else if (period === "ytd") {
    startDate =
      joinDate > new Date(today.getFullYear(), 0, 1)
        ? joinDate
        : new Date(today.getFullYear(), 0, 1);
    endDate = today;
  } else if (period === "allTime" || !period) {
    // Semua waktu
    startDate = joinDate;
    endDate = today;
  }

  return { startDate, endDate };
};

// @desc    Get attendance stats for all employees
// @route   GET /api/attendance/stats/all
// @access  Private (Admin only)
const getAllAttendanceStats = asyncHandler(async (req, res) => {
  try {
    const { month, year, period } = req.query;

    const employees = await User.find({ role: "employee" });

    if (employees.length === 0) {
      return res.json({
        count: 0,
        stats: [],
        message: "No employees found in the database",
      });
    }

    const allStats = [];

    for (const employee of employees) {
      const { startDate, endDate } = await getDateRange(
        employee._id,
        month,
        year,
        period
      );

      const totalWorkDays = await getWorkingDays(startDate, endDate);

      const data = await getAttendancesByUserData(
        employee._id,
        startDate,
        endDate
      );
      const safeData = data || [];

      const daysWorked = safeData.length;
      const missingDays = totalWorkDays - daysWorked;

      const present = safeData.filter((r) => r.status === "present").length;
      const absent = safeData.filter((r) => r.status === "absent").length + missingDays;
      const leave = safeData.filter((r) => r.status === "leave").length;
      const late = safeData.filter((r) => r.status === "late").length;
      const sick = safeData.filter((r) => r.status === "sick").length;

      const attendanceRate =
        totalWorkDays > 0
          ? (((present + late) / totalWorkDays) * 100).toFixed(2)
          : "0.00";

      const employeeStats = {
        employeeId: employee._id,
        name: employee.name || "Unknown",
        department: employee.department || "Not assigned",
        position: employee.position || "Not assigned",
        present,
        absent,
        leave,
        late,
        sick,
        daysWorked,
        totalWorkDays,
        attendanceRate,
      };

      allStats.push(employeeStats);
    }

    const totalPresent = allStats.reduce((sum, emp) => sum + emp.present, 0);
    const totalAbsent = allStats.reduce((sum, emp) => sum + emp.absent, 0);
    const totalLeave = allStats.reduce((sum, emp) => sum + emp.leave, 0);
    const totalLate = allStats.reduce((sum, emp) => sum + emp.late, 0);
    const totalSick = allStats.reduce((sum, emp) => sum + emp.sick, 0);

    const totalDaysWorked = allStats.reduce(
      (sum, emp) => sum + emp.daysWorked,
      0
    );

    const totalWorkDaysAll = allStats.reduce(
      (sum, emp) => sum + emp.totalWorkDays,
      0
    );

    const avgDaysWorkedPerEmployee =
      allStats.length > 0
        ? Math.round(totalDaysWorked / allStats.length).toString()
        : "0";

    const aggregateStats = {
      totalWorkDays: totalWorkDaysAll,
      presentRate:
        totalWorkDaysAll > 0
          ? ((totalPresent / totalWorkDaysAll) * 100).toFixed(2)
          : "0.00",
      absenceRate:
        totalWorkDaysAll > 0
          ? ((totalAbsent / totalWorkDaysAll) * 100).toFixed(2)
          : "0.00",
      leaveRate:
        totalWorkDaysAll > 0
          ? ((totalLeave / totalWorkDaysAll) * 100).toFixed(2)
          : "0.00",
      lateRate:
        totalWorkDaysAll > 0
          ? ((totalLate / totalWorkDaysAll) * 100).toFixed(2)
          : "0.00",
      sickRate:
        totalWorkDaysAll > 0
          ? ((totalSick / totalWorkDaysAll) * 100).toFixed(2)
          : "0.00",
      avgAttendanceRate:
        allStats.length > 0
          ? (
              allStats.reduce(
                (sum, emp) => sum + parseFloat(emp.attendanceRate),
                0
              ) / allStats.length
            ).toFixed(2)
          : "0.00",
      avgDaysWorkedPerEmployee,
    };

    res.json({
      totalEmployees: employees.length,
      aggregateStats,
      stats: allStats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get attendance statistics by department
// @route   GET /api/attendance/stats/department
// @access  Private/Admin
const getDepartmentStatistics = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized as admin");
  }

  try {
    const { month, year, period } = req.query;

    const departments = await User.distinct("department");

    const departmentStats = [];

    for (const department of departments) {
      if (!department) continue;

      const employees = await User.find({ department });

      const employeeIds = employees.map((emp) => emp._id);

      let totalPresent = 0;
      let totalLate = 0;
      let totalLeave = 0;
      let totalSick = 0;
      let totalAbsent = 0;
      let totalWorkDays = 0;

      const leaveRequests = await Submission.countDocuments({
        employeeId: { $in: employeeIds },
        type: "leave",
        ...(month && year
          ? 
          {
            createdAt: {
              $gte: new Date(year, month - 1, 1),
              $lte: new Date(year, month, 0),
            },
          }
          
          // {
          //     $or: [
          //       {
          //         startDate: {
          //           $gte: new Date(year, month - 1, 1),
          //           $lte: new Date(year, month, 0),
          //         },
          //       },
          //       {
          //         endDate: {
          //           $gte: new Date(year, month - 1, 1),
          //           $lte: new Date(year, month, 0),
          //         },
          //       },
          //     ],
          //   }
          : {}),
      });

      const resignations = await Submission.countDocuments({
        employeeId: { $in: employeeIds },
        type: "resignation",
        ...(month && year
          ? {
              createdAt: {
                $gte: new Date(year, month - 1, 1),
                $lte: new Date(year, month, 0),
              },
            }
          : {}),
      });

      for (const employee of employees) {
        try {
          const { startDate, endDate } = await getDateRange(
            employee._id,
            month,
            year,
            period
          );

          const employeeWorkDays = await getWorkingDays(startDate, endDate);
          totalWorkDays += employeeWorkDays;

          const data = await getAttendancesByUserData(
            employee._id,
            startDate,
            endDate
          );

          const safeData = data || [];
          const missingDays = employeeWorkDays - safeData.length;

          totalPresent += safeData.filter(
            (record) => record.status === "present"
          ).length;
          totalLate += safeData.filter(
            (record) => record.status === "late"
          ).length;
          totalLeave += safeData.filter(
            (record) => record.status === "leave"
          ).length;
          totalSick += safeData.filter(
            (record) => record.status === "sick"
          ).length;
          totalAbsent += safeData.filter(
            (record) => record.status === "absent"
          ).length + missingDays;
        } catch (employeeError) {
          console.error(employeeError);
        }
      }

      const attendanceRate =
        totalWorkDays > 0
          ? (((totalPresent + totalLate) / totalWorkDays) * 100).toFixed(2)
          : "0.00";

      const turnoverRate =
        employees.length > 0
          ? ((resignations / employees.length) * 100).toFixed(2)
          : "0.00";

      const deptStat = {
        department,
        employees: employees.length,
        attendanceRate,
        turnoverRate,
        leaveRequests,
        resignations,
        attendanceBreakdown: {
          present:
            totalWorkDays > 0
              ? ((totalPresent / totalWorkDays) * 100).toFixed(2)
              : "0.00",
          late:
            totalWorkDays > 0
              ? ((totalLate / totalWorkDays) * 100).toFixed(2)
              : "0.00",
          leave:
            totalWorkDays > 0
              ? ((totalLeave / totalWorkDays) * 100).toFixed(2)
              : "0.00",
          sick:
            totalWorkDays > 0
              ? ((totalSick / totalWorkDays) * 100).toFixed(2)
              : "0.00",
          absent:
            totalWorkDays > 0
              ? ((totalAbsent / totalWorkDays) * 100).toFixed(2)
              : "0.00",
        },
      };

      departmentStats.push(deptStat);
    }

    res.json({
      count: departmentStats.length,
      stats: departmentStats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get employee performance stats
// @route   GET /api/attendance/employee-performance
// @access  Private (Admin only)
const getEmployeePerformanceStats = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized as admin");
  }

  try {
    const { month, year, period, limit = 3 } = req.query;
    const limitNumber = parseInt(limit);

    const employees = await User.find({ status: "active", role: "employee" });

    if (employees.length === 0) {
      return res.json({
        topPerformers: [],
        attendanceConcerns: [],
      });
    }

    const employeeStats = [];

    for (const employee of employees) {
      try {
        const { startDate, endDate } = await getDateRange(
          employee._id,
          month,
          year,
          period
        );

        const totalWorkDays = await getWorkingDays(startDate, endDate);

        const data = await getAttendancesByUserData(
          employee._id,
          startDate,
          endDate
        );
        const safeData = data || [];

        const presentDays = safeData.filter(
          (record) => record.status === "present"
        ).length;

        const lateDays = safeData.filter(
          (record) => record.status === "late"
        ).length;

        const attendanceRate =
          totalWorkDays > 0
            ? (((presentDays + lateDays) / totalWorkDays) * 100).toFixed(2)
            : "0.00";

        employeeStats.push({
          employeeId: employee._id,
          name: employee.name,
          department: employee.department,
          attendanceRate,
        });
      } catch (error) {
        console.error(error);
      }
    }

    employeeStats.sort(
      (a, b) => parseFloat(b.attendanceRate) - parseFloat(a.attendanceRate)
    );

    const topPerformers = employeeStats.slice(0, limitNumber);

    const attendanceConcerns = [...employeeStats]
      .sort(
        (a, b) => parseFloat(a.attendanceRate) - parseFloat(b.attendanceRate)
      )
      .slice(0, limitNumber);

    res.json({
      topPerformers,
      attendanceConcerns,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get attendance trend (monthly aggregate)
// @route   GET /api/attendance/trend
// @access  Private (Admin only)
const getAttendanceTrend = asyncHandler(async (req, res) => {
  try {
    const { month, year, period } = req.query;

    const employees = await User.find({ role: "employee" });

    if (employees.length === 0) {
      return res.json({
        count: 0,
        trend: [],
        message: "No employees found in the database",
      });
    }

    // Proses trend data
    const trendData = await processAttendanceTrend(
      employees,
      month,
      year,
      period
    );

    res.json({
      totalEmployees: employees.length,
      trend: trendData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const processAttendanceTrend = async (employees, month, year, period) => {
  let monthsToProcess = [];

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  if (period === "allTime") {
    const attendances = await Attendance.find({
      user: { $in: employees.map(emp => emp._id) }
    });

    if (attendances.length > 0) {
      const uniqueMonthsSet = new Set();
      
      attendances.forEach(attendance => {
        const attendanceDate = new Date(attendance.date);
        const year = attendanceDate.getFullYear();
        const month = attendanceDate.getMonth() + 1;
        uniqueMonthsSet.add(`${year}-${month}`);
      });

      Array.from(uniqueMonthsSet).forEach(yearMonth => {
        const [y, m] = yearMonth.split('-').map(Number);
        monthsToProcess.push({ year: y, month: m });
      });
      
      monthsToProcess.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });
    } else {
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        monthsToProcess.push({
          year: date.getFullYear(),
          month: date.getMonth() + 1,
        });
      }
    }
  } else if (period === "ytd") {
    for (let m = 1; m <= currentMonth; m++) {
      monthsToProcess.push({ year: currentYear, month: m });
    }
  } else if (month && year) {
    const selectedDate = new Date(parseInt(year), parseInt(month) - 1);
    for (let i = 5; i >= 0; i--) {
      const date = new Date(selectedDate);
      date.setMonth(selectedDate.getMonth() - i);
      monthsToProcess.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      });
    }
  } else if (year && !month) {
    for (let m = 1; m <= 12; m++) {
      monthsToProcess.push({
        year: parseInt(year),
        month: m,
      });
    }
  } else {
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      monthsToProcess.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      });
    }
  }

  const trendData = await Promise.all(
    monthsToProcess.map(async ({ year, month }) => {
      const { startDate, endDate } = await getDateRange(
        employees[0]._id,
        month,
        year,
        ""
      );

      const totalWorkDays = await getWorkingDays(startDate, endDate);

      const results = await Promise.all(
        employees.map(async (employee) => {
          const data = await getAttendancesByUserData(
            employee._id,
            startDate,
            endDate
          );
          const safeData = data || [];
          const missingDays = totalWorkDays - safeData.length;

          return {
            present: safeData.filter((r) => r.status === "present").length,
            absent: safeData.filter((r) => r.status === "absent").length + missingDays,
            leave: safeData.filter((r) => r.status === "leave").length,
            late: safeData.filter((r) => r.status === "late").length,
            sick: safeData.filter((r) => r.status === "sick").length,
            total: safeData.length,
            totalWorkDays, 
          };
        })
      );

      const monthHasData = results.some(r => r.total > 0);
      
      if (!monthHasData && period === "allTime") {
        return null;
      }

      const monthlyPresent = results.reduce((sum, r) => sum + r.present, 0);
      const monthlyAbsent = results.reduce((sum, r) => sum + r.absent, 0);
      const monthlyLeave = results.reduce((sum, r) => sum + r.leave, 0);
      const monthlyLate = results.reduce((sum, r) => sum + r.late, 0);
      const monthlySick = results.reduce((sum, r) => sum + r.sick, 0);
      const monthlyTotal = results.reduce((sum, r) => sum + r.total, 0);

      const presentRate =
        monthlyTotal > 0
          ? (monthlyPresent / (totalWorkDays * employees.length)) * 100
          : 0;
      const absenceRate =
        monthlyTotal > 0
          ? (monthlyAbsent / (totalWorkDays * employees.length)) * 100
          : 0;
      const leaveRate =
        monthlyTotal > 0
          ? (monthlyLeave / (totalWorkDays * employees.length)) * 100
          : 0;
      const lateRate =
        monthlyTotal > 0
          ? (monthlyLate / (totalWorkDays * employees.length)) * 100
          : 0;
      const sickRate =
        monthlyTotal > 0
          ? (monthlySick / (totalWorkDays * employees.length)) * 100
          : 0;

      return {
        year,
        month,
        presentRate: parseFloat(presentRate.toFixed(2)),
        absenceRate: parseFloat(absenceRate.toFixed(2)),
        leaveRate: parseFloat(leaveRate.toFixed(2)),
        lateRate: parseFloat(lateRate.toFixed(2)),
        sickRate: parseFloat(sickRate.toFixed(2)),
      };
    })
  );

  return trendData.filter(data => data !== null);
};


module.exports = {
  getAllAttendances,
  createAttendance,
  createAttendanceAdminOnly,
  getAttendances,
  getAttendanceById,
  updateAttendance,
  getAttendanceStats,
  getAttendancesByUser,
  getAllAttendanceStats,
  getDepartmentStatistics,
  getEmployeePerformanceStats,
  getAttendanceTrend,
};
