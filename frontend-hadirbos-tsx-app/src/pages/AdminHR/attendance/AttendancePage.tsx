import { useState, useEffect, useRef, useContext } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  FileText,
  BarChart3,
  Clock,
  CalendarDays,
  Users,
  Search,
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { getCurrentUser } from "../../../services/authService";
import {
  getAllAttendance,
  getAttendanceByEmployeeId,
  getAttendanceById,
  postAttendanceAdminOnly,
  updateAttendance,
} from "../../../services/attendanceService";
import { getUsers } from "../../../services/userService";
import type { UserBase } from "../../../types/user";
import type { AttendanceStatus, Attendance } from "../../../types/attendance";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const searchTerm = useContext(SearchContext).searchTerm;

  // First, let's add a state for editing attendance
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    status: "",
    note: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState("");

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
  const availableYears = [2022, 2023, 2024, 2025, 2026, 2027];

  useEffect(() => {
    setLoadEmployees(true);
    const fetchUsers = async () => {
      try {
        const data = await getUsers(userInfo.token);
        setEmployees(data);
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
  }, [selectedAttendance, userInfo.token, updateSuccess, updateError]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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
  }, [sidebarRef, sidebarOpen]);

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

  const reloadAttendance = async () => {
    try {
      if (!selectedEmployee) return;
      const response = await getAttendanceByEmployeeId(
        userInfo.token,
        selectedEmployee,
        currentMonth + 1,
        currentYear
      );
      setAttendanceByIdEmployee(response);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  const reloadAbsences = async () => {
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

  // Add this function to handle form changes
  const handleEditChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Add this function to handle attendance update
  const handleUpdateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError("");

    try {
      if (!selectedAttendance) {
        throw new Error("No attendance record selected");
      }

      const updatedAttendance = await updateAttendance(
        selectedAttendance,
        {
          status: editFormData.status,
          note: editFormData.note,
          employeeId: selectedEmployee || "",
        },
        userInfo.token
      );

      // Update the attendance data
      setAttendanceData(
        attendanceData.map((record) =>
          record._id === selectedAttendance ? updatedAttendance : record
        )
      );

      // Update the current editing record
      setEditingRecord(updatedAttendance);

      setUpdateSuccess(true);
      reloadAttendance();
      reloadAbsences();

      // Exit edit mode after a short delay
      setTimeout(() => {
        setEditMode(false);
        setUpdateSuccess(false);
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        setUpdateError(error.message);
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  // Update the openAttendanceDetail function to initialize the edit form data
  const openAttendanceDetail = (attendanceId: string) => {
    setSelectedAttendance(attendanceId);
    setAttendanceDetailOpen(true);
    setEditMode(false); // Reset edit mode when opening the modal

    // Reset update states
    setUpdateSuccess(false);
    setUpdateError("");
  };

  const [isAddAttendanceOpen, setIsAddAttendanceOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [addFormData, setAddFormData] = useState({
    status: "present",
    note: "",
    date: selectedDate || "",
    employeeId: selectedEmployee || "",
  });

  const handleAddAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      setUpdateError("");
      setUpdateSuccess(false);

      await postAttendanceAdminOnly(addFormData, userInfo.token);

      setUpdateSuccess(true);
      setIsAddAttendanceOpen(false);
      reloadAttendance();

    } catch (error) {
      if (error instanceof Error) {
        setUpdateError(error.message);
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const openAddAttendance = (date: string) => {
    if (!selectedEmployee) {
      return;
    }
    setSelectedDate(date);
    setIsAddAttendanceOpen(true);
  };

  useEffect(() => {
    setAddFormData((prev) => ({
      ...prev,
      date: selectedDate || "",
      employeeId: selectedEmployee || "",
    }));
  }, [selectedDate, selectedEmployee]);

  const handleAddChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open attendance detail modal
  // const openAttendanceDetail = (attendanceId: string) => {
  //   // setSelectedEmployee(employeeId);
  //   setSelectedAttendance(attendanceId);
  //   setAttendanceDetailOpen(true);
  // };

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
      <div className="bg-white rounded-xl border border-gray-200 shadow-md p-2 ">
        <div className="overflow-x-auto md:overscroll-x-none">
          <div className="grid grid-cols-7 gap-1 md:gap-2 min-w-[700px]">
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
                  onClick={() => {
                    if (dayAttendance?._id) {
                      openAttendanceDetail(dayAttendance._id);
                    } else {
                      const selectedDate = new Date(
                        currentYear,
                        currentMonth,
                        day + 1
                      );
                      const isoDate = selectedDate.toISOString().split("T")[0]; // format ISO date
                      openAddAttendance(isoDate);
                    }
                  }}
                >
                  <div className="text-gray-800 font-medium mb-1 md:mb-2 text-xs md:text-sm">
                    {day}
                  </div>

                  {selectedEmployee ? (
                    isWeekend ? (
                      <div className="flex items-center">
                        <div
                          className={`border-l-2 md:border-l-4 pl-2 ${getStatusColor(
                            "weekend"
                          )} rounded p-2 w-full`}
                        >
                          <div className="text-xs font-medium text-gray-500 truncate">
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
                          <div className="text-xs font-medium truncate">
                            {getStatusLabel(dayAttendance.status)}
                          </div>
                          {dayAttendance.date && (
                            <div className="text-xs mt-1 truncate">
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
                      <div className="flex items-center truncate">
                        <div
                          className={`border-l-2 md:border-l-4 pl-2 ${getStatusColor(
                            "absent"
                          )} rounded p-2 w-full`}
                        >
                          <div className="text-xs font-medium truncate">
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
          <Avatar
            name={employee?.name}
            className="w-12 h-12 md:w-16 md:h-16 text-xl md:text-2xl font-bold mr-3 md:mr-4"
          />
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
    const itemsPerPage = 5;
    const lastAbsences = getMonthlyAbsences(currentMonth, currentYear).slice();

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAbsences = lastAbsences.slice(startIndex, endIndex);
    const totalPages = Math.ceil(lastAbsences.length / itemsPerPage);

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
      <div className="bg-white rounded-xl border border-gray-200 shadow-md p-3 md:p-6 w-full">
        <h3 className="text-base md:text-xl font-bold text-gray-800 mb-3 md:mb-6">
          Recent Employee Absences
        </h3>

        {paginatedAbsences.length === 0 ? (
          <div className="text-center text-gray-700 p-4 rounded-lg bg-gray-50 border border-gray-100">
            <div className="flex flex-col items-center justify-center py-4">
              <CalendarDays className="h-12 w-12 text-gray-400 mb-2" />
              <p className="font-medium">No absence records found</p>
              <p className="text-sm text-gray-500">
                Records will appear here when available
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
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
                    className={`p-3 md:p-4 rounded-lg border-l-4 ${colorClasses} hover:bg-opacity-80 transition-all cursor-pointer shadow-sm`}
                    onClick={() =>
                      openAttendanceDetail(absence?.attendanceId ?? "")
                    }
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <Avatar
                          name={absence.employee?.name}
                          className="w-10 h-10 mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-800 text-sm md:text-base">
                            {absence.employee?.name}
                          </div>
                          <div className="text-gray-600 text-xs md:text-sm">
                            {absence.employee?.department}
                          </div>
                        </div>
                      </div>

                      {/* Responsive date and time info */}
                      <div className="flex items-center justify-between mt-2 sm:mt-0 sm:block sm:text-right">
                        <div className="text-gray-600 text-xs md:text-sm flex items-center">
                          <CalendarDays className="h-3 w-3 mr-1" />
                          {format(parseISO(absence.date), "MMM d, yyyy")}
                        </div>
                        <div className="text-gray-600 text-xs md:text-sm flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {absence.daysAgo === 0
                            ? "Today"
                            : absence.daysAgo === 1
                            ? "Yesterday"
                            : `${absence.daysAgo} days ago`}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          absence.status === "absent"
                            ? "bg-red-100 text-red-700"
                            : absence.status === "sick"
                            ? "bg-purple-100 text-purple-700"
                            : absence.status === "leave"
                            ? "bg-blue-100 text-blue-700"
                            : absence.status === "late"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {getStatusLabel(absence.status)}
                      </div>
                      {absence.note && (
                        <div className="text-gray-600 text-xs md:text-sm italic line-clamp-1 sm:line-clamp-none">
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

        {/* Improved pagination controls for mobile */}
        {paginatedAbsences.length > 0 && (
          <div className="flex justify-end items-center mt-4 md:mt-6 ml-auto">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
                }`}
              >
                <ChevronLeft className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="text-xs sm:text-sm text-gray-600">
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{totalPages || 1}</span>
              </div>

              <button
                onClick={nextPage}
                disabled={paginatedAbsences.length < itemsPerPage}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
                  paginatedAbsences.length < itemsPerPage
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:hidden" />
              </button>
            </div>
          </div>
        )}
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

  const searchContext = useContext(SearchContext);

  // Update the sidebar layout to make the employee list scrollable but the attendance status fixed
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-200 transition-colors border border-gray-200"
          >
            <Users className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 ml-2">
            Employee Attendance
          </h1>
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
          {/* Sidebar Header */}
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

          {/* Attendance Legend */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-gray-800 font-medium mb-3">
              Attendance Status
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {/* Status */}
              {[
                { color: "bg-green-500", label: "Present" },
                { color: "bg-red-500", label: "Absent" },
                { color: "bg-blue-500", label: "Leave" },
                { color: "bg-yellow-500", label: "Late" },
                { color: "bg-purple-500", label: "Sick" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm ${item.color}`}></div>
                  <span className="text-gray-700 text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="p-4 border-b border-gray-200 md:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="Search employee..."
                className="pl-9 pr-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                value={searchContext?.searchTerm}
                onChange={(e) => searchContext?.setSearchTerm(e.target.value)}
              />
              <Search
                className="absolute left-2.5 top-2.5 text-gray-400"
                size={16}
              />
            </div>
          </div>

          {/* Employee List */}
          <h3 className="text-gray-800 font-medium p-4">Employees</h3>
          {loadEmployees ? (
            <Loading size={8} />
          ) : (
            <div className="flex-1 overflow-x-auto p-4">
              <div className="space-y-2 min-w-max">
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

        <div className="flex-1 flex flex-col md:ml-0 overflow-auto">
          {/* Calendar Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between p-3 lg:p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 lg:gap-4 mb-3 lg:mb-0">
              <div className="flex">
                <button
                  className="p-1 lg:p-2 text-gray-700 hover:bg-gray-100 rounded-l-lg"
                  onClick={prevMonth}
                >
                  <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" />
                </button>
                <button
                  className="p-1 lg:p-2 text-gray-700 hover:bg-gray-100 rounded-r-lg"
                  onClick={nextMonth}
                >
                  <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5" />
                </button>
              </div>

              <div className="flex items-center gap-1 lg:gap-2">
                <select
                  value={currentMonth}
                  onChange={handleMonthChange}
                  className="bg-white border border-gray-300 rounded-lg px-1 lg:px-2 py-1 text-xs lg:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                  className="bg-white border border-gray-300 rounded-lg px-1 lg:px-2 py-1 text-xs lg:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:gap-4 lg:ml-4">
              {/* Custom tabs for view selection */}
              <div className="flex bg-gray-100 rounded-lg p-1 overflow-x-auto lg:w-auto">
                <button
                  className={`flex items-center px-2 lg:px-3 py-1 lg:py-1.5 rounded whitespace-nowrap ${
                    currentView === "calendar"
                      ? "bg-white shadow-sm"
                      : "hover:bg-gray-200"
                  } text-gray-800 text-xs lg:text-sm transition-colors`}
                  onClick={() => setCurrentView("calendar")}
                >
                  <Calendar className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                  Calendar
                </button>
                <button
                  className={`flex items-center px-2 lg:px-3 py-1 lg:py-1.5 rounded whitespace-nowrap ${
                    currentView === "stats"
                      ? "bg-white shadow-sm"
                      : "hover:bg-gray-200"
                  } text-gray-800 text-xs lg:text-sm transition-colors`}
                  onClick={() => setCurrentView("stats")}
                >
                  <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                  Stats
                </button>
                <button
                  className={`flex items-center px-2 lg:px-3 py-1 lg:py-1.5 rounded whitespace-nowrap ${
                    currentView === "absences"
                      ? "bg-white shadow-sm"
                      : "hover:bg-gray-200"
                  } text-gray-800 text-xs lg:text-sm transition-colors`}
                  onClick={() => setCurrentView("absences")}
                >
                  <FileText className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
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
          <div className="flex-1 p-2 lg:p-4 min-w-full">
            {currentView === "calendar" && renderCalendarView()}
            {currentView === "stats" && renderStatsView()}
            {currentView === "absences" && renderAbsencesView()}
          </div>
        </div>

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {attendanceDetailOpen && selectedAttendance && editingRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-xl max-w-md w-full mx-auto border border-gray-200">
              {loadDetail ? (
                <Loading />
              ) : (
                (() => {
                  // const employee = employees.find(
                  //   (emp) => emp._id === selectedEmployee
                  // );
                  const record = editingRecord;
                  const formattedDate = format(
                    parseISO(record.date),
                    "EEEE, d MMMM yyyy"
                  );

                  return (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Avatar
                            name={record.employeeId?.name}
                            className="mr-3"
                          />
                          <div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-800">
                              {record.employeeId?.name}
                            </h3>
                            <p className="text-xs md:text-sm text-gray-600">
                              {formattedDate}
                            </p>
                          </div>
                        </div>
                      </div>

                      {updateSuccess && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                          Attendance record updated successfully!
                        </div>
                      )}

                      {updateError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                          {updateError}
                        </div>
                      )}

                      {editMode ? (
                        // Edit Mode
                        <form onSubmit={handleUpdateAttendance}>
                          <div className="mb-4">
                            <label
                              className="block text-gray-700 text-sm font-medium mb-2"
                              htmlFor="status"
                            >
                              Attendance Status
                            </label>
                            <select
                              id="status"
                              name="status"
                              value={editFormData.status}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              <option value="present">Present</option>
                              <option value="late">Late</option>
                              <option value="absent">Absent</option>
                              <option value="sick">Sick</option>
                              <option value="leave">Leave</option>
                            </select>
                          </div>

                          <div className="mb-4">
                            <label
                              className="block text-gray-700 text-sm font-medium mb-2"
                              htmlFor="note"
                            >
                              Note
                            </label>
                            <textarea
                              id="note"
                              name="note"
                              value={editFormData.note}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                              placeholder="Add a note about this attendance record..."
                            ></textarea>
                          </div>

                          <div className="flex justify-between">
                            <button
                              type="button"
                              className="px-3 md:px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm md:text-base"
                              onClick={() => setEditMode(false)}
                            >
                              Cancel
                            </button>

                            <button
                              type="submit"
                              className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm md:text-base flex items-center"
                              disabled={updateLoading}
                            >
                              {updateLoading ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Updating...
                                </>
                              ) : (
                                "Save Changes"
                              )}
                            </button>
                          </div>
                        </form>
                      ) : (
                        // View Mode
                        <>
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

                            {userInfo.role === "admin" && (
                              <button
                                className="px-3 md:px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm md:text-base"
                                onClick={() => {
                                  setEditMode(true);
                                  setEditFormData({
                                    status: record.status,
                                    note: record.note || "",
                                  });
                                }}
                              >
                                Edit Attendance
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  );
                })()
              )}
            </div>
          </div>
        )}

        {isAddAttendanceOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 rounded-lg shadow-xl max-w-md w-full mx-auto border border-gray-200">
              <form onSubmit={handleAddAttendance}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Add Attendance
                  </h3>
                  <div className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
                    <Calendar size={18} className="mr-2" />
                    <span className="font-medium">
                      {selectedDate
                        ? new Date(selectedDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : ""}
                    </span>
                  </div>
                </div>

                {updateError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {updateError}
                  </div>
                )}

                <div className="mb-4">
                  <label
                    htmlFor="status"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={addFormData.status}
                    onChange={handleAddChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                    <option value="sick">Sick</option>
                    <option value="leave">Leave</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="note"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Note
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={addFormData.note}
                    onChange={handleAddChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    placeholder="Add a note..."
                  ></textarea>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setIsAddAttendanceOpen(false)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                  >
                    {updateLoading && (
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                    {updateLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
