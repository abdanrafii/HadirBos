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

  const isActive = (path : string) => location.pathname === path;

  const handlePageChange = (path : string) => {
    navigate(path); 
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
          text="Reports"
          active={isActive("/admin/reports")}
          collapsed={!sidebarOpen}
          onClick={() => handlePageChange("/admin/reports")}
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