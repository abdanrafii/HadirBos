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

// @desc    Get submission statistics (admin only)
// @route   GET /api/submissions/stats
// @access  Private/Admin
const getSubmissionStats = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403)
    throw new Error("Not authorized as admin")
  }

  // Get counts by type and status
  const stats = await Submission.aggregate([
    {
      $group: {
        _id: {
          type: "$type",
          status: "$status",
        },
        count: { $sum: 1 },
      },
    },
  ])

  // Format the results
  const formattedStats = {
    leave: {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0,
    },
    resignation: {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0,
    },
    total: {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0,
    },
  }

  stats.forEach((stat) => {
    const { type, status } = stat._id
    formattedStats[type][status] = stat.count
    formattedStats[type].total += stat.count
    formattedStats.total[status] += stat.count
    formattedStats.total.total += stat.count
  })

  res.json(formattedStats)
})

module.exports = {
  createSubmission,
  getEmployeeSubmissions,
  getAllSubmissions,
  updateSubmissionStatus,
  getSubmissionById,
  getSubmissionStats,
}
