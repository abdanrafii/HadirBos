const asyncHandler = require("express-async-handler")
const Submission = require("../models/Submission")
const User = require("../models/User")

// @desc    Create a new submission (leave or resignation)
// @route   POST /api/submissions
// @access  Private
const createSubmission = asyncHandler(async (req, res) => {
  const { type, reason, startDate, endDate, fileUrl } = req.body
  const employeeId = req.user._id

  // Validate required fields based on type
  if (type === "leave" && (!startDate || !endDate)) {
    res.status(400)
    throw new Error("Start date and end date are required for leave requests")
  }

  // Create submission
  const submission = await Submission.create({
    employeeId,
    type,
    reason,
    startDate: type === "leave" ? startDate : null,
    endDate: type === "leave" ? endDate : null,
    fileUrl,
  })

  if (submission) {
    res.status(201).json(submission)
  } else {
    res.status(400)
    throw new Error("Invalid submission data")
  }
})

// @desc    Get all submissions for current employee
// @route   GET /api/submissions/employee
// @access  Private
const getEmployeeSubmissions = asyncHandler(async (req, res) => {
  const employeeId = req.user._id

  const submissions = await Submission.find({ employeeId }).sort({ createdAt: -1 })

  res.json(submissions)
})

// @desc    Get all submissions (admin only)
// @route   GET /api/submissions
// @access  Private/Admin
const getAllSubmissions = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403)
    throw new Error("Not authorized as admin")
  }

  // Get query parameters for filtering
  const { type, status, employeeId } = req.query

  // Build filter object
  const filter = {}
  if (type) filter.type = type
  if (status) filter.status = status
  if (employeeId) filter.employeeId = employeeId

  const submissions = await Submission.find(filter)
    .populate("employeeId", "name email department position")
    .sort({ createdAt: -1 })

  res.json(submissions)
})

// @desc    Update submission status (admin only)
// @route   PUT /api/submissions/:id
// @access  Private/Admin
const updateSubmissionStatus = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403)
    throw new Error("Not authorized as admin")
  }

  const { status, adminNotes } = req.body

  if (!["pending", "approved", "rejected"].includes(status)) {
    res.status(400)
    throw new Error("Invalid status value")
  }

  const submission = await Submission.findById(req.params.id)

  if (!submission) {
    res.status(404)
    throw new Error("Submission not found")
  }

  submission.status = status
  if (adminNotes) {
    submission.adminNotes = adminNotes
  }

  const updatedSubmission = await submission.save()

  // If this is a resignation and it's approved, we could update the user's status
  if (updatedSubmission.type === "resignation" && status === "approved") {
    await User.findByIdAndUpdate(updatedSubmission.employeeId, { status: "inactive" })
  }

  res.json(updatedSubmission)
})

// @desc    Get submission by ID
// @route   GET /api/submissions/:id
// @access  Private
const getSubmissionById = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id).populate("employeeId", "name email department position")

  if (!submission) {
    res.status(404)
    throw new Error("Submission not found")
  }

  // Check if the user is authorized to view this submission
  if (req.user.role !== "admin" && submission.employeeId._id.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error("Not authorized to view this submission")
  }

  res.json(submission)
})

// @desc    Get submission stats (admin only)
// @route   GET /api/submissions/stats
// @access  Private/Admin
const getSubmissionStats = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized as admin");
  }

  const { month, year, period } = req.query;
  let query = {};

  if (period === "allTime") {
    query = {}; 
  } else if (period === "ytd") {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);
    query = {
      startDate: { $gte: startOfYear, $lte: endOfMonth },
    };
  } else if (year && !month) {
    const startOfYear = new Date(Number(year), 0, 1);
    const endOfYear = new Date(Number(year), 11, 31);
    query = {
      startDate: { $gte: startOfYear, $lte: endOfYear },
    };
  } else if (year && month) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);
    query = {
      startDate: { $gte: startDate, $lte: endDate },
    };
  } else {
    return res.status(400).json({
      message: "Please provide period or year (with optional month)",
    });
  }

  try {
    const stats = await Submission.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            type: "$type",
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = {
      leave: { pending: 0, approved: 0, rejected: 0, total: 0, percentages: {} },
      resignation: { pending: 0, approved: 0, rejected: 0, total: 0, percentages: {} },
      total: { pending: 0, approved: 0, rejected: 0, total: 0, percentages: {} },
    };

    stats.forEach((stat) => {
      const { type, status } = stat._id;
      formattedStats[type][status] = stat.count;
      formattedStats[type].total += stat.count;
      formattedStats.total[status] += stat.count;
      formattedStats.total.total += stat.count;
    });

    const calculatePercentage = (part, total) => {
      return total === 0 ? 0 : Math.round((part / total) * 100);
    };

    formattedStats.leave.percentages = {
      pending: calculatePercentage(formattedStats.leave.pending, formattedStats.leave.total),
      approved: calculatePercentage(formattedStats.leave.approved, formattedStats.leave.total),
      rejected: calculatePercentage(formattedStats.leave.rejected, formattedStats.leave.total),
    };

    formattedStats.resignation.percentages = {
      pending: calculatePercentage(formattedStats.resignation.pending, formattedStats.resignation.total),
      approved: calculatePercentage(formattedStats.resignation.approved, formattedStats.resignation.total),
      rejected: calculatePercentage(formattedStats.resignation.rejected, formattedStats.resignation.total),
    };

    formattedStats.total.percentages = {
      pending: calculatePercentage(formattedStats.total.pending, formattedStats.total.total),
      approved: calculatePercentage(formattedStats.total.approved, formattedStats.total.total),
      rejected: calculatePercentage(formattedStats.total.rejected, formattedStats.total.total),
    };

    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Server error while fetching submission stats",
    });
  }
});


