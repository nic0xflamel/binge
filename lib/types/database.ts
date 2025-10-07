/**
 * TypeScript types for Supabase database queries
 * These types represent the structure of data returned from joined queries
 */

// Base table types
export interface Profile {
  id: string;
  display_name: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Group {
  id: string;
  name: string;
  owner: string;
  match_threshold: 'majority' | 'unanimous';
  region: string;
  adult_content: boolean;
  created_at: string;
}

export interface Title {
  id: number;
  type: 'movie' | 'tv';
  name: string;
  year: number | null;
  runtime_min: number | null;
  poster_url: string | null;
  trailer_url: string | null;
  overview: string;
  genres: string[];
  vibes: string[];
  popularity: number;
  rating: number;
  adult: boolean;
}

// Joined query types
export interface GroupMemberWithProfile {
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  profiles: Profile | null;
}

export interface SwipeWithProfile {
  user_id: string;
  decision: 'yes' | 'no';
  profiles: Profile | null;
}

export interface MatchWithTitle {
  id: string;
  created_at: string;
  rule: string;
  titles: Title | null;
  match_members?: MatchMember[];
}

export interface MatchMember {
  user_id: string;
  profiles: Profile | null;
}

export interface GroupMembershipWithGroup {
  group_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  groups: Group | null;
}

export interface DeckWithItems {
  id: string;
  expires_at: string;
  deck_items: Array<{ count: number }>;
}

// Helper type for extracting nested data
export type Nullable<T> = T | null;

/**
 * Type guard to filter out null and undefined values
 *
 * Useful for filtering arrays with TypeScript's type narrowing. When used with
 * Array.filter(), TypeScript will correctly infer the resulting array type.
 *
 * @param value - The value to check for null/undefined
 * @returns True if the value is not null or undefined
 *
 * @example
 * const profiles = swipes.map(s => s.profiles).filter(isNotNull);
 * // profiles is now Profile[] instead of (Profile | null)[]
 */
export function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
