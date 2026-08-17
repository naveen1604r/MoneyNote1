import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Target,
  Repeat,
  PiggyBank,
  FileText,
  BarChart3,
  User,
  Settings,
  Download,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import MoneyNoteLogo from '../common/MoneyNoteLogo';

const mainNavItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Income', path: '/income', icon: Wallet },
  { name: 'Expenses', path: '/expenses', icon: CreditCard },
  { name: 'Budget', path: '/budgets', icon: Target },
  { name: 'Recurring', path: '/recurring', icon: Repeat },
  { name: 'Savings', path: '/savings', icon: PiggyBank },
  { name: 'Finance Notes', path: '/notes', icon: FileText },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
];

const bottomNavItems = [
  { name: 'Export & Backup', path: '/export', icon: Download },
  { name: 'MoneyNote Guide', path: '/help', icon: HelpCircle },
  { name: 'Profile', path: '/profile', icon: User },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = ({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Prevent body scrolling when mobile navigation drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
      isActive
        ? 'bg-primary text-white shadow-md shadow-primary/25 font-semibold'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className={`flex items-center h-16 border-b border-slate-200/80 dark:border-slate-800 transition-all duration-300 ${
        isCollapsed && !mobileOpen ? 'justify-center px-2' : 'justify-between px-4'
      }`}>
        <MoneyNoteLogo iconOnly={isCollapsed && !mobileOpen} />

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
          className={`hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            isCollapsed && !mobileOpen ? 'ml-1' : ''
          }`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {(!isCollapsed || mobileOpen) && (
          <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </div>
        )}
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={navLinkClass}
              title={isCollapsed && !mobileOpen ? item.name : undefined}
            >
              <Icon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {(!isCollapsed || mobileOpen) && (
                <span className="truncate">{item.name}</span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 space-y-1">
        {(!isCollapsed || mobileOpen) && (
          <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Preferences & Data
          </div>
        )}
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={navLinkClass}
              title={isCollapsed && !mobileOpen ? item.name : undefined}
            >
              <Icon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {(!isCollapsed || mobileOpen) && (
                <span className="truncate">{item.name}</span>
              )}
            </NavLink>
          );
        })}

        <button
          onClick={handleLogout}
          aria-label="Log out"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-200 group"
          title={isCollapsed && !mobileOpen ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          {(!isCollapsed || mobileOpen) && (
            <span className="truncate">Logout</span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 ease-in-out glass-sidebar ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
