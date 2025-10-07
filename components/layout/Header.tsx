'use client';

import { useState } from 'react';
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
    <header className="bg-sky-500 shadow-lg relative overflow-visible">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20px 20px, white 2px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-2 relative z-10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:opacity-90 transition flex items-center -my-6 md:-my-12 -ml-2">
              <img src="/logo.png" alt="Binge" className="h-24 md:h-44 w-auto relative z-20 drop-shadow-2xl" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className={`font-medium transition ${
                pathname === '/dashboard'
                  ? 'text-white border-b-2 border-white pb-1'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/swipe"
              className={`font-medium transition ${
                pathname === '/swipe'
                  ? 'text-white border-b-2 border-white pb-1'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Swipe
            </Link>
            <Link
              href="/matches"
              className={`font-medium transition ${
                pathname?.startsWith('/matches')
                  ? 'text-white border-b-2 border-white pb-1'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Matches
            </Link>
            <Link
              href="/group"
              className={`font-medium transition ${
                pathname === '/group'
                  ? 'text-white border-b-2 border-white pb-1'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Group
            </Link>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-semibold transition backdrop-blur-sm border-2 border-white/40"
              >
                {userName?.[0]?.toUpperCase() || 'U'}
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-200">
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
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
