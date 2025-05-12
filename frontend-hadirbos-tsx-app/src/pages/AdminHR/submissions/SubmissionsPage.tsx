import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { Calendar, FileText, Filter, Search, ChevronLeft, ChevronRight, Clock, User, X } from "lucide-react"
import { getCurrentUser } from "../../../services/authService"
import { getAllSubmissions, getSubmissionStats } from "../../../services/submissionService"
import { getUsers } from "../../../services/userService"
import type { Submission, SubmissionStats } from "../../../types/submission"
import type { UserBase } from "../../../types/user"
import Loading from "../../../components/Loading"
import Avatar from "../../../components/Avatar"

const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [stats, setStats] = useState<SubmissionStats | null>(null)
  const [employees, setEmployees] = useState<UserBase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    employeeId: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const navigate = useNavigate()
  const userInfo = getCurrentUser()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch submissions with filters
        const submissionsData = await getAllSubmissions(userInfo.token, filters)
        setSubmissions(submissionsData)

        // Fetch stats
        const statsData = await getSubmissionStats(userInfo.token, undefined, undefined, "allTime")
        setStats(statsData)

        // Fetch employees for filter dropdown
        const employeesData = await getUsers(userInfo.token)
        setEmployees(employeesData)
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userInfo.token, filters])

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
    setCurrentPage(1) // Reset to first page when filters change
  }

  const clearFilters = () => {
    setFilters({
      type: "",
      status: "",
      employeeId: "",
    })
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-300"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300"
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "leave":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "resignation":
        return "bg-purple-100 text-purple-800 border-purple-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Filter submissions by search term
  const filteredSubmissions = submissions.filter((submission) => {
    const employeeName = typeof submission.employeeId === "object" ? submission.employeeId.name : ""
    const searchString = `${employeeName} ${submission.reason}`.toLowerCase()
    return searchString.includes(searchTerm.toLowerCase())
  })

  // Pagination
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, startIndex + itemsPerPage)

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employee Submissions</h1>
          <p className="text-gray-600">Manage leave requests and resignations</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search submissions..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border ${
              Object.values(filters).some((value) => value !== "")
                ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Leave Requests</p>
                <p className="text-2xl font-bold text-gray-800">{stats.leave.total}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex justify-between text-xs">
              <span className="text-green-600">{stats.leave.approved} Approved</span>
              <span className="text-yellow-600">{stats.leave.pending} Pending</span>
              <span className="text-red-600">{stats.leave.rejected} Rejected</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Resignations</p>
                <p className="text-2xl font-bold text-gray-800">{stats.resignation.total}</p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex justify-between text-xs">
              <span className="text-green-600">{stats.resignation.approved} Approved</span>
              <span className="text-yellow-600">{stats.resignation.pending} Pending</span>
              <span className="text-red-600">{stats.resignation.rejected} Rejected</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total.total}</p>
              </div>
              <div className="bg-indigo-100 p-2 rounded-full">
                <User className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 flex justify-between text-xs">
              <span className="text-green-600">{stats.total.approved} Approved</span>
              <span className="text-yellow-600">{stats.total.pending} Pending</span>
              <span className="text-red-600">{stats.total.rejected} Rejected</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-700">Filter Submissions</h3>
            <button onClick={clearFilters} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
              <X size={16} className="mr-1" /> Clear Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Request Type
              </label>
              <select
                id="type"
                name="type"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="leave">Leave</option>
                <option value="resignation">Resignation</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <select
                id="employeeId"
                name="employeeId"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.employeeId}
                onChange={handleFilterChange}
              >
                <option value="">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow">{error}</div>}

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Submissions</h3>
        </div>

        {loading ? (
          <Loading />
        ) : paginatedSubmissions.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No submissions found</p>
            <p className="text-gray-400 text-sm mt-1">
              {Object.values(filters).some((value) => value !== "") || searchTerm
                ? "Try adjusting your filters or search term"
                : "Submissions will appear here when employees make requests"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedSubmissions.map((submission) => {
                  const employee = typeof submission.employeeId === "object" ? submission.employeeId : null

                  return (
                    <tr key={submission._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar name={employee?.name || "Unknown"} size="sm" className="mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{employee?.name || "Unknown"}</div>
                            <div className="text-xs text-gray-500">{employee?.department || ""}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(submission.type)}`}
                        >
                          {submission.type.charAt(0).toUpperCase() + submission.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(submission.createdAt)}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(submission.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {submission.type === "leave" && submission.startDate && submission.endDate ? (
                            <span>
                              {formatDate(submission.startDate)} - {formatDate(submission.endDate)}
                            </span>
                          ) : (
                            <span className="truncate block max-w-xs">
                              {submission.reason.length > 40
                                ? `${submission.reason.substring(0, 40)}...`
                                : submission.reason}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(submission.status)}`}
                        >
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/admin/submissions/${submission._id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {paginatedSubmissions.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredSubmissions.length)}</span> of{" "}
              <span className="font-medium">{filteredSubmissions.length}</span> results
            </div>

            <div className="flex space-x-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={nextPage}
                disabled={currentPage >= totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage >= totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SubmissionsPage
