import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('moneynote_token'));
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('moneynote_token');
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success && response.data.user) {
          setUser(response.data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('moneynote_token');
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Session restoration failed:', error);
        localStorage.removeItem('moneynote_token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Update user state dynamically without full reload
  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : prev));
  };

  // Mark onboarding completed in DB and state
  const markOnboardingCompleted = async () => {
    try {
      await api.post('/profile/complete-onboarding');
      setUser((prev) => (prev ? { ...prev, onboardingCompleted: true } : prev));
    } catch (err) {
      console.error('Failed to mark onboarding completed:', err);
      setUser((prev) => (prev ? { ...prev, onboardingCompleted: true } : prev));
    }
  };

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('moneynote_token', newToken);
        setToken(newToken);
        setUser(userData);
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid login credentials. Please try again.';
      return { success: false, message: msg };
    }
  };

  // Register handler
  const register = async (name, email, password, confirmPassword) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        confirmPassword,
      });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('moneynote_token', newToken);
        setToken(newToken);
        setUser(userData);
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message || 'Registration failed' };
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please check your details.';
      return { success: false, message: msg };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('moneynote_token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        markOnboardingCompleted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
