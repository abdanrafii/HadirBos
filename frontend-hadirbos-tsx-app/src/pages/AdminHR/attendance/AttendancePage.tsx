import { useState, useEffect, useRef, useContext } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Calendar,
  X,
  FileText,
  BarChart3,
  Clock,
  CalendarDays,
  ChevronDown,
  Users,
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { getCurrentUser } from "../../../services/authService";
import {
  getAllAttendance,
  getAttendanceByEmployeeId,
  getAttendanceById,
} from "../../../services/attendanceService";
import { getUsers } from "../../../services/userService";
import { UserBase } from "../../../types/user";
import { AttendanceStatus, Attendance } from "../../../types/attendance";
import Loading from "../../../components/Loading";
import { SearchContext } from "../../../context/SearchContext";
import Avatar from "../../../components/Avatar";

export default function AttendancePage() {
  const userInfo = getCurrentUser();
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedAttendance, setSelectedAttendance] = useState<string | null>(
    null
  );
  const [attendanceDetailOpen, setAttendanceDetailOpen] = useState(false);
  const [currentView, setCurrentView] = useState<
    "calendar" | "stats" | "absences"
  >("calendar");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownRef, setDropdownRef] = useState<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const searchTerm = useContext(SearchContext).searchTerm;

  // data from api
  const [loadEmployees, setLoadEmployees] = useState(false);
  const [loadAbsences, setLoadAbsences] = useState(false);
  const [loadDetail, setLoadDetail] = useState(false);
  const [employees, setEmployees] = useState<UserBase[]>([]);
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [attendenceByIdEmployee, setAttendanceByIdEmployee] = useState<
    Attendance[]
  >([]);
  const [editingRecord, setEditingRecord] = useState<Attendance | null>(null);

  useEffect(() => {
    setLoadEmployees(true);
    const fetchUsers = async () => {
      try {
        const data = await getUsers(userInfo.token);
        const filteredData = data.filter(
          (user: UserBase) => user.role === "employee"
        );
        setEmployees(filteredData);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setLoadEmployees(false);
      }
    };

    fetchUsers();
  }, [userInfo.token]);

  useEffect(() => {
    setLoadAbsences(true);
    const fetchAllAttendance = async () => {
      try {
        const response = await getAllAttendance(userInfo.token);
        setAttendanceData(response);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setLoadAbsences(false);
      }
    };

    fetchAllAttendance();
  }, [currentMonth, currentYear, userInfo.token]);

  useEffect(() => {
    const getAttendanceByIdEmployee = async () => {
      try {
        if (!selectedEmployee) return;
        const response = await getAttendanceByEmployeeId(
          userInfo.token,
          selectedEmployee,
          currentMonth + 1,
          currentYear
        );
        console.log("Attendance by ID Employee:", selectedEmployee, response);
        setAttendanceByIdEmployee(response);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } 
    };
    getAttendanceByIdEmployee();
  }, [selectedEmployee, userInfo.token, currentMonth, currentYear]);

  useEffect(() => {
    const attendanceById = async () => {
      try {
        setLoadDetail(true);
        if (!selectedAttendance) return;
        const response = await getAttendanceById(
          selectedAttendance,
          userInfo.token
        );
        setEditingRecord(response);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setLoadDetail(false);
      }
    };
    attendanceById();
  }, [selectedAttendance, userInfo.token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
        setDropdownOpen(false);
      }

      // Close sidebar when clicking outside on mobile
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        window.innerWidth < 768 &&
        sidebarOpen
      ) {
        setSidebarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, sidebarRef, sidebarOpen]);

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const getDayOfWeek = (year: number, month: number, day: number) => {
    return new Date(year, month, day).getDay();
  };

  // Navigate to previous month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Get status color
  // Update the getStatusColor function to include 'sick'
  const getStatusColor = (status: AttendanceStatus): string => {
    switch (status) {
      case "present":
        return "bg-green-100 border-green-500 text-green-700";
      case "absent":
        return "bg-red-100 border-red-500 text-red-700";
      case "leave":
        return "bg-blue-100 border-blue-500 text-blue-700";
      case "late":
        return "bg-yellow-100 border-yellow-500 text-yellow-700";
      case "sick":
        return "bg-purple-100 border-purple-500 text-purple-700";
      case "weekend":
        return "bg-gray-100 border-gray-300 text-gray-500";
      default:
        return "bg-gray-100 border-gray-300 text-gray-500";
    }
  };

  // Get status label
  // Update the getStatusLabel function to include 'sick'
  const getStatusLabel = (status: AttendanceStatus): string => {
    switch (status) {
      case "present":
        return "Present";
      case "absent":
        return "Absent";
      case "leave":
        return "Leave";
      case "late":
        return "Late";
      case "sick":
        return "Sick";
      case "weekend":
        return "Weekend";
      default:
        return status;
    }
  };

  // Get attendance statistics for an employee
  // Update the getEmployeeStats function to include 'sick'
  const getEmployeeStats = (employeeId: string) => {
    const employeeRecords = attendanceData.filter(
      (record) => record.employeeId?._id === employeeId
    );

    const totalWorkDays = employeeRecords.filter(
      (record) => record.status !== "weekend"
    ).length;

    const stats = {
      present: employeeRecords.filter((record) => record.status === "present")
        .length,
      absent: employeeRecords.filter((record) => record.status === "absent")
        .length,
      leave: employeeRecords.filter((record) => record.status === "leave")
        .length,
      late: employeeRecords.filter((record) => record.status === "late").length,
      sick: employeeRecords.filter((record) => record.status === "sick").length,
      totalWorkDays,
    };

    return stats;
  };

  // Open attendance detail modal
  const openAttendanceDetail = (employeeId: string, _id: string) => {
    setSelectedEmployee(employeeId);
    setSelectedAttendance(_id);
    setAttendanceDetailOpen(true);
  };

  // 3. Update the calendar view to only show check-in time
  const renderCalendarView = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getDayOfWeek(currentYear, currentMonth, 1);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Calculate days to display
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-md p-2 md:p-4">
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {dayNames.map((day, index) => (
            <div
              key={index}
              className="text-center font-medium text-gray-700 p-1 md:p-2 text-xs md:text-sm"
            >
              {day}
            </div>
          ))}

          {days.map((day, index) => {
            if (day === null) {
              return <div key={index} className="p-1 md:p-2"></div>;
            }

            const dayOfWeek = getDayOfWeek(currentYear, currentMonth, day);
            const isWeekend = [0, 6].includes(dayOfWeek);

            const dayAttendance = attendenceByIdEmployee
              ? attendenceByIdEmployee.find((record) => {
                  const recordDate = new Date(record.date);
                  return (
                    recordDate.getDate() === day &&
                    recordDate.getMonth() === currentMonth &&
                    recordDate.getFullYear() === currentYear
                  );
                })
              : null;

            return (
              <div
                key={index}
                className={`p-1 md:p-2 rounded-lg ${
                  isWeekend ? "bg-gray-50" : "bg-white"
                } min-h-[60px] md:min-h-[80px] cursor-pointer hover:bg-gray-200 transition-colors border border-gray-200`}
                onClick={() =>
                  selectedEmployee
                    ? openAttendanceDetail(
                        selectedEmployee,
                        dayAttendance?._id ?? ""
                      )
                    : null
                }
              >
                <div className="text-gray-800 font-medium mb-1 md:mb-2 text-xs md:text-sm">
                  {day}
                </div>

                {selectedEmployee ? (
                  isWeekend ? (
                    <div className="flex items-center">
                      <div className="border-l-2 md:border-l-4 border-gray-300 pl-2">
                        <div className="text-xs font-medium text-gray-500">
                          Weekend
                        </div>
                      </div>
                    </div>
                  ) : dayAttendance ? (
                    <div className="flex items-center">
                      <div
                        className={`border-l-2 md:border-l-4 pl-2 ${getStatusColor(
                          dayAttendance.status
                        )} rounded p-2 w-full`}
                      >
                        <div className="text-xs font-medium">
                          {getStatusLabel(dayAttendance.status)}
                        </div>
                        {dayAttendance.date && (
                          <div className="text-xs mt-1">
                            In:{" "}
                            {new Date(dayAttendance.date).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              }
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div
                        className={`border-l-2 md:border-l-4 pl-2 ${getStatusColor(
                          "absent"
                        )} rounded p-2 w-full`}
                      >
                        <div className="text-xs font-medium">
                          {getStatusLabel("absent")}
                        </div>
                        <div className="text-xs mt-1">In: -</div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-xs text-gray-500 hidden md:block">
                    Select an employee
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render stats view
  // Update the renderStatsView function to include 'sick'
  const renderStatsView = () => {
    if (!selectedEmployee) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-4 md:p-8 text-center text-gray-700">
          Please select an employee to view attendance statistics
        </div>
      );
    }

    const stats = getEmployeeStats(selectedEmployee);
    const employee = employees.find((emp) => emp._id === selectedEmployee);

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-md p-4 md:p-6">
        <div className="flex items-center mb-4 md:mb-6">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl md:text-2xl font-bold mr-3 md:mr-4">
            {employee?.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800">
              {employee?.name}
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              {employee?.position} • {employee?.department}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
          <div className="bg-gray-50 rounded-lg p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Present</div>
            <div className="text-lg md:text-2xl font-bold text-gray-800">
              {stats.present}
            </div>
            <div className="text-xs md:text-sm text-gray-600">
              {stats.present && stats.totalWorkDays
                ? `${Math.round((stats.present / stats.totalWorkDays) * 100)}%`
                : "0%"}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Absent</div>
            <div className="text-lg md:text-2xl font-bold text-gray-800">
              {stats.absent}
            </div>
            <div className="text-xs md:text-sm text-gray-600">
              {stats.absent && stats.totalWorkDays
                ? `${Math.round((stats.absent / stats.totalWorkDays) * 100)}%`
                : "0%"}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Late</div>
            <div className="text-lg md:text-2xl font-bold text-gray-800">
              {stats.late}
            </div>
            <div className="text-xs md:text-sm text-gray-600">
              {stats.late && stats.totalWorkDays
                ? `${Math.round((stats.late / stats.totalWorkDays) * 100)}%`
                : "0%"}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Leave</div>
            <div className="text-lg md:text-2xl font-bold text-gray-800">
              {stats.leave}
            </div>
            <div className="text-xs md:text-sm text-gray-600">
              {stats.leave && stats.totalWorkDays
                ? `${Math.round((stats.present / stats.totalWorkDays) * 100)}%`
                : "0%"}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Sick</div>
            <div className="text-lg md:text-2xl font-bold text-gray-800">
              {stats.sick}
            </div>
            <div className="text-xs md:text-sm text-gray-600">
              {stats.sick && stats.totalWorkDays
                ? `${Math.round((stats.sick / stats.totalWorkDays) * 100)}%`
                : "0%"}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getMonthlyAbsences = (month: number, year: number) => {
    const absences: {
      attendanceId: string;
      employee: UserBase | undefined;
      date: string;
      status: AttendanceStatus;
      daysAgo: number;
      note?: string;
    }[] = [];

    employees.forEach((employee) => {
      const employeeAbsences = attendanceData
        .filter((record) => {
          const recordDate = parseISO(record.date);
          return (
            record.employeeId?._id === employee._id &&
            ["absent", "leave", "sick", "late", "present"].includes(
              record.status
            ) &&
            recordDate.getMonth() === month &&
            recordDate.getFullYear() === year
          );
        })
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      employeeAbsences.forEach((absence) => {
        const today = new Date();
        const absenceDate = parseISO(absence.date);
        const daysAgo = differenceInDays(today, absenceDate);

        absences.push({
          attendanceId: absence._id,
          employee: employees.find((emp) => emp._id === employee._id),
          date: absence.date,
          status: absence.status,
          daysAgo,
          note: absence.note,
        });
      });
    });

    return absences.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const [currentPage, setCurrentPage] = useState(1);
  // Render absences view
  // Update the renderAbsencesView function to handle 'sick' status
  const renderAbsencesView = () => {
    const itemsPerPage = 5; // Menampilkan 5 absensi per halaman

    const lastAbsences = getMonthlyAbsences(currentMonth, currentYear).slice();

    // Menentukan batasan indeks untuk absensi yang ditampilkan
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAbsences = lastAbsences.slice(startIndex, endIndex);

    // Fungsi untuk mengubah halaman
    const nextPage = () => {
      if (paginatedAbsences.length === itemsPerPage) {
        setCurrentPage(currentPage + 1);
      }
    };

    const prevPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-md p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">
          Recent Employee Absences
        </h3>

        {paginatedAbsences.length === 0 ? (
          <div className="text-center text-gray-700 p-4 md:p-8">
            No absence records found
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {loadAbsences ? (
              <Loading />
            ) : (
              paginatedAbsences.map((absence, index) => {
                // Determine color based on status
                let colorClasses = "";
                if (absence.status === "absent") {
                  colorClasses = "border-red-500 bg-red-50";
                } else if (absence.status === "leave") {
                  colorClasses = "border-blue-500 bg-blue-50";
                } else if (absence.status === "sick") {
                  colorClasses = "border-purple-500 bg-purple-50";
                } else if (absence.status === "late") {
                  colorClasses = "border-yellow-500 bg-yellow-50";
                } else if (absence.status === "present") {
                  colorClasses = "border-green-500 bg-green-50";
                }

                return (
                  <div
                    key={index}
                    className={`p-3 md:p-4 rounded-lg border-l-4 ${colorClasses} hover:bg-gray-50 transition-colors`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-2 md:mr-3">
                          {absence.employee?.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 text-sm md:text-base">
                            {absence.employee?.name}
                          </div>
                          <div className="text-gray-600 text-xs md:text-sm">
                            {absence.employee?.department}
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-gray-600 text-xs md:text-sm flex items-center sm:justify-end">
                          <CalendarDays className="h-3 w-3 mr-1" />
                          {format(parseISO(absence.date), "MMM d, yyyy")}
                        </div>
                        <div className="text-gray-600 text-xs md:text-sm flex items-center sm:justify-end">
                          <Clock className="h-3 w-3 mr-1" />
                          {absence.daysAgo === 0
                            ? "Today"
                            : absence.daysAgo === 1
                            ? "Yesterday"
                            : `${absence.daysAgo} days ago`}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 md:mt-3 flex flex-wrap items-center gap-2">
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          absence.status === "absent"
                            ? "bg-red-100 text-red-700"
                            : absence.status === "sick"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {getStatusLabel(absence.status)}
                      </div>
                      {absence.note && (
                        <div className="text-gray-600 text-xs md:text-sm italic">
                          {absence.note}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-end mt-6">
          <div className="inline-flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-300 ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
              }`}
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page <strong>{currentPage}</strong>
            </span>

            <button
              onClick={nextPage}
              disabled={paginatedAbsences.length < itemsPerPage}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-300 ${
                paginatedAbsences.length < itemsPerPage
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add a new function to handle year selection
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentYear(Number.parseInt(e.target.value));
  };

  // Add a new function to handle month selection
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentMonth(Number.parseInt(e.target.value));
  };

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Update the sidebar layout to make the employee list scrollable but the attendance status fixed
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 ml-2">
            Employee Attendance
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center justify-between px-2 py-1 text-sm text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <Users className="h-4 w-4 mr-1" />
              <ChevronDown className="h-3 w-3" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 z-10 w-48 mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                {employees.map((employee) => (
                  <div
                    key={employee._id}
                    className="px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedEmployee(employee._id);
                      setDropdownOpen(false);
                    }}
                  >
                    {employee.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative w-full flex flex-col md:flex-row">
        <div
          ref={sidebarRef}
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } fixed md:relative top-0 left-0 z-30 md:z-10 w-64 h-screen bg-gray-50 shadow-md border-r border-gray-200 transition-transform duration-300 ease-in-out flex flex-col`}
        >
          {/* Sidebar Header with Title */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800">
                Employee Attendance
              </h1>
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-md hover:bg-gray-200 transition-colors md:hidden"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
          {/* Attendance Legend - Fixed, not scrollable */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-gray-800 font-medium mb-3">
              Attendance Status
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                <span className="text-gray-700 text-sm">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                <span className="text-gray-700 text-sm">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                <span className="text-gray-700 text-sm">Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-yellow-500"></div>
                <span className="text-gray-700 text-sm">Late</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-purple-500"></div>
                <span className="text-gray-700 text-sm">Sick</span>
              </div>
            </div>
          </div>
          {/* Employee List - Scrollable */}
          <h3 className="text-gray-800 font-medium p-4">Employees</h3>
          {loadEmployees ? (
            <Loading size={8} />
          ) : (
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-2">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee._id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors ${
                      selectedEmployee === employee._id ? "bg-gray-200" : ""
                    }`}
                    onClick={() => {
                      setSelectedEmployee(employee._id);
                      setCurrentView("calendar");
                      if (window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    <Avatar name={employee.name} />
                    <div>
                      <div className="text-gray-800 text-sm font-medium">
                        {employee.name}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {employee.department}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col md:ml-0">
          {/* Calendar Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-0">
              <div className="flex">
                <button
                  className="p-1 md:p-2 text-gray-700 hover:bg-gray-100 rounded-l-md"
                  onClick={prevMonth}
                >
                  <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                </button>
                <button
                  className="p-1 md:p-2 text-gray-700 hover:bg-gray-100 rounded-r-md"
                  onClick={nextMonth}
                >
                  <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              </div>

              <div className="flex items-center gap-1 md:gap-2">
                <select
                  value={currentMonth}
                  onChange={handleMonthChange}
                  className="bg-white border border-gray-300 rounded-md px-1 md:px-2 py-1 text-xs md:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                  onChange={handleYearChange}
                  className="bg-white border border-gray-300 rounded-md px-1 md:px-2 py-1 text-xs md:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              {/* Employee selection dropdown (desktop) */}
              <div className="hidden md:block relative" ref={dropdownRef}>
                {dropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                    {employees.map((employee) => (
                      <div
                        key={employee._id}
                        className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedEmployee(employee._id);
                          setDropdownOpen(false);
                        }}
                      >
                        {employee.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom tabs for view selection */}
              <div className="flex bg-gray-100 rounded-md p-1 overflow-x-auto w-full md:w-auto">
                <button
                  className={`flex items-center px-2 md:px-3 py-1 md:py-1.5 rounded whitespace-nowrap ${
                    currentView === "calendar"
                      ? "bg-white shadow-sm"
                      : "hover:bg-gray-200"
                  } text-gray-800 text-xs md:text-sm transition-colors`}
                  onClick={() => setCurrentView("calendar")}
                >
                  <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  Calendar
                </button>
                <button
                  className={`flex items-center px-2 md:px-3 py-1 md:py-1.5 rounded whitespace-nowrap ${
                    currentView === "stats"
                      ? "bg-white shadow-sm"
                      : "hover:bg-gray-200"
                  } text-gray-800 text-xs md:text-sm transition-colors`}
                  onClick={() => setCurrentView("stats")}
                >
                  <BarChart3 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  Stats
                </button>
                <button
                  className={`flex items-center px-2 md:px-3 py-1 md:py-1.5 rounded whitespace-nowrap ${
                    currentView === "absences"
                      ? "bg-white shadow-sm"
                      : "hover:bg-gray-200"
                  } text-gray-800 text-xs md:text-sm transition-colors`}
                  onClick={() => setCurrentView("absences")}
                >
                  <FileText className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  Absences
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow mx-4 mt-4">
              {error}
            </div>
          )}

          {/* View Content */}
          <div className="flex-1 overflow-auto p-2 md:p-4">
            {currentView === "calendar" && renderCalendarView()}
            {currentView === "stats" && renderStatsView()}
            {currentView === "absences" && renderAbsencesView()}
          </div>
        </div>

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* 5. Update the attendance detail modal to only show check-in time */}
        {attendanceDetailOpen &&
          selectedEmployee &&
          selectedAttendance &&
          editingRecord && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-xl max-w-md w-full mx-auto border border-gray-200">
                {loadDetail ? (
                  <Loading />
                ) : (
                  (() => {
                    const employee = employees.find(
                      (emp) => emp._id === selectedEmployee
                    );
                    const record = editingRecord;
                    const formattedDate = format(
                      parseISO(record.date),
                      "EEEE, d MMMM yyyy"
                    );

                    return (
                      <>
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3 md:mr-4">
                            {employee?.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-800">
                              {employee?.name}
                            </h3>
                            <p className="text-xs md:text-sm text-gray-600">
                              {formattedDate}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`p-3 md:p-4 rounded-lg border-l-4 mb-4 ${getStatusColor(
                            record.status
                          )}`}
                        >
                          <div className="text-base md:text-lg font-bold">
                            {getStatusLabel(record.status)}
                          </div>
                          {record.note && (
                            <div className="mt-2 italic text-sm">
                              {record.note}
                            </div>
                          )}
                        </div>

                        {record.date && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-4 md:mb-6">
                            <div className="text-xs md:text-sm text-gray-600">
                              Entry Time
                            </div>
                            <div className="text-lg md:text-xl font-bold text-gray-800">
                              {new Date(record.date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <button
                            className="px-3 md:px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm md:text-base"
                            onClick={() => setAttendanceDetailOpen(false)}
                          >
                            Close
                          </button>

                          {/* <button className="px-3 md:px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm md:text-base">
                          Edit Attendance
                        </button> */}
                        </div>
                      </>
                    );
                  })()
                )}
              </div>
            </div>
          )}
      </main>
    </div>
  );
}
