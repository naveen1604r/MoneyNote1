import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[React ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Something went wrong
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                An unexpected UI rendering error occurred. Please reload the application.
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
