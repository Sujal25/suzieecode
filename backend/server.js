const express = require('express');
const cors = require('cors');
const { connectDB, dbHelpers } = require('./database-mongo');
const { generateToken, hashPassword, comparePassword, authenticateToken } = require('./auth');
const { generateOTP, sendOTP, sendWelcomeEmail, sendPasswordResetOTP } = require('./emailService');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true
}));
app.use(express.json());

// Connect MongoDB
connectDB()
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AttendEase backend is running' });
});

// Send OTP for login
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if user exists
    const user = await dbHelpers.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await dbHelpers.saveOTP(email, otp, expiresAt);

    // Send OTP via email
    const emailResult = await sendOTP(email, otp);
    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ 
      message: 'OTP sent successfully',
      email: email // Return email for frontend reference
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send OTP for password reset
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if user exists
    const user = await dbHelpers.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await dbHelpers.saveOTP(email, otp, expiresAt);

    // Send password reset OTP via email
    const emailResult = await sendPasswordResetOTP(email, otp);
    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send password reset OTP email' });
    }

    res.json({ 
      message: 'Password reset OTP sent successfully',
      email: email
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset password with OTP
app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Verify OTP
    const otpRecord = await dbHelpers.verifyOTP(email, otp);
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Get user data
    const user = await dbHelpers.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await dbHelpers.updateUserPassword(user._id, hashedPassword);

    // Delete used OTP
    await dbHelpers.deleteOTP(email);

    // Invalidate all existing sessions for this user
    await dbHelpers.deleteUserSessions(user._id);

    res.json({
      message: 'Password reset successful. Please login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify OTP and login
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Verify OTP
    const otpRecord = await dbHelpers.verifyOTP(email, otp);
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Get user data
    const user = await dbHelpers.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate JWT token
    const token = generateToken(user._id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Save session
    await dbHelpers.saveSession(user._id, token, expiresAt);

    // Delete used OTP
    await dbHelpers.deleteOTP(email);

    // Return user data (without password) and token
    const { password, ...userData } = user;
    res.json({
      message: 'Login successful',
      user: userData,
      token
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Register new user
app.post('/api/register', async (req, res) => {
  try {
    const { student_id, name, email, password, branch, semester, batch } = req.body;

    // Validate required fields
    if (!student_id || !name || !email || !password || !branch || !semester || !batch) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if user already exists by email
    const existingUserByEmail = await dbHelpers.getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    // Check if user already exists by student_id
    const existingUserByStudentId = await dbHelpers.getUserByStudentId(student_id);
    if (existingUserByStudentId) {
      return res.status(409).json({ message: 'An account with this student ID already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userData = {
      student_id,
      name,
      email,
      password: hashedPassword,
      branch,
      semester: parseInt(semester),
      batch
    };

    const newUser = await dbHelpers.createUser(userData);

    // Send welcome email
    await sendWelcomeEmail(email, name);

    // Return user data (without password)
    const { password: _, ...userResponse } = newUser;
    res.status(201).json({
      message: 'Registration successful',
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000 || error.name === 'MongoServerError') {
      const field = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'field';
      if (field === 'email') {
        return res.status(409).json({ message: 'An account with this email already exists' });
      } else if (field === 'student_id') {
        return res.status(409).json({ message: 'An account with this student ID already exists' });
      } else {
        return res.status(409).json({ message: 'Student ID or email already exists' });
      }
    }
    
    // Handle SQLite unique constraint errors (fallback)
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ message: 'Student ID or email already exists' });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login with password (alternative to OTP)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Get user
    const user = await dbHelpers.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user._id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Save session
    await dbHelpers.saveSession(user._id, token, expiresAt);

    // Return user data (without password) and token
    const { password: _, ...userData } = user;
    res.json({
      message: 'Login successful',
      user: userData,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout
app.post('/api/logout', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      await dbHelpers.deleteSession(token);
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user profile
app.get('/api/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const session = await dbHelpers.getSession(token);
    if (!session) {
      return res.status(401).json({ message: 'Session expired' });
    }

    const user = await dbHelpers.getUserById(session.user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password, ...userData } = user;
    res.json({ user: userData });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ATTENDANCE ROUTES

// Mark attendance
app.post('/api/attendance', authenticateToken, async (req, res) => {
  try {
    const { subject, date, isPresent = true, status } = req.body;
    const userId = req.user._id;

    if (!subject || !date) {
      return res.status(400).json({ message: 'Subject and date are required' });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: 'Date must be in YYYY-MM-DD format' });
    }

    // Handle "Day Off" status by deleting attendance record
    if (status === 'off') {
      await dbHelpers.deleteAttendance(userId, subject, date);
      return res.json({ 
        message: 'Day off marked successfully',
        data: { subject, date, status: 'off' }
      });
    }

    // Mark attendance as present/absent
    await dbHelpers.markAttendance(userId, subject, date, isPresent);

    res.json({ 
      message: 'Attendance marked successfully',
      data: { subject, date, isPresent }
    });

  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get attendance for user
app.get('/api/attendance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate, subject } = req.query;

    let attendance;
    
    if (subject) {
      attendance = await dbHelpers.getAttendanceBySubject(userId, subject);
    } else {
      attendance = await dbHelpers.getAttendance(userId, startDate, endDate);
    }

    res.json({ attendance });

  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get attendance statistics
app.get('/api/attendance/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const stats = await dbHelpers.getAttendanceStats(userId);
    
    res.json({ stats });

  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get timetable (batch-wise)
app.get('/api/timetable/:batch', authenticateToken, async (req, res) => {
  try {
    const { batch } = req.params;
    
    // Sample timetable - in a real app, this would come from database
    const timetable = {
      batch,
      schedule: {
        Monday: [
          { time: '09:00-10:00', subject: 'Data Structures', room: 'CSE-101' },
          { time: '10:00-11:00', subject: 'Operating Systems', room: 'CSE-102' },
          { time: '11:30-12:30', subject: 'Database Systems', room: 'CSE-103' },
          { time: '13:30-14:30', subject: 'Computer Networks', room: 'CSE-104' }
        ],
        Tuesday: [
          { time: '09:00-10:00', subject: 'Algorithms', room: 'CSE-101' },
          { time: '10:00-11:00', subject: 'Software Engineering', room: 'CSE-102' },
          { time: '11:30-12:30', subject: 'Machine Learning', room: 'CSE-103' },
          { time: '13:30-14:30', subject: 'Web Development', room: 'CSE-104' }
        ],
        Wednesday: [
          { time: '09:00-10:00', subject: 'Data Structures', room: 'CSE-101' },
          { time: '10:00-11:00', subject: 'Operating Systems', room: 'CSE-102' },
          { time: '11:30-12:30', subject: 'Database Systems', room: 'CSE-103' }
        ],
        Thursday: [
          { time: '09:00-10:00', subject: 'Algorithms', room: 'CSE-101' },
          { time: '10:00-11:00', subject: 'Software Engineering', room: 'CSE-102' },
          { time: '11:30-12:30', subject: 'Machine Learning', room: 'CSE-103' },
          { time: '13:30-14:30', subject: 'Computer Networks', room: 'CSE-104' }
        ],
        Friday: [
          { time: '09:00-10:00', subject: 'Data Structures', room: 'CSE-101' },
          { time: '10:00-11:00', subject: 'Web Development', room: 'CSE-104' },
          { time: '11:30-12:30', subject: 'Machine Learning', room: 'CSE-103' }
        ]
      }
    };
    
    res.json({ timetable });

  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ADMIN ROUTES

// Admin login (using email/password from environment variables)
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check admin credentials from environment variables
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Create admin user object for token generation
    const adminUser = {
      _id: 'admin',
      email: email,
      name: 'Admin',
      role: 'admin'
    };

    // Generate JWT token
    const token = generateToken('admin');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Save session
    await dbHelpers.saveSession('admin', token, expiresAt);

    res.json({
      message: 'Admin login successful',
      user: adminUser,
      token
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all users (Admin only)
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user._id !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const users = await dbHelpers.getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
