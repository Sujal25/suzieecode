const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendease', {
      // Remove deprecated options - they are no longer needed in MongoDB driver v4.0+
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  }
}, {
  timestamps: true
});

// OTP Schema
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  expires_at: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // Auto delete when expires
  }
}, {
  timestamps: true
});

// Session Schema
const sessionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and String for admin
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expires_at: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // Auto delete when expires
  }
}, {
  timestamps: true
});

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD format
    required: true
  },
  is_present: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for unique attendance per user, subject, and date
attendanceSchema.index({ user_id: 1, subject: 1, date: 1 }, { unique: true });

// Note: Removed auto-deletion to preserve attendance data permanently
// Data will be preserved even after logout/login

// Create Models
const User = mongoose.model('User', userSchema);
const OTP = mongoose.model('OTP', otpSchema);
const Session = mongoose.model('Session', sessionSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);

// Database helper functions
const dbHelpers = {
  // User operations
  createUser: async (userData) => {
    try {
      const user = new User(userData);
      const savedUser = await user.save();
      return savedUser.toObject();
    } catch (error) {
      throw error;
    }
  },

  getUserByEmail: async (email) => {
    try {
      return await User.findOne({ email }).lean();
    } catch (error) {
      throw error;
    }
  },

  getUserByStudentId: async (student_id) => {
    try {
      return await User.findOne({ student_id }).lean();
    } catch (error) {
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      return await User.findById(id).lean();
    } catch (error) {
      throw error;
    }
  },

  getAllUsers: async () => {
    try {
      return await User.find({ role: 'student' }).select('-password').lean();
    } catch (error) {
      throw error;
    }
  },

  // OTP operations
  saveOTP: async (email, otp, expiresAt) => {
    try {
      // Delete existing OTP for this email
      await OTP.deleteMany({ email });
      
      // Create new OTP
      const otpDoc = new OTP({
        email,
        otp,
        expires_at: expiresAt
      });
      
      return await otpDoc.save();
    } catch (error) {
      throw error;
    }
  },

  verifyOTP: async (email, otp) => {
    try {
      return await OTP.findOne({
        email,
        otp,
        expires_at: { $gt: new Date() }
      }).lean();
    } catch (error) {
      throw error;
    }
  },

  deleteOTP: async (email) => {
    try {
      await OTP.deleteMany({ email });
    } catch (error) {
      throw error;
    }
  },

  // Session operations
  saveSession: async (userId, token, expiresAt) => {
    try {
      const session = new Session({
        user_id: userId,
        token,
        expires_at: expiresAt
      });
      return await session.save();
    } catch (error) {
      throw error;
    }
  },

  getSession: async (token) => {
    try {
      return await Session.findOne({
        token,
        expires_at: { $gt: new Date() }
      }).lean();
    } catch (error) {
      throw error;
    }
  },

  deleteSession: async (token) => {
    try {
      await Session.deleteOne({ token });
    } catch (error) {
      throw error;
    }
  },

  // Attendance operations
  markAttendance: async (userId, subject, date, isPresent = true) => {
    try {
      const attendance = await Attendance.findOneAndUpdate(
        { user_id: userId, subject, date },
        { is_present: isPresent },
        { upsert: true, new: true }
      );
      return attendance;
    } catch (error) {
      throw error;
    }
  },

  getAttendance: async (userId, startDate = null, endDate = null) => {
    try {
      let query = { user_id: userId };
      
      if (startDate && endDate) {
        query.date = { $gte: startDate, $lte: endDate };
      }
      
      return await Attendance.find(query).sort({ date: -1 }).lean();
    } catch (error) {
      throw error;
    }
  },

  getAttendanceBySubject: async (userId, subject) => {
    try {
      return await Attendance.find({
        user_id: userId,
        subject
      }).sort({ date: -1 }).lean();
    } catch (error) {
      throw error;
    }
  },

  deleteAttendance: async (userId, subject, date) => {
    try {
      await Attendance.deleteOne({
        user_id: userId,
        subject,
        date
      });
    } catch (error) {
      throw error;
    }
  },

  getAttendanceStats: async (userId) => {
    try {
      const stats = await Attendance.aggregate([
        { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$subject',
            total_classes: { $sum: 1 },
            attended_classes: {
              $sum: { $cond: [{ $eq: ['$is_present', true] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            subject: '$_id',
            total_classes: 1,
            attended_classes: 1,
            percentage: {
              $round: [
                { $multiply: [{ $divide: ['$attended_classes', '$total_classes'] }, 100] },
                2
              ]
            }
          }
        }
      ]);
      
      return stats;
    } catch (error) {
      throw error;
    }
  },

  // Clean old attendance data (this is handled automatically by MongoDB TTL)
  cleanOldAttendance: async () => {
    try {
      // MongoDB TTL will handle this automatically
      console.log('Old attendance cleanup handled by MongoDB TTL');
      return { deleted: 0 };
    } catch (error) {
      throw error;
    }
  },

  // Password reset operations
  updateUserPassword: async (userId, hashedPassword) => {
    try {
      await User.findByIdAndUpdate(userId, { password: hashedPassword });
    } catch (error) {
      throw error;
    }
  },

  deleteUserSessions: async (userId) => {
    try {
      await Session.deleteMany({ user_id: userId });
    } catch (error) {
      throw error;
    }
  },

  // Admin operations
  getUsersWithAttendanceStats: async () => {
    try {
      const users = await User.aggregate([
        { $match: { role: 'student' } },
        {
          $lookup: {
            from: 'attendances',
            localField: '_id',
            foreignField: 'user_id',
            as: 'attendance_records'
          }
        },
        {
          $project: {
            password: 0,
            attendance_records: 0
          }
        },
        {
          $addFields: {
            total_attendance_records: { $size: '$attendance_records' }
          }
        }
      ]);
      
      return users;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = { connectDB, dbHelpers, User, OTP, Session, Attendance };
