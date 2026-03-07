import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="min-h-dvh flex items-center justify-center p-4"
          style={{ background: 'var(--bg)', color: 'var(--text)' }}
        >
          <div
            className="glass-card max-w-md w-full p-8 text-center animate-bounce-in"
          >
            {/* Playful illustration */}
            <svg
              viewBox="0 0 120 120"
              className="w-24 h-24 mx-auto mb-4"
              aria-hidden="true"
            >
              <circle cx="60" cy="60" r="50" fill="rgba(244,63,94,0.1)" stroke="var(--danger)" strokeWidth="2" />
              {/* sad face */}
              <circle cx="45" cy="50" r="5" fill="var(--danger)" />
              <circle cx="75" cy="50" r="5" fill="var(--danger)" />
              <path d="M40 78 Q60 65 80 78" fill="none" stroke="var(--danger)" strokeWidth="3" strokeLinecap="round" />
              {/* X on forehead */}
              <line x1="52" y1="28" x2="60" y2="36" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="60" y1="28" x2="52" y2="36" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>

            <h2
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "'Fredoka One', cursive", color: 'var(--danger)' }}
            >
              Oops, something broke!
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              An unexpected error occurred. You can try again without refreshing.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleRetry}
                className="w-full py-3 rounded-full font-bold text-white transition-all hover:scale-[1.02] active:scale-95 focus:outline-none focus-visible:ring-2"
                style={{
                  background: 'var(--accent)',
                  fontFamily: "'Fredoka One', cursive",
                  boxShadow: '0 4px 16px rgba(139,92,246,0.35)',
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 rounded-full text-sm font-medium transition-all hover:opacity-80 focus:outline-none focus-visible:ring-2"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                Refresh Page
              </button>
            </div>

            <details className="text-left mt-4">
              <summary className="text-xs cursor-pointer hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                Technical details
              </summary>
              <pre
                className="mt-2 p-3 rounded-xl text-xs overflow-auto max-h-32"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                {this.state.error?.message}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
