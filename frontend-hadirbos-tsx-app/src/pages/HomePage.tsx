import React, { useState, useEffect } from "react";
import { ArrowRight, UserCheck, ChartLine, Calendar, UserIcon } from "lucide-react";
import { motion } from "framer-motion";

import { useNavigate } from "react-router";
// Define types for our components
type FeatureProps = {
  icon: React.ReactNode;
  title: string;
};

type StatCardProps = {
  number: string;
  label: string;
};

const FeatureButton = ({ icon, title }: FeatureProps) => (
  <motion.div
    className="flex items-center space-x-2 bg-white/20 p-3 rounded-xl cursor-pointer transition-colors duration-200"
    whileHover={{
      scale: 1.05,
      backgroundColor: "rgba(255, 255, 255, 0.3)",
    }}
    style={{
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
    }}
    transition={{ duration: 0.2 }}
  >
    <div className="text-white">{icon}</div>
    <span className="text-white font-medium">{title}</span>
  </motion.div>
);


const StatCard = ({ number, label }: StatCardProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => {
        const nextCount = prevCount + Math.ceil(parseInt(number) / 20);
        return nextCount >= parseInt(number) ? parseInt(number) : nextCount;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [number]);

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <span className="text-3xl font-bold text-white">{count}+</span>
      <div className="text-sm text-blue-100 font-medium">{label}</div>
    </motion.div>
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full h-screen overflow-hidden relative">
      {/* Background gradient with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900"></div>
      <div className="absolute inset-0 opacity-10 bg-pattern"></div>
      
      {/* Content container */}
      <div className="relative w-full h-full flex flex-col md:flex-row px-6 md:px-12 lg:px-20">
        
        {/* Left section - Content */}
        <div className="md:w-7/12 h-full flex flex-col justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white leading-tight">
              Revolutionizing <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">HR Management</span>
            </h1>
            
            <p className="text-blue-100 text-lg mb-8 max-w-lg">
              Streamline your HR operations with our comprehensive suite of tools designed for modern workplaces.
            </p>
            
            {/* Feature buttons */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <FeatureButton icon={<UserCheck size={18} />} title="Attendance" />
              <FeatureButton icon={<ChartLine size={18} />} title="Analytics" />
              <FeatureButton icon={<Calendar size={18} />} title="Leave Mgmt." />
              <FeatureButton icon={<UserIcon size={18} />} title="Teams" />
            </div>
            
            {/* CTA Button */}
            <motion.button
              className="px-8 py-3 bg-white text-blue-700 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center mb-10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/login")}
            >
              Get Started <ArrowRight className="ml-2" size={18} />
            </motion.button>
            
            {/* Stats */}
            <div className="flex justify-between max-w-md">
              <StatCard number="10" label="Years of Experience" />
              <StatCard number="3000" label="Happy Employees" />
              <StatCard number="200" label="Companies" />
            </div>
          </motion.div>
        </div>
        
        {/* Right section - Visual */}
        <div className="md:w-5/12 flex items-center justify-center h-full relative">
          <motion.div
            className="relative w-full h-full flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {/* Decorative elements */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 bg-blue-400 rounded-full opacity-20 filter blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 bg-indigo-500 rounded-full opacity-20 filter blur-3xl"></div>
            
            {/* Main visual element */}
            <motion.div 
              className="bg-white/10 backdrop-filter backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl w-11/12 max-w-md relative z-10"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="text-white/70 text-sm">HadirBOS Dashboard</div>
              </div>
              
              <div className="space-y-4">
                {/* Dashboard elements */}
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-white/80 text-xs mb-2">Today's Attendance</div>
                  <div className="flex justify-between items-center">
                    <div className="text-white font-bold text-2xl">87%</div>
                    <div className="flex space-x-1">
                      <div className="w-1 h-8 bg-blue-200 rounded-full"></div>
                      <div className="w-1 h-10 bg-blue-300 rounded-full"></div>
                      <div className="w-1 h-6 bg-blue-400 rounded-full"></div>
                      <div className="w-1 h-12 bg-blue-500 rounded-full"></div>
                      <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-white/80 text-xs">On Leave</div>
                    <div className="text-white font-bold">12</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-white/80 text-xs">Pending Requests</div>
                    <div className="text-white font-bold">8</div>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-white/80 text-xs mb-2">Team Performance</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">DC</div>
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">JL</div>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">KM</div>
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">AR</div>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs">+8</div>
                  </div>
                </div>
              </div>
              
              {/* Floating notification */}
              <motion.div 
                className="absolute -top-4 -right-4 bg-white p-2 rounded-lg shadow-lg flex items-center space-x-2"
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut",
                }}
              >
                <div className="bg-blue-100 p-1 rounded-md">
                  <UserCheck className="text-blue-600" size={16} />
                </div>
                <div className="text-xs">
                  <div className="font-medium text-gray-800">New check-in</div>
                  <div className="text-gray-500 text-2xs">Just now</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Add CSS for background pattern */}
      <style>{`
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E");
        }
        .text-2xs {
          font-size: 0.65rem;
        }
      `}</style>
    </div>
  );
};

export default HomePage;