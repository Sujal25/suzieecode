# AttendEase - MNIT Attendance Tracker

A modern attendance tracking application for MNIT Jaipur students with Gmail OTP verification and secure authentication.

## Features

### 🔐 Authentication & Security
- **Gmail OTP Verification**: Secure login using email-based OTP
- **Password Login**: Alternative login method with password
- **JWT Token Management**: Secure session handling
- **Email Domain Validation**: Restricted to @mnit.ac.in emails
- **Password Hashing**: Secure password storage with bcrypt

### 📊 Attendance Management
- **Real-time Tracking**: Mark attendance for current day's classes
- **Calendar View**: Monthly attendance overview with color coding
- **Subject-wise Statistics**: Track attendance percentage per subject
- **75% Rule Monitoring**: Automatic calculation of classes needed to maintain 75%

### 📅 Timetable Integration
- **Personalized Timetable**: View your class schedule by batch
- **Dynamic Updates**: Real-time timetable changes
- **Holiday Integration**: Automatic holiday detection

### 🎨 Modern UI/UX
- **Dark Mode**: Beautiful dark theme optimized for all devices
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Smooth Animations**: Framer Motion powered transitions
- **Intuitive Navigation**: Easy-to-use sidebar and mobile navigation

## Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **SQLite** - Lightweight database
- **JWT** - JSON Web Tokens for authentication
- **Nodemailer** - Email sending functionality
- **bcryptjs** - Password hashing

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Gmail account with 2FA enabled

### 1. Clone the Repository
```bash
git clone <repository-url>
cd attend-copy
```

### 2. Backend Setup
```bash
cd backend

# Run interactive setup
npm run setup

# Install dependencies
npm install

# Start development server
npm run dev
```

The backend will be available at `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Gmail Configuration

For OTP functionality to work:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate new app password for "Mail"
3. **Use the app password** in the backend configuration

## Usage

### Registration
1. Click "Register here" on the login page
2. Fill in your details (Student ID, Name, Branch, etc.)
3. Use your @mnit.ac.in email address
4. Set a secure password
5. Check your email for welcome confirmation

### Login
1. **OTP Login** (Recommended):
   - Enter your @mnit.ac.in email
   - Click "Send OTP"
   - Check your email for the 6-digit code
   - Enter the OTP to login

2. **Password Login**:
   - Enter your email and password
   - Click "Login"

### Attendance Tracking
1. **Dashboard**: View today's classes and mark attendance
2. **Calendar**: See monthly attendance overview
3. **Timetable**: View your class schedule
4. **Statistics**: Monitor your attendance percentages

## Project Structure

```
attend-copy/
├── backend/                 # Backend server
│   ├── server.js           # Main server file
│   ├── database.js         # Database setup and helpers
│   ├── auth.js             # Authentication utilities
│   ├── emailService.js     # Email functionality
│   ├── package.json        # Backend dependencies
│   └── README.md           # Backend documentation
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # App entry point
│   ├── pages/              # Page components
│   │   ├── LoginPage.jsx   # Authentication page
│   │   ├── RegisterPage.jsx # Registration page
│   │   ├── DashboardPage.jsx # Main dashboard
│   │   ├── CalendarPage.jsx # Calendar view
│   │   └── TimetablePage.jsx # Timetable view
│   ├── components/         # Reusable components
│   ├── data/              # Static data files
│   └── package.json       # Frontend dependencies
└── README.md              # This file
```

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/send-otp` - Send OTP email
- `POST /api/verify-otp` - Verify OTP and login
- `POST /api/login` - Password-based login
- `POST /api/logout` - User logout
- `GET /api/profile` - Get user profile

### Health Check
- `GET /api/health` - Server status

## Security Features

- **Email Validation**: Only @mnit.ac.in emails allowed
- **Password Security**: Bcrypt hashing with salt rounds
- **JWT Tokens**: Secure session management
- **OTP Expiration**: 10-minute OTP validity
- **CORS Protection**: Configured for frontend origin
- **Input Validation**: Server-side validation for all inputs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the backend README for detailed setup instructions
- Ensure your Gmail configuration is correct
- Verify all environment variables are set properly

## Future Enhancements

- [ ] Admin panel for managing students
- [ ] Bulk attendance upload
- [ ] Email notifications for low attendance
- [ ] Mobile app development
- [ ] Integration with college ERP systems
- [ ] Advanced analytics and reports 