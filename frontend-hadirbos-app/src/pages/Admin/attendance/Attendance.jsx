"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { FiCalendar, FiClipboard, FiUsers } from "react-icons/fi"

import Sidebar from "../../../components/Sidebar"
import Navbar from "../../../components/Navbar"
import StatsCard from "../../../components/Stats"

const Attendance = () => {
  const [attendanceList, setAttendanceList] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // New state for filters
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1) // Current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()) // Current year
  const [filteredAttendance, setFilteredAttendance] = useState([])
  const [calendarDays, setCalendarDays] = useState([])

  const navigate = useNavigate()
  const userInfo = JSON.parse(localStorage.getItem("userInfo"))

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ]

  // Generate years (current year - 5 to current year + 5)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  useEffect(() => {
    if (!userInfo) {
      navigate("/login")
      return
    }

    if (userInfo.role !== "admin") {
      navigate("/employee/dashboard")
      return
    }

    const fetchData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }

        // Fetch attendance data
        const { data: attendanceData } = await axios.get("http://localhost:5000/api/attendance/all", config)
        setAttendanceList(attendanceData)

        // Fetch employees
        const { data: employeesData } = await axios.get("http://localhost:5000/api/users", config)
        // Filter to only include employees
        const employeesList = employeesData.filter((user) => user.role === "employee")
        setEmployees(employeesList)

        // Set default selected employee if available
        if (employeesList.length > 0) {
          setSelectedEmployee(employeesList[0]._id)
        }

        setLoading(false)
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch data")
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate, userInfo])

  // Generate calendar days when month/year changes
  useEffect(() => {
    generateCalendarDays(selectedMonth, selectedYear)
  }, [selectedMonth, selectedYear])

  // Filter attendance data when selection changes
  useEffect(() => {
    if (selectedEmployee && attendanceList.length > 0) {
      const filtered = attendanceList.filter((record) => {
        const recordDate = new Date(record.date)
        const recordMonth = recordDate.getMonth() + 1
        const recordYear = recordDate.getFullYear()

        return (
          record.employeeId?._id === selectedEmployee && recordMonth === selectedMonth && recordYear === selectedYear
        )
      })

      setFilteredAttendance(filtered)
    }
  }, [selectedEmployee, selectedMonth, selectedYear, attendanceList])

  const generateCalendarDays = (month, year) => {
    // Get number of days in the selected month
    const daysInMonth = new Date(year, month, 0).getDate()

    // Create array of day objects
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const date = new Date(year, month - 1, day)
      return {
        day,
        date,
        dayOfWeek: date.getDay(), // 0 = Sunday, 6 = Saturday
      }
    })

    setCalendarDays(days)
  }

  const getAttendanceForDay = (day) => {
    const date = new Date(selectedYear, selectedMonth - 1, day).toISOString().split("T")[0]

    const record = filteredAttendance.find((record) => {
      const recordDate = new Date(record.date).toISOString().split("T")[0]
      return recordDate === date
    })

    return record || null
  }

  const getStatusColor = (day) => {
    const record = getAttendanceForDay(day)

    if (!record) {
      return "bg-red-100 border-red-200 text-red-800" // Absent (default)
    }

    switch (record.status) {
      case "present":
        return "bg-green-100 border-green-200 text-green-800"
      case "late":
        return "bg-blue-100 border-blue-200 text-blue-800"
      case "sick":
        return "bg-yellow-100 border-yellow-200 text-yellow-800"
      case "leave":
        return "bg-purple-100 border-purple-200 text-purple-800"
      case "absent":
        return "bg-red-100 border-red-200 text-red-800"
      default:
        return "bg-gray-100 border-gray-200 text-gray-800"
    }
  }

  const getStatusText = (day) => {
    const record = getAttendanceForDay(day)

    if (!record) {
      return "Absent"
    }

    return record.status.charAt(0).toUpperCase() + record.status.slice(1)
  }

  const getSelectedEmployeeName = () => {
    if (!selectedEmployee || employees.length === 0) return "No employee selected"

    const employee = employees.find((emp) => emp._id === selectedEmployee)
    return employee ? employee.name : "Unknown Employee"
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        logoutHandler={() => {
          localStorage.removeItem("userInfo")
          navigate("/login")
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar userInfo={userInfo} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Attendance Records</h1>
            <p className="text-gray-600 mt-1">View and manage employee attendance by month</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Total Records"
              value={attendanceList.length}
              icon={<FiClipboard className="text-indigo-500" size={24} />}
            />
            <StatsCard
              title="Unique Employees"
              value={employees.length}
              icon={<FiUsers className="text-green-500" size={24} />}
            />
            <StatsCard
              title="Days Covered"
              value={[...new Set(attendanceList.map((rec) => new Date(rec.date).toDateString()))].length}
              icon={<FiCalendar className="text-blue-500" size={24} />}
            />
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow mb-6">{error}</div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Filter Form */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800">Attendance Filter</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-2">
                        Select Employee
                      </label>
                      <select
                        id="employee"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                      >
                        {employees.map((employee) => (
                          <option key={employee._id} value={employee._id}>
                            {employee.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
                        Select Month
                      </label>
                      <select
                        id="month"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number.parseInt(e.target.value))}
                      >
                        {months.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                        Select Year
                      </label>
                      <select
                        id="year"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number.parseInt(e.target.value))}
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar View */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Attendance Calendar: {getSelectedEmployeeName()} -{" "}
                    {months.find((m) => m.value === selectedMonth)?.label} {selectedYear}
                  </h3>
                </div>
                <div className="p-6">
                  {/* Calendar Legend */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
                      <span className="text-sm text-gray-700">Present</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded mr-2"></div>
                      <span className="text-sm text-gray-700">Sick</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded mr-2"></div>
                      <span className="text-sm text-gray-700">Late</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded mr-2"></div>
                      <span className="text-sm text-gray-700">Leave</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2"></div>
                      <span className="text-sm text-gray-700">Absent</span>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Day headers */}
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                      <div key={index} className="text-center font-semibold text-gray-700 py-2">
                        {day}
                      </div>
                    ))}

                    {/* Empty cells for days before the 1st of the month */}
                    {Array.from({ length: calendarDays[0]?.dayOfWeek || 0 }).map((_, index) => (
                      <div
                        key={`empty-start-${index}`}
                        className="h-24 border border-gray-100 rounded-lg bg-gray-50"
                      ></div>
                    ))}

                    {/* Calendar days */}
                    {calendarDays.map((dayObj) => (
                      <div
                        key={dayObj.day}
                        className={`h-24 border ${getStatusColor(dayObj.day)} rounded-lg p-2 flex flex-col`}
                      >
                        <div className="font-semibold">{dayObj.day}</div>
                        <div className="text-xs mt-1">{getStatusText(dayObj.day)}</div>
                        {getAttendanceForDay(dayObj.day)?.note && (
                          <div
                            className="text-xs mt-auto italic truncate"
                            title={getAttendanceForDay(dayObj.day)?.note}
                          >
                            "{getAttendanceForDay(dayObj.day)?.note}"
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Empty cells for days after the end of the month */}
                    {Array.from({
                      length: (7 - (((calendarDays[0]?.dayOfWeek || 0) + calendarDays.length) % 7)) % 7,
                    }).map((_, index) => (
                      <div
                        key={`empty-end-${index}`}
                        className="h-24 border border-gray-100 rounded-lg bg-gray-50"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Attendance
