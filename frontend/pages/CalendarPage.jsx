import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import holidays from '../data/holidays.json';
import { attendanceAPI, timetableAPI } from '../src/services/api';

const SUB_BATCHES = ['B1', 'B2', 'B3', 'B4'];

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

function getDayName(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
}

function getFullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getClassesForDate(dateStr, batch, timetable) {
  const dayName = getDayName(dateStr);
  const schedule = timetable.schedule || {};
  const all = schedule[dayName] || [];
  return all; // Return all classes for the day
}

function getSubjectAttendanceStats(attendanceList) {
  const stats = {};
  attendanceList.forEach(record => {
    const subject = record.subject;
    if (!stats[subject]) stats[subject] = { present: 0, total: 0 };
    stats[subject].total++;
    if (record.is_present) stats[subject].present++;
  });
  return stats;
}

// Helper to get YYYY-MM-DD from a Date object (local time)
function toDateStrLocal(dateObj) {
  return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
}

function isHoliday(dateStr) {
  // Use local date parsing
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayOfWeek = d.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return true; // Sunday or Saturday
  return holidays.some(h => h.date === dateStr);
}

export default function CalendarPage({ batch = 'B1' }) {
  const systemToday = new Date();
  const selectedBatch = batch;
  const [modalDate, setModalDate] = useState(null);
  const [month, setMonth] = useState(systemToday.getMonth());
  const [year, setYear] = useState(systemToday.getFullYear());
  
  // Internal state for attendance and timetable data
  const [attendanceList, setAttendanceList] = useState([]);
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch timetable and attendance data on component mount and when batch/month changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch timetable for the batch
        const timetableResponse = await timetableAPI.getTimetable(selectedBatch);
        setTimetable(timetableResponse.timetable || {});
        
        // Fetch attendance data
        const attendanceResponse = await attendanceAPI.getAttendance();
        setAttendanceList(attendanceResponse.attendance || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedBatch, month, year]);

  // Function to mark attendance
  const markAttendance = async (subject, date, isPresent) => {
    try {
      await attendanceAPI.markAttendance(subject, date, isPresent);
      // Refresh attendance data
      const attendanceResponse = await attendanceAPI.getAttendance();
      setAttendanceList(attendanceResponse.attendance || []);
    } catch (err) {
      console.error('Failed to mark attendance:', err);
    }
  };

  const monthDays = getMonthDays(year, month);
  const firstDayOfWeek = monthDays[0].getDay();
  const lastDayOfWeek = monthDays[monthDays.length - 1].getDay();
  const blanksBefore = Array(firstDayOfWeek).fill(null);
  const blanksAfter = Array(6 - lastDayOfWeek).fill(null);
  const allCells = [...blanksBefore, ...monthDays, ...blanksAfter];

  // Swipe support
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  function handleTouchStart(e) {
    touchStartX.current = e.changedTouches[0].screenX;
  }
  function handleTouchEnd(e) {
    touchEndX.current = e.changedTouches[0].screenX;
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchEndX.current - touchStartX.current;
      if (Math.abs(diff) > 50) {
        if (diff < 0) changeMonth(1); // swipe left, next month
        else changeMonth(-1); // swipe right, prev month
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  }

  function changeMonth(offset) {
    let newMonth = month + offset;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setMonth(newMonth);
    setYear(newYear);
  }

  // Color logic for each day based on attendance records
  function getDayColor(dateStr, classes) {
    if (isHoliday(dateStr)) return 'bg-gray-200 border-gray-300';
    if (classes.length === 0) return 'bg-gray-50 border-gray-200';
    
    // Check attendance for this date
    const dayAttendance = attendanceList.filter(record => record.date === dateStr);
    if (dayAttendance.length === 0) return 'bg-gray-100 border-gray-200'; // No attendance data
    
    const presentCount = dayAttendance.filter(record => record.is_present).length;
    const totalCount = dayAttendance.length;
    
    if (presentCount === totalCount) return 'bg-green-200 border-green-400';
    if (presentCount === 0) return 'bg-red-200 border-red-400';
    return 'bg-yellow-100 border-yellow-400'; // Partial attendance
  }

  // Count attendance days
  let fullyAttended = 0, partialAttended = 0, nonAttending = 0, noData = 0;
  monthDays.forEach(dateObj => {
    const dateStr = toDateStrLocal(dateObj);
    const classes = getClassesForDate(dateStr, selectedBatch, timetable);
    if (isHoliday(dateStr) || classes.length === 0) return;
    
    const dayAttendance = attendanceList.filter(record => record.date === dateStr);
    if (dayAttendance.length === 0) {
      noData++;
    } else {
      const presentCount = dayAttendance.filter(record => record.is_present).length;
      const totalCount = dayAttendance.length;
      
      if (presentCount === totalCount) fullyAttended++;
      else if (presentCount === 0) nonAttending++;
      else partialAttended++;
    }
  });

  return (
    <div className="min-h-screen bg-accent-50 flex flex-col items-center py-6 px-2">
      <h2 className="text-2xl font-poppins font-bold text-accent-600 mb-2 text-center">Attendance Calendar</h2>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => changeMonth(-1)} className="px-3 py-2 rounded-lg bg-accent-600 text-white shadow hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-400 transition-all text-lg">
            &#8592;
          </button>
          <span className="font-semibold text-accent-600 text-lg">{new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => changeMonth(1)} className="px-3 py-2 rounded-lg bg-accent-600 text-white shadow hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-400 transition-all text-lg">
            &#8594;
          </button>
        </div>
      </div>
      {/* Month Calendar Grid */}
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow p-4 flex flex-col items-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-7 gap-2 w-full">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-xs font-bold text-accent-500 text-center mb-1">{day}</div>
          ))}
          {allCells.map((dateObj, idx) => {
            if (!dateObj) return <div key={idx} />;
            const dateStr = toDateStrLocal(dateObj);
            const classes = getClassesForDate(dateStr, selectedBatch, timetable);
            const color = getDayColor(dateStr, classes);
            return (
              <button
                key={dateStr}
                className={`flex flex-col items-center justify-center aspect-square min-w-8 min-h-8 rounded-lg border relative group focus:outline-none focus:ring-2 focus:ring-accent-200 ${color}`}
                title={dateStr}
                tabIndex={0}
                aria-label={dateStr}
                onClick={() => setModalDate(dateStr)}
              >
                <span className="text-[10px] text-gray-400 mb-0.5">{dateObj.getDate()}</span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-4 mt-4 text-xs flex-wrap">
          <span className="font-semibold text-green-700">Fully attended days: {fullyAttended}</span>
          <span className="font-semibold text-yellow-700">Partial attended days: {partialAttended}</span>
          <span className="font-semibold text-red-700">Non-attending days: {nonAttending}</span>
          <span className="font-semibold text-gray-500">No data days: {noData}</span>
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
              <h3 className="text-lg font-bold mb-2 text-accent-600">{getFullDate(modalDate)}</h3>
              {!isHoliday(modalDate) && getClassesForDate(modalDate, selectedBatch, timetable).length > 0 && (
                <div className="flex justify-center gap-3 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.96 }}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 animate-pulse"
                    onClick={() => {
                      const classes = getClassesForDate(modalDate, selectedBatch, timetable);
                      classes.forEach(slot => {
                        markAttendance(slot.subject, modalDate, true);
                      });
                    }}
                  >
                    Mark All Present
                  </motion.button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                    onClick={() => {
                      const classes = getClassesForDate(modalDate, selectedBatch, timetable);
                      classes.forEach(slot => {
                        markAttendance(slot.subject, modalDate, false);
                      });
                    }}
                  >
                    Mark All Absent
                  </button>
                </div>
              )}
              {isHoliday(modalDate) && (
                <div className="mb-2 text-gray-700 font-semibold flex items-center gap-2">Holiday</div>
              )}
              <div className="flex flex-col gap-2">
                {getClassesForDate(modalDate, selectedBatch, timetable).length === 0 && (
                  <div className="text-gray-400">No classes scheduled.</div>
                )}
                {getClassesForDate(modalDate, selectedBatch, timetable).map(slot => {
                  const subjStat = getSubjectAttendanceStats(attendanceList)[slot.subject] || { present: 0, total: 0 };
                  const percent = subjStat.total ? Math.round((subjStat.present / subjStat.total) * 100) : 0;
                  
                  // Get current attendance status for this specific class on this date
                  const currentRecord = attendanceList.find(record => 
                    record.date === modalDate && record.subject === slot.subject
                  );
                  const currentStatus = currentRecord ? (currentRecord.is_present ? 'present' : 'absent') : 'none';
                  
                  return (
                    <div key={`${slot.subject}-${slot.time}`} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-gray-50">
                      <span className="font-semibold text-accent-600">{slot.subject}</span>
                      <span className="text-xs text-gray-400">({slot.time})</span>
                      <span className="ml-auto text-xs text-gray-500">{slot.type}</span>
                      <span className={`ml-2 text-xs font-mono ${percent < 75 ? 'text-red-500' : 'text-green-700'}`}>{percent}%</span>
                      <span className="text-xs text-gray-500 ml-1">({subjStat.present}/{subjStat.total})</span>
                      {!isHoliday(modalDate) && (
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => markAttendance(slot.subject, modalDate, true)}
                            className={`px-2 py-1 rounded text-xs font-bold border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent-200
                              ${currentStatus === 'present' ? 
                                'bg-green-200 text-green-800 border-green-400' :
                                'bg-gray-100 text-gray-500 border-gray-200 hover:bg-green-100 hover:text-green-700'}`}
                            aria-pressed={currentStatus === 'present'}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => markAttendance(slot.subject, modalDate, false)}
                            className={`px-2 py-1 rounded text-xs font-bold border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent-200
                              ${currentStatus === 'absent' ? 
                                'bg-red-200 text-red-800 border-red-400' :
                                'bg-gray-100 text-gray-500 border-gray-200 hover:bg-red-100 hover:text-red-700'}`}
                            aria-pressed={currentStatus === 'absent'}
                          >
                            Absent
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {isHoliday(modalDate) && (
                  <div className="text-gray-400">Attendance marking is disabled for this day.</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 