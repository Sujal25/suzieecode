import React from 'react';
import { motion } from 'framer-motion';
import aeLogo from '../src/assets/ae.png';

export default function LandingPage({ onLogin }) {
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
        <p className="text-light-200 text-center mb-6">
          MNIT Jaipur | Attendance Tracker
        </p>

        {/* Description */}
        <p className="text-light-200 text-center text-sm leading-relaxed">
          Track your attendance, view timetables, and monitor your progress with our secure and easy-to-use platform.
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-4 mt-4">
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-accent-600 hover:bg-accent-700 text-white font-bold py-3 rounded-xl shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            🔐 Login to Your Account
          </button>
          
          <button
            onClick={() => window.location.href = '/register'}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            🎓 Create New Account
          </button>
        </div>

        {/* Features */}
        <div className="w-full mt-6">
          <h3 className="text-light-100 font-semibold mb-3 text-center">Features</h3>
          <div className="grid grid-cols-2 gap-3 text-xs text-light-200">
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>OTP Login</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>Attendance Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>Calendar View</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>Timetable</span>
            </div>
          </div>
        </div>

        

        {/* Custom animation for wiggle */}
        <style>{`
          @keyframes wiggle {
            0%, 100% { transform: rotate(-8deg); }
            50% { transform: rotate(8deg); }
          }
          .animate-wiggle { animation: wiggle 1.2s infinite; }
        `}</style>
      </motion.div>
    </div>
  );
} 