const getSubmissionTrend = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized as admin");
  }

  const { month, year, period } = req.query;
  let matchQuery = {};
  let monthsToGenerate = [];
  const now = new Date();

  if (period === "allTime") {
    matchQuery = {};
  } else if (period === "ytd") {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    matchQuery = {
      startDate: { $gte: startOfYear, $lte: endOfThisMonth },
    };

    for (let m = 1; m <= now.getMonth() + 1; m++) {
      monthsToGenerate.push({ year: now.getFullYear(), month: m });
    }
  } else if (year && !month) {
    const startOfYear = new Date(Number(year), 0, 1);
    const endOfYear = new Date(Number(year), 11, 31);
    matchQuery = {
      startDate: { $gte: startOfYear, $lte: endOfYear },
    };

    for (let m = 1; m <= 12; m++) {
      monthsToGenerate.push({ year: Number(year), month: m });
    }
  } else if (year && month) {
    const targetYear = Number(year);
    const targetMonth = Number(month);
    const startMonthDate = new Date(targetYear, targetMonth - 6, 1); // 6 bulan terakhir
    const endMonthDate = new Date(targetYear, targetMonth, 0);
    matchQuery = {
      startDate: { $gte: startMonthDate, $lte: endMonthDate },
    };

    for (let i = 5; i >= 0; i--) {
      let date = new Date(targetYear, targetMonth - 1 - i, 1);
      monthsToGenerate.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      });
    }
  } else {
    return res.status(400).json({
      message: "Please provide period or year (with optional month)",
    });
  }

  try {
    const trendData = await Submission.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: "$startDate" },
            month: { $month: "$startDate" },
            type: "$type", // Ganti ke 'type' (bukan submissionType)
          },
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    let finalTrend;

    if (period === "allTime") {
      const uniqueMonths = [
        ...new Set(trendData.map((t) => `${t._id.year}-${t._id.month}`)),
      ].map((str) => {
        const [year, month] = str.split("-").map(Number);
        return { year, month };
      });

      finalTrend = uniqueMonths.map(({ year, month }) => {
        const leaveData = trendData.find(
          (t) =>
            t._id.year === year &&
            t._id.month === month &&
            t._id.type === "leave"
        );
        const resignationData = trendData.find(
          (t) =>
            t._id.year === year &&
            t._id.month === month &&
            t._id.type === "resignation"
        );

        return {
          year,
          month,
          leave: leaveData
            ? {
                total: leaveData.total,
                pending: leaveData.pending,
                approved: leaveData.approved,
                rejected: leaveData.rejected,
              }
            : { total: 0, pending: 0, approved: 0, rejected: 0 },
          resignation: resignationData
            ? {
                total: resignationData.total,
                pending: resignationData.pending,
                approved: resignationData.approved,
                rejected: resignationData.rejected,
              }
            : { total: 0, pending: 0, approved: 0, rejected: 0 },
        };
      });
    } else {
      // original logic
      finalTrend = monthsToGenerate.map(({ year, month }) => {
        const leaveData = trendData.find(
          (t) =>
            t._id.year === year &&
            t._id.month === month &&
            t._id.type === "leave"
        );
        const resignationData = trendData.find(
          (t) =>
            t._id.year === year &&
            t._id.month === month &&
            t._id.type === "resignation"
        );

        return {
          year,
          month,
          leave: leaveData
            ? {
                total: leaveData.total,
                pending: leaveData.pending,
                approved: leaveData.approved,
                rejected: leaveData.rejected,
              }
            : { total: 0, pending: 0, approved: 0, rejected: 0 },
          resignation: resignationData
            ? {
                total: resignationData.total,
                pending: resignationData.pending,
                approved: resignationData.approved,
                rejected: resignationData.rejected,
              }
            : { total: 0, pending: 0, approved: 0, rejected: 0 },
        };
      });
    }

    res.json({ trend: finalTrend });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Server error while fetching submission trend",
    });
  }
});

module.exports = {
  createSubmission,
  getEmployeeSubmissions,
  getAllSubmissions,
  updateSubmissionStatus,
  getSubmissionById,
  getSubmissionStats,
  getSubmissionTrend,
}
