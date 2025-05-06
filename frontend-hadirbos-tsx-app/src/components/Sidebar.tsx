import { useNavigate, useLocation } from "react-router";
import {
  Home,
  Users,
  ChartNoAxesColumn,
  FileText,
  Settings,
  Menu,
  LogOut,
} from "lucide-react";
import { useEffect } from "react";

type SidebarItemProps = {
  icon: React.ReactNode;
  text: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
};

const SidebarItem = ({
  icon,
  text,
  active,
  collapsed,
  onClick,
}: SidebarItemProps) => {
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

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  logoutHandler: () => void;
};

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  logoutHandler,
}: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handlePageChange = (path: string) => {
    navigate(path);

    // Close sidebar on smaller screens
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarOpen]);

  return (
    <div
      className={`bg-indigo-900 text-white transition-all duration-300 ease-in-out fixed top-0 left-0 h-full z-50 ${
        sidebarOpen ? "w-64" : "w-20"
      } ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:relative lg:translate-x-0`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          {sidebarOpen && <h2 className="text-2xl font-bold">AdminPanel</h2>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white p-2 rounded-lg hover:bg-indigo-800"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      <div className="mt-6">
        <SidebarItem
          icon={<Home size={20} />}
          text="Dashboard"
          active={isActive("/admin/dashboard")}
          collapsed={!sidebarOpen}
          onClick={() => handlePageChange("/admin/dashboard")}
        />
        <SidebarItem
          icon={<Users size={20} />}
          text="Attendance"
          active={isActive("/admin/attendance")}
          collapsed={!sidebarOpen}
          onClick={() => handlePageChange("/admin/attendance")}
        />
        <SidebarItem
          icon={<ChartNoAxesColumn size={20} />}
          text="Payroll"
          active={isActive("/admin/payroll")}
          collapsed={!sidebarOpen}
          onClick={() => handlePageChange("/admin/payroll")}
        />
        <SidebarItem
          icon={<FileText size={20} />}
          text="Documents"
          active={isActive("/admin/documents")}
          collapsed={!sidebarOpen}
          onClick={() => handlePageChange("/admin/documents")}
        />
        <SidebarItem
          icon={<Settings size={20} />}
          text="Settings"
          active={isActive("/admin/settings")}
          collapsed={!sidebarOpen}
          onClick={() => handlePageChange("/admin/settings")}
        />

        {/* Logout button at bottom of sidebar */}
        <SidebarItem
          icon={<LogOut size={20} />}
          text="Logout"
          active={false}
          collapsed={!sidebarOpen}
          onClick={logoutHandler}
        />
      </div>
    </div>
  );
};

export default Sidebar;