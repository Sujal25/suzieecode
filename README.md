# AttendEase - MNIT Jaipur Attendance Tracking System

A modern, full-stack attendance tracking system built for MNIT Jaipur students with a beautiful React frontend and Node.js backend.

## 🚀 Features

### For Students
- **Secure Authentication**: OTP-based login with @mnit.ac.in email verification
- **Attendance Tracking**: Mark and view your daily attendance
- **Calendar View**: Visual calendar interface to track attendance patterns
- **Timetable Management**: View and manage your class schedule
- **Progress Monitoring**: Track attendance percentage and statistics
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### For Administrators
- **Admin Dashboard**: Comprehensive overview of all student data
- **Bulk Upload**: Upload attendance data for multiple students
- **Student Management**: View and manage student information
- **Analytics**: Detailed attendance reports and statistics

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for modern, responsive styling
- **Framer Motion** for smooth animations
- **React Router** for navigation
- **Axios** for API communication

### Backend
- **Node.js** with Express.js
- **MongoDB** (primary) with Mongoose ODM
- **SQLite** (fallback) for data persistence
- **JWT** for secure authentication
- **Nodemailer** for email services (OTP, notifications)
- **bcrypt** for password hashing

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (optional, SQLite is used as fallback)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `config.env` file in the backend directory:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/attendease
   JWT_SECRET=your_jwt_secret_here
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```

4. **Start the backend server:**
   ```bash
   npm start
   # or for development with auto-restart
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:5173
   ```

## 🗄️ Database Setup

### MongoDB (Recommended)
The application uses MongoDB as the primary database. Make sure MongoDB is running on your system.

### SQLite (Fallback)
If MongoDB is not available, the application automatically falls back to SQLite. The database file will be created automatically.

## 📱 Usage

### Student Registration
1. Visit the landing page
2. Click "Create New Account"
3. Fill in your details (Student ID, Name, Branch, etc.)
4. Use your @mnit.ac.in email address
5. Set a secure password
6. Verify your email with OTP

### Student Login
1. Go to the login page
2. Choose between OTP or Password login
3. Enter your @mnit.ac.in email
4. Complete authentication

### Marking Attendance
1. Log in to your account
2. Navigate to the dashboard
3. Select your current class
4. Mark your attendance
5. View your attendance history

### Admin Access
1. Use admin credentials to access the admin dashboard
2. Upload attendance data
3. View student statistics
4. Manage student information

## 🔧 Configuration

### Email Setup
To enable email functionality (OTP, notifications):

1. **Gmail Setup:**
   - Enable 2-factor authentication
   - Generate an App Password
   - Use the App Password in your `config.env`

2. **Other Email Providers:**
   - Update the SMTP settings in `emailService.js`

### CORS Configuration
The backend is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:5174` (Alternative Vite port)
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5174`

## 📁 Project Structure

```
attend-copy/
├── backend/
│   ├── auth.js              # Authentication utilities
│   ├── database-mongo.js    # MongoDB database setup
│   ├── database.js          # SQLite database setup
│   ├── emailService.js      # Email service configuration
│   ├── server.js            # Main Express server
│   └── package.json
├── frontend/
│   ├── components/          # Reusable React components
│   ├── pages/              # Page components
│   ├── src/
│   │   ├── assets/         # Static assets
│   │   └── services/       # API services
│   └── package.json
└── README.md
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Email Verification**: OTP-based email verification
- **CORS Protection**: Configured CORS for security
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables on your hosting platform
2. Install dependencies: `npm install --production`
3. Start the server: `npm start`

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure the API base URL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Sujal Maurya** - Initial work

## 🙏 Acknowledgments

- MNIT Jaipur for the project inspiration
- React and Node.js communities for excellent documentation
- All contributors and testers

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**AttendEase** - Making attendance tracking simple and efficient for MNIT Jaipur students! 🎓 