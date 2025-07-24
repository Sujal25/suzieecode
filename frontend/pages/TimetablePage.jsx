import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import timetableData from '../data/timetable.json';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_BLOCKS = [
  '9:00-9:55', '10:00-10:55', '11:00-11:55', '12:00-12:55',
  '2:00-2:55', '3:00-3:55', '4:00-4:55'
];
const BATCH_COLORS = {
  B1: 'bg-accent-600',
  B2: 'bg-blue-500',
  B3: 'bg-green-500',
  B4: 'bg-orange-400',
};

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-32">
      <motion.div
        className="w-10 h-10 border-4 border-accent-600 border-t-transparent rounded-full animate-spin"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      />
    </div>
  );
}

export default function TimetablePage({ batch = 'B1' }) {
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState({});

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setTimetable(timetableData.timetable);
      setLoading(false);
    }, 600); // Simulate fetch
  }, []);

  return (
    <div className="min-h-screen dark:bg-deep-900 bg-white py-8 px-2 flex flex-col items-center">
      <h1 className="text-2xl font-poppins font-bold text-accent-500 mb-6 text-center">Your Semester 3 Timetable</h1>
      {/* Day Tabs */}
      <div className="flex gap-2 mb-6">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-2xl font-bold transition-all duration-200 text-sm
              ${selectedDay === day ? 'bg-accent-600 text-white shadow' : 'bg-deep-800 text-light-100 hover:bg-accent-700/30'}`}
          >
            {day}
          </button>
        ))}
      </div>
      {/* Timetable Cards */}
      <div className="w-full max-w-3xl">
        {loading ? <LoadingSpinner /> : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {TIME_BLOCKS.map(time => {
                const slots = (timetable[selectedDay] || []).filter(slot => slot.time === time);
                if (!slots.length) return null;
                return slots.map((slot, idx) => {
                  // Show if common or if batch is in subBatches
                  const isCommon = !slot.subBatches;
                  const isForBatch = slot.subBatches?.includes(batch);
                  if (!isCommon && !isForBatch) return null;
                  return (
                    <motion.div
                      key={slot.subject + slot.time + idx}
                      className="glass rounded-2xl p-5 flex flex-col gap-2 relative group cursor-pointer hover:scale-[1.03] transition-transform"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Batch dot */}
                      <span className={`absolute top-4 right-4 w-3 h-3 rounded-full ${isCommon ? 'bg-gray-400' : BATCH_COLORS[batch]}`} title={isCommon ? 'Common' : batch}></span>
                      <div className="text-xs text-light-200 mb-1">{time}</div>
                      <div className="text-lg font-bold text-white flex items-center gap-2">
                        {slot.subject}
                        {slot.type === 'Lab' && <span className="text-xs px-2 py-0.5 rounded bg-accent-700/30 text-accent-500 ml-2">Lab</span>}
                        {slot.type === 'Tutorial' && <span className="text-xs px-2 py-0.5 rounded bg-blue-700/30 text-blue-400 ml-2">Tutorial</span>}
                      </div>
                      <motion.div
                        className="text-sm text-light-100 opacity-80 mt-1"
                        initial={{ opacity: 0, y: 10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div>Location: <span className="font-semibold">{slot.location}</span></div>
                        {slot.faculty && <div>Faculty: <span className="font-semibold">{slot.faculty}</span></div>}
                        {slot.subBatches && (
                          <div>Batches: <span className="font-semibold">{slot.subBatches.join(', ')}</span></div>
                        )}
                      </motion.div>
                    </motion.div>
                  );
                });
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
} 