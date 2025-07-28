import { useState } from 'react';
import timetableData from '../data/timetable.json';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TimetablePage({ batch = 'B1' }) {
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  return (
    <div className="min-h-screen dark:bg-deep-900 bg-white py-6 px-1 flex flex-col items-center text-[15px]">
      <h1 className="text-xl md:text-2xl font-poppins font-bold text-accent-600 mb-4 text-center">Your Semester 3 Timetable</h1>
      {/* Two-row Day Tabs */}
      <div className="mb-4 w-full max-w-2xl flex flex-col gap-2 items-center">
        <div className="flex gap-1 w-full justify-center">
          {["Monday", "Tuesday", "Wednesday"].map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`min-w-max px-3 py-1.5 rounded-xl font-bold transition-all duration-200 text-xs md:text-sm
                ${selectedDay === day ? 'bg-accent-600 text-white shadow' : 'bg-deep-800 text-light-100 hover:bg-accent-700/30'}`}
            >
              {day}
            </button>
          ))}
        </div>
        <div className="flex gap-1 w-full justify-center">
          {["Thursday", "Friday"].map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`min-w-max px-3 py-1.5 rounded-xl font-bold transition-all duration-200 text-xs md:text-sm
                ${selectedDay === day ? 'bg-accent-600 text-white shadow' : 'bg-deep-800 text-light-100 hover:bg-accent-700/30'}`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
      {/* Timetable Card for Selected Day */}
      <div className="w-full max-w-2xl flex flex-col gap-4">
        <div className="bg-white dark:bg-deep-800/80 glass rounded-2xl shadow p-3 flex flex-col gap-1">
          <div className="font-bold text-base md:text-lg text-accent-600 mb-1">{selectedDay}</div>
          {(() => {
            const slots = (timetableData.timetable[selectedDay] || []).filter(slot => !slot.subBatches || slot.subBatches.includes(batch));
            return slots.length === 0 ? (
              <div className="text-gray-400 text-xs md:text-sm">No classes</div>
            ) : (
              <div className="flex flex-col gap-1">
                {slots.map((slot, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-2 p-2 rounded-lg bg-gray-50 dark:bg-deep-900/60 border border-gray-100 dark:border-white/10">
                    <div className="font-semibold text-accent-700 text-xs md:text-base flex-1">{slot.subject}</div>
                    <div className="text-xs text-gray-500">{slot.time}</div>
                    <div className="text-xs text-gray-400">{slot.type}</div>
                    <div className="text-xs text-gray-400">{slot.location}</div>
                    {slot.subBatches && (
                      <div className="flex items-center">
                        {slot.subBatches.map((b, i) => (
                          <span
                            key={b}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent-600 text-white font-bold text-xs shadow ml-1"
                            style={{ minWidth: '1.75rem' }}
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
} 