import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../src/services/api';

export default function AdminDashboardPage({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      setUsers(response.users || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) {
      onLogout();
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.batch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen dark:bg-deep-900 bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-accent-500">
            🔐 Admin Dashboard
          </h1>
          <p className="text-light-200 mt-1">
            Manage AttendEase Users & Attendance
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          className="glass bg-deep-800/80 rounded-xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-accent-500">{users.length}</div>
          <div className="text-light-200">Total Users</div>
        </motion.div>

        <motion.div
          className="glass bg-deep-800/80 rounded-xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="text-3xl mb-2">🎓</div>
          <div className="text-2xl font-bold text-green-500">
            {users.filter(u => u.branch === 'CSE').length}
          </div>
          <div className="text-light-200">CSE Students</div>
        </motion.div>

        <motion.div
          className="glass bg-deep-800/80 rounded-xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-3xl mb-2">📅</div>
          <div className="text-2xl font-bold text-blue-500">
            {users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length}
          </div>
          <div className="text-light-200">New This Week</div>
        </motion.div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search users by name, email, student ID, or batch..."
          className="w-full px-4 py-3 rounded-lg border border-white/10 bg-deep-800 text-light-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <motion.div
        className="glass bg-deep-800/80 rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-accent-500 mb-4">
            📋 Registered Users ({filteredUsers.length})
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⏳</div>
              <div className="text-light-200">Loading users...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">❌</div>
              <div className="text-red-400">{error}</div>
              <button
                onClick={fetchUsers}
                className="mt-4 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">👤</div>
              <div className="text-light-200">
                {searchTerm ? 'No users found matching your search.' : 'No users registered yet.'}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-accent-500 font-semibold">#</th>
                    <th className="text-left py-3 px-4 text-accent-500 font-semibold">Student ID</th>
                    <th className="text-left py-3 px-4 text-accent-500 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-accent-500 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 text-accent-500 font-semibold">Branch</th>
                    <th className="text-left py-3 px-4 text-accent-500 font-semibold">Semester</th>
                    <th className="text-left py-3 px-4 text-accent-500 font-semibold">Batch</th>
                    <th className="text-left py-3 px-4 text-accent-500 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr 
                      key={user._id} 
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4 text-light-200">{index + 1}</td>
                      <td className="py-3 px-4 text-light-100 font-mono">{user.student_id}</td>
                      <td className="py-3 px-4 text-light-100 font-semibold">{user.name}</td>
                      <td className="py-3 px-4 text-light-200">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-accent-600/20 text-accent-400 rounded text-sm">
                          {user.branch}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-light-200">{user.semester}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-sm">
                          {user.batch}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-light-200">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
}
