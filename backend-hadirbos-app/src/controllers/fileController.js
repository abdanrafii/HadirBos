const path = require("path")
const fs = require("fs")
const asyncHandler = require("express-async-handler")

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// @desc    Upload a file
// @route   POST /api/files/upload
// @access  Private
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400)
    throw new Error("No files were uploaded")
  }

  const file = req.files.file
  const userId = req.user._id

  // Create user directory if it doesn't exist
  const userDir = path.join(uploadsDir, userId.toString())
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true })
  }

  // Generate a unique filename
  const timestamp = Date.now()
  const fileExt = path.extname(file.name)
  const fileName = `${timestamp}${fileExt}`
  const filePath = path.join(userDir, fileName)

  // Save the file
  file.mv(filePath, (err) => {
    if (err) {
      res.status(500)
      throw new Error(`Error uploading file: ${err.message}`)
    }
  })

  // Return the file URL
  const fileUrl = `/api/files/${userId}/${fileName}`
  res.json({ fileUrl })
})

// @desc    Get a file
// @route   GET /api/files/:userId/:fileName
// @access  Private
const getFile = asyncHandler(async (req, res) => {
  const { userId, fileName } = req.params
  const filePath = path.join(uploadsDir, userId, fileName)

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    res.status(404)
    throw new Error("File not found")
  }

  // Send the file
  res.sendFile(filePath)
})

module.exports = {
  uploadFile,
  getFile,
}
