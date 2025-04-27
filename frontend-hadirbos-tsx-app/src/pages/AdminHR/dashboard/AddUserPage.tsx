import { useState } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Mail,
  Lock,
  Briefcase,
  Award,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import { getCurrentUser } from "../../../services/authService";
import { createUser } from "../../../services/userService";

const AddUserPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    department: "",
    position: "",
  });
  const userInfo = getCurrentUser();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { name, email, password, role, department, position } = formData;

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createUser(formData, userInfo.token);
      navigate("/admin/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 transform transition-all duration-300 hover:shadow-3xl">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-8 py-6 flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-wide flex items-center">
              <User className="mr-3 w-7 h-7" /> Create New User Account
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
                    className=" text-gray-700 font-semibold mb-2 flex items-center"
                  >
                    <User className="mr-2 w-5 h-5 text-indigo-600" /> Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    id="name"
                    name="name"
                    value={name}
                    onChange={onChange}
                    required
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className=" text-gray-700 font-semibold mb-2 flex items-center"
                  >
                    <Mail className="mr-2 w-5 h-5 text-indigo-600" /> Email
                    Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    id="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="password"
                    className="text-gray-700 font-semibold mb-2 flex items-center"
                  >
                    <Lock className="mr-2 w-5 h-5 text-indigo-600" /> Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    id="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                    placeholder="Set a secure password"
                  />
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="text-gray-700 font-semibold mb-2 flex items-center"
                  >
                    <Award className="mr-2 w-5 h-5 text-indigo-600" /> User Role
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
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="department"
                    className=" text-gray-700 font-semibold mb-2 flex items-center"
                  >
                    <Briefcase className="mr-2 w-5 h-5 text-indigo-600" />{" "}
                    Department
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    id="department"
                    name="department"
                    value={department}
                    onChange={onChange}
                    required
                    placeholder="Enter department name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="position"
                    className=" text-gray-700 font-semibold mb-2 flex items-center"
                  >
                    <Award className="mr-2 w-5 h-5 text-indigo-600" /> Position
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    id="position"
                    name="position"
                    value={position}
                    onChange={onChange}
                    required
                    placeholder="Enter job position"
                  />
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
                  {loading ? "Adding User..." : "Create User Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserPage;
