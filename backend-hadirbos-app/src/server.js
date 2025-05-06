// server/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const fileUpload = require("express-fileupload");
require("./scheduler/autoAbsent");
require("./scheduler/autoPayroll");

// Route files
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const attendanceRoutes = require("./routes/attendanceRoutes")
const submissionRoutes = require("./routes/submissionRoutes")
const fileRoutes = require("./routes/fileRoutes")
const payrollRoutes = require("./routes/payrollRoutes");

// Load env vars
dotenv.config()

const app = express()

// Connect to database
connectDB()

// Middleware
app.use(express.json())
app.use(cors())
app.use(
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  }),
)

// Mount routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/submissions", submissionRoutes)
app.use("/api/files", fileRoutes)
app.use("/api/payroll", payrollRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("API is running...")
})

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  })
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
