import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({
  size = 'md',
  fullPage = false,
  label = 'Loading...'
}) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizes[size] || sizes.md} text-primary animate-spin`} />
      {label && (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[400px] flex items-center justify-center w-full h-full p-8">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
