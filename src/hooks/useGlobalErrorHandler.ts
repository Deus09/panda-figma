import { useEffect } from 'react';
import { errorLogger } from '../utils/errors/logger';
import { NetworkError, ApiError, AppError } from '../utils/errors/errorTypes';

interface GlobalErrorHookOptions {
  enableUnhandledRejectionHandler?: boolean;
  enableErrorHandler?: boolean;
  enableNetworkErrorReporting?: boolean;
  onError?: (error: Error, context?: any) => void;
}

export const useGlobalErrorHandler = (options: GlobalErrorHookOptions = {}) => {
  const {
    enableUnhandledRejectionHandler = true,
    enableErrorHandler = true,
    enableNetworkErrorReporting = true,
    onError
  } = options;

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      let error: Error;
      
      // Convert rejection reason to Error if needed
      if (event.reason instanceof Error) {
        error = event.reason;
      } else if (typeof event.reason === 'string') {
        error = new Error(event.reason);
      } else {
        error = new Error('Unknown promise rejection');
      }

      // Enhance with context if it's a fetch error
      if (error.message.includes('fetch') || error.message.includes('network')) {
        error = new NetworkError(error.message, {
          originalError: event.reason,
          url: window.location.href
        });
      }

      const errorId = errorLogger.logWithThrottle(error, {
        type: 'unhandledRejection',
        reason: event.reason,
        url: window.location.href,
        timestamp: Date.now()
      });

      if (errorId && onError) {
        onError(error, { errorId, type: 'promise' });
      }

      // Prevent the default browser behavior
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      const error = event.error || new Error(event.message || 'Script error');
      
      const errorId = errorLogger.logWithThrottle(error, {
        type: 'scriptError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        url: window.location.href,
        timestamp: Date.now()
      });

      if (errorId && onError) {
        onError(error, { errorId, type: 'script' });
      }
    };

    const handleNetworkError = (event: Event) => {
      if (enableNetworkErrorReporting && navigator.onLine === false) {
        const networkError = new NetworkError('Network connection lost');
        
        errorLogger.log(networkError, {
          type: 'networkDisconnection',
          online: navigator.onLine,
          timestamp: Date.now()
        });

        if (onError) {
          onError(networkError, { type: 'network' });
        }
      }
    };

    // Add event listeners
    if (enableUnhandledRejectionHandler) {
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
    }

    if (enableErrorHandler) {
      window.addEventListener('error', handleError);
    }

    if (enableNetworkErrorReporting) {
      window.addEventListener('offline', handleNetworkError);
    }

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      window.removeEventListener('offline', handleNetworkError);
    };
  }, [enableUnhandledRejectionHandler, enableErrorHandler, enableNetworkErrorReporting, onError]);

  // Return utility functions
  return {
    reportError: (error: Error, context?: any) => {
      const errorId = errorLogger.log(error, {
        ...context,
        manualReport: true,
        timestamp: Date.now()
      });
      
      if (onError) {
        onError(error, { errorId, type: 'manual' });
      }
      
      return errorId;
    },
    
    createApiError: (message: string, status?: number, context?: any) => {
      return new ApiError(message, status, context);
    },
    
    createNetworkError: (message?: string, context?: any) => {
      return new NetworkError(message, context);
    },
    
    createAppError: (message: string, code?: string, severity?: 'low' | 'medium' | 'high' | 'critical') => {
      return new AppError(message, code, severity);
    }
  };
};
