import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  User,
  Mail,
  Lock,
  Briefcase,
  Award,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";

const EditUser = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    department: "",
    position: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [originalUser, setOriginalUser] = useState(null);
  const navigate = useNavigate();

  // Use a ref to track if we've already loaded the data
  const dataLoaded = useRef(false);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const { name, email, password, role, department, position } = formData;

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

    // Fetch user data only once
    const fetchUser = async () => {
      // Skip if we've already loaded data
      if (dataLoaded.current) return;

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get(
          `http://localhost:5000/api/users/${id}`,
          config
        );

        // Store original user data and set form data
        setOriginalUser(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          password: "", // We don't set password here for security
          role: data.role || "employee",
          department: data.department || "",
          position: data.position || "",
        });

        // Mark data as loaded
        dataLoaded.current = true;
        setFetchLoading(false);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : "Failed to fetch user data"
        );
        setFetchLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate, userInfo]); // Dependencies are still needed for navigation checks

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // Create update object with changed data only
      const updateData = {};

      // Compare each field with original data
      if (name !== originalUser.name) updateData.name = name;
      if (email !== originalUser.email) updateData.email = email;
      if (password) updateData.password = password; // Only include password if provided
      if (role !== originalUser.role) updateData.role = role;
      if (department !== originalUser.department)
        updateData.department = department;
      if (position !== originalUser.position) updateData.position = position;

      await axios.put(
        `http://localhost:5000/api/users/${id}`,
        updateData,
        config
      );

      setLoading(false);
      navigate("/admin/dashboard");
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : "Failed to update user"
      );
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 transform transition-all duration-300 hover:shadow-3xl">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-8 py-6 flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-wide flex items-center">
              <User className="mr-3 w-7 h-7" /> Edit User Account
            </h3>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={submitHandler} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="text-gray-700 font-semibold mb-2 flex items-center"
                  >
                    <User className="mr-2 w-5 h-5 text-indigo-600" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    id="name"
                    name="name"
                    value={name}
                    onChange={onChange}
                    placeholder="Enter full name"
                  />
                  {originalUser && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {originalUser.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="text-gray-700 font-semibold mb-2 flex items-center"
                  >
                    <Mail className="mr-2 w-5 h-5 text-indigo-600" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    id="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    placeholder="Enter email address"
                  />
                  {originalUser && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {originalUser.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="password"
                    className="text-gray-700 font-semibold mb-2 flex items-center"
                  >
                    <Lock className="mr-2 w-5 h-5 text-indigo-600" />
                    Password
                    <span className="ml-2 text-sm text-gray-500">
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    id="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="text-gray-700 font-semibold mb-2 flex items-center"
                  >
                    <Award className="mr-2 w-5 h-5 text-indigo-600" />
                    User Role
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 appearance-none border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                      id="role"
                      name="role"
                      value={role}
                      onChange={onChange}
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                    <ChevronDown className="w-5 h-5 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                  {originalUser && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {originalUser.role}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="department"
                    className="text-gray-700 font-semibold mb-2 flex items-center"
                  >
                    <Briefcase className="mr-2 w-5 h-5 text-indigo-600" />
                    Department
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    id="department"
                    name="department"
                    value={department}
                    onChange={onChange}
                    placeholder="Enter department"
                  />
                  {originalUser && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {originalUser.department}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="position"
                    className="text-gray-700 font-semibold mb-2 flex items-center"
                  >
                    <Award className="mr-2 w-5 h-5 text-indigo-600" />
                    Position
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    id="position"
                    name="position"
                    value={position}
                    onChange={onChange}
                    placeholder="Enter position"
                  />
                  {originalUser && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {originalUser.position}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  onClick={() => navigate("/admin/dashboard")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg hover:from-indigo-700 hover:to-purple-800 transition-all ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update User Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
