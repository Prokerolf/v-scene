import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 text-red-900 p-8 flex flex-col items-center justify-center font-sans">
          <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-8 border-2 border-red-200">
            <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
              <span className="material-symbols-rounded text-red-500 text-4xl">error</span>
              Application Crash Detected
            </h1>
            <p className="mb-6 text-red-700 bg-red-100 p-4 rounded-lg font-mono text-sm overflow-auto">
              {this.state.error && this.state.error.toString()}
            </p>
            <details className="bg-gray-50 p-4 rounded-lg border border-gray-200" open>
              <summary className="font-bold cursor-pointer text-gray-700 mb-2">Component Stack Trace</summary>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-96">
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-rounded">refresh</span> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
