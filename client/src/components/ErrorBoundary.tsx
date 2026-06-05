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
      if (this.props.fallback) {return this.props.fallback;}

      return (
        <div className="min-h-dvh flex items-center justify-center p-4 bg-bg text-ink">
          <div className="panel max-w-md w-full p-8 text-center animate-reveal">
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted">Error</p>
            <h2 className="font-mono text-2xl font-extrabold mt-3 mb-2 text-ink">
              Something broke
            </h2>
            <p className="text-sm mb-6 text-muted">
              An unexpected error occurred. You can try again without refreshing.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleRetry}
                className="w-full font-mono font-bold text-sm uppercase tracking-[0.04em] py-3 bg-accent text-accent-ink transition-[filter] hover:brightness-95"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full font-mono text-xs font-semibold uppercase tracking-[0.04em] py-2.5 border-[1.5px] border-line text-muted transition-colors hover:text-ink"
              >
                Refresh Page
              </button>
            </div>

            <details className="text-left mt-4">
              <summary className="font-mono text-xs cursor-pointer text-muted hover:text-ink">
                Technical details
              </summary>
              <pre className="mt-2 p-3 font-mono text-xs overflow-auto max-h-32 border-[1.5px] border-line text-muted">
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
