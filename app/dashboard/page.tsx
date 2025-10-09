import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { components, layouts } from '@/lib/design-system';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get user's groups
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, groups(id, name)')
    .eq('user_id', user.id);

  type GroupData = { id: string; name: string };
  const groups = memberships?.map(m => m.groups as unknown as GroupData | null).filter((g): g is GroupData => g !== null) || [];
  const activeGroup = groups[0];

  if (!activeGroup) {
    redirect('/onboarding/group');
  }

  // Get recent matches for this group
  const { data: matches } = await supabase
    .from('matches')
    .select('id, created_at, titles(id, name, poster_url, year)')
    .eq('group_id', activeGroup.id)
    .order('created_at', { ascending: false })
    .limit(6);

  type TitleData = { id: number; name: string; poster_url: string | null; year: number | null };
  type MatchData = { id: string; created_at: string; titles: TitleData | null };
  const typedMatches = matches as MatchData[] | null;

  // Get user's personal likes (all 'yes' swipes)
  const { data: likes } = await supabase
    .from('swipes')
    .select('title_id, created_at, titles(id, name, poster_url, year)')
    .eq('user_id', user.id)
    .eq('decision', 'yes')
    .order('created_at', { ascending: false })
    .limit(12);

  type LikeData = { title_id: number; created_at: string; titles: TitleData | null };
  const typedLikes = likes as LikeData[] | null;

  return (
    <div className={layouts.page}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6 pb-20 md:pb-8 pt-4 sm:pt-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-5 animate-fade-in">
          {/* Start Swiping Card */}
          <Link href="/swipe" className="group">
            <div className="bg-gradient-to-br from-sky-100 to-sky-200 rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all duration-200 active:scale-95 border border-sky-200">
              <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Start Swiping</h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                Discover your next favorite show or movie
              </p>
            </div>
          </Link>

          {/* Matches Card */}
          <Link href="/matches" className="group">
            <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all duration-200 active:scale-95 border border-pink-200">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Your Matches</h2>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold text-pink-700">{typedMatches?.length || 0}</span> titles everyone loves
              </p>
            </div>
          </Link>
        </div>

        {/* My Likes */}
        <div className={`${components.card.base} p-4 sm:p-6 md:p-8 animate-slide-up`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Likes</h2>
              <p className="text-sm text-gray-600 mt-1">Movies and shows you want to watch</p>
            </div>
            {typedLikes && typedLikes.length > 0 && (
              <div className={components.badge.primary}>
                {typedLikes.length}+ saved
              </div>
            )}
          </div>
          {typedLikes && typedLikes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {typedLikes.map((like, idx) => (
                <div
                  key={`${like.title_id}-${like.created_at}`}
                  className="group"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="aspect-[2/3] bg-gradient-to-br from-sky-100 to-pink-100 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-200 relative group-hover:scale-105">
                    {like.titles?.poster_url ? (
                      <Image
                        src={like.titles.poster_url}
                        alt={like.titles.name || ''}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 right-2">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-gray-900 truncate">
                    {like.titles?.name}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {like.titles?.year}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No likes yet</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Start swiping to build your personal watchlist of movies and shows you love!
              </p>
              <Link
                href="/swipe"
                className={`${components.button.primary} inline-block`}
              >
                Start Swiping
              </Link>
            </div>
          )}
        </div>

        {/* Recent Matches */}
        <div className={`${components.card.base} p-4 sm:p-6 md:p-8 animate-slide-up`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Group Matches</h2>
              <p className="text-sm text-gray-600 mt-1">What everyone agreed on</p>
            </div>
          </div>
          {typedMatches && typedMatches.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {typedMatches.map((match, idx) => (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="group"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="aspect-[2/3] bg-gradient-to-br from-sky-100 to-pink-100 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-200 relative group-hover:scale-105">
                    {match.titles?.poster_url ? (
                      <Image
                        src={match.titles.poster_url}
                        alt={match.titles.name || ''}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-gray-900 truncate">
                    {match.titles?.name}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {match.titles?.year}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches yet</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                When your group agrees on titles, they&apos;ll show up here. Get everyone swiping!
              </p>
              <Link
                href="/swipe"
                className={`${components.button.primary} inline-block`}
              >
                Start Swiping
              </Link>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className={`${components.card.base} p-4 sm:p-6 md:p-8`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/preferences"
              className="p-5 border border-gray-200 rounded-2xl hover:border-sky-400 hover:bg-sky-50/50 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-200 transition-colors">
                  <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Preferences</h3>
                  <p className="text-sm text-gray-600">Update viewing preferences</p>
                </div>
              </div>
            </Link>
            <Link
              href="/group"
              className="p-5 border border-gray-200 rounded-2xl hover:border-sky-400 hover:bg-sky-50/50 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0 group-hover:bg-pink-200 transition-colors">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Group Settings</h3>
                  <p className="text-sm text-gray-600">Manage group and invites</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
