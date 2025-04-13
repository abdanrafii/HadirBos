const axios = require("axios");

const checkWorkingDay = async (req, res, next) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const day = today.getDay(); // 0 = Sunday, 6 = Saturday

    // console.log("Today's date:", todayStr, "Day of the week:", day);

    // Ambil daftar hari libur dari API
    const { data: holidays } = await axios.get(
      "https://api-harilibur.vercel.app/api"
    );

    // Cek apakah hari ini hari libur nasional
    const todayHoliday = holidays.find(
      (holiday) =>
        holiday.holiday_date === todayStr && holiday.is_national_holiday
    );

    if (todayHoliday) {
      return res.status(400).json({
        message: `Today is a national holiday: ${todayHoliday.holiday_name}. Attendance is not required. Enjoy your day off!`,
      });
    }

    // Cek jika hari Sabtu atau Minggu
    if (day === 0 || day === 6) {
      return res.status(400).json({
        message:
          "Today is the weekend. Attendance is not required. Enjoy your weekend!",
      });
    }

    // Lolos semua pengecekan, lanjut ke controller
    next();
  } catch (error) {
    console.error("Error checking working day:", error);
    return res.status(500).json({ message: "Failed to validate working day" });
  }
};

module.exports = checkWorkingDay;
