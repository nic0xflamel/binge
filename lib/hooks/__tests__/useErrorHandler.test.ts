import { describe, it, expect } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useErrorHandler } from '../useErrorHandler';

describe('useErrorHandler', () => {
  it('should initialize with no error', () => {
    const { result } = renderHook(() => useErrorHandler());
    expect(result.current.error).toBeNull();
  });

  it('should handle Error objects', () => {
    const { result } = renderHook(() => useErrorHandler());
    const testError = new Error('Test error message');

    act(() => {
      result.current.handleError(testError);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Test error message');
    expect(result.current.error?.details).toBe(testError);
  });

  it('should handle error objects with message property', () => {
    const { result } = renderHook(() => useErrorHandler());
    const errorObj = { message: 'Custom error', code: 'ERR_001' };

    act(() => {
      result.current.handleError(errorObj);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Custom error');
    expect(result.current.error?.code).toBe('ERR_001');
    expect(result.current.error?.details).toBe(errorObj);
  });

  it('should handle string errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError('String error message');
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('String error message');
  });

  it('should handle unknown errors with fallback message', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(12345);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('An unexpected error occurred');
    expect(result.current.error?.details).toBe(12345);
  });

  it('should use custom fallback message', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(null, 'Custom fallback');
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Custom fallback');
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(new Error('Test error'));
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should return the processed error', () => {
    const { result } = renderHook(() => useErrorHandler());
    let returnedError;

    act(() => {
      returnedError = result.current.handleError(new Error('Test'));
    });

    expect(returnedError).toBeDefined();
    expect(returnedError.message).toBe('Test');
  });

  it('should handle multiple errors in sequence', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(new Error('First error'));
    });
    expect(result.current.error?.message).toBe('First error');

    act(() => {
      result.current.handleError(new Error('Second error'));
    });
    expect(result.current.error?.message).toBe('Second error');
  });
});
