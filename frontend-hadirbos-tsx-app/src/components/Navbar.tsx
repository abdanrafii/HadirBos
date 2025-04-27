import { Bell, Menu, Search } from "lucide-react";
import { useContext } from "react";
import { SearchContext } from "../context/SearchContext";
import { UserInfo } from "../types/user";
import Avatar from "./Avatar";

type NavbarProps = {
  userInfo: UserInfo | null;
  showSearch?: boolean;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
};

const Navbar = ({
  userInfo,
  showSearch = true,
  sidebarOpen,
  setSidebarOpen,
}: NavbarProps) => {
  const searchContext = useContext(SearchContext);

  return (
    <header className="bg-white shadow-xs z-10">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Section (Menu & Search) */}
        <div className="flex items-center space-x-4">
          {/* Hamburger menu button */}
          <button
            onClick={() => setSidebarOpen && setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 mr-4"
          >
            <Menu size={24} />
          </button>

          {/* Search Bar */}
          {showSearch && (
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Search employees..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent lg:w-64 md:w-48"
                value={searchContext?.searchTerm}
                onChange={(e) => searchContext?.setSearchTerm(e.target.value)}
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={16}
              />
            </div>
          )}
        </div>

        {/* Right Section (Notifications & User Info) */}
        <div className="flex items-center space-x-4">
          {/* Notification Icon */}
          <button className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100">
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Info & Avatar */}
          <div className="flex items-center space-x-3">
            <Avatar name={userInfo?.name} />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-700">
                {userInfo?.name}
              </p>
              <p className="text-xs font-medium text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
