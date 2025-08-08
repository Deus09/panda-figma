// Error types and utilities for global error handling
export class AppError extends Error {
  public readonly code: string;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: string = 'GENERIC_ERROR',
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.context = context;
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network connection failed', context?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', 'high', context);
    this.name = 'NetworkError';
  }
}

export class ApiError extends AppError {
  public readonly status?: number;
  
  constructor(
    message: string,
    status?: number,
    context?: Record<string, any>
  ) {
    const code = status ? `API_ERROR_${status}` : 'API_ERROR';
    const severity = status && status >= 500 ? 'high' : 'medium';
    
    super(message, code, severity, { ...context, status });
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface ErrorReport {
  id: string;
  timestamp: Date;
  error: Error;
  userAgent: string;
  url: string;
  route?: string;
  userId?: string;
  context?: Record<string, any>;
}
