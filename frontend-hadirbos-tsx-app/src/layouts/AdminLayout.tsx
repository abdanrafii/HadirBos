import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { SearchContext } from "../context/SearchContext";
import { getCurrentUser, logout } from "../services/authService";
import { useNavigate } from "react-router";

type MainLayoutProps = {
  children: React.ReactNode;
  showSearch?: boolean;
};

const AdminLayout = ({ children, showSearch }: MainLayoutProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const userInfo = getCurrentUser();
  const navigate  = useNavigate();

  const logoutHandler = () => logout(navigate);

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          logoutHandler={logoutHandler}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar userInfo={userInfo} showSearch={showSearch} />

          <main className="flex-1 overflow-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </SearchContext.Provider>
  );
};

export default AdminLayout;
