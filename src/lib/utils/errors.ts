// Error types
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public debugInfo?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, debugInfo?: any) {
    super(message, 'NETWORK_ERROR', debugInfo);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, debugInfo?: any) {
    super(message, 'VALIDATION_ERROR', debugInfo);
    this.name = 'ValidationError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, debugInfo?: any) {
    super(message, 'AUTH_ERROR', debugInfo);
    this.name = 'AuthError';
  }
}

// Error messages
export const ERROR_MESSAGES = {
  default: 'An unexpected error occurred. Please try again.',
  network: 'Unable to connect to the server. Please check your connection.',
  validation: 'Please check your input and try again.',
  auth: 'Authentication error. Please sign in again.',
  notFound: 'The requested resource was not found.',
  serverError: 'Server error. Please try again later.',
} as const;

// Debug mode
const DEBUG = import.meta.env.MODE === 'development';

// Import debug utilities
import { logDebug, formatDebugError } from './debug';

// Error handler
export async function handleError(error: unknown, context?: string): Promise<AppError> {
  // Log error in development
  if (DEBUG) {
    console.error(`Error in ${context || 'unknown context'}:`, error);
  }

  // Log error to debug system
  await logDebug({
    function_name: context || 'unknown',
    error_message: formatDebugError(error),
    input_params: {
      error_type: error instanceof Error ? error.constructor.name : typeof error,
      error_message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }
  });

  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Convert known error types
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return new NetworkError(ERROR_MESSAGES.network, error);
    }
    if (error.message.includes('validation')) {
      return new ValidationError(ERROR_MESSAGES.validation, error);
    }
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      return new AuthError(ERROR_MESSAGES.auth, error);
    }
    
    return new AppError(error.message, undefined, error);
  }

  return new AppError(ERROR_MESSAGES.default, undefined, error);
}

// Format error message for display
export function formatErrorMessage(error: unknown): string {
  const appError = error instanceof AppError ? error : handleError(error);
  
  if (DEBUG && appError.debugInfo) {
    return `${appError.message}\n\nDebug info: ${JSON.stringify(appError.debugInfo, null, 2)}`;
  }

  return appError.message;
}