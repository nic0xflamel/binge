/**
 * TMDB ETL Script
 *
 * Fetches movie and TV show data from TMDB API and populates the database.
 *
 * Usage:
 *   1. Get TMDB API key from https://www.themoviedb.org/settings/api
 *   2. Set TMDB_API_KEY in .env.local
 *   3. Run: yarn tsx scripts/etl-tmdb.ts
 */

import { createClient } from '@supabase/supabase-js';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!TMDB_API_KEY) {
  console.error('❌ TMDB_API_KEY not found in environment variables');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  process.exit(1);
}

// Validate service role key is not the anon key
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (SUPABASE_SERVICE_KEY === SUPABASE_ANON_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY cannot be the same as the anon key');
  console.error('   The service role key is required for ETL operations');
  console.error('   Find it in: Supabase Dashboard → Project Settings → API → service_role key');
  process.exit(1);
}

// Validate service role key format (should be a JWT token, typically 200+ chars)
if (SUPABASE_SERVICE_KEY.length < 200) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY appears invalid (too short)');
  console.error('   Expected a JWT token of ~200+ characters');
  console.error('   Find it in: Supabase Dashboard → Project Settings → API → service_role key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// Vibe mapping based on genres
const GENRE_TO_VIBE_MAP: Record<string, string[]> = {
  'Action': ['Edge-of-seat'],
  'Adventure': ['Epic'],
  'Animation': ['Feel-good'],
  'Comedy': ['Laugh-out-loud', 'Feel-good'],
  'Crime': ['Dark'],
  'Documentary': ['Mind-bending'],
  'Drama': ['Tearjerker', 'Epic'],
  'Family': ['Feel-good', 'Cozy'],
  'Fantasy': ['Epic'],
  'History': ['Epic'],
  'Horror': ['Edge-of-seat', 'Dark'],
  'Music': ['Feel-good'],
  'Mystery': ['Mind-bending'],
  'Romance': ['Feel-good', 'Tearjerker'],
  'Science Fiction': ['Mind-bending'],
  'TV Movie': [],
  'Thriller': ['Edge-of-seat', 'Dark'],
  'War': ['Epic', 'Dark'],
  'Western': ['Epic'],
};

// Map TMDB genre IDs to names
const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

interface TMDBTitle {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  poster_path?: string;
  overview?: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  popularity: number;
  vote_average: number;
  adult: boolean;
  videos?: {
    results: Array<{
      type: string;
      site: string;
      key: string;
    }>;
  };
}

async function fetchFromTMDB(endpoint: string): Promise<any> {
  const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }

  return response.json();
}

function deriveVibes(genres: string[]): string[] {
  const vibes = new Set<string>();

  genres.forEach(genre => {
    const mappedVibes = GENRE_TO_VIBE_MAP[genre] || [];
    mappedVibes.forEach(vibe => vibes.add(vibe));
  });

  return Array.from(vibes);
}

function getGenreNames(genreIds: number[]): string[] {
  return genreIds.map(id => GENRE_MAP[id]).filter(Boolean);
}

function getTrailerUrl(videos?: { results: Array<{ type: string; site: string; key: string }> }): string | null {
  if (!videos?.results) return null;

  const trailer = videos.results.find(
    v => v.type === 'Trailer' && v.site === 'YouTube'
  );

  return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
}

async function fetchTitleDetails(id: number, type: 'movie' | 'tv'): Promise<TMDBTitle | null> {
  try {
    const data = await fetchFromTMDB(`/${type}/${id}?append_to_response=videos`);
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${type} ${id}:`, error);
    return null;
  }
}

async function processTitle(tmdbTitle: TMDBTitle, type: 'movie' | 'tv') {
  // Get full details including videos
  const details = await fetchTitleDetails(tmdbTitle.id, type);
  if (!details) return null;

  const name = details.title || details.name || '';
  const releaseDate = details.release_date || details.first_air_date || '';
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  // Get runtime
  let runtime = null;
  if (type === 'movie') {
    runtime = details.runtime || null;
  } else {
    runtime = details.episode_run_time?.[0] || null;
  }

  const posterUrl = details.poster_path
    ? `${TMDB_IMAGE_BASE}${details.poster_path}`
    : null;

  const genreNames = getGenreNames(details.genre_ids || details.genres?.map(g => g.id) || []);
  const vibes = deriveVibes(genreNames);
  const trailerUrl = getTrailerUrl(details.videos);

  return {
    id: details.id,
    type,
    name,
    year,
    runtime_min: runtime,
    poster_url: posterUrl,
    trailer_url: trailerUrl,
    overview: details.overview || '',
    genres: genreNames,
    vibes,
    popularity: details.popularity,
    rating: details.vote_average,
    adult: details.adult,
  };
}

async function fetchPopularTitles(type: 'movie' | 'tv', pages: number = 5) {
  const titles: any[] = [];

  for (let page = 1; page <= pages; page++) {
    console.log(`📥 Fetching ${type}s page ${page}/${pages}...`);

    const data = await fetchFromTMDB(`/${type}/popular?page=${page}`);

    for (const result of data.results) {
      const title = await processTitle(result, type);
      if (title) {
        titles.push(title);
      }

      // Rate limiting - TMDB allows 40 requests per 10 seconds
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  return titles;
}

async function upsertTitles(titles: any[]) {
  console.log(`💾 Upserting ${titles.length} titles...`);

  const { data, error } = await supabase
    .from('titles')
    .upsert(titles, { onConflict: 'id' });

  if (error) {
    console.error('❌ Error upserting titles:', error);
    throw error;
  }

  console.log(`✅ Upserted ${titles.length} titles`);
}

async function addStreamingAvailability(titleIds: number[], region: string = 'US') {
  console.log(`🎬 Adding streaming availability for ${titleIds.length} titles...`);

  // This is a simplified version. In production, you would:
  // 1. Use JustWatch API or similar
  // 2. Fetch real streaming data per region
  // 3. Handle rate limiting

  // For now, we'll randomly assign some streaming services
  const services = ['netflix', 'prime', 'disney', 'hbo', 'hulu'];

  const availabilityRecords = titleIds.map(titleId => ({
    title_id: titleId,
    region,
    services: services
      .filter(() => Math.random() > 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1),
  }));

  const { error } = await supabase
    .from('streaming_availability')
    .upsert(availabilityRecords, { onConflict: 'title_id,region' });

  if (error) {
    console.error('❌ Error adding streaming availability:', error);
    throw error;
  }

  console.log(`✅ Added streaming availability`);
}

async function main() {
  console.log('🚀 Starting TMDB ETL...\n');

  try {
    // Fetch popular movies
    console.log('📽️  Fetching popular movies...');
    const movies = await fetchPopularTitles('movie', 5);
    await upsertTitles(movies);
    await addStreamingAvailability(movies.map(m => m.id));

    // Fetch popular TV shows
    console.log('\n📺 Fetching popular TV shows...');
    const tvShows = await fetchPopularTitles('tv', 5);
    await upsertTitles(tvShows);
    await addStreamingAvailability(tvShows.map(t => t.id));

    // Stats
    const { count } = await supabase
      .from('titles')
      .select('*', { count: 'exact', head: true });

    console.log(`\n✨ ETL Complete!`);
    console.log(`📊 Total titles in database: ${count}`);
    console.log(`📊 Added ${movies.length} movies`);
    console.log(`📊 Added ${tvShows.length} TV shows`);

  } catch (error) {
    console.error('❌ ETL failed:', error);
    process.exit(1);
  }
}

main();
