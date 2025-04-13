import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Briefcase, Award, ChevronLeft } from 'lucide-react';

const EditUser = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    position: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [originalUser, setOriginalUser] = useState(null);
  const navigate = useNavigate();
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  
  const { name, email, password, role, department, position } = formData;
  
  useEffect(() => {
    // Check if user is logged in and is admin
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    if (userInfo.role !== 'admin') {
      navigate('/employee/dashboard');
      return;
    }
    
    // Fetch user data
    const fetchUser = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        const { data } = await axios.get(`http://localhost:5000/api/users/${id}`, config);
        
        // Store original user data
        setOriginalUser(data);
        
        setFetchLoading(false);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to fetch user data'
        );
        setFetchLoading(false);
      }
    };
    
    fetchUser();
  }, [id, navigate, userInfo]);
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      // Buat objek update dengan data yang berubah
      const updateData = {};
      
      // Bandingkan setiap field dengan data asli
      if (name !== originalUser.name) updateData.name = name;
      if (email !== originalUser.email) updateData.email = email;
      if (password) updateData.password = password;
      if (role !== originalUser.role) updateData.role = role;
      if (department !== originalUser.department) updateData.department = department;
      if (position !== originalUser.position) updateData.position = position;
      
      await axios.put(
        `http://localhost:5000/api/users/${id}`,
        updateData,
        config
      );
      
      setLoading(false);
      navigate('/admin/dashboard');
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to update user'
      );
      setLoading(false);
    }
  };
  
  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 transform transition-all duration-300 hover:shadow-3xl">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-8 py-6 flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-wide flex items-center">
              <User className="mr-3 w-7 h-7" /> Edit User Account
            </h3>
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}
            
            <form onSubmit={submitHandler} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-semibold mb-2 flex items-center">
                    <User className="mr-2 w-5 h-5 text-indigo-600" /> 
                    Full Name 
                    <span className="ml-2 text-sm text-gray-500">
                      (Current: {originalUser.name})
                    </span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    id="name"
                    name="name"
                    value={name}
                    onChange={onChange}
                    placeholder={`Change from ${originalUser.name}`}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-semibold mb-2 flex items-center">
                    <Mail className="mr-2 w-5 h-5 text-indigo-600" /> 
                    Email Address 
                    <span className="ml-2 text-sm text-gray-500">
                      (Current: {originalUser.email})
                    </span>
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    id="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    placeholder={`Change from ${originalUser.email}`}
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-gray-700 font-semibold mb-2 flex items-center">
                    <Lock className="mr-2 w-5 h-5 text-indigo-600" /> 
                    Password 
                    <span className="ml-2 text-sm text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    id="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    placeholder="Enter new password"
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-gray-700 font-semibold mb-2 flex items-center">
                    <Award className="mr-2 w-5 h-5 text-indigo-600" /> 
                    User Role 
                    <span className="ml-2 text-sm text-gray-500">
                      (Current: {originalUser.role})
                    </span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    id="role"
                    name="role"
                    value={role}
                    onChange={onChange}
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="department" className="block text-gray-700 font-semibold mb-2 flex items-center">
                    <Briefcase className="mr-2 w-5 h-5 text-indigo-600" /> 
                    Department 
                    <span className="ml-2 text-sm text-gray-500">
                      (Current: {originalUser.department})
                    </span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    id="department"
                    name="department"
                    value={department}
                    onChange={onChange}
                    placeholder={`Change from ${originalUser.department}`}
                  />
                </div>
                
                <div>
                  <label htmlFor="position" className="block text-gray-700 font-semibold mb-2 flex items-center">
                    <Award className="mr-2 w-5 h-5 text-indigo-600" /> 
                    Position 
                    <span className="ml-2 text-sm text-gray-500">
                      (Current: {originalUser.position})
                    </span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    id="position"
                    name="position"
                    value={position}
                    onChange={onChange}
                    placeholder={`Change from ${originalUser.position}`}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button 
                  type="button" 
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg hover:from-indigo-700 hover:to-purple-800 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUser;