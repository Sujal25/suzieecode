import { useState } from 'react';

const SUB_BATCHES = ['B1', 'B2', 'B3', 'B4'];

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [batch, setBatch] = useState('B1');
  const [error, setError] = useState('');

  // Email validation for @mnit.ac.in
  const validateEmail = (e) => {
    e.preventDefault();
    if (!email.endsWith('@mnit.ac.in')) {
      setError('Please use your @mnit.ac.in email ID.');
      return;
    }
    setError('');
    if (onLogin) onLogin(email, batch);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      {/* Card Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-6 items-center">
        {/* Animated Emoji/Illustration */}
        <div className="text-6xl animate-bounce mb-2" aria-hidden="true">
          <span role="img" aria-label="books">📚</span>
        </div>
        {/* Title */}
        <h1 className="text-3xl font-poppins font-bold text-primary-700 mb-2 text-center">
          Welcome to AttendEase
        </h1>
        <p className="text-gray-500 text-center mb-4">
          MNIT Jaipur | 2nd Year CSE Attendance Tracker
        </p>
        {/* Login Form */}
        <form className="w-full flex flex-col gap-4" onSubmit={validateEmail}>
          <label className="flex flex-col gap-1 font-medium text-gray-700">
            Email ID
            <input
              type="email"
              className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 font-inter text-base"
              placeholder="yourname@mnit.ac.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              aria-label="Email ID"
            />
          </label>
          <label className="flex flex-col gap-1 font-medium text-gray-700">
            Sub-batch
            <select
              className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 font-inter text-base bg-white"
              value={batch}
              onChange={e => setBatch(e.target.value)}
              aria-label="Sub-batch"
            >
              {SUB_BATCHES.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </label>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="mt-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 rounded-xl shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            Login
          </button>
        </form>
        {/* Micro animation: waving hand */}
        <div className="text-2xl mt-2 animate-wiggle inline-block" aria-hidden="true">
          <span role="img" aria-label="wave">👋</span>
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
    </div>
  );
} 