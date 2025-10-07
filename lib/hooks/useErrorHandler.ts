import { useState, useCallback } from 'react';

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

export function useErrorHandler() {
  const [error, setError] = useState<AppError | null>(null);

  const handleError = useCallback((error: unknown, fallbackMessage = 'An unexpected error occurred') => {
    let appError: AppError;

    if (error instanceof Error) {
      appError = {
        message: error.message,
        details: error,
      };
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      appError = {
        message: (error as { message: string }).message,
        code: 'code' in error ? (error as { code: string }).code : undefined,
        details: error,
      };
    } else if (typeof error === 'string') {
      appError = {
        message: error,
      };
    } else {
      appError = {
        message: fallbackMessage,
        details: error,
      };
    }

    setError(appError);
    return appError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
}
