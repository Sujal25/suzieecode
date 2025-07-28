import { useState, useEffect } from 'react';
import { attendanceAPI, timetableAPI } from '../src/services/api';

const getToday = () => new Date().toLocaleDateString('en-US', { weekday: 'long' });
const getTodayDate = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

function getTodayClasses(timetable, batch) {
  const today = getToday();
  const all = timetable?.[today] || [];
  return all.filter(slot => !slot.subBatches || slot.subBatches.includes(batch));
}

function getClassKey(slot) {
  return `${slot.subject}__${slot.time}`;
}

function getSubjectAttendanceStats(attendanceRecords) {
  const stats = {};
  attendanceRecords.forEach(record => {
    const subject = record.subject;
    if (!stats[subject]) stats[subject] = { present: 0, total: 0 };
    if (record.is_present === true) stats[subject].present++;
    if (record.is_present === true || record.is_present === false) stats[subject].total++;
  });
  return stats;
}

export default function DashboardPage() {
  const [timetable, setTimetable] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({ name: 'Student', batch: 'B1' });

  // Get auth token and user info from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch timetable data
  const fetchTimetable = async () => {
    try {
      const userInfo = localStorage.getItem('user');
      const batch = userInfo ? JSON.parse(userInfo).batch : 'B1';
      
      const response = await timetableAPI.getTimetable(batch);
      setTimetable(response.timetable.schedule);
    } catch (err) {
      console.error('Error fetching timetable:', err);
      // Fallback to local timetable if API fails
      const fallbackTimetable = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
      };
      setTimetable(fallbackTimetable);
    }
  };

  // Fetch attendance records
  const fetchAttendance = async () => {
    try {
      const response = await attendanceAPI.getAttendance();
      setAttendanceRecords(response.attendance || []);
      
      // Create today's attendance map for quick lookup
      const todayDate = getTodayDate();
      const todayRecords = response.attendance.filter(record => 
        record.date === todayDate
      );
      const todayMap = {};
      todayRecords.forEach(record => {
        const classKey = `${record.subject}__${record.time || 'unknown'}`;
        // Convert boolean is_present to status string for UI
        if (record.is_present === true) {
          todayMap[classKey] = 'present';
        } else if (record.is_present === false) {
          todayMap[classKey] = 'absent';
        }
      });
      setTodayAttendance(todayMap);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Failed to load attendance data');
    }
  };

  // Mark attendance
  const handleMark = async (classKey, status) => {
    const [subject, time] = classKey.split('__');
    const todayDate = getTodayDate();
    
    // Skip 'off' status - don't mark attendance for off days
    if (status === 'off') {
      setTodayAttendance(prev => ({
        ...prev,
        [classKey]: status
      }));
      return;
    }
    
    try {
      await attendanceAPI.markAttendance(
        subject, 
        todayDate, 
        status === 'present'
      );
      
      // Update local state
      setTodayAttendance(prev => ({
        ...prev,
        [classKey]: status
      }));
      
      // Refresh attendance data
      await fetchAttendance();
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError('Failed to mark attendance');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTimetable(), fetchAttendance()]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen dark:bg-deep-900 bg-white flex items-center justify-center">
        <div className="text-accent-500 text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen dark:bg-deep-900 bg-white flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  const todayDate = getTodayDate();
  const todayClasses = getTodayClasses(timetable, user.batch);
  const subjectStats = getSubjectAttendanceStats(attendanceRecords);
  const allSubjects = Object.keys(subjectStats);
  const summary = allSubjects.map(subject => {
    const { present, total } = subjectStats[subject];
    const percent = total ? Math.round((present / total) * 100) : 0;
    const left = percent >= 75 ? 0 : Math.ceil((0.75 * total - present) / 0.25);
    return { subject, present, total, percent, left };
  });
  const below75 = summary.filter(s => s.percent < 75);
  const totalClasses = summary.reduce((a, b) => a + b.total, 0);
  const presentClasses = summary.reduce((a, b) => a + b.present, 0);
  const overallPercent = totalClasses ? Math.round((presentClasses / totalClasses) * 100) : 0;

  return (
    <div className="min-h-screen dark:bg-deep-900 bg-white flex flex-col items-center py-6 px-2">
      <h2 className="text-2xl font-poppins font-bold text-accent-500 mb-2 text-center">Hi, {user.name}!</h2>
      <div className="text-light-200 mb-6 text-center">Today's Schedule for <span className="font-semibold">{user.batch}</span></div>
      {/* Today's Schedule & Mark Attendance */}
      <div className="w-full max-w-md glass bg-deep-800/80 rounded-2xl shadow-xl p-6 mb-6 flex flex-col gap-6 items-center">
        <h3 className="font-bold text-lg mb-2 text-accent-500">{getToday()}</h3>
        {todayClasses.length ? (
          <ul className="w-full flex flex-col gap-4">
            {todayClasses.map((slot, i) => {
              const classKey = getClassKey(slot);
              return (
                <li key={i} className="flex flex-col gap-1">
                  <div className="font-inter font-semibold text-accent-500 mb-1">{slot.subject} <span className="text-xs text-light-200">({slot.time})</span></div>
                  <div className="flex gap-2">
                    {['present', 'absent', 'off'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleMark(classKey, status)}
                        className={`px-3 py-1 rounded-lg font-bold text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent-500
                          ${todayAttendance[classKey] === status ?
                            status === 'present' ? 'bg-accent-600 text-white' :
                            status === 'absent' ? 'bg-red-600 text-white' :
                            'bg-gray-700 text-yellow-300'
                            : 'bg-deep-900 text-light-200 hover:bg-accent-700/30 hover:text-accent-200'}`}
                        aria-pressed={todayAttendance[classKey] === status}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : <div className="text-gray-400">No classes today!</div>}
      </div>
      {/* Attendance Summary Card */}
      <div className="w-full max-w-md glass bg-deep-800/80 rounded-2xl shadow-xl p-6 flex flex-col items-center">
        <div className="font-semibold mb-2 text-accent-500">Attendance Summary (by Subject)</div>
        <div className="flex items-center gap-4 w-full mb-2">
          <div className="flex-1">
            <div className="w-full bg-accent-700/30 rounded-full h-4">
              <div
                className="bg-accent-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${overallPercent}%` }}
              ></div>
            </div>
            <div className="text-xs text-light-200 mt-1">{overallPercent}% overall attendance</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-lg font-bold text-accent-500">{presentClasses}/{totalClasses}</div>
            <div className="text-xs text-light-200">Present/Total</div>
          </div>
        </div>
        <div className="w-full mt-2">
          {summary.map(({ subject, percent, left, present, total }) => (
            <div key={subject} className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm text-accent-500 flex items-center gap-1">
                {subject}
              </span>
              <span className={`text-sm font-mono ${percent < 75 ? 'text-red-400' : 'text-green-300'}`}>{percent}%</span>
              <span className="text-xs text-light-200 ml-2">({present}/{total})</span>
              {percent < 75 && (
                <span className="text-xs text-red-400 ml-2">+{left} to 75%</span>
              )}
            </div>
          ))}
        </div>
        
        
      </div>
    </div>
  );
} 