import { useState, useEffect, useContext } from "react";
import {
  Users,
  PlusCircle,
  ChartNoAxesColumn,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import StatsCard from "../../../components/StatsCard";
import DeleteModal from "../../../components/DeleteModal";
import { useNavigate } from "react-router";
import { SearchContext } from "../../../context/SearchContext";
import Loading from "../../../components/Loading";
import { UserInfo as User } from "../../../types/user";
import { getCurrentUser } from "../../../services/authService";
import {
  deleteUser,
  getUserById,
  getUsers,
} from "../../../services/userService";
import Avatar from "../../../components/Avatar";

const AdminDashboardPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadDetail, setLoadDetail] = useState(false);
  const [error, setError] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [modalDetailOpen, setModalDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const navigate = useNavigate();
  const userInfo = getCurrentUser();
  const searchTerm = useContext(SearchContext).searchTerm;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsers(userInfo.token);
        const employeeUsers = data.filter(
          (user: User) => user.role === "employee"
        );
        setUsers(employeeUsers);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userInfo.token]);

  useEffect(() => {
    const fetchDetailUsers = async () => {
      try {
        setLoadDetail(true);
        const data = await getUserById(selectedUser, userInfo.token);
        setDetailUser(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setLoadDetail(false);
      }
    };

    fetchDetailUsers();
  }, [selectedUser, userInfo.token]);

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete._id, userInfo.token);
        setUsers(users.filter((user) => user._id !== userToDelete._id));
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setIsModalOpen(false);
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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const nextPage = () => {
    if (paginatedUsers.length === itemsPerPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <>
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Employee Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage all employees and their information
            </p>
          </div>

          <button
            className="bg-indigo-600 text-white flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors text-sm sm:text-base whitespace-nowrap mt-2 sm:mt-0"
            onClick={() => navigate("/admin/add-user")}
          >
            <PlusCircle className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Add New Employee</span>
            <span className="sm:hidden">Add Employee</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Employees"
          value={users.length}
          icon={<Users className="text-indigo-500" size={24} />}
        />
        <StatsCard
          title="Departments"
          value={[...new Set(users.map((user) => user.department))].length}
          icon={<ChartNoAxesColumn className="text-green-500" size={24} />}
        />
        <StatsCard
          title="Positions"
          value={[...new Set(users.map((user) => user.position))].length}
          icon={<FileText className="text-blue-500" size={24} />}
        />
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <Loading />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Base Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <Avatar name={user.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {user.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.baseSalary}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-green-600 hover:text-green-900 mr-3"
                        onClick={() => {
                          setSelectedUser(user._id);
                          setModalDetailOpen(true);
                        }}
                      >
                        Detail
                      </button>
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => navigate(`/admin/edit-user/${user._id}`)}
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

          <div className="flex justify-end items-center m-4">
            <div className="inline-flex items-center gap-2 sm:gap-4">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-300 ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
                }`}
              >
                <ChevronLeft className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <span className="text-sm text-gray-600">
                Page <strong>{currentPage}</strong> of{" "}
                <strong>{totalPages}</strong>
              </span>

              <button
                onClick={nextPage}
                disabled={paginatedUsers.length < itemsPerPage}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-300 ${
                  paginatedUsers.length < itemsPerPage
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:hidden" />
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <DeleteModal
          userName={userToDelete?.name}
          onDelete={handleDeleteUser}
          closeModal={() => setIsModalOpen(false)}
        />
      )}

      {modalDetailOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-xl max-w-lg w-full mx-auto border border-gray-200">
            {loadDetail ? (
              <Loading />
            ) : (
              (() => {
                const employee = detailUser;
                return (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Avatar name={employee?.name} className="mr-3" />
                        <div>
                          <h3 className="text-lg md:text-xl font-bold text-gray-800">
                            {employee?.name}
                          </h3>
                          {/* <p className="text-xs md:text-sm text-gray-600">
                            {employee?.email}
                          </p> */}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs md:text-sm text-gray-600">
                            Role
                          </div>
                          <div className="text-base font-medium text-gray-800">
                            {employee?.role || "N/A"}
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs md:text-sm text-gray-600">
                            Department
                          </div>
                          <div className="text-base font-medium text-gray-800">
                            {employee?.department || "N/A"}
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs md:text-sm text-gray-600">
                            Position
                          </div>
                          <div className="text-base font-medium text-gray-800">
                            {employee?.position || "N/A"}
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs md:text-sm text-gray-600">
                            Base Salary
                          </div>
                          <div className="text-base font-medium text-gray-800">
                            {employee?.baseSalary
                              ? `Rp ${employee.baseSalary.toLocaleString()}`
                              : "N/A"}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs md:text-sm text-gray-600">
                          Email
                        </div>
                        <div className="text-base font-medium text-gray-800">
                          {employee?.email || "N/A"}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs md:text-sm text-gray-600">
                          Account Number
                        </div>
                        <div className="text-base font-medium text-gray-800">
                          {employee?.accountNumber || "N/A"}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs md:text-sm text-gray-600">
                          Phone
                        </div>
                        <div className="text-base font-medium text-gray-800">
                          {employee?.phone || "N/A"}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs md:text-sm text-gray-600">
                          Address
                        </div>
                        <div className="text-base font-medium text-gray-800">
                          {employee?.address || "N/A"}
                        </div>
                      </div>
                      {/* 
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs md:text-sm text-gray-600">
                          Password
                        </div>
                        <div className="flex items-center">
                          <div className="text-base font-medium text-gray-800 mr-2">
                            ••••••••
                          </div>
                          <button className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded">
                            Show
                          </button>
                        </div>
                      </div> */}
                    </div>

                    <div className="flex justify-between">
                      <button
                        className="px-3 md:px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm md:text-base"
                        onClick={() => setModalDetailOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  </>
                );
              })()
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboardPage;
