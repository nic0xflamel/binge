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
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
    },
    pink: {
      50: '#fdf2f8',
      100: '#fce7f3',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
    },
  },

  // Neutral Colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
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
    large: 'text-lg text-gray-700',
    base: 'text-base text-gray-700',
    small: 'text-sm text-gray-600',
    xs: 'text-xs text-gray-500',
  },
} as const;

// Spacing
export const spacing = {
  container: 'max-w-6xl mx-auto px-6',
  section: 'py-8',
  card: 'p-6',
} as const;

// Component Styles
export const components = {
  // Card variants
  card: {
    base: `bg-white/80 backdrop-blur-sm ${borderRadius.xl} ${shadows.md} border border-gray-100 hover:${shadows.lg} transition-all`,
    solid: `bg-white ${borderRadius.xl} ${shadows.md} hover:${shadows.lg} transition-all`,
    feature: `bg-white/80 backdrop-blur-sm ${borderRadius.xl} ${shadows.md} p-8 hover:${shadows.xl} transition-all group`,
  },

  // Button variants
  button: {
    primary: `${gradients.primary} text-white font-semibold py-3 px-6 ${borderRadius.lg} hover:${shadows.lg} hover:scale-105 active:scale-95 transform transition-all`,
    secondary: `bg-sky-50 text-sky-700 font-semibold py-3 px-6 ${borderRadius.lg} hover:bg-sky-100 hover:scale-105 active:scale-95 transform transition-all border border-sky-200`,
    ghost: `bg-gray-100 text-gray-700 font-semibold py-3 px-6 ${borderRadius.lg} hover:bg-gray-200 hover:scale-105 active:scale-95 transform transition-all`,
    danger: `bg-red-600 text-white font-semibold py-3 px-6 ${borderRadius.lg} hover:bg-red-700 hover:scale-105 active:scale-95 transform transition-all`,
  },

  // Badge variants
  badge: {
    primary: `text-sm font-semibold text-sky-600 bg-sky-50 px-3 py-1.5 ${borderRadius.full}`,
    secondary: `text-sm font-semibold text-pink-600 bg-pink-50 px-3 py-1.5 ${borderRadius.full}`,
    neutral: `text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 ${borderRadius.full}`,
    gradient: `text-sm font-semibold text-white ${gradients.primary} px-3 py-1.5 ${borderRadius.full}`,
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

  // Links
  link: {
    primary: 'text-sky-600 hover:text-sky-700 transition-colors font-medium',
    back: 'text-sky-100 hover:text-white transition-colors inline-block mb-2',
    nav: 'text-white/90 hover:text-white transition font-medium',
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
  pageWithHeader: `min-h-screen bg-gray-50`,
  container: 'max-w-6xl mx-auto p-6',
  narrowContainer: 'max-w-4xl mx-auto p-6',
} as const;
