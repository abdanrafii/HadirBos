import React from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useNavigate dan useLocation dari React Router

import {
  FiHome,
  FiUsers,
  FiBarChart2,
  FiFileText,
  FiSettings,
  FiMenu,
  FiLogOut,
} from "react-icons/fi";

const SidebarItem = ({ icon, text, active, collapsed, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center px-6 py-3 cursor-pointer transition-colors ${
        active ? "bg-indigo-800" : "hover:bg-indigo-800"
      }`}
    >
      <div className={`${collapsed ? "mx-auto" : ""}`}>{icon}</div>
      {!collapsed && <span className="ml-4">{text}</span>}
    </div>
  );
};

const Sidebar = ({ sidebarOpen, setSidebarOpen, logoutHandler }) => {
  const navigate = useNavigate(); // Hook untuk navigasi
  const location = useLocation(); // Hook untuk mendapatkan lokasi saat ini

  // Fungsi untuk menentukan apakah tombol aktif berdasarkan URL saat ini
  const isActive = (path) => location.pathname === path;

  const handlePageChange = (path) => {
    navigate(path); // Navigasi ke halaman yang sesuai
  };

  return (
    <div
      className={`bg-indigo-900 text-white ${
        sidebarOpen ? "w-64" : "w-20"
      } transition-all duration-300 ease-in-out`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          {sidebarOpen && <h2 className="text-2xl font-bold">AdminPanel</h2>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white p-2 rounded-lg hover:bg-indigo-800"
          >
            <FiMenu size={24} />
          </button>
        </div>
      </div>

      <div className="mt-6">
        <SidebarItem
          icon={<FiHome size={20} />}
          text="Dashboard"
          active={isActive("/admin/dashboard")}
          collapsed={!sidebarOpen}
          onClick={() => handlePageChange("/admin/dashboard")}
        />
        <SidebarItem
          icon={<FiUsers size={20} />}
          text="Attendance"
          active={isActive("/admin/attendance")}
          collapsed={!sidebarOpen}
          onClick={() => handlePageChange("/admin/attendance")}
        />
        <SidebarItem
          icon={<FiBarChart2 size={20} />}
          text="Reports"
          active={isActive("/admin/reports")}
          collapsed={!sidebarOpen}
          onClick={() => handlePageChange("/admin/reports")}
        />
        <SidebarItem
          icon={<FiFileText size={20} />}
          text="Documents"
          active={isActive("/admin/documents")}
          collapsed={!sidebarOpen}
          onClick={() => handlePageChange("/admin/documents")}
        />
        <SidebarItem
          icon={<FiSettings size={20} />}
          text="Settings"
          active={isActive("/admin/settings")}
          collapsed={!sidebarOpen}
          onClick={() => handlePageChange("/admin/settings")}
        />

        {/* Logout button at bottom of sidebar */}
        <SidebarItem
          icon={<FiLogOut size={20} />}
          text="Logout"
          collapsed={!sidebarOpen}
          onClick={logoutHandler}
        />
      </div>
    </div>
  );
};

export default Sidebar;
