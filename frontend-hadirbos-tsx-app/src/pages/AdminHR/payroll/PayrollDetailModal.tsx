import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock,
  CalendarDays,
  Building,
} from "lucide-react";
import { format } from "date-fns";
import { Payroll } from "../../../types/payroll";
import { AttendanceStats } from "../../../types/attendance";
import { getCurrentUser } from "../../../services/authService";
import { getAttendanceStats } from "../../../services/attendanceService";
import Loading from "../../../components/Loading";
import Avatar from "../../../components/Avatar";

// Types
interface PayrollDetailProps {
  payrollRecord: Payroll;
  onClose: () => void;
}

const PayrollDetailModal = ({
  payrollRecord,
  onClose,
}: PayrollDetailProps) => {
  const [activeTab, setActiveTab] = useState<
    "summary" | "attendance" | "payment"
  >("summary");
  const [attendanceStats, setAttendanceStats] =
    useState<AttendanceStats | null>(null);
  const userInfo = getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        setLoading(true);
        const data = await getAttendanceStats(
          userInfo.token,
          payrollRecord.employeeId._id
        );
        setAttendanceStats(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPayroll();
  }, [userInfo.token, payrollRecord.employeeId._id]);

  // if (isPaymentModalOpen) {
  //   return (
  //     <PaymentModal
  //       payrollRecord={payrollRecord}
  //       onClose={() => setIsPaymentModalOpen(false)}
  //       onSuccess={onEdit}
  //     />
  //   );
  // }

  const idrFormatter = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Header with employee info */}
            <div className="p-4 md:p-6 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={onClose}
                  className="mr-4 p-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div className="flex items-center">
                  <Avatar
                    name={payrollRecord.employeeId.name}
                    size="lg"
                    className="mr-4"
                  />
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      {payrollRecord.employeeId.name}
                    </h2>
                    <div className="flex items-center text-sm text-gray-600">
                      <span>{payrollRecord.employeeId.position}</span>
                      <span className="mx-2">•</span>
                      <span>{payrollRecord.employeeId.department}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex items-center">
                <div className="text-right mr-4">
                  <div className="text-sm text-gray-600">Payroll Period:</div>
                  <div className="font-medium">
                    {new Date(
                      payrollRecord.year,
                      payrollRecord.month,
                      1
                    ).toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                <button
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === "summary"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("summary")}
                >
                  Summary
                </button>
                <button
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === "attendance"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("attendance")}
                >
                  Attendance
                </button>
                <button
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === "payment"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("payment")}
                >
                  Payment Info
                </button>
              </nav>
            </div>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow mb-6">
                {error}
              </div>
            )}

            {/* Content area */}
            <div className="flex-1 overflow-auto p-4 md:p-6">
              {activeTab === "summary" && (
                <div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          Total Net Pay
                        </h3>
                        <p className="text-sm text-gray-600">
                          Final amount after all deductions
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {idrFormatter(payrollRecord.totalAmount)}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-gray-600">Base Salary:</span>
                        <span className="font-medium">
                          {idrFormatter(payrollRecord.employeeId.baseSalary)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-gray-600">+ Bonus:</span>
                        <span className="font-medium text-green-600">
                          {idrFormatter(payrollRecord.bonus)}
                        </span>
                      </div>
                      {/* <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-600">+ Overtime:</span>
                    <span className="font-medium text-green-600">
                      {idrFormatter(payrollRecord.overtime)}
                    </span>
                  </div> */}
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-gray-600">- Deductions:</span>
                        <span className="font-medium text-red-600">
                          {idrFormatter(payrollRecord.deductions)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-gray-600">- Tax (5%):</span>
                        <span className="font-medium text-red-600">
                          {idrFormatter(payrollRecord.tax)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Clock className="h-5 w-5 text-gray-500 mr-2" />
                        <h3 className="font-medium text-gray-800">
                          Time Summary
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Working Days:
                          </span>
                          <span className="text-sm font-medium">
                            {attendanceStats?.totalWorkDays} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Days Worked:
                          </span>
                          <span className="text-sm font-medium">
                            {attendanceStats?.daysWorked} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Absences:
                          </span>
                          <span className="text-sm font-medium">
                            {attendanceStats?.absent} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Late Arrivals:
                          </span>
                          <span className="text-sm font-medium">
                            {attendanceStats?.late} days
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <CalendarDays className="h-5 w-5 text-gray-500 mr-2" />
                        <h3 className="font-medium text-gray-800">
                          Pay Period
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Month:</span>
                          <span className="text-sm font-medium">
                            {new Date(
                              payrollRecord.year,
                              payrollRecord.month,
                              1
                            ).toLocaleString("default", {
                              month: "long",
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Year:</span>
                          <span className="text-sm font-medium">
                            {payrollRecord.year}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span
                            className={`text-sm font-medium rounded-full px-2 ${
                              payrollRecord.status === "paid"
                                ? "text-green-700 bg-green-100"
                                : "text-yellow-700 bg-yellow-100"
                            }`}
                          >
                            {payrollRecord.status.charAt(0).toUpperCase() +
                              payrollRecord.status.slice(1)}
                          </span>
                        </div>
                        {payrollRecord?.paymentDate && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Payment Date:
                            </span>
                            <span className="text-sm font-medium">
                              {format(
                                new Date(payrollRecord?.paymentDate),
                                "MMM d, yyyy"
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Building className="h-5 w-5 text-gray-500 mr-2" />
                        <h3 className="font-medium text-gray-800">
                          Employee Info
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">ID:</span>
                          <span className="text-sm font-medium whitespace-nowrap">
                            {payrollRecord.employeeId._id
                              .toString()
                              .padStart(4, "0")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Department:
                          </span>
                          <span className="text-sm font-medium">
                            {payrollRecord.employeeId.department}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Position:
                          </span>
                          <span className="text-sm font-medium">
                            {payrollRecord.employeeId.position}
                          </span>
                        </div>
                        {/* <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Rate (Daily):
                      </span>
                      <span className="text-sm font-medium">
                        {idrFormatter(payrollRecord)}
                      </span>
                    </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "attendance" && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Attendance Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">
                        Summary
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Working Days:
                          </span>
                          <span className="text-sm font-medium">
                            {attendanceStats?.daysWorked} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Days Worked:
                          </span>
                          <span className="text-sm font-medium">
                            {attendanceStats?.daysWorked} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Absences:
                          </span>
                          <span className="text-sm font-medium">
                            {attendanceStats?.absent} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Late Arrivals:
                          </span>
                          <span className="text-sm font-medium">
                            {attendanceStats?.late} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Leave Days:
                          </span>
                          <span className="text-sm font-medium">
                            {attendanceStats?.leave} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Sick Days:
                          </span>
                          <span className="text-sm font-medium">
                            {attendanceStats?.sick} days
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">Impact</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Attendance Rate:
                          </span>
                          <span className="text-sm font-medium">
                            {attendanceStats?.attendanceRate} %
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Deduction Amount:
                          </span>
                          <span className="text-sm font-medium text-red-600">
                            -{idrFormatter(payrollRecord.deductions)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "payment" && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Payment Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">
                        Payment Details
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span
                            className={`text-sm font-medium rounded-full px-2 ${
                              payrollRecord.status === "paid"
                                ? "text-green-700 bg-green-100"
                                : "text-yellow-700 bg-yellow-100"
                            }`}
                          >
                            {payrollRecord.status.charAt(0).toUpperCase() +
                              payrollRecord.status.slice(1)}
                          </span>
                        </div>
                        {payrollRecord.paymentDate && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Payment Date:
                            </span>
                            <span className="text-sm font-medium">
                              {format(
                                new Date(payrollRecord.paymentDate),
                                "MMM d, yyyy"
                              )}
                            </span>
                          </div>
                        )}
                        {payrollRecord.paymentMethod && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Payment Method:
                            </span>
                            <span className="text-sm font-medium">
                              {payrollRecord.paymentMethod
                                .charAt(0)
                                .toUpperCase() +
                                payrollRecord.paymentMethod.slice(1)}
                            </span>
                          </div>
                        )}
                        {payrollRecord.paymentReference && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Payment Reference:
                            </span>
                            <span className="text-sm font-medium">
                              {payrollRecord.paymentReference}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PayrollDetailModal;
