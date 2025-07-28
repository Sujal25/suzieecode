const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { dbHelpers } = require('./database-mongo');
require('dotenv').config({ path: './config.env' });

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Check if session exists in database
    const session = await dbHelpers.getSession(token);
    if (!session) {
      return res.status(403).json({ message: 'Session expired' });
    }

    // Get user data  
    let user;
    if (decoded.userId === 'admin') {
      // Handle admin user
      user = {
        _id: 'admin',
        name: 'Admin',
        email: process.env.ADMIN_EMAIL,
        role: 'admin'
      };
    } else {
      user = await dbHelpers.getUserById(decoded.userId);
      if (!user) {
        return res.status(403).json({ message: 'User not found' });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = verifyToken(token);
      if (decoded) {
        const session = await dbHelpers.getSession(token);
        if (session) {
          const user = await dbHelpers.getUserById(decoded.userId);
          if (user) {
            req.user = user;
          }
        }
      }
    } catch (error) {
      // Ignore token errors for optional auth
    }
  }

  next();
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  authenticateToken,
  optionalAuth
}; 