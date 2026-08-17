import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MoneyNoteLogo from '../common/MoneyNoteLogo';
import Button from '../common/Button';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Sparkles,
  X
} from 'lucide-react';

const OnboardingModal = () => {
  const { user, markOnboardingCompleted } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user has already completed onboarding or user is null, do not render modal
  if (!user || user.onboardingCompleted) {
    return null;
  }

  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      await markOnboardingCompleted();
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinishOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-center">
              <div className="p-4 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-primary shadow-soft">
                <MoneyNoteLogo size="lg" clickable={false} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
                Welcome to MoneyNote 💰
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium max-w-sm mx-auto leading-relaxed">
                Manage your income, expenses, savings and budgets in one simple place.
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-soft">
                <TrendingUp className="w-10 h-10" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Track Your Income
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium max-w-sm mx-auto leading-relaxed">
                Record your salary and other income sources so you always know how much money is coming in.
              </p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-3xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-soft">
                <TrendingDown className="w-10 h-10" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Control Your Expenses
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium max-w-sm mx-auto leading-relaxed">
                Track your daily spending and understand where your money goes.
              </p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-3xl bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-soft">
                <PiggyBank className="w-10 h-10" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Build Your Savings
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium max-w-sm mx-auto leading-relaxed">
                Set savings goals, create budgets and track your financial progress.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-8 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        {/* Top Progress Dots & Skip Button */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-4">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === currentStep
                    ? 'w-6 bg-primary'
                    : step < currentStep
                    ? 'w-2 bg-emerald-500'
                    : 'w-2 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleFinishOnboarding}
            disabled={isSubmitting}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors px-2 py-1 rounded-lg"
          >
            Skip
          </button>
        </div>

        {/* Step Content */}
        <div className="min-h-[180px] flex items-center justify-center">
          {renderStepContent()}
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/60 gap-3">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="md"
              icon={ArrowLeft}
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="md"
              onClick={handleFinishOnboarding}
              disabled={isSubmitting}
              className="text-slate-400 dark:text-slate-500"
            >
              Skip
            </Button>
          )}

          <Button
            variant="primary"
            size="md"
            icon={currentStep === 4 ? Sparkles : ArrowRight}
            iconPosition="right"
            onClick={handleNext}
            isLoading={isSubmitting}
          >
            {currentStep === 4 ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
