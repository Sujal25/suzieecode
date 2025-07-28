import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TimetableInputPage from '../pages/TimetableInputPage';
import TimetablePage from '../pages/TimetablePage';
import DashboardPage from '../pages/DashboardPage';
import CalendarPage from '../pages/CalendarPage';
import AdminUploadPage from '../pages/AdminUploadPage';
import AdminLoginPage from '../pages/AdminLoginPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import LandingPage from '../pages/LandingPage';
import SidebarNav from '../components/SidebarNav';
import { authAPI } from './services/api';

function App() {
  const [student, setStudent] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    // Check for existing authentication
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setStudent(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    // Set loading to false after checking authentication
    setLoading(false);
  }, []);

  // Simple admin route: ?admin=1
  const isAdmin = typeof window !== 'undefined' && window.location.search.includes('admin=1');
  if (isAdmin) return <AdminUploadPage />;

  const handleLogin = (userData) => {
    setStudent(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setStudent(null);
    setIsAuthenticated(false);
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen dark:bg-deep-900 bg-white flex items-center justify-center">
        <div className="text-accent-500 text-2xl font-poppins">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500 mx-auto mb-4"></div>
          Loading AttendEase...
        </div>
      </div>
    );
  }

  // Check if current user is admin
  const isAdminUser = student && (student.role === 'admin' || student._id === 'admin');

  if (!isAuthenticated) {
    // Check current path for specific pages
    const currentPath = window.location.pathname;
    
    if (currentPath === '/admin') {
      return <AdminLoginPage onAdminLogin={handleLogin} />;
    }
    
    if (currentPath === '/register') {
      return <RegisterPage onRegisterSuccess={handleLogin} />;
    }
    
    if (currentPath === '/login') {
      return <LoginPage onLogin={handleLogin} />;
    }
    
    // Default to landing page
    return <LandingPage onLogin={handleLogin} />;
  }

  // If user is admin, show admin dashboard
  if (isAdminUser) {
    return <AdminDashboardPage onLogout={handleLogout} />;
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <SidebarNav onLogout={handleLogout} />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/timetable" element={<TimetablePage />} />
            <Route path="/register" element={<RegisterPage onRegisterSuccess={handleLogin} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
