import { NavLink } from 'react-router-dom';
import { authAPI } from '../src/services/api';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/calendar', label: 'Calendar', icon: '📅' },
  { to: '/timetable', label: 'Timetable', icon: '📖' },
];

export default function SidebarNav({ onLogout }) {
  const handleLogout = async () => {
    try {
      // Call logout API to invalidate server-side session
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with client-side logout even if API call fails
    } finally {
      // Call parent logout handler to clear client-side data
      onLogout();
    }
  };
  return (
    <>
      {/* Sidebar for desktop */}
      <nav className="hidden md:flex flex-col gap-2 glass bg-deep-800/80 shadow-2xl rounded-r-3xl py-8 px-4 min-w-[90px] items-center transition-all duration-300 h-full border-r border-white/10">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-xl font-inter text-sm transition-all duration-200
              ${isActive ? 'bg-accent-600 text-white shadow' : 'text-light-200 hover:bg-accent-700/30 hover:text-accent-500'}`
            }
            end={item.to === '/'}
            aria-label={item.label}
          >
            <span className="text-2xl mb-1" aria-hidden="true">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
        
        {/* Logout button for desktop */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl font-inter text-sm transition-all duration-200 text-light-200 hover:bg-red-600/30 hover:text-red-400"
            aria-label="Logout"
          >
            <span className="text-2xl mb-1" aria-hidden="true">🚪</span>
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </nav>
      {/* Top nav for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden justify-around glass bg-deep-800/90 shadow-2xl rounded-t-2xl py-2 px-1 border-t border-white/10">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg font-inter text-xs transition-all duration-200
              ${isActive ? 'bg-accent-600 text-white shadow' : 'text-light-200 hover:bg-accent-700/30 hover:text-accent-500'}`
            }
            end={item.to === '/'}
            aria-label={item.label}
          >
            <span className="text-xl" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
        
        {/* Logout button for mobile */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg font-inter text-xs transition-all duration-200 text-light-200 hover:bg-red-600/30 hover:text-red-400"
          aria-label="Logout"
        >
          <span className="text-xl" aria-hidden="true">🚪</span>
          <span>Logout</span>
        </button>
      </nav>
    </>
  );
} 