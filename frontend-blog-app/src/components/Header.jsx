import React from 'react'
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="w-full bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-[#b19777]">
          <img src="/logo.png" alt="HR Management" className="h-10" />
        </Link>
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-800 hover:text-[#b19777]">Home</Link>
          <Link to="/dashboard" className="text-gray-800 hover:text-[#b19777]">Dashboard</Link>
          <Link to="/employees" className="text-gray-800 hover:text-[#b19777]">Employees</Link>
          <Link to="/contact" className="text-gray-800 hover:text-[#b19777]">Contact</Link>
        </nav>
        <Link to="/login" className="px-4 py-2 bg-[#b19777] text-white rounded hover:bg-[#9a8164]">
          Login
        </Link>
      </div>
    </header>
  )
}

export default Header