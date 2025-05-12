import { useState, useRef } from "react";
import { Download, ArrowLeft, Check, X } from "lucide-react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import {
  AttendanceStatsResponse,
  AttendanceSummaryResponse,
  AttendanceTrend,
  DepartmentStatsResponse,
} from "../../../types/attendance";
import { SubmissionStats } from "../../../types/submission";
import { PayrollStats } from "../../../types/payroll";

interface ReportPdfModalProps {
  onClose: () => void;
  reportTitle: string;
  reportTab: string;
  reportData: {
    historicalData: AttendanceStatsResponse | null;
    departmentStats: DepartmentStatsResponse | null;
    submissionData: SubmissionStats | null;
    payrollStatsData: PayrollStats | null;
    employeesStatistics: AttendanceSummaryResponse | null;
    attendanceTrend: AttendanceTrend | null;
    // submissionsTrend;
    // payrollTrend;
    // submissionsTrendData;
    pieData:
      | {
          name: string;
          value: number;
          color: string;
        }[]
      | null;
    leaveData:
      | {
          name: string;
          total: number;
          pending: number;
          approved: number;
          rejected: number;
        } []
      | undefined;
    resignationData:
      | {
          name: string;
          total: number;
          pending: number;
          approved: number;
          rejected: number;
        } []
      | undefined;
    payrollDetailData:
      | {
          name: string;
          month: number;
          totalPayroll: number;
          totalBonus: number;
          totalDeductions: number;
          totalTax: number;
        }[]
      | undefined;
    reportDateRangeType: string;
    reportYearFilter: number;
  };
  idrFormatter: (value: number) => string;
  getMonthName: (month: number) => string;
}

