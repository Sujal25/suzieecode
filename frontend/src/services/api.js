const API_BASE_URL = '${import.meta.env.VITE_API_URL}/api';

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

// Authentication API
export const authAPI = {
  // Send OTP for login
  sendOTP: async (email) => {
    const response = await fetch(`${API_BASE_URL}/send-otp`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  },

  // Verify OTP and login
  verifyOTP: async (email, otp) => {
    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, otp })
    });
    return handleResponse(response);
  },

  // Register new user
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  // Login with password
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  // Logout
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get current user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Forgot password - send OTP
  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  },

  // Reset password with OTP
  resetPassword: async (email, otp, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, otp, newPassword })
    });
    return handleResponse(response);
  }
};

// Attendance API
export const attendanceAPI = {
  // Mark attendance
  markAttendance: async (subject, date, isPresent = true) => {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ subject, date, isPresent })
    });
    return handleResponse(response);
  },

  // Get attendance for user
  getAttendance: async (startDate = null, endDate = null, subject = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (subject) params.append('subject', subject);
    
    const response = await fetch(`${API_BASE_URL}/attendance?${params}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get attendance statistics
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/attendance/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Clean old attendance data
  cleanup: async () => {
    const response = await fetch(`${API_BASE_URL}/attendance/cleanup`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Timetable API
export const timetableAPI = {
  // Get timetable for batch
  getTimetable: async (batch) => {
    const response = await fetch(`${API_BASE_URL}/timetable/${batch}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Admin API
export const adminAPI = {
  // Admin login
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  // Get all users
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get user attendance details
  getUserAttendance: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/attendance`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Health check
export const healthCheck = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(response);
};

export default {
  auth: authAPI,
  attendance: attendanceAPI,
  timetable: timetableAPI,
  admin: adminAPI,
  healthCheck
};
