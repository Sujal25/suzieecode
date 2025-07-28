import { useState } from 'react';
import { motion } from 'framer-motion';
import { authAPI } from '../src/services/api';
import aeLogo from '../src/assets/ae.png';

const SUB_BATCHES = ['B1', 'B2', 'B3', 'B4'];

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [batch, setBatch] = useState('B1');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' or 'password'
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: email, 2: otp+password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validateEmail = (email) => {
    if (!email.endsWith('@mnit.ac.in')) {
      setMessage('Please use your @mnit.ac.in email ID.');
      return false;
    }
    return true;
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage('OTP sent to your email! Check your inbox.');
        setShowOtpInput(true);
      } else {
        setMessage(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setMessage('Error connecting to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!otp.trim()) {
      setMessage('Please enter the OTP');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage('Login successful!');
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Call onLogin with user data
        if (onLogin) {
          onLogin(data.user);
        }
      } else {
        setMessage(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setMessage('Error connecting to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!validateEmail(email) || !password.trim()) {
      setMessage('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage('Login successful!');
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Call onLogin with user data
        if (onLogin) {
          onLogin(data.user);
        }
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (err) {
      setMessage('Error connecting to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (forgotPasswordStep === 1) {
      // Send OTP for password reset
      if (!validateEmail(email)) {
        return;
      }
      
      setIsLoading(true);
      try {
        const res = await authAPI.forgotPassword(email);
        setMessage('Password reset OTP sent to your email!');
        setForgotPasswordStep(2);
      } catch (err) {
        setMessage(err.message || 'Failed to send reset OTP');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Reset password with OTP
      if (!otp || !newPassword || !confirmPassword) {
        setMessage('Please fill all fields');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setMessage('Passwords do not match');
        return;
      }
      
      if (newPassword.length < 6) {
        setMessage('Password must be at least 6 characters long');
        return;
      }
      
      setIsLoading(true);
      try {
        await authAPI.resetPassword(email, otp, newPassword);
        setMessage('Password reset successful! You can now login with your new password.');
        // Reset form
        setShowForgotPassword(false);
        setForgotPasswordStep(1);
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setPassword('');
      } catch (err) {
        setMessage(err.message || 'Failed to reset password');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-deep-900 bg-white">
      <motion.div
        className="glass rounded-2xl p-8 w-full max-w-md flex flex-col gap-6 items-center bg-deep-800/80 border border-white/10 shadow-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Animated Logo/Illustration */}
        <div className="mb-2" aria-hidden="true">
          <img 
            src={aeLogo} 
            alt="AttendEase Logo" 
            className="w-80 h-20 animate-bounce"
          />
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-poppins font-bold text-accent-500 mb-2 text-center">
          Welcome to AttendEase
        </h1>
        <p className="text-light-200 text-center mb-4">
          MNIT Jaipur | Attendance Tracker
        </p>

        {/* Login Method Toggle */}
        <div className="flex gap-2 bg-deep-900 rounded-lg p-1">
          <button
            type="button"
            onClick={() => {
              setLoginMethod('otp');
              setShowOtpInput(false);
              setMessage('');
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              loginMethod === 'otp'
                ? 'bg-accent-600 text-white'
                : 'text-light-200 hover:text-accent-400'
            }`}
          >
            OTP Login
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('password');
              setShowOtpInput(false);
              setMessage('');
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              loginMethod === 'password'
                ? 'bg-accent-600 text-white'
                : 'text-light-200 hover:text-accent-400'
            }`}
          >
            Password Login
          </button>
        </div>

        {!showForgotPassword ? (
          /* Login Form */
          <form className="w-full flex flex-col gap-4" onSubmit={loginMethod === 'otp' ? (showOtpInput ? verifyOTP : sendOTP) : loginWithPassword}>
            <label className="flex flex-col gap-1 font-medium text-light-100">
              Email ID
              <input
                type="email"
                className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 focus:outline-none focus:ring-2 focus:ring-accent-500 font-inter text-base"
                placeholder="yourname@mnit.ac.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={showOtpInput}
              />
            </label>

            {loginMethod === 'password' && (
              <>
                <label className="flex flex-col gap-1 font-medium text-light-100">
                  Password
                  <input
                    type="password"
                    className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 focus:outline-none focus:ring-2 focus:ring-accent-500 font-inter text-base"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </label>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setMessage('');
                    }}
                    className="text-accent-400 hover:text-accent-300 text-sm underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              </>
            )}

            {loginMethod === 'otp' && showOtpInput && (
              <label className="flex flex-col gap-1 font-medium text-light-100">
                OTP Code
                <input
                  type="text"
                  className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 focus:outline-none focus:ring-2 focus:ring-accent-500 font-inter text-base text-center text-2xl tracking-widest"
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                />
              </label>
            )}

            {loginMethod === 'otp' && !showOtpInput && (
              <label className="flex flex-col gap-1 font-medium text-light-100">
                Sub-batch
                <select
                  className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 focus:outline-none focus:ring-2 focus:ring-accent-500 font-inter text-base"
                  value={batch}
                  onChange={e => setBatch(e.target.value)}
                >
                  {SUB_BATCHES.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </label>
            )}

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
              {isLoading 
                ? 'Processing...' 
                : loginMethod === 'otp' 
                  ? (showOtpInput ? 'Verify OTP' : 'Send OTP') 
                  : 'Login'
              }
            </button>
          </form>
        ) : (
          /* Forgot Password Form */
          <form className="w-full flex flex-col gap-4" onSubmit={handleForgotPassword}>
            <div className="text-center mb-4">
              <h3 className="text-xl font-poppins font-bold text-accent-500">Reset Password</h3>
              <p className="text-light-200 text-sm mt-1">
                {forgotPasswordStep === 1 
                  ? 'Enter your email to receive password reset OTP'
                  : 'Enter OTP and set your new password'
                }
              </p>
            </div>

            <label className="flex flex-col gap-1 font-medium text-light-100">
              Email ID
              <input
                type="email"
                className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 focus:outline-none focus:ring-2 focus:ring-accent-500 font-inter text-base"
                placeholder="yourname@mnit.ac.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={forgotPasswordStep === 2}
              />
            </label>

            {forgotPasswordStep === 2 && (
              <>
                <label className="flex flex-col gap-1 font-medium text-light-100">
                  OTP Code
                  <input
                    type="text"
                    className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 focus:outline-none focus:ring-2 focus:ring-accent-500 font-inter text-base text-center text-2xl tracking-widest"
                    placeholder="000000"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                  />
                </label>

                <label className="flex flex-col gap-1 font-medium text-light-100">
                  New Password
                  <input
                    type="password"
                    className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 focus:outline-none focus:ring-2 focus:ring-accent-500 font-inter text-base"
                    placeholder="Enter new password (min 6 characters)"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </label>

                <label className="flex flex-col gap-1 font-medium text-light-100">
                  Confirm Password
                  <input
                    type="password"
                    className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 focus:outline-none focus:ring-2 focus:ring-accent-500 font-inter text-base"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </label>
              </>
            )}

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
              className="mt-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-bold py-3 rounded-xl shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed"
            >
              {isLoading 
                ? 'Processing...' 
                : forgotPasswordStep === 1 
                  ? '🔑 Send Reset OTP' 
                  : '✅ Reset Password'
              }
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordStep(1);
                setMessage('');
                setOtp('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              className="text-light-200 hover:text-accent-400 text-sm underline"
            >
              ← Back to Login
            </button>
          </form>
        )}

        {/* Register Section */}
        <div className="w-full">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-deep-800 px-2 text-light-200">New to AttendEase?</span>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <button 
              onClick={() => window.location.href = '/register'}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              🎓 Create New Account
            </button>
            
            <p className="text-light-200 text-xs mt-2">
              Already have an account?{' '}
              <button 
                onClick={() => window.location.href = '/register'}
                className="text-accent-500 hover:text-accent-400 font-medium underline"
              >
                Register here
              </button>
            </p>
          </div>
        </div>

        {/* Micro animation: waving hand */}
        <div className="text-2xl mt-2 animate-wiggle inline-block" aria-hidden="true">
          <span role="img" aria-label="wave">👋</span>
        </div>
      </motion.div>

      {/* Custom animation for wiggle */}
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }
        .animate-wiggle { animation: wiggle 1.2s infinite; }
      `}</style>
    </div>
  );
} 