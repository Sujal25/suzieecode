import { useState } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../src/services/api';

export default function AdminLoginPage({ onAdminLogin }) {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!credentials.email || !credentials.password) {
      setMessage('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await adminAPI.login(credentials.email, credentials.password);
      
      setMessage('Admin login successful!');
      
      // Store admin token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Call admin login callback
      if (onAdminLogin) {
        onAdminLogin(response.user);
      }
      
    } catch (error) {
      setMessage(error.message || 'Admin login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-deep-900 bg-gray-100">
      <motion.div
        className="glass rounded-2xl p-8 w-full max-w-md flex flex-col gap-6 items-center bg-deep-800/80 border border-white/10 shadow-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Admin Icon */}
        <div className="text-6xl mb-2" aria-hidden="true">
          <span role="img" aria-label="admin">🔐</span>
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-poppins font-bold text-accent-500 mb-2 text-center">
          Admin Panel
        </h1>
        <p className="text-light-200 text-center mb-4">
          AttendEase Administration
        </p>

        {/* Admin Login Form */}
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 font-medium text-light-100">
            Admin Email
            <input
              type="email"
              name="email"
              className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 focus:outline-none focus:ring-2 focus:ring-accent-500 font-inter text-base"
              placeholder="admin@attendease.com"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="flex flex-col gap-1 font-medium text-light-100">
            Admin Password
            <input
              type="password"
              name="password"
              className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 focus:outline-none focus:ring-2 focus:ring-accent-500 font-inter text-base"
              placeholder="Enter admin password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </label>

          {message && (
            <div className={`text-sm p-3 rounded-lg ${
              message.includes('successful') 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 bg-accent-600 hover:bg-accent-700 disabled:bg-accent-600/50 text-white font-bold py-3 rounded-xl shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Admin Login'}
          </button>
        </form>

        {/* Back to Student Login */}
        <div className="text-light-200 text-sm text-center">
          <button 
            onClick={() => window.location.href = '/'}
            className="text-accent-500 hover:text-accent-400 font-medium underline"
          >
            Back to Student Login
          </button>
        </div>

        {/* Admin Credentials Info */}
        <div className="text-xs text-light-200/60 text-center mt-4 p-3 bg-deep-900/50 rounded-lg">
          <p className="font-semibold mb-1">Default Admin Credentials:</p>
          <p>Email: admin@attendease.com</p>
          <p>Password: admin123secure</p>
          <p className="mt-2 text-yellow-400">⚠️ Change these in production!</p>
        </div>
      </motion.div>
    </div>
  );
}
