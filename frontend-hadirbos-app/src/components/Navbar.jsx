import React from 'react';
import { FiBell, FiSearch } from 'react-icons/fi';

const Navbar = ({ userInfo, searchTerm, setSearchTerm }) => {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search employees..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100">
            <FiBell size={20} />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center">
            <img 
              src={`https://ui-avatars.com/api/?name=${userInfo?.name}`} 
              alt="Profile" 
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{userInfo?.name}</p>
              <p className="text-xs font-medium text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;