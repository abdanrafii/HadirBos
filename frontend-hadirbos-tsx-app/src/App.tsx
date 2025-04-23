import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboardPage from "./pages/AdminHR/dashboard/AdminDashboardPage";
import AdminLayout from "./layouts/AdminLayout";
import AddUserPage from "./pages/AdminHR/dashboard/AddUserPage";
import EditUserPage from "./pages/AdminHR/dashboard/EditUserPage";
import EmployeeDashboardPage from "./pages/Employee/EmployeeDashboardPage";
import ProtectedRoute from "./utils/protectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route
          path="/admin/dashboard"
          element={
            <AdminLayout showSearch={true}>
              <AdminDashboardPage />
            </AdminLayout>
          }
        />
        <Route path="/admin/add-user" element={<AddUserPage />} />
        <Route path="/admin/edit-user/:id" element={<EditUserPage />} />
      </Route>

      {/* Employee Protected Route */}
      <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
        <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
