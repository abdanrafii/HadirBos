import { useContext, useEffect, useState } from "react";

import {
  Download,
  DollarSign,
  FileSpreadsheet,
  Edit,
  X,
} from "lucide-react";
import { Payroll } from "../../../types/payroll";
import { getPayroll } from "../../../services/payrollService";
import { getCurrentUser } from "../../../services/authService";
import Loading from "../../../components/Loading";
import Avatar from "../../../components/Avatar";
import { SearchContext } from "../../../context/SearchContext";
import PayrollDetailModal from "./PayrollDetailModal";
import PaymentModal from "./PaymentModal";
import { useNavigate } from "react-router";
import MarkAsUnpaidModal from "./MarkAsUnpaidModal";
import * as XLSX from "xlsx";
import PaySlip from "./Payslip";

const PayrollPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [payrollData, setPayrollData] = useState<Payroll[]>([]);
  const userInfo = getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payrollStatus, setPayrollStatus] = useState<"paid" | "unpaid" | "all">(
    "all"
  );
  const searchTerm = useContext(SearchContext).searchTerm;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payrollSelected, setPayrollSelected] = useState<Payroll>({
    _id: "",
    employeeId: {
      _id: "",
      name: "",
      department: "",
      position: "",
      baseSalary: 0,
    },
    status: "unpaid", // default unpaid
    month: new Date().getMonth() + 1, // bulan sekarang (1-12)
    year: new Date().getFullYear(), // tahun sekarang
    deductions: 0,
    bonus: 0,
    tax: 0,
    totalAmount: 0,
    paymentDate: new Date(),
    paymentMethod: "cash",
    paymentReference: "",
    notes: "",
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUnpaidModalOpen, setIsUnpaidModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        setLoading(true);
        const data = await getPayroll(
          userInfo.token,
          currentMonth + 1,
          currentYear
        );
        setPayrollData(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPayroll();
  }, [userInfo.token, currentMonth, currentYear, navigate]);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const data = await getPayroll(
        userInfo.token,
        currentMonth + 1,
        currentYear
      );
      setPayrollData(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const idrFormatter = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentYear(Number.parseInt(e.target.value));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentMonth(Number.parseInt(e.target.value));
  };

  const handleModalOpen = (record: Payroll) => {
    setPayrollSelected(record);
    setIsModalOpen(true);
  };

  const handlePaymentModalOpen = (record: Payroll) => {
    setPayrollSelected(record);
    setIsPaymentModalOpen(true);
  };

  const handleMarkAsUnpaidModalOpen = (record: Payroll) => {
    setPayrollSelected(record);
    setIsUnpaidModalOpen(true);
  };

  // Filter payroll data based on selected month, year, and status
  const filteredPayroll = payrollData.filter((record) => {
    const matchesMonth = currentMonth === record.month - 1;
    const matchesYear = currentYear === record.year;
    const matchesStatus =
      payrollStatus === "all" || payrollStatus === record.status;

    const matchesSearch =
      record.employeeId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId.department
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      record.employeeId.baseSalary
        .toString()
        .includes(searchTerm.toLowerCase()) ||
      record.bonus.toString().includes(searchTerm.toLowerCase()) ||
      record.deductions.toString().includes(searchTerm.toLowerCase()) ||
      record.tax.toString().includes(searchTerm.toLowerCase()) ||
      record.totalAmount.toString().includes(searchTerm.toLowerCase());

    // || record.employeeId.position.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesMonth && matchesYear && matchesStatus && matchesSearch;
  });

  // Calculate totals for the filtered payroll
  const payrollTotals = payrollData.reduce(
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

  const handleExportPayroll = () => {
    // Siapkan data yang akan diexport
    const exportData = filteredPayroll.map((record) => ({
      Employee: record.employeeId.name,
      Department: record.employeeId.department,
      "Base Salary": record.employeeId.baseSalary,
      Deductions: record.deductions,
      Bonus: record.bonus,
      Tax: record.tax,
      Total: record.totalAmount,
      Status: record.status,
      "Payment Date": record.paymentDate,
      "Payment Method": record.paymentMethod,
      "Payment Reference": record.paymentReference,
    }));

    // Buat worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Buat workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");

    // Export ke file
    XLSX.writeFile(workbook, `Payroll_${currentYear}_${currentMonth + 1}.xlsx`);
  };

  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

  const handlePayslipModalOpen = (record: Payroll) => {
    setPayrollSelected(record);
    setIsPayslipModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-0">
            Employee Payroll -{" "}
            {new Date(currentYear, currentMonth, 1).toLocaleString("default", {
              month: "long",
            })}{" "}
            {currentYear}
          </h3>

          <div className="flex flex-wrap gap-4">
            {/* Month and year selection */}
            <div className="flex items-center gap-1">
              <select
                value={currentMonth}
                onChange={(e) => handleMonthChange(e)}
                className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(2000, i, 1).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={(e) => handleYearChange(e)}
                className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1">
              <select
                value={payrollStatus}
                onChange={(e) =>
                  setPayrollStatus(e.target.value as "all" | "unpaid" | "paid")
                }
                className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="all">All Status</option>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {/* Print button
            <button
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button> */}

            {/* Export button */}
            <button
              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
              onClick={handleExportPayroll}
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Payroll summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Total Base Salary</div>
            <div className="text-xl font-bold text-gray-800">
              {idrFormatter(payrollTotals.baseSalary)}
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <div className="text-sm text-gray-600">Total Deductions</div>
            <div className="text-xl font-bold text-red-700">
              {idrFormatter(payrollTotals.deductions)}
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="text-sm text-gray-600">Total Bonuses</div>
            <div className="text-xl font-bold text-green-700">
              {idrFormatter(payrollTotals.bonus)}
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="text-sm text-gray-600">Total Taxes</div>
            <div className="text-xl font-bold text-yellow-700">
              {idrFormatter(payrollTotals.tax)}
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <div className="text-sm text-gray-600">Net Payable</div>
            <div className="text-xl font-bold text-purple-700">
              {idrFormatter(payrollTotals.totalAmount)}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow mb-6">
          {error}
        </div>
      )}

      {/* Link to monthly reports */}
      {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center">
          <BarChart3 className="h-5 w-5 text-blue-600 mr-3" />
          <div>
            <h4 className="font-medium text-blue-800">
              Attendance Data Available
            </h4>
            <p className="text-sm text-blue-600">
              View detailed attendance reports that affect payroll calculations
            </p>
          </div>
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          onClick={() => {}}
        >
          View Reports
        </button>
      </div> */}
      {/* Payroll table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <Loading />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 p-4 text-left">
                    Employee
                  </th>
                  <th className="border border-gray-200 p-4 text-left">
                    Department
                  </th>
                  <th className="border border-gray-200 p-4 text-left">
                    Base Salary
                  </th>
                  <th className="border border-gray-200 p-4 text-left">
                    Deductions
                  </th>
                  <th className="border border-gray-200 p-4 text-left">
                    Bonus
                  </th>
                  <th className="border border-gray-200 p-4 text-left">Tax</th>
                  <th className="border border-gray-200 p-4 text-left">
                    Total
                  </th>
                  <th className="border border-gray-200 p-4 text-center">
                    Status
                  </th>
                  <th className="border border-gray-200 p-4 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayroll.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="border border-gray-200 p-4 text-center text-gray-500"
                    >
                      No payroll records found for the selected period
                    </td>
                  </tr>
                ) : (
                  filteredPayroll.map((record, index) => {
                    return (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="border border-gray-200 p-4 whitespace-nowrap truncate">
                          <div className="flex items-center gap-2">
                            <Avatar name={record.employeeId.name} size="sm" />
                            <span>{record.employeeId.name}</span>
                          </div>
                        </td>
                        <td className="border border-gray-200 p-4 whitespace-nowrap">
                          {record.employeeId.department}
                        </td>
                        <td className="border border-gray-200 p-4 text-left whitespace-nowrap">
                          {idrFormatter(record.employeeId.baseSalary)}
                        </td>
                        <td className="border border-gray-200 p-4 text-left whitespace-nowrap text-red-600">
                          -{idrFormatter(record.deductions)}
                        </td>
                        <td className="border border-gray-200 p-4 text-left whitespace-nowrap text-green-600">
                          +{idrFormatter(record.bonus)}
                        </td>
                        <td className="border border-gray-200 p-4 text-left whitespace-nowrap text-red-600">
                          -{idrFormatter(record.tax)}
                        </td>
                        <td className="border border-gray-200 p-4 text-left whitespace-nowrap font-bold">
                          {idrFormatter(record.totalAmount)}
                        </td>
                        <td className="border border-gray-200 p-4 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              record.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {record.status === "paid" ? "Paid" : "Unpaid"}
                          </span>
                        </td>
                        <td className="border border-gray-200 p-4">
                          <div className="flex justify-center gap-1">
                            {/* Inside the renderPayrollView function, update the "View Details" button to open the payroll detail modal */}
                            {/* Find this line in the actions column of the payroll table: */}
                            {/* And replace it with: */}
                            <button
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                              title="View Details"
                              onClick={() => {
                                handleModalOpen(record);
                              }}
                            >
                              <FileSpreadsheet className="h-4 w-4" />
                            </button>

                            {/* Generate Payslip Button */}
                            <button
                              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                              title="Generate Payslip"
                              onClick={() => {
                                handlePayslipModalOpen(record);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </button>

                            {/* Edit Button (always available) */}
                            <button
                              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                              title="Edit"
                              onClick={() => {
                                navigate(`/admin/payroll/edit/${record._id}`, {
                                  state: { payroll: record }, // ✅ kirim payload dengan key 'payroll' supaya halaman edit bisa baca
                                });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            {/* Status-specific actions */}
                            {record.status === "paid" && (
                              <button
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                title="Mark as Unpaid"
                                onClick={() => {
                                  handleMarkAsUnpaidModalOpen(record);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}

                            {record.status === "unpaid" && (
                              <button
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                                title="Mark as Paid"
                                onClick={() => {
                                  handlePaymentModalOpen(record);
                                }}
                              >
                                <DollarSign className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <PayrollDetailModal
          payrollRecord={payrollSelected}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isPaymentModalOpen && (
        <PaymentModal
          payrollRecord={payrollSelected}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={fetchPayroll}
        />
      )}

      {isUnpaidModalOpen && (
        <MarkAsUnpaidModal
          payrollRecord={payrollSelected}
          onClose={() => setIsUnpaidModalOpen(false)}
          onSuccess={fetchPayroll}
        />
      )}

      {isPayslipModalOpen && (
        <PaySlip
          payrollRecord={payrollSelected}
          onClose={() => setIsPayslipModalOpen(false)}
        />
      )}
    </div>
  );
};

export default PayrollPage;
