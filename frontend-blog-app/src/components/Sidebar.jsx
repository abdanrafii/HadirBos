import React from 'react';

import { FiHome, FiUsers, FiBarChart2, FiFileText, FiSettings, FiMenu, FiLogOut } from 'react-icons/fi';

const SidebarItem = ({ icon, text, active, collapsed }) => {
  return (
    <div className={`flex items-center px-6 py-3 cursor-pointer transition-colors ${active ? 'bg-indigo-800' : 'hover:bg-indigo-800'}`}>
      <div className={`${collapsed ? 'mx-auto' : ''}`}>
        {icon}
      </div>
      {!collapsed && <span className="ml-4">{text}</span>}
    </div>
  );
};

const Sidebar = ({ sidebarOpen, setSidebarOpen, logoutHandler }) => {
  return (
    <div className={`bg-indigo-900 text-white ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out`}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          {sidebarOpen && <h2 className="text-2xl font-bold">AdminPanel</h2>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white p-2 rounded-lg hover:bg-indigo-800">
            <FiMenu size={24} />
          </button>
        </div>
      </div>
      
      <div className="mt-6">
        <SidebarItem icon={<FiHome size={20} />} text="Dashboard" active={true} collapsed={!sidebarOpen} />
        <SidebarItem icon={<FiUsers size={20} />} text="Attendance" collapsed={!sidebarOpen} />
        <SidebarItem icon={<FiBarChart2 size={20} />} text="Reports" collapsed={!sidebarOpen} />
        <SidebarItem icon={<FiFileText size={20} />} text="Documents" collapsed={!sidebarOpen} />
        <SidebarItem icon={<FiSettings size={20} />} text="Settings" collapsed={!sidebarOpen} />
        
        {/* Logout button at bottom of sidebar */}
        <div className="absolute bottom-0 w-full pb-6">
          <button 
            className="flex items-center px-6 py-3 hover:bg-indigo-800 transition-colors rounded-lg w-[12.5%]"
            onClick={logoutHandler}
          >
            <FiLogOut size={20} />
            {sidebarOpen && <span className="ml-4">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;