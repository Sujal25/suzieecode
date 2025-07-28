const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          branch TEXT NOT NULL,
          semester INTEGER NOT NULL,
          batch TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // OTP table for verification
      db.run(`
        CREATE TABLE IF NOT EXISTS otp_codes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL,
          otp TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Sessions table for JWT tokens
      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Attendance table
      db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          subject TEXT NOT NULL,
          date DATE NOT NULL,
          is_present BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          UNIQUE(user_id, subject, date)
        )
      `);

      // Create index for auto-delete (older than 10 days)
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_attendance_date 
        ON attendance(created_at)
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
};

// Database helper functions
const dbHelpers = {
  // User operations
  createUser: (userData) => {
    return new Promise((resolve, reject) => {
      const { student_id, name, email, password, branch, semester, batch } = userData;
      db.run(
        'INSERT INTO users (student_id, name, email, password, branch, semester, batch) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [student_id, name, email, password, branch, semester, batch],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...userData });
        }
      );
    });
  },

  getUserByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  getUserByStudentId: (student_id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE student_id = ?', [student_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  getUserById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // OTP operations
  saveOTP: (email, otp, expiresAt) => {
    return new Promise((resolve, reject) => {
      // Delete existing OTP for this email
      db.run('DELETE FROM otp_codes WHERE email = ?', [email], (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Insert new OTP
        db.run(
          'INSERT INTO otp_codes (email, otp, expires_at) VALUES (?, ?, ?)',
          [email, otp, expiresAt],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });
    });
  },

  verifyOTP: (email, otp) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM otp_codes WHERE email = ? AND otp = ? AND expires_at > datetime("now")',
        [email, otp],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  },

  deleteOTP: (email) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM otp_codes WHERE email = ?', [email], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  // Session operations
  saveSession: (userId, token, expiresAt) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  },

  getSession: (token) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM sessions WHERE token = ? AND expires_at > datetime("now")',
        [token],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  },

  deleteSession: (token) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM sessions WHERE token = ?', [token], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  // Attendance operations
  markAttendance: (userId, subject, date, isPresent = true) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT OR REPLACE INTO attendance (user_id, subject, date, is_present) VALUES (?, ?, ?, ?)',
        [userId, subject, date, isPresent ? 1 : 0],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  },

  getAttendance: (userId, startDate = null, endDate = null) => {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM attendance WHERE user_id = ?';
      let params = [userId];
      
      if (startDate && endDate) {
        query += ' AND date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }
      
      query += ' ORDER BY date DESC';
      
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getAttendanceBySubject: (userId, subject) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM attendance WHERE user_id = ? AND subject = ? ORDER BY date DESC',
        [userId, subject],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  getAttendanceStats: (userId) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          subject,
          COUNT(*) as total_classes,
          SUM(is_present) as attended_classes,
          ROUND((SUM(is_present) * 100.0 / COUNT(*)), 2) as percentage
         FROM attendance 
         WHERE user_id = ? 
         GROUP BY subject`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  // Clean old attendance data (older than 10 days)
  cleanOldAttendance: () => {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM attendance WHERE created_at < datetime("now", "-10 days")',
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
};

module.exports = { db, initDatabase, dbHelpers }; 