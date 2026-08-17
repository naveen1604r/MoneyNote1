import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, Eye, EyeOff, Sun, Moon, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';

const getPasswordStrength = (pass) => {
  if (!pass) return { score: 0, label: '', color: '' };
  if (pass.length < 8) return { score: 1, label: 'Weak', color: 'bg-rose-500 text-rose-500' };

  const hasNumbers = /\d/.test(pass);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);

  if (hasNumbers && hasUpper && hasLower && hasSpecial) {
    return { score: 3, label: 'Strong', color: 'bg-emerald-500 text-emerald-500' };
  }
  if ((hasNumbers && (hasUpper || hasLower)) || hasSpecial) {
    return { score: 2, label: 'Medium', color: 'bg-amber-500 text-amber-500' };
  }

  return { score: 1, label: 'Weak', color: 'bg-rose-500 text-rose-500' };
};

const Register = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const passwordStrength = getPasswordStrength(password);

  const validateForm = () => {
    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return false;
    }
    if (!email.trim()) {
      setErrorMessage('Email address is required.');
      return false;
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setErrorMessage('Password is required.');
      return false;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await register(name, email, password, confirmPassword);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrorMessage(result.message || 'Registration failed.');
      }
    } catch (err) {
      setErrorMessage('An error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Floating Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm hover:shadow transition-all"
        title="Toggle Theme"
      >
        {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
      </button>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white shadow-lg mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            Start tracking your finances today.
          </p>
        </div>

        {/* Register Form Card */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 shadow-soft-lg space-y-5">
          {errorMessage && (
            <Toast
              type="error"
              message={errorMessage}
              onClose={() => setErrorMessage('')}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Naveen"
                  disabled={isSubmitting}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="naveen@example.com"
                  disabled={isSubmitting}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="At least 8 characters"
                  disabled={isSubmitting}
                  className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Strength:</span>
                    <span className={passwordStrength.color.split(' ')[1]}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex gap-1">
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        passwordStrength.score >= 1 ? passwordStrength.color.split(' ')[0] : 'bg-transparent'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        passwordStrength.score >= 2 ? passwordStrength.color.split(' ')[0] : 'bg-transparent'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        passwordStrength.score >= 3 ? passwordStrength.color.split(' ')[0] : 'bg-transparent'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Re-enter password"
                  disabled={isSubmitting}
                  className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="w-full mt-2"
              icon={ArrowRight}
              iconPosition="right"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
