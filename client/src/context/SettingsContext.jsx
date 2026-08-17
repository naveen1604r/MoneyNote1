import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSettings, updateSettings as apiUpdateSettings } from '../services/api';
import { parseDateOnly } from '../utils/dateUtils';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    currency: 'INR',
    dateFormat: 'DD MMM YYYY',
    theme: 'system',
    emailNotifications: true,
    expenseAlerts: true,
    savingsUpdates: true,
    billReminders: true,
    financialTips: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch settings from MySQL
  const fetchSettings = useCallback(async () => {
    try {
      const res = await getSettings();
      if (res.data.success && res.data.settings) {
        setSettings(res.data.settings);
      }
    } catch (error) {
      console.error('Failed to load user settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Update Settings in DB & Context
  const updateUserSettings = async (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      const res = await apiUpdateSettings(updated);
      if (res.data.success && res.data.settings) {
        setSettings(res.data.settings);
      }
      return res.data;
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  };

  // Helper: Format Currency Symbol
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
    const num = Number(amount);
    const formattedNum = Math.abs(num).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    });
    const prefix = num < 0 ? '-' : '';

    switch (settings.currency) {
      case 'USD':
        return `${prefix}$${formattedNum}`;
      case 'EUR':
        return `${prefix}€${formattedNum}`;
      case 'GBP':
        return `${prefix}£${formattedNum}`;
      case 'INR':
      default:
        return `${prefix}₹${formattedNum}`;
    }
  };

  // Helper: Safe Date-Only Formatter (no timezone shifting)
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = parseDateOnly(dateStr);
    if (!d || isNaN(d.getTime())) return String(dateStr);

    const day = String(d.getDate()).padStart(2, '0');
    const monthNum = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const monthShort = d.toLocaleDateString('en-US', { month: 'short' });

    switch (settings.dateFormat) {
      case 'DD/MM/YYYY':
        return `${day}/${monthNum}/${year}`;
      case 'MM/DD/YYYY':
        return `${monthNum}/${day}/${year}`;
      case 'DD MMM YYYY':
      default:
        return `${day} ${monthShort} ${year}`;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateUserSettings,
        formatCurrency,
        formatDate,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
