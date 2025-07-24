import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import attendanceData from '../data/attendance.json';
import timetableData from '../data/timetable.json';

const SUB_BATCHES = ['B1', 'B2', 'B3', 'B4'];
const STATUS_EMOJI = {
  present: '✅',
  absent: '❌',
  off: '🟡',
  none: '⬜️',
};
const STATUS_COLOR = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  off: 'bg-yellow-100 text-yellow-700',
  none: 'bg-gray-100 text-gray-400',
};

function getLast30Days() {
  const days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function getDayName(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
}

function getClassesForDate(dateStr, batch) {
  const dayName = getDayName(dateStr);
  const all = timetableData.timetable[dayName] || [];
  return all.filter(slot => !slot.subBatches || slot.subBatches.includes(batch));
}

export default function CalendarPage({ batch = 'B1' }) {
  const [selectedBatch, setSelectedBatch] = useState(batch);
  const [modalDate, setModalDate] = useState(null);
  const days = getLast30Days();

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col items-center py-6 px-2">
      <h2 className="text-2xl font-poppins font-bold text-primary-700 mb-2 text-center">Attendance Calendar</h2>
      <div className="mb-4">
        <label className="font-medium text-gray-700 mr-2">Sub-batch:</label>
        <select
          className="rounded-lg border border-gray-200 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-200 font-inter text-base bg-white"
          value={selectedBatch}
          onChange={e => setSelectedBatch(e.target.value)}
        >
          {SUB_BATCHES.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>
      {/* Calendar Grid */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-4 flex flex-col items-center">
        <div className="grid grid-cols-7 gap-2 w-full">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-xs font-bold text-primary-600 text-center mb-1">{day}</div>
          ))}
          {days.map(date => {
            const batchDay = attendanceData[date]?.[selectedBatch] || {};
            const classes = getClassesForDate(date, selectedBatch);
            return (
              <button
                key={date}
                className={`flex flex-col items-center justify-center aspect-square min-w-8 min-h-8 rounded-lg bg-gray-50 border border-gray-200 relative group focus:outline-none focus:ring-2 focus:ring-primary-200`}
                title={date}
                tabIndex={0}
                aria-label={date}
                onClick={() => setModalDate(date)}
              >
                <span className="text-[10px] text-gray-400 mb-0.5">{new Date(date).getDate()}</span>
                <div className="flex flex-wrap gap-0.5 justify-center">
                  {classes.length === 0 && <span className="text-lg">⬜️</span>}
                  {classes.map(slot => {
                    const classKey = `${slot.subject}__${slot.time}`;
                    const status = batchDay[classKey] || 'none';
                    return (
                      <span
                        key={classKey}
                        className={`text-base rounded ${STATUS_COLOR[status]} px-1`}
                        title={`${slot.subject} (${slot.time}): ${status}`}
                      >
                        {STATUS_EMOJI[status]}
                      </span>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex gap-4 mt-4 text-xs flex-wrap">
          <span className="flex items-center gap-1"><span className="text-lg">✅</span> Present</span>
          <span className="flex items-center gap-1"><span className="text-lg">❌</span> Absent</span>
          <span className="flex items-center gap-1"><span className="text-lg">🟡</span> Off</span>
          <span className="flex items-center gap-1"><span className="text-lg">⬜️</span> No Data</span>
        </div>
      </div>
      {/* Modal for date details */}
      <AnimatePresence>
        {modalDate && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalDate(null)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl relative"
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
            >
              <button className="absolute top-2 right-3 text-xl text-gray-400 hover:text-red-500" onClick={() => setModalDate(null)}>&times;</button>
              <h3 className="text-lg font-bold mb-2">{modalDate} ({getDayName(modalDate)})</h3>
              <div className="flex flex-col gap-2">
                {getClassesForDate(modalDate, selectedBatch).length === 0 && (
                  <div className="text-gray-400">No classes scheduled.</div>
                )}
                {getClassesForDate(modalDate, selectedBatch).map(slot => {
                  const classKey = `${slot.subject}__${slot.time}`;
                  const status = (attendanceData[modalDate]?.[selectedBatch] || {})[classKey] || 'none';
                  return (
                    <div key={classKey} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-gray-50">
                      <span className={`text-lg ${STATUS_COLOR[status]}`}>{STATUS_EMOJI[status]}</span>
                      <span className="font-semibold text-primary-700">{slot.subject}</span>
                      <span className="text-xs text-gray-400">({slot.time})</span>
                      <span className="ml-auto text-xs text-gray-500">{slot.type}</span>
                      {status === 'absent' && <span className="ml-2 text-red-500 font-bold">Missed</span>}
                      {status === 'present' && <span className="ml-2 text-green-600 font-bold">Attended</span>}
                      {status === 'off' && <span className="ml-2 text-yellow-600 font-bold">Off</span>}
                      {status === 'none' && <span className="ml-2 text-gray-400 font-bold">No Data</span>}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 