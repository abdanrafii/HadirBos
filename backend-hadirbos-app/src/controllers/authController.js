// server/controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user profile (for the logged-in user)
// @route   PUT /api/auth/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Allow updating only specific fields (not department or position)
    if (req.body.name !== undefined) user.name = req.body.name
    if (req.body.email !== undefined) user.email = req.body.email
    if (req.body.phone !== undefined) user.phone = req.body.phone
    if (req.body.address !== undefined) user.address = req.body.address

    // Update password if provided
    if (req.body.password && req.body.password.trim() !== "") {
      user.password = req.body.password
    }

    const updatedUser = await user.save()

    // Send response without password
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      position: updatedUser.position,
      phone: updatedUser.phone,
      address: updatedUser.address,
      status: updatedUser.status,
    })
  } catch (err) {
    console.error(err)

    // Handle validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        errors: Object.values(err.errors).map((e) => e.message),
      })
    }

    res.status(500).json({ message: "Server error", error: err.message })
  }
};

