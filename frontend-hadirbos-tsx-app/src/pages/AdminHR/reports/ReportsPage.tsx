import { useState, useEffect } from "react";
import {
  Filter,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Briefcase,
  CreditCard,
  BarChart,
  FileText,
  Clock,
  BarChart2,
  PieChartIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Bar,
  BarChart as BarChartRecharts,
  AreaChart,
  Area,
} from "recharts";

import { getCurrentUser } from "../../../services/authService";
import {
  getAllAttendanceStats,
  getAttendanceTrend,
  getDepartmentStatistics,
  getEmployeePerformanceStats,
} from "../../../services/attendanceService";
import type {
  AttendanceStatsResponse,
  AttendanceSummaryResponse,
  AttendanceTrend,
  DepartmentStatsResponse,
} from "../../../types/attendance";
import type {
  SubmissionStats,
  SubmissionTrend,
} from "../../../types/submission";
import {
  getSubmissionStats,
  getSubmissionTrend,
} from "../../../services/submissionService";
import type { PayrollStats, PayrollTrend } from "../../../types/payroll";
import {
  getPayrollStats,
  getPayrollTrend,
} from "../../../services/payrollService";
import Loading from "../../../components/Loading";
import ReportPdfModal from "./ReportPdfModal";
import Avatar from "../../../components/Avatar";

const getMonthName = (month: number) => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return monthNames[month];
};

