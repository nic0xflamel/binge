import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get match details
  const { data: match } = await supabase
    .from('matches')
    .select(`
      id,
      created_at,
      rule,
      group_id,
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
          display_name,
          avatar_url
        )
      )
    `)
    .eq('id', id)
    .single();

  if (!match) {
    notFound();
  }

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
  const title = match.titles as unknown as TitleData | null;
  if (!title) notFound();

  // Get streaming availability
  const { data: group } = await supabase
    .from('groups')
    .select('region')
    .eq('id', match.group_id)
    .single();

  const { data: availability } = await supabase
    .from('streaming_availability')
    .select('services')
    .eq('title_id', title.id)
    .eq('region', group?.region || 'US')
    .single();

  // Get streaming links
  const { data: streamingLinks } = await supabase
    .from('streaming_links')
    .select('*');

  const linksMap = new Map(streamingLinks?.map(link => [link.service, link.link_template]) || []);

  // Get user's rating for this title
  const { data: userRating } = await supabase
    .from('ratings')
    .select('rating, reaction')
    .eq('group_id', match.group_id)
    .eq('user_id', user.id)
    .eq('title_id', title.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Link href="/matches" className="text-purple-100 hover:text-white inline-block mb-2">
            ← Back to Matches
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Poster and Info */}
          <div className="md:flex">
            {/* Poster */}
            <div className="md:w-1/3">
              <div className="aspect-[2/3] bg-gray-200 relative">
                {title.poster_url ? (
                  <Image
                    src={title.poster_url}
                    alt={title.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="md:w-2/3 p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {title.name}
                  </h1>
                  <div className="flex items-center gap-3 text-gray-600 mb-4">
                    <span>{title.year}</span>
                    {title.runtime_min && (
                      <>
                        <span>•</span>
                        <span>{title.runtime_min} minutes</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap">
                  ✨ Match
                </div>
              </div>

              {/* Genres */}
              {title.genres && title.genres.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {title.genres.map(genre => (
                      <span
                        key={genre}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Vibes */}
              {title.vibes && title.vibes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Vibes</h3>
                  <div className="flex flex-wrap gap-2">
                    {title.vibes.map(vibe => (
                      <span
                        key={vibe}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        {vibe}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Overview */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Overview</h3>
                <p className="text-gray-700 leading-relaxed">{title.overview}</p>
              </div>

              {/* Streaming Services */}
              {availability?.services && availability.services.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Watch on</h3>
                  <div className="flex flex-wrap gap-2">
                    {availability.services.map((service: string) => {
                      const template = linksMap.get(service);
                      const url = template?.replace('{tmdb_id}', title.id.toString());

                      return url ? (
                        <a
                          key={service}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all capitalize"
                        >
                          {service}
                        </a>
                      ) : (
                        <span
                          key={service}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium capitalize"
                        >
                          {service}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Trailer */}
              {title.trailer_url && (
                <div className="mb-6">
                  <a
                    href={title.trailer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-purple-100 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 transition-all"
                  >
                    🎬 Watch Trailer
                  </a>
                </div>
              )}

              {/* Who Liked This */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Matched by {match.match_members?.length || 0} members
                </h3>
                <div className="flex flex-wrap gap-2">
                  {match.match_members?.map((member: any, idx: number) => {
                    const displayName = member.profiles?.display_name as string | undefined;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {displayName?.[0] || '?'}
                        </div>
                        <span className="text-sm text-gray-700">
                          {displayName || 'Unknown'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Section */}
        {!userRating && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rate this title</h2>
            <p className="text-gray-600 mb-4">Have you watched it? Let your group know what you thought!</p>
            <Link
              href={`/matches/${id}/rate`}
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-8 rounded-lg hover:shadow-lg transition-all"
            >
              Add Rating
            </Link>
          </div>
        )}

        {userRating && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your Rating</h2>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{'⭐'.repeat(userRating.rating)}</span>
              <span className="text-gray-600">({userRating.rating}/5)</span>
            </div>
            {userRating.reaction && (
              <p className="text-gray-700">{userRating.reaction}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
