// client/src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  
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
    
    // Fetch all users
    const fetchUsers = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        const { data } = await axios.get('http://localhost:5000/api/users', config);
        // Filter users to only include those with 'employee' role
        const employeeUsers = data.filter(user => user.role === 'employee');
        setUsers(employeeUsers);
        setLoading(false);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to fetch users'
        );
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [navigate, userInfo]);
  
  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
        <div>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-md mr-2 hover:bg-blue-700"
            onClick={() => navigate('/admin/add-user')}
          >
            Add New User
          </button>
          <button 
            className="bg-white text-red-600 px-4 py-2 border border-red-600 rounded-md hover:bg-red-50"
            onClick={logoutHandler}
          >
            Logout
          </button>
        </div>
      </div>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Employees</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Department</th>
                  <th className="py-3 px-4 text-left">Position</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.department}</td>
                    <td className="py-3 px-4">{user.position}</td>
                    <td className="py-3 px-4">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm mr-2 hover:bg-blue-600"
                        onClick={() => navigate(`/admin/edit-user/${user._id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        onClick={async () => {
                          if (window.confirm(`Delete user ${user.name}?`)) {
                            try {
                              await axios.delete(`http://localhost:5000/api/users/${user._id}`, {
                                headers: {
                                  Authorization: `Bearer ${userInfo.token}`,
                                },
                              });
                              setUsers(users.filter((u) => u._id !== user._id));
                            } catch (error) {
                              alert('Failed to delete user');
                            }
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;