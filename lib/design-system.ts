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
  display: 'text-5xl font-black tracking-tight text-gray-900',
  heading: {
    h1: 'text-4xl font-bold tracking-tight text-gray-900',
    h2: 'text-3xl font-bold tracking-tight text-gray-900',
    h3: 'text-2xl font-semibold tracking-tight text-gray-900',
    h4: 'text-xl font-semibold text-gray-900',
  },
  subtitle: 'text-lg text-gray-600 font-medium',
  body: {
    large: 'text-lg text-gray-800 leading-relaxed',
    base: 'text-base text-gray-800 leading-relaxed',
    small: 'text-sm text-gray-700',
    xs: 'text-xs text-gray-600',
  },
  caption: 'text-sm text-gray-600',
  overline: 'text-xs uppercase tracking-wider font-bold text-gray-500 mb-3',
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
    base: `bg-white/80 backdrop-blur-sm ${borderRadius.xl} ${shadows.md} border border-gray-100 hover:${shadows.xl} hover:scale-[1.02] hover:ring-2 hover:ring-sky-400/50 transition-all duration-300 ease-out`,
    solid: `bg-white ${borderRadius.xl} ${shadows.md} hover:${shadows.xl} hover:scale-[1.02] hover:ring-2 hover:ring-sky-400/50 transition-all duration-300 ease-out`,
    feature: `bg-white/80 backdrop-blur-sm ${borderRadius.xl} ${shadows.md} p-6 sm:p-8 hover:${shadows.xl} hover:scale-[1.02] hover:ring-2 hover:ring-sky-400/50 transition-all duration-300 ease-out group`,
    interactive: `bg-white ${borderRadius.xl} ${shadows.md} hover:${shadows['2xl']} hover:scale-[1.02] hover:ring-2 hover:ring-sky-400/50 transition-all duration-300 ease-out cursor-pointer`,
  },

  // Button variants (all with min 44px touch targets)
  button: {
    primary: `bg-gradient-to-r from-sky-600 to-pink-600 text-white font-semibold py-3 px-6 ${borderRadius.lg} ${shadows.md} min-h-[44px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 button-spring-hover button-glow-primary hover:brightness-110 active:scale-95 transform transition-all duration-150`,
    secondary: `bg-sky-100 text-sky-700 font-semibold py-3 px-6 ${borderRadius.lg} hover:bg-sky-200 hover:brightness-105 border-2 border-sky-300 ${shadows.sm} min-h-[44px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 button-spring-hover active:scale-95 transform transition-all duration-150`,
    ghost: `bg-gray-200 text-gray-800 font-semibold py-3 px-6 ${borderRadius.lg} hover:bg-gray-300 hover:brightness-105 border-2 border-gray-300 min-h-[44px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 button-spring-hover active:scale-95 transform transition-all duration-150`,
    danger: `bg-red-600 text-white font-semibold py-3 px-6 ${borderRadius.lg} hover:bg-red-700 ${shadows.md} min-h-[44px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 button-spring-hover active:scale-95 transform transition-transform duration-150`,
  },

  // Badge variants (consistent styling with borders)
  badge: {
    primary: `text-sm font-bold text-sky-800 bg-sky-100 px-3 py-1.5 ${borderRadius.full} border border-sky-300 shadow-sm`,
    secondary: `text-sm font-bold text-pink-800 bg-pink-100 px-3 py-1.5 ${borderRadius.full} border border-pink-300 shadow-sm`,
    neutral: `text-sm font-semibold text-gray-800 bg-gray-100 px-3 py-1.5 ${borderRadius.full} border border-gray-300 shadow-sm`,
    gradient: `text-sm font-bold text-white ${gradients.primary} px-3 py-1.5 ${borderRadius.full} ${shadows.sm}`,
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
