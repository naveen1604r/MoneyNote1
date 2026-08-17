import React from 'react';
import { NavLink } from 'react-router-dom';

const MoneyNoteLogo = ({
  iconOnly = false,
  size = 'md',
  clickable = true,
  className = '',
}) => {
  // Sizing configurations
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Emblem (M + ₹ / Spark) */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-primary to-emerald-500 text-white font-extrabold shadow-md shadow-primary/20 shrink-0 ${iconSizes[size]}`}>
        <span className="tracking-tighter font-black">M</span>
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
      </div>

      {/* Brand Text */}
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold tracking-tight text-slate-900 dark:text-white ${textSizes[size]}`}>
            Money<span className="text-primary font-extrabold">Note</span>
          </span>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
            Personal Finance
          </span>
        </div>
      )}
    </div>
  );

  if (clickable) {
    return (
      <NavLink
        to="/dashboard"
        className="focus:outline-none group transition-transform duration-200 active:scale-95 inline-flex items-center"
        title="MoneyNote Dashboard"
      >
        {content}
      </NavLink>
    );
  }

  return content;
};

export default MoneyNoteLogo;
