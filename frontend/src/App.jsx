import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TimetableInputPage from '../pages/TimetableInputPage';
import TimetablePage from '../pages/TimetablePage';
import DashboardPage from '../pages/DashboardPage';
import CalendarPage from '../pages/CalendarPage';
import AdminUploadPage from '../pages/AdminUploadPage';
import SidebarNav from '../components/SidebarNav';

function App() {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Simple admin route: ?admin=1
  const isAdmin = typeof window !== 'undefined' && window.location.search.includes('admin=1');
  if (isAdmin) return <AdminUploadPage />;

  if (!student) {
    return <TimetableInputPage onSubmit={setStudent} />;
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <SidebarNav />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<DashboardPage batch={student.batch} user={student.roll || 'Student'} />} />
            <Route path="/calendar" element={<CalendarPage batch={student.batch} />} />
            <Route path="/timetable" element={<TimetablePage batch={student.batch} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
