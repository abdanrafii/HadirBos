// client/src/pages/EditUser.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EditUser = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: '',
    position: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
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
        setFormData({
          name: data.name,
          email: data.email,
          password: '',
          role: data.role,
          department: data.department,
          position: data.position
        });
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
      
      // Only include password if it's been changed
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-4">
            <h3 className="text-xl font-bold">Edit User</h3>
          </div>
          <div className="p-6">
            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
            
            {fetchLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <form onSubmit={submitHandler}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    id="name"
                    name="name"
                    value={name}
                    onChange={onChange}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    id="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                    Password <span className="text-sm font-normal text-gray-500">(Leave blank to keep current)</span>
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    id="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    id="role"
                    name="role"
                    value={role}
                    onChange={onChange}
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="department" className="block text-gray-700 text-sm font-bold mb-2">Department</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    id="department"
                    name="department"
                    value={department}
                    onChange={onChange}
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="position" className="block text-gray-700 text-sm font-bold mb-2">Position</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    id="position"
                    name="position"
                    value={position}
                    onChange={onChange}
                    required
                  />
                </div>
                
                <div className="flex justify-between">
                  <button 
                    type="button" 
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                    onClick={() => navigate('/admin/dashboard')}
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update User'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUser;