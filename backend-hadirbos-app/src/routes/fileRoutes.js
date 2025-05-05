const express = require("express")
const router = express.Router()
const { uploadFile, getFile } = require("../controllers/fileController")
const { protect } = require("../middleware/authMiddleware")

// Upload file route
router.post("/upload", protect, uploadFile)

// Get file route
router.get("/:userId/:fileName", protect, getFile)

module.exports = router
