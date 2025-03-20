import React from 'react'
import MainLayout from '../components/MainLayout';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';


const HomePage = () => {
  return (
    <MainLayout>
      <div className="w-full min-h-screen flex flex-col md:flex-row items-center justify-between px-4 md:px-12 py-12 bg-blue-50">
        {/* Left Section */}
        <div className="md:w-1/2">
          <div className="text-sm text-blue-600 mb-2">HRManager</div>
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-8">
            BEST HR MANAGEMENT<br />SYSTEM
          </h1>
          
          <div className="mb-4">
            <Link to="#" className="flex items-center text-blue-800 hover:text-blue-500 transition-colors mb-4">
              Isi Kehadiran <span className="ml-2"><FaArrowRight /></span>
            </Link>
            
            <Link to="/login" className="flex items-center text-blue-800 hover:text-blue-500 transition-colors">
              Login <span className="ml-2"><FaArrowRight /></span>
            </Link>
          </div>
          
          <div className="flex mt-12 space-x-16">
            <div>
              <div className="text-3xl md:text-4xl font-semibold text-blue-600">10+</div>
              <div className="text-sm text-blue-700">
                Years of<br />Experience
              </div>
            </div>
            
            <div>
              <div className="text-3xl md:text-4xl font-semibold text-blue-600">3K+</div>
              <div className="text-sm text-blue-700">
                Happy<br />Employees
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Section */}
        <div className="mt-10 md:mt-0 md:w-1/2 relative">
          <div className="w-64 h-80 md:w-80 md:h-96 bg-blue-600 rounded-md absolute right-4 top-4 md:right-8 md:top-8"></div>
          <img 
            src="/images/hr-professional.jpg" 
            alt="HadirBos-Logo" 
            className="w-64 h-80 md:w-80 md:h-96 rounded-md object-cover relative z-10"
          />
          <div className="absolute top-0 right-0 bg-white p-3 rounded-md shadow-md z-20">
            <span className="font-semibold text-blue-700">HR MANAGEMENT</span>
          </div>
        </div>
      </div>
    </MainLayout>
  )
};

export default HomePage