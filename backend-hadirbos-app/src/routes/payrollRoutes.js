const express = require("express");
const router = express.Router();
const {
  getAllPayroll,
  getPayrollById,
  updatePayroll,
  getPayrollsByEmployeeId,
  processPayment,
  getPayrollStats,
  getPayrollTrend,
} = require("../controllers/payrollController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").get(protect, admin, getAllPayroll);

router.route("/stats").get(protect, admin, getPayrollStats);

router.route("/trend").get(protect, admin, getPayrollTrend);

router
  .route("/:id")
  .get(protect, getPayrollById)
  .put(protect, admin, updatePayroll);

router.route("/employee/:employeeId").get(protect, getPayrollsByEmployeeId);

router.route("/:id/payment").patch(protect, admin, processPayment);


module.exports = router;
