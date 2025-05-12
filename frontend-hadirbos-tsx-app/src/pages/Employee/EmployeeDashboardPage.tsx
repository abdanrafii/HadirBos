import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import type { User } from "../../types/user"
import type { Attendance } from "../../types/attendance"
import type { Submission, SubmissionFormData } from "../../types/submission"
import { getCurrentUser, getProfile, logout, updateProfile } from "../../services/authService"
import Loading from "../../components/Loading"
import {
  LogOut,
  Users,
  Calendar,
  FileText,
  BriefcaseBusiness,
  DollarSign,
  ScrollText,
} from "lucide-react";
import { getAttendance, postAttendance } from "../../services/attendanceService"
import { createSubmission, getEmployeeSubmissions } from "../../services/submissionService"
import Avatar from "../../components/Avatar"
import FileUpload from "../../components/FileUpload"
import { uploadFile } from "../../services/fileUploadService"
import { Payroll } from "../../types/payroll";
import { getPayrollByEmployeeId } from "../../services/payrollService";
import PaySlip from "../AdminHR/payroll/Payslip";

const EmployeeDashboardPage = () => {
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("attendance")
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([])
  const [attendanceStatus, setAttendanceStatus] = useState("present")
  const [attendanceNote, setAttendanceNote] = useState("")
  const [attendanceSuccess, setAttendanceSuccess] = useState(false)
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceError, setAttendanceError] = useState("")
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null)
  const [availableStatusOptions, setAvailableStatusOptions] = useState<
    string[]
  >([]);
  const [payrollData, setPayrollData] = useState<Payroll[]>([])

  // Submission state
  const [submissionType, setSubmissionType] = useState<"leave" | "resignation">("leave")
  const [submissionReason, setSubmissionReason] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [submissionFile, setSubmissionFile] = useState<File | null>(null)
  const [submissionLoading, setSubmissionLoading] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  const [submissionError, setSubmissionError] = useState("")
  const [submissionHistory, setSubmissionHistory] = useState<Submission[]>([])

  // First, let's add a new state for the edit profile modal
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [profileFormData, setProfileFormData] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    phone: "",
    address: "",
  })
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false)
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false)
  const [profileUpdateError, setProfileUpdateError] = useState("")

  const navigate = useNavigate()
  const userInfo = getCurrentUser()

  // Function to update available status options based on current time
  const updateStatusOptions = () => {
    const now = new Date()
    const hours = now.getHours()

    // If time is between 8 AM and 10 AM (inclusive), show "present", "sick", "leave"
    if (hours >= 8 && hours < 10) {
      setAvailableStatusOptions(["present", "sick", "leave"])
      // If current selected status is "late", change it to "present"
      if (attendanceStatus === "late") {
        setAttendanceStatus("present")
      }
    }
    // After 10 AM, show "late", "sick", "leave"
    else {
      setAvailableStatusOptions(["late", "sick", "leave"])
      // If current selected status is "present", change it to "late"
      if (attendanceStatus === "present") {
        setAttendanceStatus("late")
      }
    }
  }

  useEffect(() => {
    // Update status options initially
    updateStatusOptions()

    // Set interval to check time every minute
    const intervalId = setInterval(updateStatusOptions, 60000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileResponse = await getProfile(userInfo.token)
        setProfile(profileResponse)

        const attendanceResponse = await getAttendance(userInfo.token)
        setAttendanceData(attendanceResponse)

        const today = new Date().toISOString().split("T")[0]
        const todayEntry = attendanceResponse.find(
          (entry: Attendance) => new Date(entry.date).toISOString().split("T")[0] === today,
        )

        if (todayEntry) {
          setTodayAttendance(todayEntry)
        }

        // Fetch submission history
        const submissionsResponse = await getEmployeeSubmissions(userInfo.token)
        setSubmissionHistory(submissionsResponse)
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate, userInfo.token])

  const logoutHandler = () => logout(navigate)

  const formatDate = (dateString: string) => {
    const options = {
      year: "numeric" as const,
      month: "long" as const,
      day: "numeric" as const,
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (dateString: string) => {
    const options = {
      hour: "2-digit" as const,
      minute: "2-digit" as const,
      second: "2-digit" as const,
    }
    return new Date(dateString).toLocaleTimeString(undefined, options)
  }

  const submitAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    setAttendanceLoading(true)
    setAttendanceError("")
    setAttendanceSuccess(false)

    try {
      const attendancePayload = {
        status: attendanceStatus,
        note: attendanceNote,
        employeeId: userInfo._id,
      }

      const data = await postAttendance(attendancePayload, userInfo.token)
      console.log("Attendance submitted:", data)

      setAttendanceData([data, ...attendanceData])
      setTodayAttendance(data)
      setAttendanceSuccess(true)
      setAttendanceNote("")

      setTimeout(() => {
        setAttendanceSuccess(false)
      }, 3000)
    } catch (error) {
      if (error instanceof Error) {
        setAttendanceError(error.message)
      }
    } finally {
      setAttendanceLoading(false)
    }
  }

  // Find the submitLeaveOrResignation function and update it to handle file uploads
  const submitLeaveOrResignation = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmissionLoading(true)
    setSubmissionError("")
    setSubmissionSuccess(false)

    try {
      // Validate form data
      if (!submissionReason.trim()) {
        throw new Error("Please provide a reason for your request")
      }

      if (submissionType === "leave" && (!startDate || !endDate)) {
        throw new Error("Please provide both start and end dates for leave request")
      }

      // Create submission data
      const submissionData: SubmissionFormData = {
        type: submissionType,
        reason: submissionReason,
      }

      if (submissionType === "leave") {
        submissionData.startDate = startDate
        submissionData.endDate = endDate
      }

      // Handle file upload if a file is selected
      if (submissionFile) {
        try {
          const fileUrl = await uploadFile(submissionFile, userInfo.token)
          submissionData.fileUrl = fileUrl
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(`File upload failed: ${error.message}`)
          }
          throw new Error("File upload failed")
        }
      }

      const response = await createSubmission(submissionData, userInfo.token)

      // Update submission history
      setSubmissionHistory([response, ...submissionHistory])

      // Reset form
      setSubmissionType("leave")
      setSubmissionReason("")
      setStartDate("")
      setEndDate("")
      setSubmissionFile(null)

      // Show success message
      setSubmissionSuccess(true)

      setTimeout(() => {
        setSubmissionSuccess(false)
      }, 3000)
    } catch (error) {
      if (error instanceof Error) {
        setSubmissionError(error.message)
      }
    } finally {
      setSubmissionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800"
      case "late":
        return "bg-yellow-100 text-yellow-800"
      case "sick":
        return "bg-orange-100 text-orange-800"
      case "leave":
        return "bg-blue-100 text-blue-800"
      case "absent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  // Add this function to handle opening the edit profile modal
  const openEditProfileModal = () => {
    if (profile) {
      setProfileFormData({
        name: profile.name || "",
        email: profile.email || "",
        department: profile.department || "",
        position: profile.position || "",
        phone: profile.phone || "",
        address: profile.address || "",
      })
      setShowEditProfileModal(true)
    }
  }

  // Add this function to handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileFormData({
      ...profileFormData,
      [name]: value,
    })
  }

  // Add this function to handle profile update submission
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileUpdateLoading(true)
    setProfileUpdateError("")

    try {
      // Create a new object without department and position
      const profileUpdateData = {
        name: profileFormData.name,
        email: profileFormData.email,
        phone: profileFormData.phone,
        address: profileFormData.address,
      }

      // Use the new updateProfile function from authService
      const updatedProfile = await updateProfile(profileUpdateData, userInfo.token)

      // Update the profile state with new data
      setProfile({
        ...profile!,
        ...updatedProfile,
      })

      setProfileUpdateSuccess(true)

      // Close the modal after a short delay
      setTimeout(() => {
        setShowEditProfileModal(false)
        setProfileUpdateSuccess(false)
      }, 2000)
    } catch (error) {
      if (error instanceof Error) {
        setProfileUpdateError(error.message)
      }
    } finally {
      setProfileUpdateLoading(false)
    }
  }

  const renderSubmissionsTab = () => {
    return (
      <div className="space-y-6">
        {/* Submission Form */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <FileText className="h-6 w-6 mr-2" />
              Submit Leave or Resignation Request
            </h3>
          </div>
          <div className="p-6">
            {submissionSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                Your request has been submitted successfully! HR will review your application.
              </div>
            )}

            {submissionError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{submissionError}</div>
            )}

            <form onSubmit={submitLeaveOrResignation} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Request Type</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-blue-600"
                      name="submissionType"
                      value="leave"
                      checked={submissionType === "leave"}
                      onChange={() => setSubmissionType("leave")}
                    />
                    <span className="ml-2">Leave Request</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-blue-600"
                      name="submissionType"
                      value="resignation"
                      checked={submissionType === "resignation"}
                      onChange={() => setSubmissionType("resignation")}
                    />
                    <span className="ml-2">Resignation</span>
                  </label>
                </div>
              </div>

              {submissionType === "leave" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reason">
                  Reason
                </label>
                <textarea
                  id="reason"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder={`Please provide a detailed reason for your ${
                    submissionType === "leave" ? "leave request" : "resignation"
                  }...`}
                  value={submissionReason}
                  onChange={(e) => setSubmissionReason(e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Supporting Document (Optional)</label>
                <FileUpload
                  onFileChange={setSubmissionFile}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  label={`Upload ${submissionType === "leave" ? "Leave" : "Resignation"} Document`}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Upload any supporting documents for your request (doctor's note, formal resignation letter, etc.)
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-md hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 flex items-center"
                  disabled={submissionLoading}
                >
                  {submissionLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-5 w-5" />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Submission History */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Calendar className="h-6 w-6 mr-2" />
              Request History
            </h3>
          </div>
          <div className="p-6">
            {submissionHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Submitted
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {/* For leave: show date range, for resignation: show reason preview */}
                        Details
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {submissionHistory.map((submission) => (
                      <tr key={submission._id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center">
                            {submission.type === "leave" ? (
                              <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                            ) : (
                              <BriefcaseBusiness className="h-4 w-4 text-red-500 mr-2" />
                            )}
                            <span className="capitalize">{submission.type}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">{formatDate(submission.createdAt)}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {submission.type === "leave" ? (
                            <span>
                              {submission.startDate && submission.endDate
                                ? `${formatDate(submission.startDate)} - ${formatDate(submission.endDate)}`
                                : "Date range not specified"}
                            </span>
                          ) : (
                            <span className="truncate block max-w-xs">
                              {submission.reason.length > 50
                                ? `${submission.reason.substring(0, 50)}...`
                                : submission.reason}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getSubmissionStatusColor(
                              submission.status,
                            )}`}
                          >
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">You haven't submitted any requests yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const idrFormatter = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    const fetchPayrollData = async () => {
      try {
        setLoading(true);
        const response = await getPayrollByEmployeeId(
          userInfo.token,
          userInfo._id
        );
        setPayrollData(response);
        console.log(response);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollData();
  }, [userInfo._id, userInfo.token]);

  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
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
 
  const handlePayslipModalOpen = (record: Payroll) => {
    setPayrollSelected(record);
    setIsPayslipModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-white p-1.5 sm:p-2 rounded-full">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <div className="ml-2 sm:ml-3">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  Employee Portal
                </h1>
                {profile && (
                  <p className="text-xs sm:text-sm text-blue-100">
                    Welcome, {profile.name}
                  </p>
                )}
              </div>
            </div>

            {/* Mobile version - icon only */}
            <button
              className="md:hidden bg-white text-red-600 p-2.5 rounded-full hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
              onClick={logoutHandler}
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>

            {/* Desktop version - with text */}
            <button
              className="hidden md:flex bg-white text-red-600 px-4 py-2.5 rounded-md hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 ease-in-out items-center space-x-2 shadow-md hover:shadow-lg"
              onClick={logoutHandler}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <Loading fullscreen={true} />
        ) : profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 flex flex-col items-center">
                  <Avatar
                    name={profile.name}
                    size={"lg"}
                    className="font-bold text-3xl p-5"
                  />
                  <h3 className="text-xl font-bold text-white mt-4">
                    {profile.name}
                  </h3>
                  <p className="text-blue-100">{profile.position}</p>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-3 p-2 hover:bg-gray-50 rounded">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-700">{profile.email}</span>
                  </div>
                  <div className="flex items-center mb-3 p-2 hover:bg-gray-50 rounded">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span className="text-gray-700">{profile.department}</span>
                  </div>
                  <div className="flex items-center mb-3 p-2 hover:bg-gray-50 rounded">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-700">
                      Joined: {formatDate(profile.joinDate)}
                    </span>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Quick Links
                    </h4>
                    <div
                      className={`flex items-center p-2 rounded cursor-pointer ${
                        activeTab === "attendance"
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                      onClick={() => setActiveTab("attendance")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <span>Attendance</span>
                    </div>
                    <div
                      className={`flex items-center p-2 rounded cursor-pointer ${
                        activeTab === "payroll"
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                      onClick={() => setActiveTab("payroll")}
                    >
                      <DollarSign className="h-5 w-5 mr-3" />
                      <span>Payroll</span>
                    </div>
                    <div
                      className={`flex items-center p-2 rounded cursor-pointer ${
                        activeTab === "submissions"
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                      onClick={() => setActiveTab("submissions")}
                    >
                      <FileText className="h-5 w-5 mr-3" />
                      <span>Leave & Resignation</span>
                    </div>
                    <div
                      className={`flex items-center p-2 rounded cursor-pointer ${
                        activeTab === "profile"
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                      onClick={() => setActiveTab("profile")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>My Profile</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === "attendance" && (
                <div className="space-y-6">
                  {/* Clock In/Out Card */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                      <h3 className="text-xl font-bold text-white flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Today's Attendance
                      </h3>
                    </div>
                    <div className="p-6">
                      {todayAttendance ? (
                        <div className="text-center">
                          <div
                            className={`inline-block px-4 py-2 rounded-full text-lg font-semibold mb-4 ${getStatusColor(
                              todayAttendance.status
                            )}`}
                          >
                            {todayAttendance.status.charAt(0).toUpperCase() +
                              todayAttendance.status.slice(1)}
                          </div>
                          <p className="text-gray-700 mb-2">
                            Submitted at:{" "}
                            {formatTime(todayAttendance.createdAt)}
                          </p>
                          {todayAttendance.note && (
                            <p className="text-gray-700 italic">
                              "{todayAttendance.note}"
                            </p>
                          )}
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-blue-700">
                              You've already submitted your attendance for
                              today.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={submitAttendance}>
                          {attendanceSuccess && (
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                              Attendance submitted successfully!
                            </div>
                          )}

                          {attendanceError && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                              {attendanceError}
                            </div>
                          )}

                          <div className="mb-6">
                            <label
                              className="block text-gray-700 text-sm font-bold mb-2"
                              htmlFor="attendanceStatus"
                            >
                              Status:
                            </label>
                            <select
                              id="attendanceStatus"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={attendanceStatus}
                              onChange={(e) =>
                                setAttendanceStatus(e.target.value)
                              }
                            >
                              {availableStatusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                                </option>
                              ))}
                            </select>

                            {/* Display current time notification */}
                            <div className="mt-2 text-sm text-gray-500">
                              Current time: {new Date().toLocaleTimeString()}
                              {new Date().getHours() >= 10 && (
                                <p className="text-yellow-600 mt-1">
                                  Note: Attendance after 10:00 AM is marked as
                                  "Late"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mb-6">
                            <label
                              className="block text-gray-700 text-sm font-bold mb-2"
                              htmlFor="attendanceNote"
                            >
                              Note (optional):
                            </label>
                            <textarea
                              id="attendanceNote"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={3}
                              placeholder="Add a note about your attendance status..."
                              value={attendanceNote}
                              onChange={(e) =>
                                setAttendanceNote(e.target.value)
                              }
                            ></textarea>
                          </div>

                          <div className="flex justify-center">
                            <button
                              type="submit"
                              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-md hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 flex items-center"
                              disabled={attendanceLoading}
                            >
                              {attendanceLoading ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  Submit Attendance
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* Recent Attendance Records */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                      <h3 className="text-xl font-bold text-white flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        Recent Attendance History
                      </h3>
                    </div>
                    <div className="p-6 overflow-x-auto">
                      {attendanceData.length > 0 ? (
                        <table className="min-w-full bg-white">
                          <thead>
                            <tr className="bg-gray-50 border-b">
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Time
                              </th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Note
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {attendanceData.slice(0, 5).map((record, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-700">
                                  {formatDate(record.createdAt)}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                  {formatTime(record.createdAt)}
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                      record.status
                                    )}`}
                                  >
                                    {record.status.charAt(0).toUpperCase() +
                                      record.status.slice(1)}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                  {record.note || (
                                    <span className="text-gray-400 italic">
                                      No note
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No attendance records found.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "payroll" && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      Payroll History
                    </h3>
                  </div>

                  {/* Table */}
                  <div className="p-6 overflow-x-auto">
                    {payrollData.length > 0 ? (
                      <table className="min-w-full bg-white">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Period
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Payment Date
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {payrollData.map((payroll) => (
                            <tr key={payroll._id} className="hover:bg-gray-50">
                              {/* Period */}
                              <td className="py-3 px-4 text-sm text-gray-700">
                                {`${new Date(
                                  payroll.year,
                                  payroll.month - 1
                                ).toLocaleString("en-GB", {
                                  month: "long",
                                })} ${payroll.year}`}
                              </td>

                              {/* Amount */}
                              <td className="py-3 px-4 text-sm text-gray-700">
                                {idrFormatter(payroll.totalAmount)}
                              </td>

                              {/* Status */}
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                    payroll.status === "paid"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {payroll.status.charAt(0).toUpperCase() +
                                    payroll.status.slice(1)}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-sm text-gray-700">
                                {payroll.paymentDate
                                  ? new Date(
                                      payroll.paymentDate
                                    ).toLocaleDateString("en-US", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })
                                  : "-"}
                              </td>

                              {/* Download Button */}
                              <td className="py-3 px-4">
                                <button
                                  onClick={() =>
                                    handlePayslipModalOpen(payroll)
                                  }
                                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2 px-3 rounded flex items-center gap-1"
                                >
                                  <ScrollText className="w-4 h-4" />
                                  Payslip
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No payroll records found.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "submissions" && renderSubmissionsTab()}

              {activeTab === "profile" && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Employee Profile
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            FULL NAME
                          </label>
                          <p className="text-gray-800 font-medium">
                            {profile.name}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            EMAIL ADDRESS
                          </label>
                          <p className="text-gray-800 font-medium">
                            {profile.email}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            EMPLOYEE ID
                          </label>
                          <p className="text-gray-800 font-medium">
                            {profile._id ||
                              "EMP-" + Math.floor(Math.random() * 10000)}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            BASE SALARY
                          </label>
                          <p className="text-gray-800 font-medium">
                            {profile.baseSalary}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            DEPARTMENT
                          </label>
                          <p className="text-gray-800 font-medium">
                            {profile.department}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            POSITION
                          </label>
                          <p className="text-gray-800 font-medium">
                            {profile.position}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            JOIN DATE
                          </label>
                          <p className="text-gray-800 font-medium">
                            {formatDate(profile.joinDate)}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            ACCOUNT NUMBER
                          </label>
                          <p className="text-gray-800 font-medium">
                            {profile.accountNumber || "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t">
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">
                        Contact Information
                      </h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            PHONE NUMBER
                          </label>
                          <p className="text-gray-800 font-medium">
                            {profile.phone || "-"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            ADDRESS
                          </label>
                          <p className="text-gray-800 font-medium">
                            {profile.address || "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={openEditProfileModal}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-600 text-lg">No profile data found.</p>
          </div>
        )}
      </div>
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-auto border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Edit Profile
            </h2>

            {profileUpdateSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                Profile updated successfully!
              </div>
            )}

            {profileUpdateError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {profileUpdateError}
              </div>
            )}

            <form onSubmit={handleProfileUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-1"
                    htmlFor="name"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileFormData.name}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-1"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileFormData.email}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-1"
                    htmlFor="department"
                  >
                    Department
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={profileFormData.department}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Department cannot be changed by employee
                  </p>
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-1"
                    htmlFor="position"
                  >
                    Position
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={profileFormData.position}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Position cannot be changed by employee
                  </p>
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-1"
                    htmlFor="phone"
                  >
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={profileFormData.phone}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-1"
                    htmlFor="address"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={profileFormData.address}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  disabled={profileUpdateLoading}
                >
                  {profileUpdateLoading ? (
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
          </div>
        </div>
      )}

      {isPayslipModalOpen && (
        <PaySlip
          payrollRecord={payrollSelected}
          onClose={() => setIsPayslipModalOpen(false)}
        />
      )}
    </div>
  );
}

export default EmployeeDashboardPage
