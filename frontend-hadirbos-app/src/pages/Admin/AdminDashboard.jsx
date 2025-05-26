import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiUsers, FiPlusCircle, FiBarChart2, FiFileText } from "react-icons/fi";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import StatsCard from "../../components/Stats";
import DeleteModal from "../../components/DeleteModal";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [userToDelete, setUserToDelete] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    // Check if user is logged in and is admin
    if (!userInfo) {
      navigate("/login");
      return;
    }

    if (userInfo.role !== "admin") {
      navigate("/employee/dashboard");
      return;
    }

    // Fetch all users
    const fetchUsers = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get(
          "http://localhost:5000/api/users",
          config
        );
        // Filter users to only include those with 'employee' role
        const employeeUsers = data.filter((user) => user.role === "employee");
        setUsers(employeeUsers);
        setLoading(false);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : "Failed to fetch users"
        );
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate, userInfo]);

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        await axios.delete(
          `http://localhost:5000/api/users/${userToDelete._id}`,
          config
        );

        // Remove the deleted user from the state
        setUsers(users.filter((user) => user._id !== userToDelete._id));
        setIsModalOpen(false); // Close the modal after deletion
      } catch (error) {
        alert("Failed to delete user");
        setIsModalOpen(false); // Close the modal on error
      }
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        logoutHandler={logoutHandler}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar Component */}
        <Navbar
          userInfo={userInfo}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                Employee Management
              </h1>
              <button
                className="bg-indigo-600 text-white flex items-center px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                onClick={() => navigate("/admin/add-user")}
              >
                <FiPlusCircle className="mr-2" />
                Add New Employee
              </button>
            </div>

            <p className="text-gray-600 mt-1">
              Manage all employees and their information
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Total Employees"
              value={users.length}
              icon={<FiUsers className="text-indigo-500" size={24} />}
            />
            <StatsCard
              title="Departments"
              value={[...new Set(users.map((user) => user.department))].length}
              icon={<FiBarChart2 className="text-green-500" size={24} />}
            />
            <StatsCard
              title="Positions"
              value={[...new Set(users.map((user) => user.position))].length}
              icon={<FiFileText className="text-blue-500" size={24} />}
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
                  Employees Directory
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
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={`https://ui-avatars.com/api/?name=${user.name}`}
                                alt=""
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {user.department}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                            onClick={() =>
                              navigate(`/admin/edit-user/${user._id}`)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteClick(user)}
                          >
                            Delete
                          </button>
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

      {isModalOpen && (
        <DeleteModal
          userName={userToDelete?.name}
          onDelete={handleDeleteUser}
          closeModal={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
