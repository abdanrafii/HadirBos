const express = require("express")
const router = express.Router()
const {
  createSubmission,
  getEmployeeSubmissions,
  getAllSubmissions,
  updateSubmissionStatus,
  getSubmissionById,
  getSubmissionStats,
  getSubmissionTrend,
} = require("../controllers/submissionController")
const { protect, admin } = require("../middleware/authMiddleware")

// Create a new submission and get employee's submissions
router.route("/").post(protect, createSubmission).get(protect, admin, getAllSubmissions)

router.route("/trend").get(protect, admin, getSubmissionTrend);

// Get current employee's submissions
router.get("/employee", protect, getEmployeeSubmissions)

// Get submission statistics
router.get("/stats", protect, admin, getSubmissionStats)

// Get submission by ID and update submission status
router.route("/:id").get(protect, getSubmissionById).put(protect, admin, updateSubmissionStatus)

module.exports = router
