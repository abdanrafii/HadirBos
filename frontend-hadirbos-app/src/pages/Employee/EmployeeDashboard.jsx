import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EmployeeDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('attendance');
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState('present');
  const [attendanceNote, setAttendanceNote] = useState('');
  const [attendanceSuccess, setAttendanceSuccess] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  const [todayAttendance, setTodayAttendance] = useState(null);
  
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  
  useEffect(() => {
    // Check if user is logged in
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    // Get employee profile
    const fetchData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        const { data: profileData } = await axios.get('http://localhost:5000/api/auth/profile', config);
        setProfile(profileData);
        
        // Get attendance data
        const { data: attendanceResponse } = await axios.get('http://localhost:5000/api/attendance', config);
        setAttendanceData(attendanceResponse);
        
        // Check if attendance was already submitted today
        const today = new Date().toISOString().split('T')[0];
        const todayEntry = attendanceResponse.find(entry => 
          new Date(entry.date).toISOString().split('T')[0] === today
        );
        
        if (todayEntry) {
          setTodayAttendance(todayEntry);
        }
        
        setLoading(false);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to fetch data'
        );
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, userInfo]);
  
  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };
  
  const submitAttendance = async (e) => {
    e.preventDefault();
    setAttendanceLoading(true);
    setAttendanceError('');
    setAttendanceSuccess(false);
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const attendancePayload = {
        status: attendanceStatus,
        note: attendanceNote,
        employeeId: profile._id,
      };
      
      const { data } = await axios.post(
        'http://localhost:5000/api/attendance',
        attendancePayload,
        config
      );
      
      setAttendanceData([data, ...attendanceData]);
      setTodayAttendance(data);
      setAttendanceSuccess(true);
      setAttendanceNote('');
      
      // Show success message for 3 seconds
      setTimeout(() => {
        setAttendanceSuccess(false);
      }, 3000);
      
    } catch (error) {
      setAttendanceError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to submit attendance'
      );
    }
    
    setAttendanceLoading(false);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'sick':
        return 'bg-orange-100 text-orange-800';
      case 'leave':
        return 'bg-blue-100 text-blue-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-white p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Employee Portal</h1>
                {profile && <p className="text-blue-100">Welcome, {profile.name}</p>}
              </div>
            </div>
            <button 
              className="bg-white text-red-600 px-4 py-2 rounded-md hover:bg-red-50 transition-colors duration-200 flex items-center space-x-1"
              onClick={logoutHandler}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 flex flex-col items-center">
                  <div className="w-24 h-24 bg-gray-300 rounded-full mb-4 flex items-center justify-center text-gray-600 text-3xl font-bold">
                    {profile.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-white">{profile.name}</h3>
                  <p className="text-blue-100">{profile.position}</p>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-3 p-2 hover:bg-gray-50 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">{profile.email}</span>
                  </div>
                  <div className="flex items-center mb-3 p-2 hover:bg-gray-50 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-gray-700">{profile.department}</span>
                  </div>
                  <div className="flex items-center mb-3 p-2 hover:bg-gray-50 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">Joined: {formatDate(profile.joinDate)}</span>
                  </div>
                </div>
                
                <div className="px-4 pb-4">
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Quick Links</h4>
                    <div 
                      className={`flex items-center p-2 rounded cursor-pointer ${activeTab === 'attendance' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'}`}
                      onClick={() => setActiveTab('attendance')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>Attendance</span>
                    </div>
                    <div 
                      className={`flex items-center p-2 rounded cursor-pointer ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'}`}
                      onClick={() => setActiveTab('profile')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>My Profile</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'attendance' && (
                <div className="space-y-6">
                  {/* Clock In/Out Card */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                      <h3 className="text-xl font-bold text-white flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Today's Attendance
                      </h3>
                    </div>
                    <div className="p-6">
                      {todayAttendance ? (
                        <div className="text-center">
                          <div className={`inline-block px-4 py-2 rounded-full text-lg font-semibold mb-4 ${getStatusColor(todayAttendance.status)}`}>
                            {todayAttendance.status.charAt(0).toUpperCase() + todayAttendance.status.slice(1)}
                          </div>
                          <p className="text-gray-700 mb-2">Submitted at: {formatTime(todayAttendance.createdAt)}</p>
                          {todayAttendance.note && (
                            <p className="text-gray-700 italic">"{todayAttendance.note}"</p>
                          )}
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-blue-700">You've already submitted your attendance for today.</p>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={submitAttendance}>
                          {attendanceSuccess && (
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                              Attendance submitted successfully!
                            </div>
                          )}
                          
                          {attendanceError && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                              {attendanceError}
                            </div>
                          )}
                          
                          <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="attendanceStatus">
                              Status:
                            </label>
                            <select
                              id="attendanceStatus"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={attendanceStatus}
                              onChange={(e) => setAttendanceStatus(e.target.value)}
                            >
                              <option value="present">Present</option>
                              <option value="late">Late</option>
                              <option value="sick">Sick</option>
                              <option value="leave">Leave</option>
                            </select>
                          </div>
                          
                          <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="attendanceNote">
                              Note (optional):
                            </label>
                            <textarea
                              id="attendanceNote"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="3"
                              placeholder="Add a note about your attendance status..."
                              value={attendanceNote}
                              onChange={(e) => setAttendanceNote(e.target.value)}
                            ></textarea>
                          </div>
                          
                          <div className="flex justify-center">
                            <button
                              type="submit"
                              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-md hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 flex items-center"
                              disabled={attendanceLoading}
                            >
                              {attendanceLoading ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Submit Attendance
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                  
                  {/* Recent Attendance Records */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                      <h3 className="text-xl font-bold text-white flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Recent Attendance History
                      </h3>
                    </div>
                    <div className="p-6 overflow-x-auto">
                      {attendanceData.length > 0 ? (
                        <table className="min-w-full bg-white">
                          <thead>
                            <tr className="bg-gray-50 border-b">
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {attendanceData.slice(0, 5).map((record, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-700">{formatDate(record.createdAt)}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{formatTime(record.createdAt)}</td>
                                <td className="py-3 px-4">
                                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                  {record.note || <span className="text-gray-400 italic">No note</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No attendance records found.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'profile' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Employee Profile
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">FULL NAME</label>
                          <p className="text-gray-800 font-medium">{profile.name}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">EMAIL ADDRESS</label>
                          <p className="text-gray-800 font-medium">{profile.email}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">EMPLOYEE ID</label>
                          <p className="text-gray-800 font-medium">{profile._id || 'EMP-' + Math.floor(Math.random() * 10000)}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">DEPARTMENT</label>
                          <p className="text-gray-800 font-medium">{profile.department}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">POSITION</label>
                          <p className="text-gray-800 font-medium">{profile.position}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">JOIN DATE</label>
                          <p className="text-gray-800 font-medium">{formatDate(profile.joinDate)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t">
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">Contact Information</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">PHONE NUMBER</label>
                          <p className="text-gray-800 font-medium">{profile.phone || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">ADDRESS</label>
                          <p className="text-gray-800 font-medium">{profile.address || '-'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 text-lg">No profile data found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;