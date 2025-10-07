import { describe, it, expect, jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '../useToast';

describe('useToast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with empty toasts array', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  describe('showToast', () => {
    it('should add a toast with default type', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Test message');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Test message');
      expect(result.current.toasts[0].type).toBe('info');
    });

    it('should add a toast with specified type', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Success message', 'success');
      });

      expect(result.current.toasts[0].type).toBe('success');
      expect(result.current.toasts[0].message).toBe('Success message');
    });

    it('should generate unique IDs for each toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('First');
        result.current.showToast('Second');
      });

      expect(result.current.toasts).toHaveLength(2);
      expect(result.current.toasts[0].id).not.toBe(result.current.toasts[1].id);
    });

    it('should return the toast ID', () => {
      const { result } = renderHook(() => useToast());
      let toastId: string = '';

      act(() => {
        toastId = result.current.showToast('Test');
      });

      expect(toastId).toBeTruthy();
      expect(result.current.toasts[0].id).toBe(toastId);
    });

    it('should auto-remove toast after duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Test', 'info', 5000);
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should not auto-remove toast when duration is 0', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Test', 'info', 0);
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(result.current.toasts).toHaveLength(1);
    });
  });

  describe('removeToast', () => {
    it('should remove a toast by ID', () => {
      const { result } = renderHook(() => useToast());
      let toastId: string = '';

      act(() => {
        toastId = result.current.showToast('Test', 'info', 0);
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        result.current.removeToast(toastId);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should only remove the specified toast', () => {
      const { result } = renderHook(() => useToast());
      let firstId: string = '';

      act(() => {
        firstId = result.current.showToast('First', 'info', 0);
        result.current.showToast('Second', 'info', 0);
      });

      expect(result.current.toasts).toHaveLength(2);

      act(() => {
        result.current.removeToast(firstId);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Second');
    });
  });

  describe('convenience methods', () => {
    it('should show success toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Success!');
      });

      expect(result.current.toasts[0].type).toBe('success');
      expect(result.current.toasts[0].message).toBe('Success!');
    });

    it('should show error toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.error('Error!');
      });

      expect(result.current.toasts[0].type).toBe('error');
      expect(result.current.toasts[0].message).toBe('Error!');
    });

    it('should show warning toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.warning('Warning!');
      });

      expect(result.current.toasts[0].type).toBe('warning');
      expect(result.current.toasts[0].message).toBe('Warning!');
    });

    it('should show info toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info('Info!');
      });

      expect(result.current.toasts[0].type).toBe('info');
      expect(result.current.toasts[0].message).toBe('Info!');
    });

    it('should accept custom duration', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Success!', 3000);
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.toasts).toHaveLength(0);
    });
  });

  describe('multiple toasts', () => {
    it('should handle multiple toasts simultaneously', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Success!');
        result.current.error('Error!');
        result.current.warning('Warning!');
      });

      expect(result.current.toasts).toHaveLength(3);
      expect(result.current.toasts[0].type).toBe('success');
      expect(result.current.toasts[1].type).toBe('error');
      expect(result.current.toasts[2].type).toBe('warning');
    });

    it('should remove toasts independently', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('First', 'info', 1000);
        result.current.showToast('Second', 'info', 2000);
        result.current.showToast('Third', 'info', 3000);
      });

      expect(result.current.toasts).toHaveLength(3);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.toasts).toHaveLength(2);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.toasts).toHaveLength(0);
    });
  });
});
