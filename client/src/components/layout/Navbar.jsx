import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../common/NotificationBell';
import SearchDropdown from '../search/SearchDropdown';
import { searchFinance } from '../../services/api';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/income': 'Income Management',
  '/expenses': 'Expense Tracker',
  '/budgets': 'Budget Management',
  '/recurring': 'Recurring Transactions',
  '/savings': 'Savings Goals',
  '/notes': 'Finance Notes',
  '/reports': 'Analytics & Reports',
  '/profile': 'User Profile',
  '/settings': 'Account Settings',
  '/notifications': 'Notifications',
  '/search': 'Global Search',
  '/export': 'Export & Backup',
};

const Navbar = ({ setMobileOpen }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset image error when avatarUrl changes
  useEffect(() => {
    setImageError(false);
  }, [user?.avatarUrl]);

  // Live Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [previewResults, setPreviewResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Debounced search for live Navbar dropdown preview
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      setPreviewResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await searchFinance({ q: searchQuery.trim(), limit: 5 });
        if (res.data.success) {
          setPreviewResults(res.data.results || []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Navbar search error:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageTitle = routeTitles[location.pathname] || 'MoneyNote';

  const getUserInitials = (name) => {
    if (!name) return 'MN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogoutClick = () => {
    setUserDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 glass-nav px-4 sm:px-6 flex items-center justify-between transition-all">
      {/* Left Section: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {pageTitle}
        </h2>
      </div>

      {/* Right Section: Live Search, Theme Toggle, NotificationBell, User Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Desktop Live Search Field */}
        <div className="relative hidden sm:block w-56 md:w-72" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search your finances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim()) setShowDropdown(true);
              }}
              aria-label="Search your finances"
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary text-xs font-medium"
            />
          </form>

          {showDropdown && (
            <SearchDropdown
              query={searchQuery}
              results={previewResults}
              onClose={() => setShowDropdown(false)}
            />
          )}
        </div>

        {/* Mobile Search Icon Button */}
        <button
          onClick={() => navigate('/search')}
          className="sm:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Search"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* Real Notification Bell Component */}
        <NotificationBell />

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            aria-label="User account menu"
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
          >
            {user?.avatarUrl && !imageError ? (
              <img
                src={user.avatarUrl}
                alt={user.name || 'User'}
                onError={() => setImageError(true)}
                className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
                {getUserInitials(user?.name)}
              </div>
            )}

            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                {user?.email || 'Account'}
              </span>
            </div>
            <ChevronDown className="hidden sm:block w-4 h-4 text-slate-400" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700/60">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || ''}
                </p>
              </div>

              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>View Profile</span>
              </button>

              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Account Settings</span>
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-700/60" />

              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
