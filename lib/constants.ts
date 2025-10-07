// Streaming Services
export const STREAMING_SERVICES = [
  'netflix',
  'prime',
  'disney',
  'hbo',
  'hulu',
  'apple',
  'paramount',
  'peacock',
] as const;

export type StreamingService = typeof STREAMING_SERVICES[number];

// Genres
export const GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Sci-Fi',
  'Romance',
  'Thriller',
  'Documentary',
  'Animation',
  'Fantasy',
  'Mystery',
  'Crime',
] as const;

export type Genre = typeof GENRES[number];

// Moods/Vibes
export const MOODS = [
  'Feel-good',
  'Mind-bending',
  'Edge-of-seat',
  'Laugh-out-loud',
  'Tearjerker',
  'Epic',
  'Cozy',
  'Dark',
] as const;

export type Mood = typeof MOODS[number];

// Runtime Limits
export const RUNTIME_CONFIG = {
  MIN: 60,
  MAX: 240,
  STEP: 15,
  DEFAULT: 180,
} as const;

// Match Thresholds
export const MATCH_THRESHOLDS = ['majority', 'unanimous'] as const;
export type MatchThreshold = typeof MATCH_THRESHOLDS[number];

// Rating Configuration
export const RATING_CONFIG = {
  MIN_STARS: 1,
  MAX_STARS: 5,
  MAX_REACTION_LENGTH: 500,
} as const;

// Regions
export const REGIONS = ['US', 'UK', 'CA', 'AU', 'EU'] as const;
export type Region = typeof REGIONS[number];

// Rate Limiting
export const RATE_LIMITS = {
  /** Minimum time between swipes in milliseconds */
  SWIPE_COOLDOWN_MS: 300,
} as const;

// Durations (in milliseconds)
export const DURATIONS = {
  /** Default toast display duration */
  TOAST_DEFAULT_MS: 5000,
  /** Animation duration for card transitions */
  CARD_TRANSITION_MS: 150,
} as const;

// Validation constraints
export const VALIDATION = {
  /** Minimum length for display name */
  DISPLAY_NAME_MIN: 2,
  /** Maximum length for display name */
  DISPLAY_NAME_MAX: 50,
  /** Minimum length for group name */
  GROUP_NAME_MIN: 2,
  /** Maximum length for group name */
  GROUP_NAME_MAX: 50,
  /** Maximum length for bio */
  BIO_MAX: 200,
} as const;

// UI Constants
export const UI = {
  /** Maximum number of recent matches to show on dashboard */
  RECENT_MATCHES_LIMIT: 6,
} as const;
