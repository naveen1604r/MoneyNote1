import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const activeLoading = isLoading || loading;
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]';

  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white focus:ring-primary shadow-sm hover:shadow-md hover:shadow-primary/20',
    secondary: 'bg-secondary hover:bg-secondary-hover text-white focus:ring-secondary shadow-sm hover:shadow-md hover:shadow-secondary/20',
    outline: 'border border-slate-300 dark:border-slate-600 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-slate-400',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 focus:ring-slate-400',
    danger: 'bg-danger hover:bg-danger-dark text-white focus:ring-danger shadow-sm hover:shadow-md hover:shadow-danger/20',
    success: 'bg-success hover:bg-success-dark text-white focus:ring-success shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
    icon: 'p-2 text-sm',
  };

  return (
    <button
      disabled={disabled || activeLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {activeLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}

      {children && <span>{children}</span>}

      {!activeLoading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 shrink-0" />
      )}
    </button>
  );
};

export default Button;
