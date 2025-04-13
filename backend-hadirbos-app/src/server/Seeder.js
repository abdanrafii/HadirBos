const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User.js');
const bcrypt = require('bcryptjs');

dotenv.config();
connectDB();

const seedUsers = async () => {
  try {
    // Hapus semua data User (opsional)
    await User.deleteMany();

    // Data user (Admin & Employee)
    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10), // Hash password
        role: 'admin',
        department: 'Acountant',
        position: 'HR',
        status: 'active',
      },
      {
        name: 'John Doe',
        email: 'employee@example.com',
        password: await bcrypt.hash('employee123', 10),
        role: 'employee',
        department: 'Acountant',
        position: 'staff',
        status: 'active',
      },
      {
        name: 'John',
        email: 'ceo@example.com',
        password: await bcrypt.hash('ceooo123', 10),
        role: 'ceo',
        department: 'IT',
        position: 'CEO',
        status: 'active',
      }
    ];

    // Masukkan data ke MongoDB
    await User.insertMany(users);
    console.log('Data pengguna berhasil diimpor!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedUsers();
