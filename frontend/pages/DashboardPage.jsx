import { useState } from 'react';
import timetableData from '../data/timetable.json';
import attendanceData from '../data/attendance.json';

const getToday = () => new Date().toLocaleDateString('en-US', { weekday: 'long' });
const getTodayDate = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

const STATUS = ['present', 'absent', 'off'];
const STATUS_LABEL = {
  present: '✅ Present',
  absent: '❌ Absent',
  off: '🟡 Off',
};
const STATUS_COLOR = {
  present: 'bg-green-200 text-green-800',
  absent: 'bg-red-200 text-red-800',
  off: 'bg-yellow-100 text-yellow-700',
  none: 'bg-gray-100 text-gray-500',
};

function getTodayClasses(batch) {
  const today = getToday();
  const all = timetableData.timetable[today] || [];
  return all.filter(slot => !slot.subBatches || slot.subBatches.includes(batch));
}

function getClassKey(slot) {
  return `${slot.subject}__${slot.time}`;
}

function getClassAttendanceStats(attendance, batch) {
  // { classKey: { present: n, total: n } }
  const stats = {};
  Object.values(attendance).forEach(day => {
    const batchDay = day[batch] || {};
    Object.entries(batchDay).forEach(([classKey, status]) => {
      if (!stats[classKey]) stats[classKey] = { present: 0, total: 0 };
      if (status === 'present') stats[classKey].present++;
      if (status === 'present' || status === 'absent') stats[classKey].total++;
    });
  });
  return stats;
}

export default function DashboardPage({ batch = 'B1', user = 'Student' }) {
  const [selectedBatch] = useState(batch);
  const [attendance, setAttendance] = useState(attendanceData);

  const todayDate = getTodayDate();
  const todayClasses = getTodayClasses(selectedBatch);
  const todayAttendance = attendance[todayDate]?.[selectedBatch] || {};

  // Mark attendance for a class (by subject+time)
  const handleMark = (classKey, status) => {
    setAttendance(prev => ({
      ...prev,
      [todayDate]: {
        ...prev[todayDate],
        [selectedBatch]: {
          ...prev[todayDate]?.[selectedBatch],
          [classKey]: status
        }
      }
    }));
  };

  // Per-class attendance stats
  const classStats = getClassAttendanceStats(attendance, selectedBatch);
  const allClassKeys = Object.keys(classStats);
  const summary = allClassKeys.map(classKey => {
    const { present, total } = classStats[classKey];
    const percent = total ? Math.round((present / total) * 100) : 0;
    const left = percent >= 75 ? 0 : Math.ceil((0.75 * total - present) / 0.25);
    return { classKey, present, total, percent, left };
  });
  const below75 = summary.filter(s => s.percent < 75);

  // Overall summary
  const totalClasses = summary.reduce((a, b) => a + b.total, 0);
  const presentClasses = summary.reduce((a, b) => a + b.present, 0);
  const overallPercent = totalClasses ? Math.round((presentClasses / totalClasses) * 100) : 0;

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col items-center py-6 px-2">
      <h2 className="text-2xl font-poppins font-bold text-primary-700 mb-2 text-center">Hi, {user}!</h2>
      <div className="text-gray-500 mb-6 text-center">Today's Schedule for <span className="font-semibold">{selectedBatch}</span></div>
      {/* Today's Schedule & Mark Attendance */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-4 mb-6">
        <h3 className="font-bold text-lg mb-2 text-primary-600">{getToday()}</h3>
        {todayClasses.length ? (
          <ul className="flex flex-col gap-4">
            {todayClasses.map((slot, i) => {
              const classKey = getClassKey(slot);
              return (
                <li key={i} className="flex flex-col gap-1">
                  <div className="font-inter font-semibold text-primary-700 mb-1">
                    {slot.subject} <span className="text-xs text-gray-400">({slot.time})</span>
                  </div>
                  <div className="flex gap-2">
                    {STATUS.map(status => (
                      <button
                        key={status}
                        onClick={() => handleMark(classKey, status)}
                        className={`px-3 py-1 rounded-lg font-bold text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-200
                          ${todayAttendance[classKey] === status ? STATUS_COLOR[status] : STATUS_COLOR['none']}`}
                        aria-pressed={todayAttendance[classKey] === status}
                      >
                        {STATUS_LABEL[status]}
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
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-4 flex flex-col items-center">
        <div className="font-semibold mb-2">Attendance Summary</div>
        <div className="flex items-center gap-4 w-full mb-2">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-primary-400 h-4 rounded-full transition-all duration-300"
                style={{ width: `${overallPercent}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{overallPercent}% overall attendance</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-lg font-bold text-primary-700">{presentClasses}/{totalClasses}</div>
            <div className="text-xs text-gray-500">Present/Total</div>
          </div>
        </div>
        <div className="w-full mt-2">
          {summary.map(({ classKey, percent, left }) => (
            <div key={classKey} className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm text-primary-700 flex items-center gap-1">
                {classKey.replace(/__/g, ' @ ')}
                {percent < 75 && <span className="text-red-500 text-lg" title="Below 75%">⚠️</span>}
              </span>
              <span className={`text-sm font-mono ${percent < 75 ? 'text-red-500' : 'text-green-700'}`}>{percent}%</span>
              {percent < 75 && (
                <span className="text-xs text-red-500 ml-2">+{left} to 75%</span>
              )}
            </div>
          ))}
        </div>
        {below75.length > 0 && (
          <div className="mt-3 text-sm text-red-600 font-semibold">
            Classes below 75%: {below75.map(s => s.classKey.replace(/__/g, ' @ ')).join(', ')}
          </div>
        )}
        {below75.length === 0 && (
          <div className="mt-3 text-sm text-green-600 font-semibold">
            All classes above 75% attendance 🎉
          </div>
        )}
      </div>
    </div>
  );
} 