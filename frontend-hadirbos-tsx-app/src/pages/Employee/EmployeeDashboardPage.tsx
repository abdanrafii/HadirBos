import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { User } from "../../types/user";
import { Attendance } from "../../types/attendance";
import { getCurrentUser, getProfile, logout } from "../../services/authService";
import Loading from "../../components/Loading";
import { LogOut, Users } from "lucide-react";
import {
  getAttendance,
  postAttendance,
} from "../../services/attendanceService";
import Avatar from "../../components/Avatar";

const EmployeeDashboardPage = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("attendance");
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState("present");
  const [attendanceNote, setAttendanceNote] = useState("");
  const [attendanceSuccess, setAttendanceSuccess] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(
    null
  );
  const [availableStatusOptions, setAvailableStatusOptions] = useState<string[]>([]);

  const navigate = useNavigate();
  const userInfo = getCurrentUser();

  // Function to update available status options based on current time
  const updateStatusOptions = () => {
    const now = new Date();
    const hours = now.getHours();
    
    // If time is between 8 AM and 10 AM (inclusive), show "present", "sick", "leave"
    if (hours >= 8 && hours < 10) {
      setAvailableStatusOptions(["present", "sick", "leave"]);
      // If current selected status is "late", change it to "present"
      if (attendanceStatus === "late") {
        setAttendanceStatus("present");
      }
    } 
    // After 10 AM, show "late", "sick", "leave"
    else {
      setAvailableStatusOptions(["late", "sick", "leave"]);
      // If current selected status is "present", change it to "late"
      if (attendanceStatus === "present") {
        setAttendanceStatus("late");
      }
    }
  };

  useEffect(() => {
    // Update status options initially
    updateStatusOptions();

    // Set interval to check time every minute
    const intervalId = setInterval(updateStatusOptions, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileResponse = await getProfile(userInfo.token);
        setProfile(profileResponse);

        const attendanceResponse = await getAttendance(userInfo.token);
        setAttendanceData(attendanceResponse);

        const today = new Date().toISOString().split("T")[0];
        const todayEntry = attendanceResponse.find(
          (entry: Attendance) =>
            new Date(entry.date).toISOString().split("T")[0] === today
        );

        if (todayEntry) {
          setTodayAttendance(todayEntry);
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, userInfo.token]);

  const logoutHandler = () => logout(navigate);

  const formatDate = (dateString: string) => {
    const options = {
      year: "numeric" as const,
      month: "long" as const,
      day: "numeric" as const,
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString: string) => {
    const options = {
      hour: "2-digit" as const,
      minute: "2-digit" as const,
      second: "2-digit" as const,
    };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const submitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttendanceLoading(true);
    setAttendanceError("");
    setAttendanceSuccess(false);

    try {
      const attendancePayload = {
        status: attendanceStatus,
        note: attendanceNote,
        employeeId: userInfo._id,
      };

      const data = await postAttendance(attendancePayload, userInfo.token);
      console.log("Attendance submitted:", data);

      setAttendanceData([data, ...attendanceData]);
      setTodayAttendance(data);
      setAttendanceSuccess(true);
      setAttendanceNote("");

      setTimeout(() => {
        setAttendanceSuccess(false);
      }, 3000);
    } catch (error) {
      if (error instanceof Error) {
        setAttendanceError(error.message);
      }
    } finally {
      setAttendanceLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      case "sick":
        return "bg-orange-100 text-orange-800";
      case "leave":
        return "bg-blue-100 text-blue-800";
      case "absent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                              ))}
                            </select>
                            
                            {/* Display current time notification */}
                            <div className="mt-2 text-sm text-gray-500">
                              Current time: {new Date().toLocaleTimeString()}
                              {new Date().getHours() >= 10 && (
                                <p className="text-yellow-600 mt-1">
                                  Note: Attendance after 10:00 AM is marked as "Late"
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
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center">
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
    </div>
  );
};

export default EmployeeDashboardPage;