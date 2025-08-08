import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorLogger } from '../../utils/errors/logger';
import { AppError } from '../../utils/errors/errorTypes';
import ErrorFallback from './ErrorFallback';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; errorId: string; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
  private errorThrottle: Map<string, number> = new Map();

  public state: State = {
    hasError: false,
    error: null,
    errorId: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: null // Will be set in componentDidCatch
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Prevent infinite error loops
    if (this.isInfiniteLoop(error)) {
      console.error('Infinite error loop detected, preventing further logging');
      return;
    }

    // Log error with context
    const errorId = errorLogger.logWithThrottle(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'GlobalErrorBoundary',
      route: window.location.pathname,
      timestamp: Date.now()
    }, 3000); // 3 second throttle

    // Update state with error ID
    this.setState({ errorId: errorId || 'THROTTLED' });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to external monitoring if available
    if ((window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        error_boundary: 'global'
      });
    }
  }

  public render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || ErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          errorId={this.state.errorId || 'UNKNOWN'}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }

  private resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null
    });
  };

  private isInfiniteLoop(error: Error): boolean {
    const errorSignature = `${error.name}:${error.message}`;
    const now = Date.now();
    const lastOccurrence = this.errorThrottle.get(errorSignature);
    
    if (lastOccurrence && now - lastOccurrence < 1000) {
      return true; // Same error within 1 second = likely infinite loop
    }
    
    this.errorThrottle.set(errorSignature, now);
    
    // Clean old entries
    this.errorThrottle.forEach((timestamp, signature) => {
      if (now - timestamp > 10000) { // Remove entries older than 10 seconds
        this.errorThrottle.delete(signature);
      }
    });
    
    return false;
  }
}

export default GlobalErrorBoundary;
