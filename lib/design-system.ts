/**
 * Centralized Design System
 * Single source of truth for colors, spacing, and component styles
 */

// Color Palette
export const colors = {
  // Primary Brand Colors
  primary: {
    sky: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
    },
    pink: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9f1239',
    },
  },

  // Neutral Colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Status Colors
  status: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },
} as const;

// Gradients
export const gradients = {
  primary: 'bg-gradient-to-r from-sky-400 to-pink-400',
  primaryBr: 'bg-gradient-to-br from-sky-400 to-pink-400',
  background: 'bg-gradient-to-br from-sky-50 via-pink-50 to-blue-50',
  header: 'bg-sky-500',
} as const;

// Border Radius
export const borderRadius = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  full: 'rounded-full',
} as const;

// Shadows
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-lg',
  lg: 'shadow-xl',
  xl: 'shadow-2xl',
} as const;

// Typography
export const typography = {
  heading: {
    h1: 'text-4xl font-bold text-gray-900',
    h2: 'text-3xl font-bold text-gray-900',
    h3: 'text-2xl font-bold text-gray-900',
    h4: 'text-xl font-bold text-gray-900',
  },
  body: {
    large: 'text-lg text-gray-800',
    base: 'text-base text-gray-800',
    small: 'text-sm text-gray-700',
    xs: 'text-xs text-gray-600',
  },
} as const;

// Spacing (with safe area support)
export const spacing = {
  container: 'max-w-6xl mx-auto px-4 sm:px-6',
  section: 'py-6 sm:py-8',
  card: 'p-4 sm:p-6',
  pageBottom: 'pb-20 md:pb-8', // Account for mobile bottom nav
  safeTop: 'pt-[env(safe-area-inset-top)]',
  safeBottom: 'pb-[env(safe-area-inset-bottom)]',
} as const;

// Component Styles
export const components = {
  // Card variants
  card: {
    base: `bg-white/80 backdrop-blur-sm ${borderRadius.xl} ${shadows.md} border border-gray-100 hover:${shadows.lg} transition-all duration-200`,
    solid: `bg-white ${borderRadius.xl} ${shadows.md} hover:${shadows.lg} transition-all duration-200`,
    feature: `bg-white/80 backdrop-blur-sm ${borderRadius.xl} ${shadows.md} p-6 sm:p-8 hover:${shadows.xl} transition-all duration-200 group`,
  },

  // Button variants (all with min 44px touch targets)
  button: {
    primary: `bg-gradient-to-r from-sky-600 to-pink-600 text-white font-semibold py-3 px-6 ${borderRadius.lg} hover:${shadows.lg} hover:scale-105 active:scale-95 transform transition-all duration-200 ${shadows.md} min-h-[44px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2`,
    secondary: `bg-sky-100 text-sky-700 font-semibold py-3 px-6 ${borderRadius.lg} hover:bg-sky-200 hover:scale-105 active:scale-95 transform transition-all duration-200 border-2 border-sky-300 ${shadows.sm} min-h-[44px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2`,
    ghost: `bg-gray-200 text-gray-800 font-semibold py-3 px-6 ${borderRadius.lg} hover:bg-gray-300 hover:scale-105 active:scale-95 transform transition-all duration-200 border-2 border-gray-300 min-h-[44px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`,
    danger: `bg-red-600 text-white font-semibold py-3 px-6 ${borderRadius.lg} hover:bg-red-700 hover:scale-105 active:scale-95 transform transition-all duration-200 ${shadows.md} min-h-[44px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`,
  },

  // Badge variants (consistent styling with borders)
  badge: {
    primary: `text-sm font-semibold text-sky-700 bg-sky-100 px-3 py-1.5 ${borderRadius.full} border border-sky-200`,
    secondary: `text-sm font-semibold text-pink-700 bg-pink-100 px-3 py-1.5 ${borderRadius.full} border border-pink-200`,
    neutral: `text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 ${borderRadius.full} border border-gray-200`,
    gradient: `text-sm font-semibold text-white ${gradients.primary} px-3 py-1.5 ${borderRadius.full} ${shadows.sm}`,
  },

  // Icon containers
  icon: {
    base: `w-14 h-14 ${borderRadius.lg} ${gradients.primaryBr} flex items-center justify-center`,
    large: `w-20 h-20 ${borderRadius.xl} ${gradients.primaryBr} flex items-center justify-center`,
  },

  // Page header
  pageHeader: {
    container: `${gradients.header} text-white p-6 ${shadows.md} relative overflow-hidden`,
    pattern: 'absolute inset-0 opacity-10',
    content: 'max-w-6xl mx-auto relative z-10',
  },

  // Links (with focus states)
  link: {
    primary: 'text-sky-600 hover:text-sky-700 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 rounded-sm',
    back: 'text-sky-100 hover:text-white transition-colors duration-200 inline-block mb-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 rounded-sm',
    nav: 'text-white/90 hover:text-white transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-sky-500 rounded-sm',
  },
} as const;

// Animations
export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  scaleIn: 'animate-scale-in',
} as const;

// Helper function to create consistent page layouts
export const layouts = {
  page: `min-h-screen ${gradients.background}`,
  pageWithHeader: `min-h-screen ${gradients.background}`,
  container: 'max-w-6xl mx-auto p-6',
  narrowContainer: 'max-w-4xl mx-auto p-6',
} as const;
