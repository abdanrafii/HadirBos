const mongoose = require("mongoose")

const submissionSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["leave", "resignation"],
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: function () {
        return this.type === "leave"
      },
    },
    endDate: {
      type: Date,
      required: function () {
        return this.type === "leave"
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    fileUrl: {
      type: String,
      required: false,
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

// Create index for faster queries
submissionSchema.index({ employeeId: 1, status: 1 })
submissionSchema.index({ type: 1, status: 1 })

const Submission = mongoose.model("Submission", submissionSchema)

module.exports = Submission
