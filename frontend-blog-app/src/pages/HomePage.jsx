import React, { useEffect, useState } from 'react';
import MainLayout from '../components/MainLayout';
//import { Link } from 'react-router-dom';
import { FaArrowRight, FaUserCheck, FaChartLine, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';
import HrLanding from "../assets/hr-landing.jpg";
import { useNavigate } from "react-router-dom";

const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-b-4 border-blue-600"
      whileHover={{ y: -8, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-blue-50 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
        <div className="text-blue-600 text-xl">{icon}</div>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

const StatCard = ({ number, label }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prevCount => {
        const nextCount = prevCount + Math.ceil(parseInt(number) / 20);
        return nextCount >= parseInt(number) ? parseInt(number) : nextCount;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [number]);
  
  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-900 bg-clip-text text-transparent">
        {count}+
      </span>
      <div className="text-2sm text-gray-600 from-gray-600 to-gray-900 mt-2 text-center font-medium">
        {label}
      </div>
    </motion.div>
  );
};

const TestimonialCard = ({ name, role, text, image }) => {
  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow-md"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-4">
        <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover mr-4" />
        <div>
          <h4 className="font-bold text-gray-800">{name}</h4>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
      <p className="text-gray-700 italic">"{text}"</p>
    </motion.div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <MainLayout>
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="absolute inset-0 opacity-20 bg-pattern"></div>
        
        <div className="relative w-full min-h-screen flex flex-col md:flex-row items-center justify-between px-4 md:px-16 py-16">
          {/* Left Section */}
          <motion.div 
            className="md:w-1/2 text-white z-10"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-8 py-2 bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              HadirBOS
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="drop-shadow-lg">Revolutionizing</span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                HR Management
              </span>
            </h1>
            
            <p className="text-lg md:text-xl mb-8 text-blue-100 max-w-lg">
              Streamline your HR operations with our comprehensive suite of tools designed for modern workplaces.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12 w-full">
              <motion.button 
                className="w-full px-8 py-4 bg-white text-blue-600 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")} 
              > 
                Get Started <FaArrowRight className="ml-2" />
              </motion.button>
            </div>
            
            <div className="flex justify-start space-x-16">
              <StatCard number="10" label="Years of Experience" />
              <StatCard number="3000" label="Happy Employees" />
              <StatCard number="200" label="Companies" />
            </div>
          </motion.div>
          
          {/* Right Section */}
          <motion.div 
            className="mt-16 md:mt-0 md:w-1/2 flex justify-center relative"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              <div className="w-72 h-96 md:w-96 md:h-[520px] bg-gradient-to-tr from-indigo-700 to-purple-700 rounded-2xl absolute -right-6 -top-6 transform rotate-3 opacity-70"></div>
              <div className="w-72 h-96 md:w-96 md:h-[520px] bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl absolute right-6 top-6 transform -rotate-3 opacity-70"></div>
              <img 
                src={HrLanding} 
                alt="HR Professional" 
                className="w-72 h-96 md:w-96 md:h-[520px] rounded-2xl object-cover relative z-10 shadow-2xl"
              />
              
              {/* Floating elements */}
              <motion.div 
                className="absolute top-8 -left-10 bg-white p-4 rounded-xl shadow-xl z-20 flex items-center space-x-3"
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut"
                }}
              >
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FaUserCheck className="text-blue-600 text-xl" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">Employee Onboarding</div>
                  <div className="text-xs text-gray-500">Simplified Process</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="absolute bottom-8 -right-12 bg-white p-4 rounded-xl shadow-xl z-20"
                animate={{ 
                  y: [0, 10, 0],
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 3.5,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <div className="font-semibold text-gray-800 mb-1">Performance</div>
                <div className="flex space-x-1">
                  <div className="w-2 h-10 bg-blue-200 rounded-full"></div>
                  <div className="w-2 h-14 bg-blue-400 rounded-full"></div>
                  <div className="w-2 h-8 bg-blue-300 rounded-full"></div>
                  <div className="w-2 h-12 bg-blue-500 rounded-full"></div>
                  <div className="w-2 h-16 bg-blue-600 rounded-full"></div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
            <path fill="#ffffff" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-20 px-4 md:px-16 bg-white">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Powerful HR Features
          </motion.h2>
          <motion.p 
            className="text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Everything you need to manage your workforce efficiently in one integrated platform
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<FaUserCheck />}
            title="Easy Attendance"
            description="Simplified attendance tracking with geolocation verification and real-time monitoring."
          />
          <FeatureCard 
            icon={<FaChartLine />}
            title="Performance Analytics"
            description="Track employee performance with intuitive dashboards and actionable insights."
          />
          <FeatureCard 
            icon={<FaCalendarAlt />}
            title="Leave Management"
            description="Streamline leave requests, approvals, and balance tracking."
          />
          <FeatureCard 
            icon={<FaUsers />}
            title="Team Management"
            description="Build and manage effective teams with detailed organizational structure."
          />
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="py-20 px-4 md:px-16 bg-gray-50">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Trusted by HR Professionals
          </motion.h2>
          <motion.p 
            className="text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            See what our users have to say about their experience
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TestimonialCard 
            name="Sarah Johnson"
            role="HR Director, TechCorp"
            text="HRManager has transformed how we handle employee data and attendance. The automation saves us countless hours every month."
            image="https://randomuser.me/api/portraits/women/32.jpg"
          />
          <TestimonialCard 
            name="David Chen"
            role="Operations Manager, Innovate Inc"
            text="The reporting features are exceptional. I can now make data-driven decisions about staffing and scheduling with confidence."
            image="https://randomuser.me/api/portraits/men/22.jpg"
          />
          <TestimonialCard 
            name="Michelle Rivera"
            role="HR Manager, Global Services"
            text="The employee onboarding process is now seamless. New hires get up to speed faster, and we've reduced paperwork by 85%."
            image="https://randomuser.me/api/portraits/women/45.jpg"
          />
        </div>
      </div>
      
      {/* CTA Section 
      <div className="relative py-20 px-4 md:px-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 opacity-10 bg-pattern"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Ready to Transform Your HR Operations?
            </motion.h2>
            <motion.p 
              className="text-blue-100 text-lg mb-8 max-w-lg"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Join thousands of companies already using HRManager to streamline their HR processes.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Link to="/login" className="px-8 py-3 bg-white text-blue-600 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center">
                Get Started <FaArrowRight className="ml-2" />
              </Link>
              <Link to="/contact" className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white hover:bg-opacity-10 transition-all">
                Contact Sales
              </Link>
            </motion.div>
          </div>
          
          <motion.div 
            className="md:w-1/3"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm p-8 rounded-2xl shadow-xl">
              <h3 className="text-xl font-bold mb-4">Request a Demo</h3>
              <form>
                <div className="mb-4">
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-blue-100 outline-none border border-transparent focus:border-white" 
                  />
                </div>
                <div className="mb-4">
                  <input 
                    type="email" 
                    placeholder="Work Email" 
                    className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-blue-100 outline-none border border-transparent focus:border-white" 
                  />
                </div>
                <div className="mb-4">
                  <input 
                    type="text" 
                    placeholder="Company Name" 
                    className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-blue-100 outline-none border border-transparent focus:border-white" 
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full p-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-all"
                >
                  Schedule Demo
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>*/}
      
      {/* Add CSS for background pattern */}
      <style jsx>{`
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E");
        }
      `}</style>
    </MainLayout>
  );
};

export default HomePage;