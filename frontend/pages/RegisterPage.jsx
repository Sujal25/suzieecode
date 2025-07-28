import React, { useState } from 'react';
import { motion } from 'framer-motion';
import aeLogo from '../src/assets/ae.png';
import { authAPI } from '../src/services/api';

const SUB_BATCHES = ['B1', 'B2', 'B3', 'B4'];
const BRANCHES = ['CSE', 'ECE', 'ME', 'CE', 'EE'];

export default function RegisterPage({ onRegisterSuccess }) {
  const [form, setForm] = useState({
    student_id: '',
    name: '',
    branch: 'CSE',
    semester: '3',
    batch: 'B1',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage(''); // Clear message when user types
  };

  const validateForm = () => {
    if (!form.student_id.trim()) {
      setMessage('Student ID is required');
      return false;
    }
    if (!form.name.trim()) {
      setMessage('Name is required');
      return false;
    }
    if (!form.email.trim()) {
      setMessage('Email is required');
      return false;
    }
    if (!form.email.endsWith('@mnit.ac.in')) {
      setMessage('Please use your @mnit.ac.in email ID');
      return false;
    }
    if (form.password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setMessage('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: form.student_id,
          name: form.name,
          branch: form.branch,
          semester: parseInt(form.semester),
          batch: form.batch,
          email: form.email,
          password: form.password
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage('Registration successful! Please check your email for confirmation.');
        // Clear form
        setForm({
          student_id: '',
          name: '',
          branch: 'CSE',
          semester: '3',
          batch: 'B1',
          email: '',
          password: '',
          confirmPassword: ''
        });
        
        // Redirect to login page after successful registration
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000); // Wait 2 seconds to show success message
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (err) {
      setMessage('Error connecting to server. Please try again.');
    } finally {
      setIsLoading(false);
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
        
        <h1 className="text-3xl font-poppins font-bold text-accent-500 mb-2 text-center">
          Create Account
        </h1>
        <p className="text-light-200 text-center mb-4">
          Join AttendEase to track your attendance
        </p>
        
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 font-medium text-light-100">
            Student ID
            <input
              type="text"
              name="student_id"
              className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 focus:outline-none focus:ring-2 focus:ring-accent-500 font-inter text-base"
              placeholder="2023UCP1234"
              value={form.student_id}
              onChange={handleChange}
              required
            />
          </label>

          <label className="flex flex-col gap-1 font-medium text-light-100">
            Full Name
            <input
              type="text"
              name="name"
              className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 focus:outline-none focus:ring-2 focus:ring-accent-500 font-inter text-base"
              placeholder="Your Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="flex flex-col gap-1 font-medium text-light-100">
            Branch
            <select
              name="branch"
              className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 focus:outline-none focus:ring-2 focus:ring-accent-500 font-inter text-base"
              value={form.branch}
              onChange={handleChange}
            >
              {BRANCHES.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 font-medium text-light-100">
            Semester
            <select
              name="semester"
              className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 focus:outline-none focus:ring-2 focus:ring-accent-500 font-inter text-base"
              value={form.semester}
              onChange={handleChange}
            >
              <option value="1">1st Semester</option>
              <option value="2">2nd Semester</option>
              <option value="3">3rd Semester</option>
              <option value="4">4th Semester</option>
              <option value="5">5th Semester</option>
              <option value="6">6th Semester</option>
              <option value="7">7th Semester</option>
              <option value="8">8th Semester</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 font-medium text-light-100">
            Sub-batch
            <select
              name="batch"
              className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 focus:outline-none focus:ring-2 focus:ring-accent-500 font-inter text-base"
              value={form.batch}
              onChange={handleChange}
            >
              {SUB_BATCHES.map(batch => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 font-medium text-light-100">
            Email ID
            <input
              type="email"
              name="email"
              className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 focus:outline-none focus:ring-2 focus:ring-accent-500 font-inter text-base"
              placeholder="yourname@mnit.ac.in"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="flex flex-col gap-1 font-medium text-light-100">
            Password
            <input
              type="password"
              name="password"
              className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 focus:outline-none focus:ring-2 focus:ring-accent-500 font-inter text-base"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <label className="flex flex-col gap-1 font-medium text-light-100">
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 focus:outline-none focus:ring-2 focus:ring-accent-500 font-inter text-base"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </label>

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
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-light-200 text-sm text-center">
          Already have an account?{' '}
          <button 
            onClick={() => window.location.href = '/login'}
            className="text-accent-500 hover:text-accent-400 font-medium underline"
          >
            Login here
          </button>
        </div>
      </motion.div>
    </div>
  );
} 