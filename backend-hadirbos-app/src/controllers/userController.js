// server/controllers/userController.js
const User = require('../models/User');

// @desc    Create a new user (by admin only)
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      position,
      phone,
      address,
      baseSalary,
      accountNumber
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user with optional fields (phone and address)
    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
      position,
      phone: phone || undefined, 
      address: address || undefined,
      baseSalary,
      accountNumber: accountNumber || undefined,
      status: "active",
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        baseSalary: user.baseSalary,
        position: user.position,
        phone: user.phone,
        address: user.address,
        accountNumber: user.accountNumber,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "employee" }).select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields dengan cara yang lebih eksplisit
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.email !== undefined) user.email = req.body.email;
    if (req.body.role !== undefined) user.role = req.body.role;
    
    // Khusus untuk department, gunakan pengecekan aman
    if (req.body.department !== undefined) {
      user.department = req.body.department || ''; // Gunakan string kosong jika undefined
    }
    
    if (req.body.position !== undefined) user.position = req.body.position;
    
    // Update password if provided
    if (req.body.password && req.body.password.trim() !== '') {
      user.password = req.body.password; 
    }

    if (req.body.baseSalary !== undefined) user.baseSalary = req.body.baseSalary;

    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.address !== undefined) user.address = req.body.address;

    // Update status jika diberikan
    if (req.body.status !== undefined) user.status = req.body.status;

    if (req.body.accountNumber !== undefined) user.accountNumber = req.body.accountNumber;

    const updatedUser = await user.save();
    
    // Kirim respon tanpa password
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      position: updatedUser.position,
      phone: updatedUser.phone,
      address: updatedUser.address,
      baseSalary: updatedUser.baseSalary,
      status: updatedUser.status
    });
  } catch (err) {
    console.error(err);
    
    // Tangani error validasi Mongoose secara spesifik
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.json({ message: "User removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};