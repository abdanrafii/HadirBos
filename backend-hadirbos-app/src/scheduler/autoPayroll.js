const cron = require("node-cron");
const User = require("../models/User");
const Payroll = require("../models/Payroll");
const Attendance = require("../models/Attendance");
const axios = require("axios");

async function getWorkingDays(startDate, endDate) {
  try {
    const yearSet = new Set();

    let tempDate = new Date(startDate);
    while (tempDate <= endDate) {
      yearSet.add(tempDate.getFullYear());
      tempDate.setFullYear(tempDate.getFullYear() + 1);
    }

    let holidayDates = [];
    for (const year of yearSet) {
      const { data: holidays } = await axios.get(
        `https://api-harilibur.vercel.app/api?year=${year}`
      );
      holidayDates.push(...holidays.map((h) => h.date));
    }

    let workingDays = 0;
    let date = new Date(startDate);

    while (date <= endDate) {
      const day = date.getDay(); // 0 = Minggu, 6 = Sabtu
      const dateStr = date.toISOString().split("T")[0];

      if (day !== 0 && day !== 6 && !holidayDates.includes(dateStr)) {
        workingDays++;
      }

      date.setDate(date.getDate() + 1);
    }

    // console.log(
    //   `Total hari kerja antara ${startDate} dan ${endDate}: ${workingDays}`
    // );
    return workingDays;
  } catch (error) {
    // console.error(
    //   "Gagal mengambil data hari libur, fallback ke default 22 hari kerja per bulan.",
    //   error
    // );

    const monthDiff =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth()) +
      1;
    return monthDiff * 22;
  }
}

/**
 * Generate payroll otomatis berdasarkan data bulan sebelumnya
 */
const autoPayroll = async () => {
  try {
    const currentDate = new Date();
    let prevMonth = currentDate.getMonth(); // 0-11 (Januari = 0)
    let prevMonthYear = currentDate.getFullYear();

    if (prevMonth === 0) {
      prevMonth = 12;
      prevMonthYear -= 1;
    }

    const displayPrevMonth = prevMonth === 0 ? 12 : prevMonth;

    const queryPrevMonth = prevMonth === 0 ? 11 : prevMonth - 1;

    // console.log(
    //   `Generating payroll based on previous month: ${displayPrevMonth}/${prevMonthYear}`
    // );

    const employees = await User.find({ role: "employee", status: "active" });

    for (const employee of employees) {
      const { _id, name, baseSalary } = employee;

      const existingPayroll = await Payroll.findOne({
        employeeId: _id,
        month: currentDate.getMonth() + 1, // Bulan saat ini untuk database (1-12)
        year: currentDate.getFullYear(),
      });

      if (existingPayroll) {
        // console.log(
        //   `Payroll sudah ada untuk ${name} pada ${
        //     currentDate.getMonth() + 1
        //   }/${currentDate.getFullYear()}`
        // );
        continue;
      }

      const startDate = new Date(prevMonthYear, displayPrevMonth - 1, 1);
      const endDate = new Date(
        prevMonthYear,
        displayPrevMonth,
        0,
        23,
        59,
        59,
        999
      );
      const totalWorkingDays = await getWorkingDays(startDate, endDate);

      const attendances = await Attendance.find({
        employeeId: _id,
        date: {
          $gte: new Date(prevMonthYear, queryPrevMonth, 1), // Awal bulan sebelumnya
          $lt: new Date(prevMonthYear, queryPrevMonth + 1, 1), // Awal bulan ini
        },
      });

      // console.log(`Found ${attendances.length} attendance records for ${name}`);

      const missingDays = totalWorkingDays - attendances.length;

      const absentDays = attendances.filter(
        (a) => a.status === "absent"
      ).length + missingDays;
      const lateDays = attendances.filter((a) => a.status === "late").length;
      const presentDays = attendances.filter(
        (a) => a.status === "present"
      ).length;
      const sickDays = attendances.filter((a) => a.status === "sick").length;
      const leaveDays = attendances.filter((a) => a.status === "leave").length;

      const absentDeduction = (baseSalary / totalWorkingDays) * absentDays;
      const lateDeduction = ((0.5 * baseSalary) / totalWorkingDays) * lateDays;
      const deduction = absentDeduction + lateDeduction;

      const totalValidDays = presentDays + sickDays + leaveDays;
      const bonus =
        totalValidDays > totalWorkingDays - 2 ? baseSalary * 0.2 : 0;
      const tax = baseSalary * 0.05;

      const totalAmount = baseSalary - tax - deduction + bonus;

      await Payroll.create({
        employeeId: _id,
        status: "unpaid",
        month: currentDate.getMonth() + 1, // Bulan saat ini (1-12)
        year: currentDate.getFullYear(),
        deductions: deduction,
        bonus: bonus,
        tax: tax,
        totalAmount: totalAmount,
      });

      // console.log(
      //   `Payroll created for employee ${name} for ${
      //     currentDate.getMonth() + 1
      //   }/${currentDate.getFullYear()} based on data from ${displayPrevMonth}/${prevMonthYear}`
      // );
    }
  } catch (error) {
    console.error("Error creating payroll: ", error);
  }
};

// Auto jalan setiap tanggal 1 jam 00:00 WIB
cron.schedule(
  "0 0  1 * *", // Setiap tanggal 1 bulan apa saja
  () => {
    // console.log("Running automatic payroll generation...");
    autoPayroll();
  },
  {
    timezone: "Asia/Jakarta",
  }
);

module.exports = {
  autoPayroll,
  getWorkingDays,
};
