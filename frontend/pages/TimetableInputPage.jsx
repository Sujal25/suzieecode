import { useState } from 'react';
import { motion } from 'framer-motion';

const SUB_BATCHES = ['B1', 'B2', 'B3', 'B4'];

export default function TimetableInputPage({ onSubmit }) {
  const [roll, setRoll] = useState('');
  const [batch, setBatch] = useState('B1');

  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-deep-900 bg-white">
      <motion.div
        className="glass rounded-2xl p-8 w-full max-w-md flex flex-col gap-6 items-center bg-deep-800/80 border border-white/10 shadow-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h1 className="text-3xl font-poppins font-bold text-accent-500 mb-2 text-center">
          MNIT CSE Timetable
        </h1>
        <p className="text-light-200 text-center mb-4">
          Enter your details to view your personalized timetable
        </p>
        <form className="w-full flex flex-col gap-4" onSubmit={e => { e.preventDefault(); onSubmit({ roll, batch }); }}>
          <label className="flex flex-col gap-1 font-medium text-light-100">
            Roll Number (optional)
            <input
              type="text"
              className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 focus:outline-none focus:ring-2 focus:ring-accent-500 font-inter text-base"
              placeholder="2023UCP1234"
              value={roll}
              onChange={e => setRoll(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 font-medium text-light-100">
            Branch
            <input
              type="text"
              value="CSE"
              disabled
              className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 font-inter text-base opacity-70 cursor-not-allowed"
            />
          </label>
          <label className="flex flex-col gap-1 font-medium text-light-100">
            Semester
            <input
              type="text"
              value="3"
              disabled
              className="rounded-lg border border-white/10 px-4 py-2 bg-deep-900 text-light-100 font-inter text-base opacity-70 cursor-not-allowed"
            />
          </label>
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
          <button
            type="submit"
            className="mt-2 bg-accent-600 hover:bg-accent-700 text-white font-bold py-2 rounded-xl shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            View Timetable
          </button>
        </form>
      </motion.div>
    </div>
  );
} 