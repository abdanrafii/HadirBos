const Payroll = require("../models/Payroll");
const User = require("../models/User");

// @desc    Get all payrolls
// @route   GET /api/payroll
// @access  Private
const getAllPayroll = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    const payrolls = await Payroll.find({
      month: month,
      year: year,
    })
      .populate({
        path: "employeeId",
        select: "name department position baseSalary",
        match: { role: "employee" },
      })
      .exec();

    const filteredPayrolls = payrolls.filter((payroll) => payroll.employeeId);

    res.status(200).json(filteredPayrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payrolls by employee ID
// @route   GET /api/payroll/employee/:id
// @access  Private
const getPayrollsByEmployeeId = async (req, res) => {
  try {
    const payrolls = await Payroll.find({
      employeeId: req.params.employeeId,
    }).populate({
      path: "employeeId",
      select: "name department position baseSalary",
      match: { role: "employee" },
    });

    if (!payrolls || payrolls.length === 0) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    res.status(200).json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payroll by ID
// @route   GET /api/payroll/:id
// @access  Private
const getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }
    res.status(200).json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update payroll
// @route   PUT /api/payroll/:id
// @access  Private
const updatePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    const {
      deductions,
      bonus,
      tax,
      paymentMethod,
      paymentDate,
      notes,
      paymentReference,
    } = req.body;

    const updateData = {};

    if (deductions !== undefined) updateData.deductions = Number(deductions);
    if (bonus !== undefined) updateData.bonus = Number(bonus);
    if (tax !== undefined) updateData.tax = Number(tax);
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (paymentDate !== undefined)
      updateData.paymentDate = new Date(paymentDate);
    if (notes !== undefined) updateData.notes = notes;
    if (paymentReference !== undefined)
      updateData.paymentReference = paymentReference;

    if (deductions !== undefined || bonus !== undefined || tax !== undefined) {
      const employee = await User.findById(payroll.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const newDeductions =
        deductions !== undefined ? Number(deductions) : payroll.deductions;
      const newBonus = bonus !== undefined ? bonus : payroll.bonus;
      const newTax = tax !== undefined ? tax : payroll.tax;

      updateData.totalAmount =
        employee.baseSalary - newDeductions + newBonus - newTax;
    }

    const updatedPayroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json(updatedPayroll);
  } catch (error) {
    console.error( error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process payment
// @route   PUT /api/payroll/:id
// @access  Private
const processPayment = async (req, res) => {
  try {
    const payrollId = req.params.id;
    const { paymentMethod, paymentReference, paymentDate, notes, status } =
      req.body;

    if (status && !["paid", "unpaid"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    let updateFields = {};

    if (status === "unpaid") {
      updateFields = {
        status: "unpaid",
        paymentMethod: "",
        paymentReference: "",
        paymentDate: null,
        notes: "",
      };
    } else {
      updateFields = {
        ...(paymentMethod && { paymentMethod }),
        ...(paymentReference && { paymentReference }),
        ...(paymentDate && { paymentDate }),
        ...(notes && { notes }),
        ...(status && { status }),
      };
    }

    const updatedPayroll = await Payroll.findByIdAndUpdate(
      payrollId,
      updateFields,
      { new: true }
    );

    if (!updatedPayroll) {
      return res.status(404).json({ message: "Payroll record not found" });
    }

    return res.status(200).json({
      message: "Payroll record updated successfully",
      payroll: updatedPayroll,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get payroll stats
// @route   GET /api/payroll/stats
// @access  Private
const getPayrollStats = async (req, res) => {
  try {
    const { month, year, period } = req.query;

    let query = {};

    if (period === "allTime") {
      // Semua data
      query = {};
    } else if (period === "ytd") {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      query = {
        year: currentYear,
        month: { $gte: 1, $lte: currentMonth },
      };
    } else if (year && !month) {
      query = {
        year: Number(year),
        month: { $gte: 1, $lte: 12 },
      };
    } else if (year && month) {
      query = {
        year: Number(year),
        month: Number(month),
      };
    } else {
      return res
        .status(400)
        .json({
          message: "Please provide period or year (with optional month)",
        });
    }

    const payrolls = await Payroll.find(query)
      .populate({
        path: "employeeId",
        select: "name department position baseSalary",
        match: { role: "employee" },
      })
      .exec();

    const filteredPayrolls = payrolls.filter((payroll) => payroll.employeeId);

    const payrollTotals = filteredPayrolls.reduce(
      (totals, record) => {
        totals.baseSalary += record.employeeId.baseSalary;
        totals.deductions += record.deductions;
        totals.bonus += record.bonus;
        totals.tax += record.tax;
        totals.totalAmount += record.totalAmount;
        return totals;
      },
      {
        baseSalary: 0,
        deductions: 0,
        bonus: 0,
        tax: 0,
        totalAmount: 0,
      }
    );

    const avgBaseSalary =
      filteredPayrolls.length > 0
        ? payrollTotals.baseSalary / filteredPayrolls.length
        : 0;
    const avgBonus =
      filteredPayrolls.length > 0
        ? payrollTotals.bonus / filteredPayrolls.length
        : 0;
    const avgTax =
      filteredPayrolls.length > 0
        ? payrollTotals.tax / filteredPayrolls.length
        : 0;
    const avgDeductions =
      filteredPayrolls.length > 0
        ? payrollTotals.deductions / filteredPayrolls.length
        : 0;
    const avgTotalAmount =
      filteredPayrolls.length > 0
        ? payrollTotals.totalAmount / filteredPayrolls.length
        : 0;
    const employeesWithBonus = filteredPayrolls.filter(
      (payroll) => payroll.bonus > 0
    ).length;
    const employeesWithDeductions = filteredPayrolls.filter(
      (payroll) => payroll.deductions > 0
    ).length;

    const highestSalary =
      filteredPayrolls.length > 0
        ? Math.max(
            ...filteredPayrolls.map((payroll) => payroll.employeeId.baseSalary)
          )
        : 0;
    const lowestSalary =
      filteredPayrolls.length > 0
        ? Math.min(
            ...filteredPayrolls.map((payroll) => payroll.employeeId.baseSalary)
          )
        : 0;

    const bonusToSalaryRatio =
      payrollTotals.baseSalary > 0
        ? payrollTotals.bonus / payrollTotals.baseSalary
        : 0;

    res.status(200).json({
      payrollTotals,
      avgBaseSalary,
      avgBonus,
      avgTax,
      avgDeductions,
      avgTotalAmount,
      employeesWithBonus,
      employeesWithDeductions,
      highestSalary,
      lowestSalary,
      bonusToSalaryRatio,
      totalEmployees: filteredPayrolls.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payroll trend stats
// @route   GET /api/payroll/trend
// @access  Private
const getPayrollTrend = async (req, res) => {
  try {
    const { month, year, period } = req.query;

    let matchQuery = {};
    const now = new Date();

    if (period === "allTime") {
      matchQuery = {};
    } else if (period === "ytd") {
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      matchQuery = {
        year: currentYear,
        month: { $gte: 1, $lte: currentMonth },
      };
    } else if (year && !month) {
      matchQuery = {
        year: Number(year),
        month: { $gte: 1, $lte: 12 },
      };
    } else if (year && month) {
      const targetYear = Number(year);
      const targetMonth = Number(month);

      const startMonth = targetMonth - 5 > 0 ? targetMonth - 5 : 1;
      matchQuery = {
        year: targetYear,
        month: { $gte: startMonth, $lte: targetMonth },
      };
    } else {
      return res.status(400).json({
        message: "Please provide period or year (with optional month)",
      });
    }

    const trendData = await Payroll.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
          },
          totalBaseSalary: { $sum: "$baseSalary" },
          totalBonus: { $sum: "$bonus" },
          totalDeductions: { $sum: "$deductions" },
          totalTax: { $sum: "$tax" },
          totalPayroll: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    let monthsToGenerate = [];

    if (period === "allTime") {
      return res.json({
        trend: trendData.map((t) => ({
          year: t._id.year,
          month: t._id.month,
          totalBaseSalary: t.totalBaseSalary,
          totalBonus: t.totalBonus,
          totalDeductions: t.totalDeductions,
          totalTax: t.totalTax,
          totalPayroll: t.totalPayroll,
          count: t.count,
        })),
      });
    }

    if (period === "ytd") {
      for (let m = 1; m <= now.getMonth() + 1; m++) {
        monthsToGenerate.push({ year: now.getFullYear(), month: m });
      }
    } else if (year && !month) {
      for (let m = 1; m <= 12; m++) {
        monthsToGenerate.push({ year: Number(year), month: m });
      }
    } else if (year && month) {
      const targetYear = Number(year);
      const targetMonth = Number(month);
      for (let i = 5; i >= 0; i--) {
        let date = new Date(targetYear, targetMonth - 1 - i, 1);
        monthsToGenerate.push({ year: date.getFullYear(), month: date.getMonth() + 1 });
      }
    }

    const finalTrend = monthsToGenerate.map(({ year, month }) => {
      const found = trendData.find(
        (t) => t._id.year === year && t._id.month === month
      );

      return {
        year,
        month,
        totalBaseSalary: found ? found.totalBaseSalary : 0,
        totalBonus: found ? found.totalBonus : 0,
        totalDeductions: found ? found.totalDeductions : 0,
        totalTax: found ? found.totalTax : 0,
        totalPayroll: found ? found.totalPayroll : 0,
        count: found ? found.count : 0,
      };
    });

    res.json({ trend: finalTrend });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  getAllPayroll,
  getPayrollById,
  updatePayroll,
  getPayrollsByEmployeeId,
  processPayment,
  getPayrollStats,
  getPayrollTrend,
};
