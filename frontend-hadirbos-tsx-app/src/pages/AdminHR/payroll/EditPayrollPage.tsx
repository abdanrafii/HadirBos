import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  ChevronLeft,
  CreditCard,
  DollarSign,
  Calendar,
  FileText,
  Tag,
  ChevronDown,
  Calculator,
} from "lucide-react";
import { getCurrentUser } from "../../../services/authService";
import { updatePayroll } from "../../../services/payrollService";

export default function EditPayrollPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const payrollData = location.state?.payroll;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State for each PayrollData field
  const [deductions, setDeductions] = useState("");
  const [bonus, setBonus] = useState("");
  const [tax, setTax] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [paymentDate, setPaymentDate] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const userInfo = getCurrentUser();

  // Prefill data from state
  useEffect(() => {
    if (payrollData) {
      setDeductions(payrollData.deductions || 0);
      setBonus(payrollData.bonus || 0);
      setTax(payrollData.tax || 0);
      setPaymentMethod(payrollData.paymentMethod || "Bank Transfer");
      setPaymentDate(payrollData.paymentDate?.slice(0, 10) || "");
      setNotes(payrollData.notes || "");
      setPaymentReference(payrollData.paymentReference || "");
    }
  }, [payrollData]);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedPayroll = {
        deductions: Number(deductions),
        bonus: Number(bonus),
        tax: Number(tax),
        paymentMethod,
        paymentDate: new Date(paymentDate),
        notes,
        paymentReference,
      };

      await updatePayroll(payrollData._id, updatedPayroll, userInfo.token);

      navigate("/admin/payroll");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const totalAmount =
    payrollData.employeeId.baseSalary -
    Number(deductions) +
    Number(bonus) -
    Number(tax);

  const idrFormatter = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 transform transition-all duration-300 hover:shadow-lg">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-8 py-6 flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-wide flex items-center">
              <CreditCard className="mr-3 w-7 h-7" /> Edit Payroll
            </h3>
            <button
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
              onClick={() => navigate("/admin/payroll")}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="baseSalary"
                    className="text-gray-700 font-semibold mb-2 flex items-center"
                  >
                    <DollarSign className="mr-2 w-5 h-5 text-indigo-600" />
                    Base Salary
                  </label>
                  <p className="w-full px-4 py-3 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">
                    {idrFormatter(payrollData.employeeId.baseSalary)}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="deductions"
                    className="text-gray-700 font-semibold mb-2 flex items-center"
                  >
                    <DollarSign className="mr-2 w-5 h-5 text-indigo-600" />
                    Deductions
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    id="deductions"
                    value={deductions}
                    onChange={(e) => setDeductions(e.target.value)}
                    placeholder="Enter deductions"
                  />
                  {payrollData && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {payrollData.deductions}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="bonus"
                    className="text-gray-700 font-semibold mb-2 flex items-center"
                  >
                    <DollarSign className="mr-2 w-5 h-5 text-indigo-600" />
                    Bonus
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    id="bonus"
                    value={bonus}
                    onChange={(e) => setBonus(e.target.value)}
                    placeholder="Enter bonus"
                  />
                  {payrollData && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {payrollData.bonus}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="tax"
                    className="text-gray-700 font-semibold mb-2 flex items-center"
                  >
                    <DollarSign className="mr-2 w-5 h-5 text-indigo-600" />
                    Tax
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    id="tax"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    placeholder="Enter tax"
                  />
                  {payrollData && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {payrollData.tax}
                    </p>
                  )}
                </div>
              </div>

              {/* Total Amount */}
              <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calculator className="w-6 h-6 text-indigo-600 mr-2" />
                    <h4 className="text-lg font-semibold text-indigo-800">
                      Total Amount
                    </h4>
                  </div>
                  <div className="text-xl font-bold text-indigo-700">
                    {idrFormatter(totalAmount)}
                  </div>
                </div>
                <div className="mt-2 text-sm text-indigo-600">
                  Base Salary + Bonus - Deductions - Tax
                </div>
              </div>

              {payrollData.status === "paid" && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="paymentMethod"
                        className="text-gray-700 font-semibold mb-2 flex items-center"
                      >
                        <CreditCard className="mr-2 w-5 h-5 text-indigo-600" />
                        Payment Method
                      </label>
                      <div className="relative">
                        <select
                          className="w-full px-4 py-3 appearance-none border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                          id="paymentMethod"
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Cash">Cash</option>
                          <option value="Check">Check</option>
                        </select>
                        <ChevronDown className="w-5 h-5 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      </div>
                      {payrollData && (
                        <p className="text-xs text-gray-500 mt-1">
                          Current: {payrollData.paymentMethod}
                        </p>
                      )}
                    </div>

                    {/* Payment Date */}
                    <div>
                      <label
                        htmlFor="paymentDate"
                        className="text-gray-700 font-semibold mb-2 flex items-center"
                      >
                        <Calendar className="mr-2 w-5 h-5 text-indigo-600" />
                        Payment Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                        id="paymentDate"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                      />
                      {payrollData && payrollData.paymentDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Current:{" "}
                          {new Date(
                            payrollData.paymentDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payment Reference */}
                  <div>
                    <label
                      htmlFor="paymentReference"
                      className="text-gray-700 font-semibold mb-2 flex items-center"
                    >
                      <Tag className="mr-2 w-5 h-5 text-indigo-600" />
                      Payment Reference
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                      id="paymentReference"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Enter reference code"
                    />
                    {payrollData && payrollData.paymentReference && (
                      <p className="text-xs text-gray-500 mt-1">
                        Current: {payrollData.paymentReference}
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label
                      htmlFor="notes"
                      className="text-gray-700 font-semibold mb-2 flex items-center"
                    >
                      <FileText className="mr-2 w-5 h-5 text-indigo-600" />
                      Notes
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                      rows={3}
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional notes"
                    ></textarea>
                    {payrollData && payrollData.notes && (
                      <p className="text-xs text-gray-500 mt-1">
                        Current: {payrollData.notes}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  onClick={() => navigate("/admin/payroll")}
                >
                  Cancel
                </button>
                <button
                  onClick={submitHandler}
                  className={`px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg hover:from-indigo-700 hover:to-purple-800 transition-all ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Payroll"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
