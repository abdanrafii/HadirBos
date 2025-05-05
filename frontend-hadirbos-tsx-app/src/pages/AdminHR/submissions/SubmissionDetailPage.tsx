"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import {
  ArrowLeft,
  Calendar,
  FileText,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  MessageSquare,
  Mail,
} from "lucide-react"
import { getCurrentUser } from "../../../services/authService"
import { getSubmissionById, updateSubmissionStatus } from "../../../services/submissionService"
import type { Submission } from "../../../types/submission"
import Loading from "../../../components/Loading"
import Avatar from "../../../components/Avatar"
import axios from "axios"

const SubmissionDetailPage = () => {
  const { id } = useParams()
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const navigate = useNavigate()
  const userInfo = getCurrentUser()

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        if (!id) return

        const data = await getSubmissionById(id, userInfo.token)
        setSubmission(data)

        if (data.adminNotes) {
          setAdminNotes(data.adminNotes)
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSubmission()
  }, [id, userInfo.token])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const downloadFile = async (fileUrl: string) => {
    try {
      const response = await axios.get(`http://localhost:5000${fileUrl}`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
        responseType: "blob",
      })

      // Create a blob URL for the file
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)

      // Create a temporary link and trigger download
      const a = document.createElement("a")
      a.href = url
      a.download = fileUrl.split("/").pop() || "document"
      document.body.appendChild(a)
      a.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading file:", error)
      alert("Failed to download file. Please try again.")
    }
  }

  const handleStatusUpdate = async (status: "approved" | "rejected") => {
    try {
      setUpdateLoading(true)

      if (!id) return

      const updatedSubmission = await updateSubmissionStatus(id, status, adminNotes, userInfo.token)

      setSubmission(updatedSubmission)
      setUpdateSuccess(true)

      setTimeout(() => {
        setUpdateSuccess(false)
      }, 3000)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      }
    } finally {
      setUpdateLoading(false)
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "pending":
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
    }
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <button
          onClick={() => navigate("/admin/submissions")}
          className="mt-4 px-4 py-2 bg-white text-red-600 rounded-md border border-red-300 hover:bg-red-50 flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Submissions
        </button>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow">
        <p className="font-bold">Submission Not Found</p>
        <p>The requested submission could not be found.</p>
        <button
          onClick={() => navigate("/admin/submissions")}
          className="mt-4 px-4 py-2 bg-white text-yellow-600 rounded-md border border-yellow-300 hover:bg-yellow-50 flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Submissions
        </button>
      </div>
    )
  }

  const employee = typeof submission.employeeId === "object" ? submission.employeeId : null

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/admin/submissions")}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          <span>Back to Submissions</span>
        </button>

        <div className={`px-3 py-1 rounded-full flex items-center ${getStatusColor(submission.status)}`}>
          {getStatusIcon(submission.status)}
          <span className="ml-2 font-medium">
            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-4">
          <h1 className="text-xl font-bold text-white flex items-center">
            {submission.type === "leave" ? (
              <Calendar className="mr-2 h-6 w-6" />
            ) : (
              <FileText className="mr-2 h-6 w-6" />
            )}
            {submission.type === "leave" ? "Leave Request" : "Resignation"} Details
          </h1>
        </div>

        <div className="p-6">
          {updateSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Submission status updated successfully!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column - Employee info */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Employee Information</h3>

                <div className="flex items-center mb-4">
                  <Avatar name={employee?.name || "Unknown"} size="md" className="mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">{employee?.name || "Unknown"}</div>
                    <div className="text-sm text-gray-500">{employee?.position || ""}</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>Department: </span>
                    <span className="ml-1 text-gray-900">{employee?.department || "Unknown"}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>Email: </span>
                    <span className="ml-1 text-gray-900">{employee?.email || "Unknown"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Submission Details</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Submitted on: </span>
                    <span className="ml-1 text-gray-900">{formatDate(submission.createdAt)}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Time: </span>
                    <span className="ml-1 text-gray-900">
                      {new Date(submission.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {submission.type === "leave" && submission.startDate && submission.endDate && (
                    <>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Leave Period: </span>
                      </div>
                      <div className="ml-6 p-2 bg-blue-50 rounded border border-blue-100 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-blue-600">Start Date</div>
                          <div className="font-medium">{formatDate(submission.startDate)}</div>
                        </div>
                        <div className="text-gray-400">to</div>
                        <div>
                          <div className="text-xs text-blue-600">End Date</div>
                          <div className="font-medium">{formatDate(submission.endDate)}</div>
                        </div>
                      </div>

                      {/* Calculate days */}
                      <div className="ml-6 text-sm text-gray-600">
                        {(() => {
                          const start = new Date(submission.startDate)
                          const end = new Date(submission.endDate)
                          const diffTime = Math.abs(end.getTime() - start.getTime())
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
                          return `${diffDays} day${diffDays !== 1 ? "s" : ""} total`
                        })()}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Supporting Document */}
              {submission.fileUrl && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Supporting Document</h3>

                  <div className="border border-gray-200 rounded-lg p-3 bg-white flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-md">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">
                          {submission.type === "leave" ? "Leave Document" : "Resignation Letter"}
                        </p>
                        <p className="text-xs text-gray-500">Document</p>
                      </div>
                    </div>

                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => downloadFile(submission.fileUrl || "")}
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right column - Request details and actions */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  {submission.type === "leave" ? "Leave Request" : "Resignation"} Reason
                </h3>

                <div className="bg-white p-4 rounded-lg border border-gray-200 whitespace-pre-line">
                  {submission.reason}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Admin Notes
                </h3>

                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                  placeholder="Add notes about this submission (visible to admins only)..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  disabled={submission.status !== "pending"}
                ></textarea>

                {submission.status !== "pending" && (
                  <p className="text-sm text-gray-500 mt-2">
                    This submission has already been {submission.status}. Notes cannot be modified.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              {submission.status === "pending" && (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => handleStatusUpdate("rejected")}
                    className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-md hover:bg-red-50 flex items-center"
                    disabled={updateLoading}
                  >
                    <XCircle className="mr-2 h-5 w-5" />
                    Reject
                  </button>

                  <button
                    onClick={() => handleStatusUpdate("approved")}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                    disabled={updateLoading}
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Approve
                  </button>
                </div>
              )}

              {submission.status !== "pending" && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    {submission.status === "approved" ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <span className="font-medium">
                      This submission was {submission.status} on {formatDate(submission.updatedAt)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubmissionDetailPage
