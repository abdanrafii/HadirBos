const axios = require("axios");

const checkWorkingDay = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    const currentHour = now.getHours();

    // Cek hari libur nasional
    const { data: holidays } = await axios.get(
      "https://api-harilibur.vercel.app/api"
    );

    const todayHoliday = holidays.find(
      (holiday) =>
        holiday.holiday_date === todayStr && holiday.is_national_holiday
    );

    if (todayHoliday) {
      return res.status(400).json({
        message: `Today is a national holiday: ${todayHoliday.holiday_name}. Attendance is not required.`,
      });
    }

    // Cek akhir pekan
    if (day === 0 || day === 6) {
      return res.status(400).json({
        message: "Today is the weekend. Attendance is not required.",
      });
    }

    if (currentHour < 8 || currentHour >= 17) {
      return res.status(400).json({
        message: "Attendance is only allowed between 08:00 and 17:00.",
      });
    }

    next();
  } catch (error) {
    console.error("Error checking working day:", error);
    return res.status(500).json({ message: "Failed to validate working day" });
  }
};

module.exports = checkWorkingDay;
