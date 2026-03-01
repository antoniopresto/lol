import { Component, type ErrorInfo, type ReactNode } from 'react';
import { WarningIcon } from '../icons';
import './error_boundary.scss';

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  error: Error | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    error: null,
    showDetails: false,
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error);
    if (info.componentStack) {
      console.error('[ErrorBoundary] Component stack:', info.componentStack);
    }
  }

  componentDidUpdate(_: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    if (this.state.error && !prevState.error) {
      window.addEventListener('keydown', this.handleKeyDown, true);
    }
    if (!this.state.error && prevState.error) {
      window.removeEventListener('keydown', this.handleKeyDown, true);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown, true);
  }

  private handleRetry = () => {
    this.setState(
      {
        error: null,
        showDetails: false,
      },
      () => {
        this.props.onReset?.();
      },
    );
  };

  private handleToggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.handleRetry();
    }
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    const { error, showDetails } = this.state;
    const errorMessage = error.message || 'An unexpected error occurred';
    const errorStack = error.stack;

    return (
      <div className="error-boundary" role="alert">
        <div className="error-boundary__content">
          <div className="error-boundary__icon">
            <WarningIcon size={32} />
          </div>
          <h2 className="error-boundary__title">Something went wrong</h2>
          <p className="error-boundary__message">{errorMessage}</p>
          {errorStack && (
            <>
              <button
                type="button"
                className="error-boundary__toggle"
                onClick={this.handleToggleDetails}
                aria-expanded={showDetails}
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
              {showDetails && (
                <pre className="error-boundary__stack">{errorStack}</pre>
              )}
            </>
          )}
          <div className="error-boundary__actions">
            <button
              type="button"
              className="error-boundary__button"
              onClick={this.handleRetry}
              autoFocus
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
}
