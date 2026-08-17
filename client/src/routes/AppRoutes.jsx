import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout
import DashboardLayout from '../layouts/DashboardLayout';

// Routes Guard
import ProtectedRoute from '../components/routes/ProtectedRoute';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Income from '../pages/Income';
import Expenses from '../pages/Expenses';
import Budgets from '../pages/Budgets';
import Recurring from '../pages/Recurring';
import Savings from '../pages/Savings';
import FinanceNotes from '../pages/FinanceNotes';
import Reports from '../pages/Reports';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Notifications from '../pages/Notifications';
import Search from '../pages/Search';
import Export from '../pages/Export';
import HelpGuide from '../pages/HelpGuide';

// Public Route Guard (Redirects authenticated users away from Login/Register to Dashboard)
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage label="Checking session..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/recurring" element={<Recurring />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/notes" element={<FinanceNotes />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/search" element={<Search />} />
          <Route path="/export" element={<Export />} />
          <Route path="/help" element={<HelpGuide />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
