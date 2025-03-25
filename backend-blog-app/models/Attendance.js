const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      validate: {
        validator: async function(value) {
          const user = await mongoose.models.User.findOne({ 
            _id: value, 
            role: 'employee' 
          });
          return !!user;
        },
        message: 'Invalid employee ID'
      }
    },
    status: {
      type: String,
      enum: ['present', 'late', 'sick', 'leave', 'absent'],
      default: 'present',
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot be more than 500 characters']
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index untuk memastikan satu attendance per hari
attendanceSchema.index(
  { 
    employeeId: 1, 
    date: 1 
  }, 
  { 
    unique: true 
  }
);

attendanceSchema.statics.checkTodayAttendance = async function(employeeId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
  
    return await this.findOne({
      employeeId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
  };

// Hooks untuk validasi tambahan
attendanceSchema.pre('save', async function(next) {
  // Pastikan yang membuat attendance adalah employee
  const user = await mongoose.models.User.findById(this.employeeId);
  
  if (!user || user.role !== 'employee') {
    throw new Error('Only employees can create attendance records');
  }
  
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;