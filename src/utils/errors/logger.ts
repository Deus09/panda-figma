import { AppError, ErrorReport } from './errorTypes';

class ErrorLogger {
  private errorQueue: ErrorReport[] = [];
  private readonly maxQueueSize = 50;

  log(error: Error, context?: Record<string, any>): string {
    const errorId = this.generateErrorId();
    
    const report: ErrorReport = {
      id: errorId,
      timestamp: new Date(),
      error,
      userAgent: navigator.userAgent,
      url: window.location.href,
      route: window.location.pathname,
      context
    };

    // Add to queue
    this.errorQueue.unshift(report);
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.pop();
    }

    // Console log with structured data
    console.error(`[Error ${errorId}]`, {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: report.timestamp.toISOString()
    });

    // Dispatch custom event for monitoring
    window.dispatchEvent(new CustomEvent('app-error', {
      detail: report
    }));

    return errorId;
  }

  logWithThrottle(error: Error, context?: Record<string, any>, throttleMs: number = 5000): string | null {
    const errorSignature = `${error.name}:${error.message}`;
    const now = Date.now();
    
    // Check if same error was logged recently
    const recentError = this.errorQueue.find(report => 
      `${report.error.name}:${report.error.message}` === errorSignature &&
      now - report.timestamp.getTime() < throttleMs
    );

    if (recentError) {
      console.warn(`Error throttled: ${errorSignature} (last logged: ${recentError.id})`);
      return null;
    }

    return this.log(error, context);
  }

  getRecentErrors(limit: number = 10): ErrorReport[] {
    return this.errorQueue.slice(0, limit);
  }

  generateReport(): string {
    const reports = this.getRecentErrors();
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errors: reports.map(r => ({
        id: r.id,
        timestamp: r.timestamp.toISOString(),
        name: r.error.name,
        message: r.error.message,
        stack: r.error.stack,
        context: r.context
      }))
    }, null, 2);
  }

  private generateErrorId(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const errorLogger = new ErrorLogger();
