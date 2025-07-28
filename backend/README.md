# AttendEase Backend

This is the backend server for the AttendEase attendance tracking application.

## Features

- User registration and authentication
- Gmail OTP verification for secure login
- Password-based login as alternative
- JWT token-based session management
- SQLite database for data persistence
- Email notifications for OTP and welcome messages

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `config.env` file in the backend directory with the following variables:

```env
# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Gmail Setup for OTP

To use Gmail for sending OTP emails:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use this app password in the `EMAIL_PASS` environment variable

### 4. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/register` - Register new user
- `POST /api/send-otp` - Send OTP to email
- `POST /api/verify-otp` - Verify OTP and login
- `POST /api/login` - Login with password
- `POST /api/logout` - Logout user
- `GET /api/profile` - Get current user profile

### Health Check

- `GET /api/health` - Server health status

## Database

The application uses SQLite for data storage. The database file (`database.sqlite`) will be created automatically when the server starts.

### Tables

- `users` - User account information
- `otp_codes` - OTP verification codes
- `sessions` - JWT token sessions

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Email domain validation (@mnit.ac.in)
- OTP expiration (10 minutes)
- Session management
- CORS enabled for frontend integration

## Frontend Integration

The backend is configured to work with the React frontend running on `http://localhost:5173`. CORS is enabled for this origin.

## Troubleshooting

1. **Email not sending**: Check your Gmail app password and ensure 2FA is enabled
2. **Database errors**: Ensure the backend directory has write permissions
3. **CORS errors**: Verify the frontend is running on the correct port
4. **JWT errors**: Check that JWT_SECRET is set in environment variables 