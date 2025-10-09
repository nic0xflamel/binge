import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { components, layouts } from '@/lib/design-system';

export default async function MatchesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get user's first group
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, groups(name)')
    .eq('user_id', user.id)
    .limit(1);

  if (!memberships || memberships.length === 0) {
    redirect('/onboarding/group');
  }

  type GroupData = { name: string };
  const groupId = memberships[0].group_id;
  const groupName = (memberships[0].groups as unknown as GroupData | null)?.name;

  // Get all matches for this group
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id,
      created_at,
      rule,
      titles (
        id,
        name,
        year,
        runtime_min,
        poster_url,
        trailer_url,
        overview,
        genres,
        vibes
      ),
      match_members (
        user_id,
        profiles (
          display_name
        )
      )
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  type TitleData = {
    id: number;
    name: string;
    year: number | null;
    runtime_min: number | null;
    poster_url: string | null;
    trailer_url: string | null;
    overview: string;
    genres: string[];
    vibes: string[];
  };
  type MatchData = {
    id: string;
    created_at: string;
    rule: string;
    titles: TitleData | null;
    match_members: any[];
  };
  const typedMatches = matches as MatchData[] | null;

  return (
    <div className={layouts.pageWithHeader}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-20 md:pb-8">
        {typedMatches && typedMatches.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {typedMatches.map(match => {
              const title = match.titles;
              if (!title) return null;

              return (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="group"
                >
                  <div className={components.card.solid}>
                    {/* Poster */}
                    <div className="aspect-[2/3] bg-gray-200 relative overflow-hidden rounded-t-xl">
                      {title.poster_url ? (
                        <Image
                          src={title.poster_url}
                          alt={title.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                      {/* Match badge */}
                      <div className={`absolute top-2 right-2 ${components.badge.gradient} flex items-center gap-1`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        <span>Match</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 sm:p-4">
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 text-sm sm:text-base">
                        {title.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                        <span>{title.year}</span>
                        {title.runtime_min && (
                          <>
                            <span>•</span>
                            <span>{title.runtime_min}m</span>
                          </>
                        )}
                      </div>

                      {/* Members who liked */}
                      <div className="text-xs text-gray-500">
                        {match.match_members?.length || 0} members liked this
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className={`${components.card.solid} p-12 text-center`}>
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No matches yet</h2>
            <p className="text-gray-600 mb-6">
              Start swiping to find titles your group will love!
            </p>
            <Link
              href="/swipe"
              className={`inline-block ${components.button.primary}`}
            >
              Start Swiping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
