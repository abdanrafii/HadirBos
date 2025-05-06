const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (value) {
          const user = await mongoose.models.User.findOne({
            _id: value,
            role: "employee",
          });
          return !!user;
        },
        message: "Invalid employee ID",
      },
    },
    status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    deductions: {
      type: Number,
      required: true,
    },
    bonus: {
      type: Number,
      required: true,
    },
    // overtime: {
    //   type: Number,
    //   required: true,
    // },
    tax: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ["bank", "cash", "check"],
    },
    paymentReference: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Payroll = mongoose.model("Payroll", payrollSchema);
module.exports = Payroll;