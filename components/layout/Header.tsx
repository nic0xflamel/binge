'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface HeaderProps {
  groupName?: string;
  userName?: string;
}

export default function Header({ groupName, userName }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="bg-sky-500 shadow-lg relative overflow-visible" role="banner">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20px 20px, white 2px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-1 relative z-10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:opacity-90 transition flex items-center">
              <img src="/logo.png" alt="Binge" className="h-12 md:h-14 w-auto drop-shadow-xl" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" role="navigation" aria-label="Main navigation">
            <Link
              href="/dashboard"
              className={`font-medium transition-colors duration-200 px-2 py-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-sky-500 ${
                pathname === '/dashboard'
                  ? 'text-white border-b-2 border-white pb-1'
                  : 'text-white/90 hover:text-white'
              }`}
              aria-current={pathname === '/dashboard' ? 'page' : undefined}
            >
              Dashboard
            </Link>
            <Link
              href="/swipe"
              className={`font-medium transition-colors duration-200 px-2 py-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-sky-500 ${
                pathname === '/swipe'
                  ? 'text-white border-b-2 border-white pb-1'
                  : 'text-white/90 hover:text-white'
              }`}
              aria-current={pathname === '/swipe' ? 'page' : undefined}
            >
              Swipe
            </Link>
            <Link
              href="/matches"
              className={`font-medium transition-colors duration-200 px-2 py-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-sky-500 ${
                pathname?.startsWith('/matches')
                  ? 'text-white border-b-2 border-white pb-1'
                  : 'text-white/90 hover:text-white'
              }`}
              aria-current={pathname?.startsWith('/matches') ? 'page' : undefined}
            >
              Matches
            </Link>
            <Link
              href="/group"
              className={`font-medium transition-colors duration-200 px-2 py-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-sky-500 ${
                pathname === '/group'
                  ? 'text-white border-b-2 border-white pb-1'
                  : 'text-white/90 hover:text-white'
              }`}
              aria-current={pathname === '/group' ? 'page' : undefined}
            >
              Group
            </Link>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-semibold transition-colors duration-200 backdrop-blur-sm border-2 border-white/40 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-sky-500"
                aria-label="User menu"
                aria-expanded={showMenu}
                aria-haspopup="true"
              >
                {userName?.[0]?.toUpperCase() || 'U'}
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-200" role="menu">
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 focus:outline-none focus:bg-gray-100"
                    role="menuitem"
                  >
                    {loading ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="md:hidden p-2 hover:bg-white/20 rounded-lg transition text-white"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {showMenu ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <nav className="md:hidden mt-4 pt-4 border-t border-white/30 space-y-2">
            <Link
              href="/dashboard"
              className="block py-2 px-4 hover:bg-white/20 rounded-lg transition text-white"
              onClick={() => setShowMenu(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/swipe"
              className="block py-2 px-4 hover:bg-white/20 rounded-lg transition text-white"
              onClick={() => setShowMenu(false)}
            >
              Swipe
            </Link>
            <Link
              href="/matches"
              className="block py-2 px-4 hover:bg-white/20 rounded-lg transition text-white"
              onClick={() => setShowMenu(false)}
            >
              Matches
            </Link>
            <Link
              href="/group"
              className="block py-2 px-4 hover:bg-white/20 rounded-lg transition text-white"
              onClick={() => setShowMenu(false)}
            >
              Group
            </Link>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full text-left py-2 px-4 hover:bg-white/20 rounded-lg transition disabled:opacity-50 text-white"
            >
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
