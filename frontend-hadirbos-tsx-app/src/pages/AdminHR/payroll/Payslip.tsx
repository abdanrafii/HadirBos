import { useState, useRef, useEffect } from "react";
import { Download, ArrowLeft, Check, X } from "lucide-react";
import { format } from "date-fns";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { Payroll } from "../../../types/payroll";
import { getCurrentUser } from "../../../services/authService";
import { AttendanceStats } from "../../../types/attendance";
import { getAttendanceStats } from "../../../services/attendanceService";
import Loading from "../../../components/Loading";

interface PayslipGeneratorProps {
  payrollRecord: Payroll;
  onClose: () => void;
}

export default function PaySlip({
  payrollRecord,
  onClose,
}: PayslipGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const payslipRef = useRef<HTMLDivElement>(null);
  const userInfo = getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendanceStats, setAttendanceStats] =
    useState<AttendanceStats | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
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

    fetchAttendance();
  }, [userInfo.token, payrollRecord.employeeId._id]);

  // Format currency
  const idrFormatter = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format date
  const formatDate = (date?: Date | string) => {
    if (!date) return "N/A";
    return format(
      typeof date === "string" ? new Date(date) : date,
      "MMMM d, yyyy"
    );
  };

  // Generate PDF from the payslip div
  const generatePDF = async () => {
    if (!payslipRef.current) return;

    setIsGenerating(true);

    try {
      const canvas = await html2canvas(payslipRef.current, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(
        `Payslip-${payrollRecord.employeeId.name}-${payrollRecord.month + 1}-${
          payrollRecord.year
        }.pdf`
      );

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Email the payslip (mock function)
  //   const emailPayslip = () => {
  //     setIsGenerating(true);

  //     // Simulate email sending
  //     setTimeout(() => {
  //       setIsGenerating(false);
  //       setShowSuccess(true);
  //       setTimeout(() => setShowSuccess(false), 3000);
  //     }, 1500);
  //   };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Header */}
            <div className="p-4 md:p-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={onClose}
                  className="mr-4 p-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h2 className="text-lg font-bold text-gray-800">
                  Employee Payslip
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={generatePDF}
                  disabled={isGenerating}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  <span>{isGenerating ? "Generating..." : "Download PDF"}</span>
                </button>

                {/* <button
              onClick={emailPayslip}
              disabled={isGenerating}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </button> */}
              </div>
            </div>

            {/* Success notification */}
            {showSuccess && (
              <div className="absolute top-4 right-4 bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-md flex items-center">
                <Check className="h-4 w-4 mr-2" />
                <span>Operation completed successfully!</span>
              </div>
            )}

            {/* Error notification */}
            {error && (
              <div className="absolute top-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-2 rounded-md flex items-center">
                <X className="h-4 w-4 mr-2" />
                <span>{error}</span>
              </div>
            )}

            {/* Payslip content - scrollable */}
            <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-100">
              {/* Actual payslip that will be converted to PDF */}
              <div
                ref={payslipRef}
                className="bg-white rounded-lg shadow-md p-6 md:p-8 max-w-3xl mx-auto"
              >
                {/* Payslip header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6">
                  <div className="mb-4 md:mb-0">
                    <div className="bg-gray-100 h-12 w-36 flex items-center justify-center text-gray-400 font-bold rounded">
                      <img src="/p.png" alt="Logo" className="h-8 w-8 mr-2" />
                      <span className="text-xl">Hadirbos</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <h1 className="text-2xl font-bold text-gray-800">
                      PAYSLIP
                    </h1>
                    <p className="text-gray-600">
                      {new Date(
                        payrollRecord.year,
                        payrollRecord.month - 1
                      ).toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Company and Employee Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                      Company Information
                    </h2>
                    <p className="text-gray-600">Hadirbos Kelompok 3</p>
                    <p className="text-gray-600">123 Main Street</p>
                    <p className="text-gray-600">Surakarta, Indonesia</p>
                    <p className="text-gray-600">Tax ID: 12-3456789</p>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                      Employee Information
                    </h2>
                    <p className="text-gray-600">
                      <span className="font-medium">Name:</span>{" "}
                      {payrollRecord.employeeId.name}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">ID:</span>{" "}
                      {payrollRecord.employeeId._id.toString().padStart(4, "0")}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Position:</span>{" "}
                      {payrollRecord.employeeId.position}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Department:</span>{" "}
                      {payrollRecord.employeeId.department}
                    </p>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Payment Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Payment Date</p>
                      <p className="font-medium">
                        {formatDate(payrollRecord.paymentDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium">
                        {payrollRecord.paymentMethod
                          ? payrollRecord.paymentMethod
                              .charAt(0)
                              .toUpperCase() +
                            payrollRecord.paymentMethod.slice(1)
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Reference</p>
                      <p className="font-medium">
                        {payrollRecord.paymentReference || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Earnings and Deductions */}
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Earnings & Deductions
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                            Description
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 text-gray-800">
                            Base Salary
                          </td>
                          <td className="px-4 py-3 text-right text-gray-800">
                            {idrFormatter(payrollRecord.employeeId.baseSalary)}
                          </td>
                        </tr>
                        {payrollRecord.bonus > 0 && (
                          <tr>
                            <td className="px-4 py-3 text-gray-800">Bonus</td>
                            <td className="px-4 py-3 text-right text-green-600">
                              +{idrFormatter(payrollRecord.bonus)}
                            </td>
                          </tr>
                        )}
                        {/* {payrollRecord.overtime > 0 && (
                      <tr>
                        <td className="px-4 py-3 text-gray-800">Overtime</td>
                        <td className="px-4 py-3 text-right text-green-600">
                          +{idrFormatter(payrollRecord.overtime)}
                        </td>
                      </tr>
                    )} */}
                        <tr>
                          <td className="px-4 py-3 text-gray-800">
                            Attendance Deductions
                          </td>
                          <td className="px-4 py-3 text-right text-red-600">
                            -{idrFormatter(payrollRecord.deductions)}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-800">Tax</td>
                          <td className="px-4 py-3 text-right text-red-600">
                            -{idrFormatter(payrollRecord.tax)}
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-medium">
                          <td className="px-4 py-3 text-gray-800">Net Pay</td>
                          <td className="px-4 py-3 text-right text-gray-800 font-bold">
                            {idrFormatter(payrollRecord.totalAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Attendance Summary */}
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Attendance Summary
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500">Working Days</p>
                      <p className="text-lg font-medium">
                        {attendanceStats?.totalWorkDays}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500">Present</p>
                      <p className="text-lg font-medium">
                        {attendanceStats?.present}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500">Absent</p>
                      <p className="text-lg font-medium">
                        {attendanceStats?.absent}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500">Late</p>
                      <p className="text-lg font-medium">
                        {attendanceStats?.late}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500">Leave/Sick</p>
                      <p className="text-lg font-medium">
                        {(attendanceStats?.leave ?? 0) +
                          (attendanceStats?.sick ?? 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {payrollRecord.notes && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h2 className="text-sm font-semibold text-gray-800 mb-1">
                      Notes
                    </h2>
                    <p className="text-sm text-gray-600">
                      {payrollRecord.notes}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                  <p>
                    This is a computer-generated document. No signature is
                    required.
                  </p>
                  <p className="mt-1">
                    For questions regarding this payslip, please contact HR
                    department.
                  </p>
                  <p className="mt-2 text-xs">
                    Generated on {format(new Date(), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
