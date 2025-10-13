'use client';

import Link from 'next/link';

interface EnhancedEmptyStateProps {
  type: 'likes' | 'matches';
  actionHref?: string;
  actionLabel?: string;
}

export default function EnhancedEmptyState({ 
  type, 
  actionHref = '/swipe', 
  actionLabel = 'Start Swiping' 
}: EnhancedEmptyStateProps) {
  
  if (type === 'likes') {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="w-24 h-24 mx-auto mb-6 relative">
          <svg viewBox="0 0 100 100" className="w-full h-full" style={{ animation: 'spin 8s linear infinite' }}>
            <defs>
              <linearGradient id="filmGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#filmGradient)" opacity="0.1" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="url(#filmGradient)" strokeWidth="3" />
            <circle cx="85" cy="50" r="5" fill="url(#filmGradient)" />
            <circle cx="72.5" cy="80.3" r="5" fill="url(#filmGradient)" />
            <circle cx="27.5" cy="80.3" r="5" fill="url(#filmGradient)" />
            <circle cx="15" cy="50" r="5" fill="url(#filmGradient)" />
            <circle cx="27.5" cy="19.7" r="5" fill="url(#filmGradient)" />
            <circle cx="72.5" cy="19.7" r="5" fill="url(#filmGradient)" />
            <circle cx="50" cy="50" r="10" fill="url(#filmGradient)" />
          </svg>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Your Watchlist Awaits! 🍿
        </h3>
        <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
          Start swiping to discover movies and shows you&apos;ll absolutely love!
        </p>
        <Link
          href={actionHref}
          className="bg-gradient-to-r from-sky-600 to-pink-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg min-h-[44px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 button-spring-hover button-glow-primary active:scale-95 transform transition-transform duration-150 inline-block"
        >
          {actionLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-12 animate-fade-in">
      <div className="w-24 h-24 mx-auto mb-6 relative">
        <svg viewBox="0 0 100 120" className="w-full h-full">
          <defs>
            <linearGradient id="popcornGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
            <linearGradient id="boxGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fcd34d" />
            </linearGradient>
          </defs>

          <path
            d="M 30 60 L 20 120 L 80 120 L 70 60 Z"
            fill="url(#boxGradient)"
            stroke="#f59e0b"
            strokeWidth="2"
          />

          <line x1="25" y1="75" x2="75" y2="75" stroke="#f59e0b" strokeWidth="1.5" />
          <line x1="23" y1="90" x2="77" y2="90" stroke="#f59e0b" strokeWidth="1.5" />
          <line x1="21" y1="105" x2="79" y2="105" stroke="#f59e0b" strokeWidth="1.5" />

          <circle cx="40" cy="50" r="8" fill="url(#popcornGradient)">
            <animate attributeName="cy" values="50;45;50" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="42" r="9" fill="url(#popcornGradient)">
            <animate attributeName="cy" values="42;37;42" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="60" cy="48" r="8" fill="url(#popcornGradient)">
            <animate attributeName="cy" values="48;43;48" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="35" cy="38" r="7" fill="url(#popcornGradient)">
            <animate attributeName="cy" values="38;33;38" dur="2.1s" repeatCount="indefinite" />
          </circle>
          <circle cx="65" cy="40" r="7" fill="url(#popcornGradient)">
            <animate attributeName="cy" values="40;35;40" dur="2.3s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        No Matches Yet—But Soon! 🎬
      </h3>
      <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
        Once your crew agrees on something, it&apos;ll show up here. Time to start swiping!
      </p>
      <Link
        href={actionHref}
        className="bg-gradient-to-r from-sky-600 to-pink-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg min-h-[44px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 button-spring-hover button-glow-primary active:scale-95 transform transition-transform duration-150 inline-block"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
