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
    console.error("Error updating payroll:", error);
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
    console.error("Process Payment Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllPayroll,
  getPayrollById,
  updatePayroll,
  getPayrollsByEmployeeId,
  processPayment,
};
