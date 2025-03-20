import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EmployeeDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  
  useEffect(() => {
    // Check if user is logged in
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    // Get employee profile
    const fetchProfile = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        const { data } = await axios.get('http://localhost:5000/api/auth/profile', config);
        setProfile(data);
        setLoading(false);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to fetch profile'
        );
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [navigate, userInfo]);
  
  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Employee Dashboard</h2>
        <button 
          className="bg-white text-red-600 px-4 py-2 border border-red-600 rounded-md hover:bg-red-50"
          onClick={logoutHandler}
        >
          Logout
        </button>
      </div>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : profile ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-4">
            <h3 className="text-xl font-bold">Employee Profile</h3>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-700"><strong>Name:</strong> {profile.name}</p>
                <p className="text-gray-700"><strong>Email:</strong> {profile.email}</p>
              </div>
              <div>
                <p className="text-gray-700"><strong>Department:</strong> {profile.department}</p>
                <p className="text-gray-700"><strong>Position:</strong> {profile.position}</p>
                <p className="text-gray-700"><strong>Join Date:</strong> {formatDate(profile.joinDate)}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 text-center">No profile data found.</p>
      )}
    </div>
  );
};

export default EmployeeDashboard;
