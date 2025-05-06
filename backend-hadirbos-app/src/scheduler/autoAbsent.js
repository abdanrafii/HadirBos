const cron = require("node-cron");
const Attendance = require("../models/Attendance");
const Employee = require("../models/User");
const axios = require("axios");

const autoAbsent = async () => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const day = today.getDay();

    // Cek hari libur nasional
    const { data: holidays } = await axios.get(
      "https://api-harilibur.vercel.app/api"
    );
    const todayHoliday = holidays.find(
      (holiday) =>
        holiday.holiday_date === todayStr && holiday.is_national_holiday
    );

    if (todayHoliday || day === 0 || day === 6) {
      // console.log("Today is a holiday or weekend, skipping auto-absent.");
      return;
    }

    const allEmployees = await Employee.find({ role: "employee" });

    for (const employee of allEmployees) {
      const alreadyAbsent = await Attendance.findOne({
        employeeId: employee._id,
        date: todayStr,
      });

      if (!alreadyAbsent) {
        await Attendance.create({
          employeeId: employee._id,
          status: "absent",
          note: "Automatically marked absent due to no attendance by 17:00",
        });
      }
    }

    // console.log("Auto-absent process completed at", today);
  } catch (error) {
    console.error("Error during auto-absent:", error);
  }
};

cron.schedule("1 17 * * *", () => {
  autoAbsent();
}, {
  timezone: "Asia/Jakarta",
}
);

module.exports = autoAbsent;