export default function ReportPdfModal({
  onClose,
  reportTitle,
  reportTab,
  reportData,
  idrFormatter,
  getMonthName,
}: ReportPdfModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const {
    historicalData,
    departmentStats,
    submissionData,
    payrollStatsData,
    employeesStatistics,
    attendanceTrend,
    // submissionsTrend,
    // payrollTrend,
    // submissionsTrendData,
    pieData,
    leaveData,
    resignationData,
    payrollDetailData,
    reportDateRangeType,
    reportYearFilter,
  } = reportData;

  const generatePDF = async () => {
    if (!reportRef.current) return;

    setIsGenerating(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait", // Use portrait orientation
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calculate the number of pages needed
      const imgWidth = pageWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      // const pageCount = Math.ceil(imgHeight / (pageHeight - 20)); // 10mm margin on top and bottom

      // Add image across multiple pages if needed
      let heightLeft = imgHeight;
      let position = 10; // starting at 10mm from the top
      let page = 0;

      // First page
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      // Add additional pages if content overflows
      while (heightLeft > 0) {
        page++;
        position = -pageHeight * page + 10; // Adjust position for next page
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      pdf.save(`${reportTitle.replace(/\s+/g, "")}-${reportTab}.pdf`);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to render the appropriate report content based on the tab
  const renderReportContent = () => {
    switch (reportTab) {
      case "overview":
        return renderOverviewReport();
      case "attendance":
        return renderAttendanceReport();
      case "departments":
        return renderDepartmentsReport();
      case "leave":
        return renderLeaveReport();
      case "resignation":
        return renderResignationReport();
      case "payroll":
        return renderPayrollReport();
      default:
        return null;
    }
  };

  //   const renderReportContent = () => {
  //     return (
  //       <>
  //         {renderOverviewReport()}
  //         {renderAttendanceReport()}
  //         {renderDepartmentsReport()}
  //         {renderLeaveReport()}
  //         {renderResignationReport()}
  //         {renderPayrollReport()}
  //       </>
  //     );
  //   };

  // Overview Report
  const renderOverviewReport = () => {
    return (
      <>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Executive Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Employee Overview Card */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="font-medium text-indigo-800 mb-3">
                Employee Overview
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Employees:</span>
                  <span className="font-semibold">
                    {historicalData?.totalEmployees}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Departments:</span>
                  <span className="font-semibold">
                    {departmentStats?.count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Days Worked:</span>
                  <span className="font-semibold">
                    {historicalData?.aggregateStats.avgDaysWorkedPerEmployee}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Salary:</span>
                  <span className="font-semibold">
                    {idrFormatter(payrollStatsData?.avgTotalAmount ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance Highlights Card */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h3 className="font-medium text-emerald-800 mb-3">
                Attendance Highlights
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Present Rate:</span>
                  <span className="font-semibold">
                    {historicalData?.aggregateStats.presentRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Absence Rate:</span>
                  <span className="font-semibold">
                    {historicalData?.aggregateStats.absenceRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sick Rate:</span>
                  <span className="font-semibold">
                    {historicalData?.aggregateStats.sickRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Attendance:</span>
                  <span className="font-semibold">
                    {historicalData?.aggregateStats.avgAttendanceRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* HR Metrics Card */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-800 mb-3">HR Metrics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Leave Requests:</span>
                  <span className="font-semibold">
                    {submissionData?.leave.total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Resignations:</span>
                  <span className="font-semibold">
                    {submissionData?.resignation.total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Turnover Rate:</span>
                  <span className="font-semibold">
                    {Math.round(
                      ((submissionData?.resignation.total || 0) /
                        (historicalData?.totalEmployees || 1)) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payroll Total:</span>
                  <span className="font-semibold">
                    {idrFormatter(
                      payrollStatsData?.payrollTotals.totalAmount || 0
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Top Performers
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Employee
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Department
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Attendance Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employeesStatistics?.topPerformers.map((performer, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-gray-800">
                      {performer.name}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {performer.department}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                      {performer.attendanceRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Concerns */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Attendance Concerns
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Employee
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Department
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Attendance Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employeesStatistics?.attendanceConcerns.map(
                  (concern, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-gray-800">
                        {concern.name}
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {concern.department}
                      </td>
                      <td className="px-4 py-3 text-right text-rose-600 font-medium">
                        {concern.attendanceRate}%
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Distribution */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Attendance Distribution
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex flex-wrap justify-center gap-4">
              {pieData?.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-700">
                    {item.name}: {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  // Attendance Report
  const renderAttendanceReport = () => {
    return (
      <>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Attendance Trends
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                {(() => {
                  if (reportDateRangeType === "all") {
                    return "Attendance Trends (All Time)";
                  } else if (reportDateRangeType === "ytd") {
                    return `Attendance Trends (Year To Date)`;
                  } else if (reportDateRangeType === "specific") {
                    return `Attendance Trends For (Last 6 Months)`;
                  } else if (reportDateRangeType === "fullYear") {
                    return `Attendance Trends For (Year ${reportYearFilter})`;
                  }
                })()}
              </h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Month
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Present Rate
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Absence Rate
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Late Rate
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Leave Rate
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Sick Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceTrend?.trend.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-gray-800">
                      {getMonthName(item.month - 1)}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-600">
                      {item.presentRate}%
                    </td>
                    <td className="px-4 py-3 text-right text-rose-600">
                      {item.absentRate}%
                    </td>
                    <td className="px-4 py-3 text-right text-amber-600">
                      {item.lateRate}%
                    </td>
                    <td className="px-4 py-3 text-right text-blue-600">
                      {item.leaveRate}%
                    </td>
                    <td className="px-4 py-3 text-right text-purple-600">
                      {item.sickRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Employee Attendance Details
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Employee
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Department
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Position
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">
                    Present
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">
                    Absent
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">
                    Late
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">
                    Leave
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Attendance %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historicalData?.stats.map((item, index) => {
                  const attendancePercentage = Number(item.attendanceRate);
                  return (
                    <tr key={index}>
                      <td className="px-4 py-3 text-gray-800">{item.name}</td>
                      <td className="px-4 py-3 text-gray-800">
                        {item.department}
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {item.position}
                      </td>
                      <td className="px-4 py-3 text-center text-emerald-600">
                        {item.present}
                      </td>
                      <td className="px-4 py-3 text-center text-rose-600">
                        {item.absent}
                      </td>
                      <td className="px-4 py-3 text-center text-amber-600">
                        {item.late}
                      </td>
                      <td className="px-4 py-3 text-center text-blue-600">
                        {item.leave}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        <span
                          className={
                            attendancePercentage >= 90
                              ? "text-emerald-600"
                              : attendancePercentage >= 75
                              ? "text-blue-600"
                              : attendancePercentage >= 60
                              ? "text-amber-600"
                              : "text-rose-600"
                          }
                        >
                          {attendancePercentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  // Departments Report
  const renderDepartmentsReport = () => {
    return (
      <>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Department Statistics
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Department
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">
                    Employees
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">
                    Attendance Rate
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">
                    Leave Requests
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">
                    Resignations
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Turnover Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {departmentStats?.stats.map((dept, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {dept.department}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-800">
                      {dept.employees}
                    </td>
                    <td className="px-4 py-3 text-center text-emerald-600">
                      {dept.attendanceRate}%
                    </td>
                    <td className="px-4 py-3 text-center text-blue-600">
                      {dept.leaveRequests}
                    </td>
                    <td className="px-4 py-3 text-center text-rose-600">
                      {dept.resignations}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          Number(dept.turnoverRate) > 20
                            ? "text-rose-600 font-medium"
                            : Number(dept.turnoverRate) > 10
                            ? "text-amber-600 font-medium"
                            : "text-emerald-600 font-medium"
                        }
                      >
                        {dept.turnoverRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Department Attendance Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departmentStats?.stats.map((dept, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <h3 className="font-medium text-gray-800 mb-3">
                  {dept.department}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Present:</span>
                    <span className="font-semibold text-emerald-600">
                      {dept.attendanceBreakdown.present}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Late:</span>
                    <span className="font-semibold text-amber-600">
                      {dept.attendanceBreakdown.late}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Leave:</span>
                    <span className="font-semibold text-blue-600">
                      {dept.attendanceBreakdown.leave}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sick:</span>
                    <span className="font-semibold text-purple-600">
                      {dept.attendanceBreakdown.sick}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Absent:</span>
                    <span className="font-semibold text-rose-600">
                      {dept.attendanceBreakdown.absent}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  // Leave Report
  const renderLeaveReport = () => {
    return (
      <>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Leave Management Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="font-medium text-indigo-800 mb-3">
                Total Requests
              </h3>
              <div className="text-3xl font-bold text-indigo-700">
                {submissionData?.leave.total}
              </div>
              <div className="text-sm text-gray-600 mt-1">This period</div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h3 className="font-medium text-emerald-800 mb-3">Approved</h3>
              <div className="text-3xl font-bold text-emerald-600">
                {submissionData?.leave.approved}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {submissionData?.leave.percentages.approved}% of requests
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-medium text-amber-800 mb-3">Pending</h3>
              <div className="text-3xl font-bold text-amber-600">
                {submissionData?.leave.pending}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {submissionData?.leave.percentages.pending}% of requests
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <h3 className="font-medium text-rose-800 mb-3">Rejected</h3>
              <div className="text-3xl font-bold text-rose-600">
                {submissionData?.leave.rejected}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {submissionData?.leave.percentages.rejected}% of requests
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Leave Requests Trend
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Month
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Total
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Approved
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Pending
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Rejected
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaveData?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-gray-800">{item.name}</td>
                    <td className="px-4 py-3 text-right text-gray-800 font-medium">
                      {item.total}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-600">
                      {item.approved}
                    </td>
                    <td className="px-4 py-3 text-right text-amber-600">
                      {item.pending}
                    </td>
                    <td className="px-4 py-3 text-right text-rose-600">
                      {item.rejected}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Leave Requests by Department
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Department
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">
                    Total Employees
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">
                    Leave Requests
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Request Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {departmentStats?.stats.map((dept, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {dept.department}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-800">
                      {dept.employees}
                    </td>
                    <td className="px-4 py-3 text-center text-blue-600">
                      {dept.leaveRequests}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-800">
                      {Math.round((dept.leaveRequests / dept.employees) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  // Resignation Report
  const renderResignationReport = () => {
    return (
      <>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Resignation Tracker
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <h3 className="font-medium text-rose-800 mb-3">
                Total Resignations
              </h3>
              <div className="text-3xl font-bold text-rose-700">
                {submissionData?.resignation.total}
              </div>
              <div className="text-sm text-gray-600 mt-1">This period</div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h3 className="font-medium text-emerald-800 mb-3">Approved</h3>
              <div className="text-3xl font-bold text-emerald-600">
                {submissionData?.resignation.approved}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {submissionData?.resignation.percentages.approved}% of requests
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-medium text-amber-800 mb-3">Pending</h3>
              <div className="text-3xl font-bold text-amber-600">
                {submissionData?.resignation.pending}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {submissionData?.resignation.percentages.pending}% of requests
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <h3 className="font-medium text-rose-800 mb-3">Rejected</h3>
              <div className="text-3xl font-bold text-rose-600">
                {submissionData?.resignation.rejected}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {submissionData?.resignation.percentages.rejected}% of requests
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Resignation Trend
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Month
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Total
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Approved
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Pending
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Rejected
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resignationData?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-gray-800">{item.name}</td>
                    <td className="px-4 py-3 text-right text-gray-800 font-medium">
                      {item.total}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-600">
                      {item.approved}
                    </td>
                    <td className="px-4 py-3 text-right text-amber-600">
                      {item.pending}
                    </td>
                    <td className="px-4 py-3 text-right text-rose-600">
                      {item.rejected}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Resignation by Department
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Department
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">
                    Total Employees
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">
                    Resignations
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Turnover Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {departmentStats?.stats.map((dept, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {dept.department}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-800">
                      {dept.employees}
                    </td>
                    <td className="px-4 py-3 text-center text-rose-600">
                      {dept.resignations}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          Number(dept.turnoverRate) > 20
                            ? "text-rose-600 font-medium"
                            : Number(dept.turnoverRate) > 10
                            ? "text-amber-600 font-medium"
                            : "text-emerald-600 font-medium"
                        }
                      >
                        {dept.turnoverRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  // Payroll Report
  const renderPayrollReport = () => {
    return (
      <>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Payroll Summary
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Month
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Total Payroll
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Total Bonus
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Total Deductions
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                    Total Tax
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payrollDetailData?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-gray-800">{item.name}</td>
                    <td className="px-4 py-3 text-right text-gray-800 font-medium">
                      {idrFormatter(item.totalPayroll)}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-600">
                      {idrFormatter(item.totalBonus)}
                    </td>
                    <td className="px-4 py-3 text-right text-rose-600">
                      {idrFormatter(item.totalDeductions)}
                    </td>
                    <td className="px-4 py-3 text-right text-amber-600">
                      {idrFormatter(item.totalTax)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Salary Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Salary Overview Card */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="font-medium text-indigo-800 mb-3">
                Salary Overview
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Salary Total:</span>
                  <span className="font-semibold">
                    {idrFormatter(
                      payrollStatsData?.payrollTotals.baseSalary ?? 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Highest Salary:</span>
                  <span className="font-semibold">
                    {idrFormatter(payrollStatsData?.highestSalary ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lowest Salary:</span>
                  <span className="font-semibold">
                    {idrFormatter(payrollStatsData?.lowestSalary ?? 0)}
                  </span>
                </div>
                <div className="border-t border-indigo-200 my-2"></div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Base Salary:</span>
                  <span className="font-semibold">
                    {idrFormatter(payrollStatsData?.avgBaseSalary ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bonus Information */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h3 className="font-medium text-emerald-800 mb-3">
                Bonus Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bonus Paid:</span>
                  <span className="font-semibold">
                    {idrFormatter(payrollStatsData?.payrollTotals.bonus ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Employees With Bonus:</span>
                  <span className="font-semibold">
                    {payrollStatsData?.employeesWithBonus ?? 0} employees
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Bonus:</span>
                  <span className="font-semibold">
                    {idrFormatter(payrollStatsData?.avgBonus ?? 0)}
                  </span>
                </div>
                <div className="border-t border-emerald-200 my-2"></div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bonus Ratio:</span>
                  <span className="font-semibold">
                    {(
                      (payrollStatsData?.bonusToSalaryRatio ?? 0) * 100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <h3 className="font-medium text-rose-800 mb-3">Deductions</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Employees With Deductions:
                  </span>
                  <span className="font-semibold">
                    {payrollStatsData?.employeesWithDeductions ?? 0} employees
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Deductions:</span>
                  <span className="font-semibold">
                    {idrFormatter(payrollStatsData?.avgDeductions ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deduction Rate:</span>
                  <span className="font-semibold">
                    {(
                      ((payrollStatsData?.payrollTotals.deductions ?? 0) /
                        (payrollStatsData?.payrollTotals.baseSalary ?? 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="border-t border-rose-200 my-2"></div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Deductions:</span>
                  <span className="font-semibold">
                    {idrFormatter(
                      payrollStatsData?.payrollTotals.deductions ?? 0
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Financial Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Budget Impact */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-800 mb-3">
                Budget Impact
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Salary Budget:</span>
                  <span className="font-semibold">
                    {idrFormatter(
                      payrollStatsData?.payrollTotals.baseSalary ?? 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Deductions:</span>
                  <span className="font-semibold">
                    {idrFormatter(
                      payrollStatsData?.payrollTotals.deductions ?? 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Taxes:</span>
                  <span className="font-semibold">
                    {idrFormatter(payrollStatsData?.payrollTotals.tax ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bonuses:</span>
                  <span className="font-semibold">
                    {idrFormatter(payrollStatsData?.payrollTotals.bonus ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Actual Payable:</span>
                  <span className="font-semibold">
                    {idrFormatter(
                      payrollStatsData?.payrollTotals.totalAmount ?? 0
                    )}
                  </span>
                </div>
                <div className="border-t border-purple-200 my-2"></div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Budget Savings:</span>
                  <span className="font-semibold">
                    {idrFormatter(
                      (payrollStatsData?.payrollTotals.baseSalary ?? 0) -
                        (payrollStatsData?.payrollTotals.totalAmount ?? 0)
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Employee Averages */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-medium text-amber-800 mb-3">
                Employee Averages
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Base Salary:</span>
                  <span className="font-semibold">
                    {idrFormatter(payrollStatsData?.avgBaseSalary ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Bonus:</span>
                  <span className="font-semibold">
                    {idrFormatter(payrollStatsData?.avgBonus ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Tax:</span>
                  <span className="font-semibold">
                    {idrFormatter(payrollStatsData?.avgTax ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Deductions:</span>
                  <span className="font-semibold">
                    {idrFormatter(payrollStatsData?.avgDeductions ?? 0)}
                  </span>
                </div>
                <div className="border-t border-amber-200 my-2"></div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Total Payout:</span>
                  <span className="font-semibold">
                    {idrFormatter(payrollStatsData?.avgTotalAmount ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="mr-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <h2 className="text-lg font-bold">{reportTitle}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex items-center gap-1 px-3 py-2 bg-white text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              <span>{isGenerating ? "Generating..." : "Download PDF"}</span>
            </button>
          </div>
        </div>

        {/* Success notification */}
        {showSuccess && (
          <div className="absolute top-4 right-4 bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-md flex items-center">
            <Check className="h-4 w-4 mr-2" />
            <span>PDF generated successfully!</span>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="absolute top-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-2 rounded-md flex items-center">
            <X className="h-4 w-4 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Report content - scrollable */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-100">
          {/* Actual report that will be converted to PDF */}
          <div
            ref={reportRef}
            className="bg-white rounded-lg shadow-md p-6 md:p-8 max-w-5xl mx-auto"
          >
            {/* Report header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6">
              <div className="mb-4 md:mb-0">
                <div className="bg-gray-100 h-12 w-36 flex items-center justify-center text-gray-400 font-bold rounded">
                  <img src="/p.png" alt="Logo" className="h-8 w-8 mr-2" />
                  <span className="text-xl text-indigo-600">Hadirbos</span>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gray-800">
                  {reportTitle}
                </h1>
                <p className="text-gray-600">
                  Generated on: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Report content based on selected tab */}
            <div className="mt-6">{renderReportContent()}</div>

            {/* Footer */}
            <div className=" pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>
                This is a computer-generated document. No signature is required.
              </p>
              <p className="mt-1">
                For questions regarding this report, please contact the HR
                department.
              </p>
              <p className="mt-2 text-xs">
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
