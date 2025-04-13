import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiCalendar, FiClipboard, FiUsers } from "react-icons/fi";

import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import StatsCard from "../../../components/Stats";

const Attendance = () => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    if (userInfo.role !== "admin") {
      navigate("/employee/dashboard");
      return;
    }

    const fetchAttendance = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get(
          "http://localhost:5000/api/attendance/all",
          config
        );
        console.log(data);
        setAttendanceList(data);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch attendance");
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [navigate, userInfo]);

  const filteredAttendance = attendanceList.filter(
    (record) =>
      record.employeeId?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      record.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        logoutHandler={() => {
          localStorage.removeItem("userInfo");
          navigate("/login");
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          userInfo={userInfo}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Attendance Records
            </h1>
            <p className="text-gray-600 mt-1">
              Manage employee attendance records
            </p>
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
              value={
                [...new Set(attendanceList.map((rec) => rec.employeeId?._id))]
                  .length
              }
              icon={<FiUsers className="text-green-500" size={24} />}
            />
            <StatsCard
              title="Days Covered"
              value={
                [
                  ...new Set(
                    attendanceList.map((rec) =>
                      new Date(rec.date).toDateString()
                    )
                  ),
                ].length
              }
              icon={<FiCalendar className="text-blue-500" size={24} />}
            />
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">
                  Attendance List
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Note
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAttendance.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.employeeId?.name || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              record.status === "present"
                                ? "bg-green-100 text-green-800"
                                : record.status === "late"
                                ? "bg-yellow-100 text-yellow-800"
                                : record.status === "sick"
                                ? "bg-blue-100 text-blue-800"
                                : record.status === "leave"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-red-100 text-red-800"
                            }
                          `}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {record.note || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Attendance
