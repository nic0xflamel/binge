import { describe, it, expect } from '@jest/globals';
import { isNotNull } from '../database';

describe('Database Type Utilities', () => {
  describe('isNotNull', () => {
    it('should return true for non-null values', () => {
      expect(isNotNull('string')).toBe(true);
      expect(isNotNull(123)).toBe(true);
      expect(isNotNull(true)).toBe(true);
      expect(isNotNull(false)).toBe(true);
      expect(isNotNull({})).toBe(true);
      expect(isNotNull([])).toBe(true);
      expect(isNotNull(0)).toBe(true);
      expect(isNotNull('')).toBe(true);
    });

    it('should return false for null', () => {
      expect(isNotNull(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isNotNull(undefined)).toBe(false);
    });

    it('should work as a type guard with filter', () => {
      const mixedArray: (string | null | undefined)[] = [
        'hello',
        null,
        'world',
        undefined,
        'test',
      ];

      const filtered = mixedArray.filter(isNotNull);

      expect(filtered).toEqual(['hello', 'world', 'test']);
      expect(filtered).toHaveLength(3);

      // Type check - this should compile without errors
      const firstItem: string = filtered[0];
      expect(typeof firstItem).toBe('string');
    });

    it('should work with objects', () => {
      interface Profile {
        name: string;
        age: number;
      }

      const profiles: (Profile | null)[] = [
        { name: 'Alice', age: 30 },
        null,
        { name: 'Bob', age: 25 },
        null,
      ];

      const validProfiles = profiles.filter(isNotNull);

      expect(validProfiles).toHaveLength(2);
      expect(validProfiles[0].name).toBe('Alice');
      expect(validProfiles[1].name).toBe('Bob');
    });

    it('should work with nested structures', () => {
      interface Swipe {
        decision: 'yes' | 'no';
        profiles: { name: string } | null;
      }

      const swipes: Swipe[] = [
        { decision: 'yes', profiles: { name: 'Alice' } },
        { decision: 'no', profiles: null },
        { decision: 'yes', profiles: { name: 'Bob' } },
      ];

      const profileNames = swipes
        .map((s) => s.profiles)
        .filter(isNotNull)
        .map((p) => p.name);

      expect(profileNames).toEqual(['Alice', 'Bob']);
    });

    it('should handle empty arrays', () => {
      const emptyArray: (string | null)[] = [];
      const filtered = emptyArray.filter(isNotNull);
      expect(filtered).toEqual([]);
    });

    it('should handle arrays with all null values', () => {
      const allNullArray: (string | null)[] = [null, null, null];
      const filtered = allNullArray.filter(isNotNull);
      expect(filtered).toEqual([]);
    });

    it('should handle arrays with all valid values', () => {
      const allValidArray: (string | null)[] = ['a', 'b', 'c'];
      const filtered = allValidArray.filter(isNotNull);
      expect(filtered).toEqual(['a', 'b', 'c']);
    });
  });
});