const ReportsPage = () => {
  // Remove the printRef reference since we'll no longer need it in the main component
  const [showReportFilters, setShowReportFilters] = useState(false);
  const [reportTab, setReportTab] = useState("overview");
  const [reportDateRangeType, setReportDateRangeType] = useState<
    "specific" | "fullYear" | "ytd" | "all"
  >("specific");
  const [showReportModal, setShowReportModal] = useState(false);

  const availableYears = [2022, 2023, 2024, 2025, 2026, 2027];

  // Remove the generateAndDownloadPdf function since it will be handled in the modal
  const handleDownloadPdf = () => {
    setShowReportModal(true);
  };

  const [reportYearFilter, setReportYearFilter] = useState<number>(
    new Date().getFullYear()
  );
  const [reportMonthFilter, setReportMonthFilter] = useState<number>(
    new Date().getMonth()
  );

  const userInfo = getCurrentUser();

  const [historicalData, setHistoricalData] =
    useState<AttendanceStatsResponse | null>(null);
  const [departmentStats, setDepartmentStats] =
    useState<DepartmentStatsResponse | null>(null);
  const [employeesStatistics, setEmployeesStatistics] =
    useState<AttendanceSummaryResponse | null>(null);
  const [submissionData, setSubmissionData] = useState<SubmissionStats | null>(
    null
  );
  const [payrollStatsData, setPayrollStatsData] = useState<PayrollStats | null>(
    null
  );
  const [attendanceTrend, setAttendanceTrend] =
    useState<AttendanceTrend | null>(null);
  const [submissionsTrend, setSubmissionsTrend] =
    useState<SubmissionTrend | null>(null);
  const [payrollTrend, setPayrollTrend] = useState<PayrollTrend | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const period =
          reportDateRangeType === "ytd"
            ? "ytd"
            : reportDateRangeType === "all"
            ? "allTime"
            : "";

        const month =
          reportDateRangeType === "specific"
            ? reportMonthFilter + 1
            : undefined;
        const year =
          reportDateRangeType === "specific" ||
          reportDateRangeType === "fullYear"
            ? reportYearFilter
            : undefined;

        const [
          historicalData,
          departmentStats,
          employeesStatistics,
          submissionData,
          payrollStatsData,
          attendanceTrend,
          submissionsTrend,
          payrollTrend,
        ] = await Promise.all([
          getAllAttendanceStats(userInfo.token, month, year, period),
          getDepartmentStatistics(userInfo.token, month, year, period),
          getEmployeePerformanceStats(userInfo.token, month, year, period),
          getSubmissionStats(userInfo.token, month, year, period),
          getPayrollStats(userInfo.token, month, year, period),
          getAttendanceTrend(userInfo.token, month, year, period),
          getSubmissionTrend(userInfo.token, month, year, period),
          getPayrollTrend(userInfo.token, month, year, period),
        ]);

        // Menyimpan data yang diterima ke state
        setHistoricalData(historicalData);
        setDepartmentStats(departmentStats);
        setEmployeesStatistics(employeesStatistics);
        setSubmissionData(submissionData);
        setPayrollStatsData(payrollStatsData);
        setAttendanceTrend(attendanceTrend);
        setSubmissionsTrend(submissionsTrend);
        setPayrollTrend(payrollTrend);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    userInfo.token,
    reportMonthFilter,
    reportYearFilter,
    reportDateRangeType,
  ]);

  const idrFormatter = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Consistent colors for attendance distribution pie chart
  const ATTENDANCE_COLORS = {
    present: "#10b981", // emerald-500
    absent: "#f43f5e", // rose-500
    leave: "#06b6d4", // cyan-500
    late: "#f59e0b", // amber-500
    sick: "#8b5cf6", // purple-500
  };

  const pieData = [
    {
      name: "Present",
      value: Number.parseFloat(
        String(historicalData?.aggregateStats.presentRate ?? 0)
      ),
      color: ATTENDANCE_COLORS.present,
    },
    {
      name: "Absent",
      value: Number.parseFloat(
        String(historicalData?.aggregateStats.absenceRate ?? 0)
      ),
      color: ATTENDANCE_COLORS.absent,
    },
    {
      name: "Leave",
      value: Number.parseFloat(
        String(historicalData?.aggregateStats.lateRate ?? 0)
      ),
      color: ATTENDANCE_COLORS.leave,
    },
    {
      name: "Late",
      value: Number.parseFloat(
        String(historicalData?.aggregateStats.leaveRate ?? 0)
      ),
      color: ATTENDANCE_COLORS.late,
    },
    {
      name: "Sick",
      value: Number.parseFloat(
        String(historicalData?.aggregateStats.sickRate ?? 0)
      ),
      color: ATTENDANCE_COLORS.sick,
    },
  ].filter((item) => item.value > 0);

  const submissionsTrendData = submissionsTrend?.trend?.map((item) => ({
    name: `${getMonthName(item.month - 1)}`,
    leave: item.leave.total,
    resignation: item.resignation.total,
  }));

  const leaveData = submissionsTrend?.trend.map((item) => ({
    name: `${getMonthName(item.month - 1)}`,
    total: item.leave.total,
    pending: item.leave.pending,
    approved: item.leave.approved,
    rejected: item.leave.rejected,
  }));

  const resignationData = submissionsTrend?.trend.map((item) => ({
    name: `${getMonthName(item.month - 1)}`,
    total: item.resignation.total,
    pending: item.resignation.pending,
    approved: item.resignation.approved,
    rejected: item.resignation.rejected,
  }));

  // Enhanced payroll data with additional metrics
  const payrollDetailData = payrollTrend?.trend.map((item) => ({
    name: getMonthName(item.month - 1),
    month: item.month,
    totalPayroll: item.totalPayroll,
    totalBonus: payrollStatsData?.payrollTotals.bonus
      ? item.totalPayroll *
        (payrollStatsData.payrollTotals.bonus /
          payrollStatsData.payrollTotals.totalAmount)
      : 0,
    totalDeductions: payrollStatsData?.payrollTotals.deductions
      ? item.totalPayroll *
        (payrollStatsData.payrollTotals.deductions /
          payrollStatsData.payrollTotals.totalAmount)
      : 0,
    totalTax: payrollStatsData?.payrollTotals.tax
      ? item.totalPayroll *
        (payrollStatsData.payrollTotals.tax /
          payrollStatsData.payrollTotals.totalAmount)
      : 0,
  }));

  const getReportTitle = () => {
    if (reportDateRangeType === "specific") {
      return `Monthly Reports - ${getMonthName(
        reportMonthFilter ?? 0
      )} ${reportYearFilter}`;
    } else if (reportDateRangeType === "fullYear") {
      return `Full Year Reports - ${reportYearFilter}`;
    } else if (reportDateRangeType === "ytd") {
      return `Year to Date Reports - ${reportYearFilter}`;
    } else {
      return "All Time Reports";
    }
  };

  const getTrendReportTitle = () => {
    if (reportDateRangeType === "specific") {
      return "Last 6 Months Trends";
    } else if (reportDateRangeType === "fullYear") {
      return `Full Year Trends - ${reportYearFilter}`;
    } else if (reportDateRangeType === "ytd") {
      return `Year to Date Trends`;
    } else {
      return "All Time Trends";
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-800 to-purple-600 text-white p-6 rounded-t-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {getReportTitle()}
                </h1>
                <p className="text-indigo-100 mt-1 flex items-center">
                  <Clock className="inline-block w-4 h-4 mr-1" />
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowReportFilters(!showReportFilters)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/20 text-white rounded-md hover:bg-white/30 transition-colors text-sm border border-white/30"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Filters
                  {showReportFilters ? (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  )}
                </button>

                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors text-sm font-medium"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Generate PDF Report
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showReportFilters && (
            <div className="p-6 bg-indigo-50 border-b border-indigo-100">
              <h3 className="text-sm font-medium text-indigo-800 mb-4">
                Report Filters
              </h3>
              <div className="flex flex-wrap gap-4">
                <div className="w-full md:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <select
                    value={reportDateRangeType}
                    onChange={(e) =>
                      setReportDateRangeType(
                        e.target.value as
                          | "specific"
                          | "ytd"
                          | "all"
                          | "fullYear"
                      )
                    }
                    className="w-full md:w-[200px] bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="specific">Specific Month/Year</option>
                    <option value="fullYear">Full Year</option>
                    <option value="ytd">Year to Date</option>
                    <option value="all">All Time</option>
                  </select>
                </div>

                {(reportDateRangeType === "specific" ||
                  reportDateRangeType === "fullYear") && (
                  <>
                    {reportDateRangeType === "specific" && (
                      <div className="w-full md:w-auto">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Month
                        </label>
                        <select
                          value={reportMonthFilter}
                          onChange={(e) =>
                            setReportMonthFilter(Number(e.target.value))
                          }
                          className="w-full md:w-[200px] bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>
                              {getMonthName(i)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="w-full md:w-auto">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year
                      </label>
                      <select
                        value={reportYearFilter}
                        onChange={(e) =>
                          setReportYearFilter(Number(e.target.value))
                        }
                        className="w-full md:w-[200px] bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {availableYears.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Report Tabs */}
          <div className="px-6 pt-6">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              <button
                className={`px-4 py-2 text-sm font-medium flex items-center gap-1 ${
                  reportTab === "overview"
                    ? "text-indigo-600 border-b-2 border-indigo-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setReportTab("overview")}
              >
                <BarChart2 className="h-4 w-4" />
                <span className="hidden md:inline">Overview</span>
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium flex items-center gap-1 ${
                  reportTab === "attendance"
                    ? "text-indigo-600 border-b-2 border-indigo-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setReportTab("attendance")}
              >
                <Clock className="h-4 w-4" />
                <span className="hidden md:inline">Attendance</span>
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium flex items-center gap-1 ${
                  reportTab === "departments"
                    ? "text-indigo-600 border-b-2 border-indigo-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setReportTab("departments")}
              >
                <Briefcase className="h-4 w-4" />
                <span className="hidden md:inline">Departments</span>
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium flex items-center gap-1 ${
                  reportTab === "leave"
                    ? "text-indigo-600 border-b-2 border-indigo-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setReportTab("leave")}
              >
                <CalendarDays className="h-4 w-4" />
                <span className="hidden md:inline">Leave</span>
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium flex items-center gap-1 ${
                  reportTab === "resignation"
                    ? "text-indigo-600 border-b-2 border-indigo-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setReportTab("resignation")}
              >
                <Users className="h-4 w-4" />
                <span className="hidden md:inline">Resignation</span>
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium flex items-center gap-1 ${
                  reportTab === "payroll"
                    ? "text-indigo-600 border-b-2 border-indigo-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setReportTab("payroll")}
              >
                <DollarSign className="h-4 w-4" />
                <span className="hidden md:inline">Payroll</span>
              </button>
            </div>
          </div>

          {/* Main report content */}
          <div className="p-6">
            {reportTab === "overview" && (
              <>
                {loading ? (
                  <Loading />
                ) : (
                  <div>
                    {error && (
                      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow mb-6">
                        {error}
                      </div>
                    )}
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <BarChart2 className="h-5 w-5 mr-2 text-indigo-600" />
                        Executive Summary
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4 shadow-sm">
                          <h3 className="font-medium text-indigo-800 mb-2 flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Employee Overview
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Total Employees:
                              </span>
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                                {historicalData?.totalEmployees}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Departments:
                              </span>
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                                {departmentStats?.count}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Avg. Days Worked:
                              </span>
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                                {
                                  historicalData?.aggregateStats
                                    .avgDaysWorkedPerEmployee
                                }
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Avg. Salary:
                              </span>
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                                {idrFormatter(
                                  payrollStatsData?.avgTotalAmount ?? 0
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4 shadow-sm">
                          <h3 className="font-medium text-emerald-800 mb-2 flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Attendance Highlights
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Present Rate:
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                                {historicalData?.aggregateStats.presentRate}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Absence Rate:
                              </span>
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-xs font-medium">
                                {historicalData?.aggregateStats.absenceRate}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Sick Rate:
                              </span>
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                {historicalData?.aggregateStats.sickRate}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Avg. Attendance:
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                                {
                                  historicalData?.aggregateStats
                                    .avgAttendanceRate
                                }
                                %
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 shadow-sm">
                          <h3 className="font-medium text-purple-800 mb-2 flex items-center">
                            <BarChart className="h-4 w-4 mr-2" />
                            HR Metrics
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Leave Requests:
                              </span>
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                {submissionData?.leave.total}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Resignations:
                              </span>
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                {submissionData?.resignation.total}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Turnover Rate:
                              </span>
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                {Math.round(
                                  (submissionData?.resignation.total ||
                                    0 / (historicalData?.totalEmployees || 0)) *
                                    100
                                )}
                                %
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Payroll Total:
                              </span>
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                {idrFormatter(
                                  payrollStatsData?.payrollTotals.totalAmount ||
                                    0
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* Department Distribution Chart */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="mb-3">
                          <h2 className="text-lg font-semibold flex items-center">
                            <Briefcase className="h-5 w-5 mr-2 text-indigo-600" />
                            Total Employees by Department
                          </h2>
                        </div>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChartRecharts data={departmentStats?.stats}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e5e7eb"
                              />
                              <XAxis
                                dataKey="department"
                                tick={{ fontSize: 12 }}
                              />
                              <YAxis tick={{ fontSize: 12 }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                                  borderRadius: "8px",
                                  border: "1px solid #e5e7eb",
                                  boxShadow:
                                    "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                }}
                              />
                              <Legend />
                              <Bar
                                dataKey="employees"
                                fill="#6366f1"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChartRecharts>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Attendance Rate Pie Chart */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="mb-3">
                          <h2 className="text-lg font-semibold flex items-center">
                            <PieChartIcon className="h-5 w-5 mr-2 text-indigo-600" />
                            Attendance Distribution
                          </h2>
                        </div>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                label={({ name, value }) =>
                                  `${name}: ${value}%`
                                }
                                labelLine={false}
                              >
                                {pieData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                                  borderRadius: "8px",
                                  border: "1px solid #e5e7eb",
                                  boxShadow:
                                    "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                }}
                                formatter={(value) => [`${value}%`, "Rate"]}
                              />
                              <Legend
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                iconType="circle"
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* Leave and Resignation Chart */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="mb-3">
                          <h2 className="text-lg font-semibold flex items-center">
                            <CalendarDays className="h-5 w-5 mr-2 text-indigo-600" />
                            Leave & Resignation Requests
                          </h2>
                          <p className="text-sm text-gray-500">
                            {getTrendReportTitle()}
                          </p>
                        </div>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChartRecharts data={submissionsTrendData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e5e7eb"
                              />
                              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                              <YAxis tick={{ fontSize: 12 }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                                  borderRadius: "8px",
                                  border: "1px solid #e5e7eb",
                                  boxShadow:
                                    "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                }}
                              />
                              <Legend />
                              <Bar
                                dataKey="leave"
                                name="Leave Requests"
                                fill="#6366f1"
                                radius={[4, 4, 0, 0]}
                              />
                              <Bar
                                dataKey="resignation"
                                name="Resignations"
                                fill="#f43f5e"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChartRecharts>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Payroll Amount Chart */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="mb-3">
                          <h2 className="text-lg font-semibold flex items-center">
                            <DollarSign className="h-5 w-5 mr-2 text-indigo-600" />
                            Total Payroll
                          </h2>
                          <p className="text-sm text-gray-500">
                            {getTrendReportTitle()}
                          </p>
                        </div>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={payrollDetailData}
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e5e7eb"
                              />
                              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                              <YAxis
                                tickFormatter={(value) =>
                                  idrFormatter(value).split(",")[0]
                                }
                                tick={{ fontSize: 10 }}
                              />
                              <Tooltip
                                formatter={(value) =>
                                  idrFormatter(Number(value))
                                }
                                contentStyle={{
                                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                                  borderRadius: "8px",
                                  border: "1px solid #e5e7eb",
                                  boxShadow:
                                    "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                }}
                              />
                              <Legend />
                              <Area
                                type="monotone"
                                dataKey="totalPayroll"
                                name="Total Payroll"
                                stroke="#8b5cf6"
                                fill="url(#colorPayroll)"
                                activeDot={{ r: 8 }}
                              />
                              <defs>
                                <linearGradient
                                  id="colorPayroll"
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="5%"
                                    stopColor="#8b5cf6"
                                    stopOpacity={0.8}
                                  />
                                  <stop
                                    offset="95%"
                                    stopColor="#8b5cf6"
                                    stopOpacity={0.1}
                                  />
                                </linearGradient>
                              </defs>
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Top Performers and Concerns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="mb-3">
                          <h2 className="text-lg font-semibold flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
                            Top Performers
                          </h2>
                        </div>
                        <div className="space-y-3">
                          {employeesStatistics?.topPerformers.map(
                            (performer, index) => (
                              <div
                                key={index}
                                className="flex items-center p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                              >
                                <Avatar
                                  name={performer.name}
                                  size="sm"
                                  className="bg-emerald-100 text-emerald-600 mr-3"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-800">
                                    {performer.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {performer.department}
                                  </div>
                                </div>
                                <div className="text-emerald-600 font-bold flex items-center">
                                  {performer.attendanceRate}%
                                  <TrendingUp className="h-4 w-4 ml-1" />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="mb-3">
                          <h2 className="text-lg font-semibold flex items-center">
                            <TrendingDown className="h-5 w-5 mr-2 text-rose-600" />
                            Attendance Concerns
                          </h2>
                        </div>
                        <div className="space-y-3">
                          {employeesStatistics?.attendanceConcerns.map(
                            (concern, index) => (
                              <div
                                key={index}
                                className="flex items-center p-3 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                              >
                                {/* <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold mr-3">
                                  {concern.name.charAt(0)}
                                </div> */}
                                <Avatar
                                  name={concern.name}
                                  size="sm"
                                  className="bg-rose-100 text-rose-600 mr-3"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-800">
                                    {concern.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {concern.department}
                                  </div>
                                </div>
                                <div className="text-rose-600 font-bold flex items-center">
                                  {concern.attendanceRate}%
                                  <TrendingDown className="h-4 w-4 ml-1" />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Attendance Tab */}
            {reportTab === "attendance" && (
              <div>
                {loading ? (
                  <Loading />
                ) : (
                  <div>
                    {error && (
                      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow mb-6">
                        {error}
                      </div>
                    )}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6">
                      <div className="mb-3">
                        <h2 className="text-xl font-bold flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                          Employee Metrics
                        </h2>
                      </div>
                      <div className="mb-6">
                        {/* Attendance Trend Chart */}
                        <div className="bg-white border border-indigo-100 rounded-lg p-4 shadow-sm">
                          <div className="mb-3">
                            <h2 className="text-lg font-semibold">
                              {getTrendReportTitle()}
                            </h2>
                          </div>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={attendanceTrend?.trend}
                                margin={{
                                  top: 5,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#e5e7eb"
                                />
                                <XAxis
                                  dataKey="month"
                                  tickFormatter={(month) =>
                                    getMonthName(month - 1)
                                  }
                                  tick={{ fontSize: 12 }}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor:
                                      "rgba(255, 255, 255, 0.95)",
                                    borderRadius: "8px",
                                    border: "1px solid #e5e7eb",
                                    boxShadow:
                                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                  }}
                                />
                                <Legend />
                                <Line
                                  type="monotone"
                                  dataKey="presentRate"
                                  name="Present Rate"
                                  stroke={ATTENDANCE_COLORS.present}
                                  activeDot={{ r: 8 }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="absenceRate"
                                  name="Absence Rate"
                                  stroke={ATTENDANCE_COLORS.absent}
                                  activeDot={{ r: 8 }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="sickRate"
                                  name="Sick Rate"
                                  stroke={ATTENDANCE_COLORS.sick}
                                  activeDot={{ r: 8 }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="lateRate"
                                  name="Late Rate"
                                  stroke={ATTENDANCE_COLORS.late}
                                  activeDot={{ r: 8 }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="leaveRate"
                                  name="Leave Rate"
                                  stroke={ATTENDANCE_COLORS.leave}
                                  activeDot={{ r: 8 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-indigo-50">
                              <th className="border-b border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">
                                Employee
                              </th>
                              <th className="border-b border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">
                                Department
                              </th>
                              <th className="border-b border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">
                                Position
                              </th>
                              <th className="border-b border-gray-200 p-3 text-center text-sm font-semibold text-gray-700">
                                Present
                              </th>
                              <th className="border-b border-gray-200 p-3 text-center text-sm font-semibold text-gray-700">
                                Absent
                              </th>
                              <th className="border-b border-gray-200 p-3 text-center text-sm font-semibold text-gray-700">
                                Late
                              </th>
                              <th className="border-b border-gray-200 p-3 text-center text-sm font-semibold text-gray-700">
                                Leave
                              </th>
                              <th className="border-b border-gray-200 p-3 text-center text-sm font-semibold text-gray-700">
                                Attendance %
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {historicalData?.stats.map((item, index) => {
                              const attendancePercentage = Number(
                                item.attendanceRate
                              );
                              return (
                                <tr
                                  key={index}
                                  className={
                                    index % 2 === 0
                                      ? "bg-white hover:bg-gray-50"
                                      : "bg-gray-50 hover:bg-gray-100"
                                  }
                                >
                                  <td className="border-b border-gray-200 p-3">
                                    <div className="flex items-center gap-2">
                                      <Avatar name={item.name} size="sm" />
                                      <span className="font-medium">
                                        {item.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="border-b border-gray-200 p-3 text-gray-700">
                                    {item.department}
                                  </td>
                                  <td className="border-b border-gray-200 p-3 text-gray-700">
                                    {item.position}
                                  </td>
                                  <td className="border-b border-gray-200 p-3 text-center">
                                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
                                      {item.present}
                                    </span>
                                  </td>
                                  <td className="border-b border-gray-200 p-3 text-center">
                                    <span className="px-2 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-medium border border-rose-200">
                                      {item.absent}
                                    </span>
                                  </td>
                                  <td className="border-b border-gray-200 p-3 text-center">
                                    <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
                                      {item.late}
                                    </span>
                                  </td>
                                  <td className="border-b border-gray-200 p-3 text-center">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                                      {item.leave}
                                    </span>
                                  </td>
                                  <td className="border-b border-gray-200 p-3 text-center">
                                    <div className="flex flex-col items-center">
                                      <span
                                        className={`font-medium ${
                                          attendancePercentage >= 90
                                            ? "text-emerald-600"
                                            : attendancePercentage >= 75
                                            ? "text-blue-600"
                                            : attendancePercentage >= 60
                                            ? "text-amber-600"
                                            : "text-rose-600"
                                        }`}
                                      >
                                        {attendancePercentage}%
                                      </span>
                                      <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${
                                            attendancePercentage >= 90
                                              ? "bg-emerald-500"
                                              : attendancePercentage >= 75
                                              ? "bg-blue-500"
                                              : attendancePercentage >= 60
                                              ? "bg-amber-500"
                                              : "bg-rose-500"
                                          }`}
                                          style={{
                                            width: `${attendancePercentage}%`,
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Departments Tab */}
            {reportTab === "departments" && (
              <div>
                {loading ? (
                  <Loading />
                ) : (
                  <div>
                    {error && (
                      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow mb-6">
                        {error}
                      </div>
                    )}
                    {/* Department Statistics */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="mb-3">
                        <h2 className="text-xl font-bold flex items-center">
                          <Briefcase className="h-5 w-5 mr-2 text-indigo-600" />
                          Department Statistics
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {departmentStats?.stats.map((dept, index) => {
                          return (
                            <div
                              key={index}
                              className="border border-gray-200 hover:border-indigo-200 transition-colors rounded-lg p-4 bg-white shadow-sm"
                            >
                              <div className="flex items-center mb-3">
                                <div className="w-4 h-4 rounded-full mr-2 bg-indigo-600"></div>
                                <h3 className="font-medium text-gray-800">
                                  {dept.department}
                                </h3>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">
                                    Employees:
                                  </span>
                                  <span className="text-sm font-medium">
                                    {dept.employees}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">
                                    Attendance Rate:
                                  </span>
                                  <span className="text-sm font-medium">
                                    {dept.attendanceRate}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">
                                    Leave Requests:
                                  </span>
                                  <span className="text-sm font-medium">
                                    {dept.leaveRequests}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">
                                    Resignations:
                                  </span>
                                  <span className="text-sm font-medium">
                                    {dept.resignations}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">
                                    Turnover:
                                  </span>
                                  <span className="text-sm font-medium">
                                    {dept.turnoverRate}%
                                  </span>
                                </div>
                              </div>

                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="mb-1">
                                  <span className="text-xs text-gray-600">
                                    Attendance Breakdown
                                  </span>
                                </div>

                                <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
                                  <div
                                    className="bg-emerald-500"
                                    style={{
                                      width: `${dept.attendanceBreakdown.present}%`,
                                    }}
                                  ></div>
                                  <div
                                    className="bg-amber-500"
                                    style={{
                                      width: `${dept.attendanceBreakdown.late}%`,
                                    }}
                                  ></div>
                                  <div
                                    className="bg-blue-500"
                                    style={{
                                      width: `${dept.attendanceBreakdown.leave}%`,
                                    }}
                                  ></div>
                                  <div
                                    className="bg-purple-500"
                                    style={{
                                      width: `${dept.attendanceBreakdown.sick}%`,
                                    }}
                                  ></div>
                                  <div
                                    className="bg-rose-500"
                                    style={{
                                      width: `${dept.attendanceBreakdown.absent}%`,
                                    }}
                                  ></div>
                                </div>

                                {/* Label + Rate */}
                                <div className="flex text-xs justify-between mt-2">
                                  <div className="flex flex-col items-center space-y-1">
                                    <span className="text-emerald-600 font-medium">
                                      Present
                                    </span>
                                    <span className="text-emerald-600 text-[12px] font-bold">
                                      {dept.attendanceBreakdown.present}%
                                    </span>
                                  </div>
                                  <div className="flex flex-col items-center space-y-1">
                                    <span className="text-amber-600 font-medium">
                                      Late
                                    </span>
                                    <span className="text-amber-600 text-[12px] font-bold">
                                      {dept.attendanceBreakdown.late}%
                                    </span>
                                  </div>
                                  <div className="flex flex-col items-center space-y-1">
                                    <span className="text-blue-600 font-medium">
                                      Leave
                                    </span>
                                    <span className="text-blue-600 text-[12px] font-bold">
                                      {dept.attendanceBreakdown.leave}%
                                    </span>
                                  </div>
                                  <div className="flex flex-col items-center space-y-1">
                                    <span className="text-purple-600 font-medium">
                                      Sick
                                    </span>
                                    <span className="text-purple-600 text-[12px] font-bold">
                                      {dept.attendanceBreakdown.sick}%
                                    </span>
                                  </div>
                                  <div className="flex flex-col items-center space-y-1">
                                    <span className="text-rose-600 font-medium">
                                      Absent
                                    </span>
                                    <span className="text-rose-600 text-[12px] font-bold">
                                      {dept.attendanceBreakdown.absent}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Leave Management Tab */}
            {reportTab === "leave" && (
              <div>
                {loading ? (
                  <Loading />
                ) : (
                  <div>
                    {error && (
                      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow mb-6">
                        {error}
                      </div>
                    )}
                    {/* Leave Statistics */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="mb-3">
                        <h2 className="text-xl font-bold flex items-center">
                          <CalendarDays className="h-5 w-5 mr-2 text-indigo-600" />
                          Leave Management
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                          <h3 className="font-medium text-indigo-800 mb-2 flex items-center">
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Total Requests
                          </h3>
                          <div className="text-3xl font-bold text-indigo-700">
                            {submissionData?.leave.total}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            This period
                          </div>
                        </div>

                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                          <h3 className="font-medium text-emerald-800 mb-2 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approved
                          </h3>
                          <div className="text-3xl font-bold text-emerald-600">
                            {submissionData?.leave.approved}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {submissionData?.leave.percentages.approved}% of
                            requests
                          </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <h3 className="font-medium text-amber-800 mb-2 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Pending
                          </h3>
                          <div className="text-3xl font-bold text-amber-600">
                            {submissionData?.leave.pending}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {submissionData?.leave.percentages.pending}% of
                            requests
                          </div>
                        </div>

                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                          <h3 className="font-medium text-rose-800 mb-2 flex items-center">
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejected
                          </h3>
                          <div className="text-3xl font-bold text-rose-600">
                            {submissionData?.leave.rejected}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {submissionData?.leave.percentages.rejected}% of
                            requests
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-indigo-100 rounded-lg p-4 shadow-sm mb-6">
                        <div className="mb-3">
                          <h2 className="text-lg font-semibold">
                            Leave Requests Trend
                          </h2>
                          <p className="text-sm text-gray-600">
                            {getTrendReportTitle()}
                          </p>
                        </div>
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChartRecharts
                            data={leaveData}
                            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e5e7eb"
                            />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                borderRadius: "8px",
                                border: "1px solid #e5e7eb",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              }}
                            />
                            <Legend />
                            <Bar
                              dataKey="approved"
                              name="Approved"
                              stackId="a"
                              fill="#10b981"
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar
                              dataKey="pending"
                              name="Pending"
                              stackId="a"
                              fill="#f59e0b"
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar
                              dataKey="rejected"
                              name="Rejected"
                              stackId="a"
                              fill="#f43f5e"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChartRecharts>
                        </ResponsiveContainer>
                      </div>

                      {/* Leave Requests by Department */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="mb-3">
                          <h2 className="text-lg font-semibold">
                            Leave Requests by Department
                          </h2>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-indigo-50">
                                <th className="border-b border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">
                                  Department
                                </th>
                                <th className="border-b border-gray-200 p-3 text-center text-sm font-semibold text-gray-700">
                                  Total Employees
                                </th>
                                <th className="border-b border-gray-200 p-3 text-center text-sm font-semibold text-gray-700">
                                  Leave Requests
                                </th>
                                <th className="border-b border-gray-200 p-3 text-center text-sm font-semibold text-gray-700">
                                  Request Rate
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {departmentStats?.stats.map((dept, index) => (
                                <tr
                                  key={index}
                                  className={
                                    index % 2 === 0
                                      ? "bg-white hover:bg-gray-50"
                                      : "bg-gray-50 hover:bg-gray-100"
                                  }
                                >
                                  <td className="border-b border-gray-200 p-3 font-medium">
                                    {dept.department}
                                  </td>
                                  <td className="border-b border-gray-200 p-3 text-center">
                                    {dept.employees}
                                  </td>
                                  <td className="border-b border-gray-200 p-3 text-center">
                                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-200">
                                      {dept.leaveRequests}
                                    </span>
                                  </td>
                                  <td className="border-b border-gray-200 p-3 text-center">
                                    {Math.round(
                                      (dept.leaveRequests / dept.employees) *
                                        100
                                    )}
                                    %
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Resignation Tab */}
            {reportTab === "resignation" && (
              <div>
                {loading ? (
                  <Loading />
                ) : (
                  <div>
                    {error && (
                      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow mb-6">
                        {error}
                      </div>
                    )}
                    {/* Resignation Statistics */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="mb-3">
                        <h2 className="text-xl font-bold flex items-center">
                          <Users className="h-5 w-5 mr-2 text-indigo-600" />
                          Resignation Tracker
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                          <h3 className="font-medium text-rose-800 mb-2 flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Total Resignations
                          </h3>
                          <div className="text-3xl font-bold text-rose-700">
                            {submissionData?.resignation.total}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            This period
                          </div>
                        </div>

                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                          <h3 className="font-medium text-emerald-800 mb-2 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approved
                          </h3>
                          <div className="text-3xl font-bold text-emerald-600">
                            {submissionData?.resignation.approved}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {submissionData?.resignation.percentages.approved}%
                            of requests
                          </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <h3 className="font-medium text-amber-800 mb-2 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Pending
                          </h3>
                          <div className="text-3xl font-bold text-amber-600">
                            {submissionData?.resignation.pending}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {submissionData?.resignation.percentages.pending}%
                            of requests
                          </div>
                        </div>

                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                          <h3 className="font-medium text-rose-800 mb-2 flex items-center">
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejected
                          </h3>
                          <div className="text-3xl font-bold text-rose-600">
                            {submissionData?.resignation.rejected}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {submissionData?.resignation.percentages.rejected}%
                            of requests
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-indigo-100 rounded-lg p-4 shadow-sm mb-6">
                        <div className="mb-3">
                          <h2 className="text-lg font-semibold">
                            Resignation Trend
                          </h2>
                          <p className="text-sm text-gray-600">
                            {getTrendReportTitle()}
                          </p>
                        </div>
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChartRecharts
                            data={resignationData}
                            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e5e7eb"
                            />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                borderRadius: "8px",
                                border: "1px solid #e5e7eb",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              }}
                            />
                            <Legend />
                            <Bar
                              dataKey="approved"
                              name="Approved"
                              stackId="a"
                              fill="#10b981"
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar
                              dataKey="pending"
                              name="Pending"
                              stackId="a"
                              fill="#f59e0b"
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar
                              dataKey="rejected"
                              name="Rejected"
                              stackId="a"
                              fill="#f43f5e"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChartRecharts>
                        </ResponsiveContainer>
                      </div>

                      {/* Resignation by Department */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="mb-3">
                          <h2 className="text-lg font-semibold">
                            Resignation by Department
                          </h2>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-indigo-50">
                                <th className="border-b border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">
                                  Department
                                </th>
                                <th className="border-b border-gray-200 p-3 text-center text-sm font-semibold text-gray-700">
                                  Total Employees
                                </th>
                                <th className="border-b border-gray-200 p-3 text-center text-sm font-semibold text-gray-700">
                                  Resignations
                                </th>
                                <th className="border-b border-gray-200 p-3 text-center text-sm font-semibold text-gray-700">
                                  Turnover Rate
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {departmentStats?.stats.map((dept, index) => (
                                <tr
                                  key={index}
                                  className={
                                    index % 2 === 0
                                      ? "bg-white hover:bg-gray-50"
                                      : "bg-gray-50 hover:bg-gray-100"
                                  }
                                >
                                  <td className="border-b border-gray-200 p-3 font-medium">
                                    {dept.department}
                                  </td>
                                  <td className="border-b border-gray-200 p-3 text-center">
                                    {dept.employees}
                                  </td>
                                  <td className="border-b border-gray-200 p-3 text-center">
                                    <span className="px-2 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-medium border border-rose-200">
                                      {dept.resignations}
                                    </span>
                                  </td>
                                  <td className="border-b border-gray-200 p-3 text-center">
                                    <span
                                      className={`font-medium ${
                                        Number(dept.turnoverRate) > 20
                                          ? "text-rose-600"
                                          : Number(dept.turnoverRate) > 10
                                          ? "text-amber-600"
                                          : "text-emerald-600"
                                      }`}
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
                    </div>
                  </div>
                )}
              </div>
            )}

            {reportTab === "payroll" && (
              <div>
                {loading ? (
                  <Loading />
                ) : (
                  <div>
                    {error && (
                      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow mb-6">
                        {error}
                      </div>
                    )}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6">
                      <div className="mb-3">
                        <h2 className="text-xl font-bold flex items-center">
                          <DollarSign className="h-5 w-5 mr-2 text-indigo-600" />
                          Payroll Report
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 gap-6 mb-6">
                        {/* Payroll Amount Chart */}
                        <div className="bg-white border border-indigo-100 rounded-lg p-4 shadow-sm">
                          <div className="mb-3">
                            <h2 className="text-lg font-semibold">
                              Total Payroll Breakdown
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">
                              {getTrendReportTitle()}
                            </p>
                          </div>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={payrollDetailData}
                                margin={{
                                  top: 5,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#e5e7eb"
                                />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis
                                  tickFormatter={(value) =>
                                    idrFormatter(value).split(",")[0]
                                  }
                                  tick={{ fontSize: 10 }}
                                />
                                <Tooltip
                                  formatter={(value) =>
                                    idrFormatter(Number(value))
                                  }
                                  contentStyle={{
                                    backgroundColor:
                                      "rgba(255, 255, 255, 0.95)",
                                    borderRadius: "8px",
                                    border: "1px solid #e5e7eb",
                                    boxShadow:
                                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                  }}
                                />
                                <Legend />
                                <Area
                                  type="monotone"
                                  dataKey="totalPayroll"
                                  name="Total Payroll"
                                  stroke="#8b5cf6"
                                  fill="url(#colorPayroll)"
                                  activeDot={{ r: 8 }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="totalBonus"
                                  name="Total Bonus"
                                  stroke="#10b981"
                                  fill="url(#colorBonus)"
                                  activeDot={{ r: 6 }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="totalDeductions"
                                  name="Total Deductions"
                                  stroke="#f43f5e"
                                  fill="url(#colorDeductions)"
                                  activeDot={{ r: 6 }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="totalTax"
                                  name="Total Tax"
                                  stroke="#f59e0b"
                                  fill="url(#colorTax)"
                                  activeDot={{ r: 6 }}
                                />
                                <defs>
                                  <linearGradient
                                    id="colorPayroll"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="5%"
                                      stopColor="#8b5cf6"
                                      stopOpacity={0.8}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor="#8b5cf6"
                                      stopOpacity={0.1}
                                    />
                                  </linearGradient>
                                  <linearGradient
                                    id="colorBonus"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="5%"
                                      stopColor="#10b981"
                                      stopOpacity={0.8}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor="#10b981"
                                      stopOpacity={0.1}
                                    />
                                  </linearGradient>
                                  <linearGradient
                                    id="colorDeductions"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="5%"
                                      stopColor="#f43f5e"
                                      stopOpacity={0.8}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor="#f43f5e"
                                      stopOpacity={0.1}
                                    />
                                  </linearGradient>
                                  <linearGradient
                                    id="colorTax"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="5%"
                                      stopColor="#f59e0b"
                                      stopOpacity={0.8}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor="#f59e0b"
                                      stopOpacity={0.1}
                                    />
                                  </linearGradient>
                                </defs>
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Category: Salary Information */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                          <Briefcase className="h-5 w-5 mr-2 text-indigo-600" />{" "}
                          Salary Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Salary Overview Card */}
                          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                            <h4 className="font-semibold mb-4 text-indigo-700 text-base flex items-center">
                              <CreditCard className="h-5 w-5 mr-2" /> Salary
                              Overview
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Base Salary Total</span>
                                <span className="font-semibold text-indigo-600">
                                  {idrFormatter(
                                    payrollStatsData?.payrollTotals
                                      .baseSalary ?? 0
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Highest Salary</span>
                                <span className="font-semibold text-indigo-600">
                                  {idrFormatter(
                                    payrollStatsData?.highestSalary ?? 0
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Lowest Salary</span>
                                <span className="font-semibold text-indigo-600">
                                  {idrFormatter(
                                    payrollStatsData?.lowestSalary ?? 0
                                  )}
                                </span>
                              </div>
                              <div className="border-t border-indigo-200 my-2"></div>
                              <div className="flex justify-between font-medium text-base">
                                <span>Average Base Salary</span>
                                <span className="text-indigo-700">
                                  {idrFormatter(
                                    payrollStatsData?.avgBaseSalary ?? 0
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Bonus Information */}
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                            <h4 className="font-semibold mb-4 text-emerald-700 text-base flex items-center">
                              <TrendingUp className="h-5 w-5 mr-2" /> Bonus
                              Information
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Total Bonus Paid</span>
                                <span className="font-semibold text-emerald-600">
                                  {idrFormatter(
                                    payrollStatsData?.payrollTotals.bonus ?? 0
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Employees With Bonus</span>
                                <span className="font-semibold text-emerald-600">
                                  {payrollStatsData?.employeesWithBonus ?? 0}{" "}
                                  employees
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Average Bonus</span>
                                <span className="font-semibold text-emerald-600">
                                  {idrFormatter(
                                    payrollStatsData?.avgBonus ?? 0
                                  )}
                                </span>
                              </div>
                              <div className="border-t border-emerald-200 my-2"></div>
                              <div className="flex justify-between font-medium text-base">
                                <span>Bonus Ratio</span>
                                <span className="flex items-center text-emerald-700">
                                  {(
                                    (payrollStatsData?.bonusToSalaryRatio ??
                                      0) * 100
                                  ).toFixed(1)}
                                  %
                                  {payrollStatsData?.bonusToSalaryRatio &&
                                  payrollStatsData.bonusToSalaryRatio > 0.1 ? (
                                    <TrendingUp className="h-4 w-4 text-emerald-600 ml-1" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4 text-rose-600 ml-1" />
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Deductions */}
                          <div className="bg-rose-50 border border-rose-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                            <h4 className="font-semibold mb-4 text-rose-700 text-base flex items-center">
                              <TrendingDown className="h-5 w-5 mr-2" />{" "}
                              Deductions
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Employees With Deductions</span>
                                <span className="font-semibold text-rose-600">
                                  {payrollStatsData?.employeesWithDeductions ??
                                    0}{" "}
                                  employees
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Average Deductions</span>
                                <span className="font-semibold text-rose-600">
                                  {idrFormatter(
                                    payrollStatsData?.avgDeductions ?? 0
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Deduction Rate</span>
                                <span className="font-semibold text-rose-600">
                                  {(
                                    ((payrollStatsData?.payrollTotals
                                      .deductions ?? 0) /
                                      (payrollStatsData?.payrollTotals
                                        .baseSalary ?? 1)) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                              <div className="border-t border-rose-200 my-2"></div>
                              <div className="flex justify-between font-medium text-base text-rose-800">
                                <span>Total Deductions</span>
                                <span>
                                  {idrFormatter(
                                    payrollStatsData?.payrollTotals
                                      .deductions ?? 0
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Category: Financial Summary */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
                          <BarChart className="h-5 w-5 mr-2 text-indigo-600" />{" "}
                          Financial Summary
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Budget Impact */}
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                            <h4 className="font-semibold mb-4 text-purple-700 text-base flex items-center">
                              <DollarSign className="h-5 w-5 mr-2" /> Budget
                              Impact
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Base Salary Budget</span>
                                <span className="font-semibold text-purple-600">
                                  {idrFormatter(
                                    payrollStatsData?.payrollTotals
                                      .baseSalary ?? 0
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Total Deductions</span>
                                <span className="font-semibold text-purple-600">
                                  {idrFormatter(
                                    payrollStatsData?.payrollTotals
                                      .deductions ?? 0
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Total Taxes</span>
                                <span className="font-semibold text-purple-600">
                                  {idrFormatter(
                                    payrollStatsData?.payrollTotals.tax ?? 0
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Total Bonuses</span>
                                <span className="font-semibold text-purple-600">
                                  {idrFormatter(
                                    payrollStatsData?.payrollTotals.bonus ?? 0
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Actual Payable</span>
                                <span className="font-semibold text-purple-600">
                                  {idrFormatter(
                                    payrollStatsData?.payrollTotals
                                      .totalAmount ?? 0
                                  )}
                                </span>
                              </div>
                              <div className="border-t border-purple-200 my-2"></div>
                              <div className="flex justify-between font-medium text-base text-emerald-700">
                                <span>Budget Savings</span>
                                <span>
                                  {idrFormatter(
                                    (payrollStatsData?.payrollTotals
                                      .baseSalary ?? 0) -
                                      (payrollStatsData?.payrollTotals
                                        .totalAmount ?? 0)
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Employee Averages */}
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                            <h4 className="font-semibold mb-4 text-amber-700 text-base flex items-center">
                              <Users className="h-5 w-5 mr-2" /> Employee
                              Averages
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Average Base Salary</span>
                                <span className="font-semibold text-amber-600">
                                  {idrFormatter(
                                    payrollStatsData?.avgBaseSalary ?? 0
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Average Bonus</span>
                                <span className="font-semibold text-amber-600">
                                  {idrFormatter(
                                    payrollStatsData?.avgBonus ?? 0
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Average Tax</span>
                                <span className="font-semibold text-amber-600">
                                  {idrFormatter(payrollStatsData?.avgTax ?? 0)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Average Deductions</span>
                                <span className="font-semibold text-amber-600">
                                  {idrFormatter(
                                    payrollStatsData?.avgDeductions ?? 0
                                  )}
                                </span>
                              </div>
                              <div className="border-t border-amber-200 my-2"></div>
                              <div className="flex justify-between font-medium text-base text-amber-700">
                                <span>Average Total Payout</span>
                                <span>
                                  {idrFormatter(
                                    payrollStatsData?.avgTotalAmount ?? 0
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {showReportModal && (
          <ReportPdfModal
            onClose={() => setShowReportModal(false)}
            reportTitle={getReportTitle()}
            reportTab={reportTab}
            reportData={{
              historicalData,
              departmentStats,
              submissionData,
              payrollStatsData,
              employeesStatistics,
              attendanceTrend,
              pieData,
              leaveData,
              resignationData,
              payrollDetailData,
              reportDateRangeType,
              reportYearFilter,
            }}
            idrFormatter={idrFormatter}
            getMonthName={getMonthName}
          />
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
