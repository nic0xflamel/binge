# TMDB ETL Script

This script fetches movie and TV show data from The Movie Database (TMDB) API and populates your Supabase database.

## What It Does

### 1. **Extract** (from TMDB)
- Fetches popular movies and TV shows
- Gets detailed metadata for each title
- Retrieves trailer URLs (YouTube embeds)
- Pulls genre and rating information

### 2. **Transform** (process data)
- Maps TMDB data to your database schema
- Converts genre IDs to genre names
- **Derives "vibes"** from genres (the secret sauce!):
  - Action → "Edge-of-seat"
  - Comedy → "Laugh-out-loud", "Feel-good"
  - Horror + Thriller → "Dark", "Edge-of-seat"
  - Drama → "Tearjerker", "Epic"
  - Sci-Fi → "Mind-bending"
  - Romance → "Feel-good", "Tearjerker"
- Formats poster URLs (500px width)
- Normalizes runtime data

### 3. **Load** (into database)
- Upserts titles into `titles` table
- Adds streaming availability (currently randomized)
- Prevents duplicates with conflict handling

## Setup

### 1. Get TMDB API Key

1. Create account at [themoviedb.org](https://www.themoviedb.org/)
2. Go to Settings → API
3. Request API key (free for non-commercial use)
4. Copy your API key

### 2. Get Supabase Service Role Key

1. Go to your [Supabase project dashboard](https://supabase.com/dashboard)
2. Settings → API
3. Copy **service_role key** (secret, server-side only!)

### 3. Add Environment Variables

Add to your `.env.local`:

```env
# TMDB API
TMDB_API_KEY=your_tmdb_api_key_here

# Supabase (service role key for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

⚠️ **Never commit `.env.local` to git!** (already in .gitignore)

## Usage

### Install Dependencies

```bash
yarn add -D tsx
```

### Run the ETL Script

```bash
yarn etl:tmdb
```

### What to Expect

```
🚀 Starting TMDB ETL...

📽️  Fetching popular movies...
📥 Fetching movies page 1/5...
📥 Fetching movies page 2/5...
📥 Fetching movies page 3/5...
📥 Fetching movies page 4/5...
📥 Fetching movies page 5/5...
💾 Upserting 100 titles...
✅ Upserted 100 titles
🎬 Adding streaming availability for 100 titles...
✅ Added streaming availability

📺 Fetching popular TV shows...
📥 Fetching tv page 1/5...
...

✨ ETL Complete!
📊 Total titles in database: 210
📊 Added 100 movies
📊 Added 100 TV shows
```

### Customization

Edit `scripts/etl-tmdb.ts` to:

1. **Change number of pages fetched** (line ~185):
   ```typescript
   const movies = await fetchPopularTitles('movie', 10); // Fetch 10 pages = ~200 movies
   const tvShows = await fetchPopularTitles('tv', 10);   // Fetch 10 pages = ~200 shows
   ```

2. **Fetch different categories**:
   - Popular: `/movie/popular` (default)
   - Top Rated: `/movie/top_rated`
   - Trending: `/trending/movie/week`
   - Upcoming: `/movie/upcoming`

3. **Add more vibe mappings** (line ~28):
   ```typescript
   const GENRE_TO_VIBE_MAP: Record<string, string[]> = {
     'Action': ['Edge-of-seat', 'Adrenaline-rush'], // Add custom vibes
     // ...
   };
   ```

## Rate Limiting

TMDB API limits:
- **Free tier**: 40 requests per 10 seconds
- Script includes 250ms delay between requests
- Fetching 5 pages of movies/TV = ~100 requests ≈ 25 seconds

## Streaming Availability

### Current Implementation (Mock Data)
The script currently assigns **random streaming services** to titles. This is fine for development/testing but not production-ready.

### Production Solution

For real streaming data, you need to integrate with a streaming availability API:

#### Option 1: JustWatch API (Recommended)
- **Unofficial API**: [github.com/dawoudt/JustWatchAPI](https://github.com/dawoudt/JustWatchAPI)
- Provides real-time streaming availability per region
- Free but unofficial (may break)

#### Option 2: Watchmode API
- **Official API**: [watchmode.com](https://api.watchmode.com/)
- 1,000 free requests/month
- $9/mo for 10,000 requests

#### Option 3: TMDB Watch Providers
- Built into TMDB API: `/movie/{id}/watch/providers`
- Limited regions & services
- Free with TMDB key

### Example: Using TMDB Watch Providers

```typescript
async function fetchStreamingProviders(titleId: number, type: 'movie' | 'tv', region: string = 'US') {
  const data = await fetchFromTMDB(`/${type}/${titleId}/watch/providers`);
  const providers = data.results[region];

  if (!providers) return [];

  const services = new Set<string>();

  // Flatrate = subscription services
  providers.flatrate?.forEach((p: any) => {
    const service = mapProviderToService(p.provider_name);
    if (service) services.add(service);
  });

  return Array.from(services);
}

function mapProviderToService(providerName: string): string | null {
  const mapping: Record<string, string> = {
    'Netflix': 'netflix',
    'Amazon Prime Video': 'prime',
    'Disney Plus': 'disney',
    'HBO Max': 'hbo',
    'Hulu': 'hulu',
    'Apple TV Plus': 'apple',
    'Paramount Plus': 'paramount',
    'Peacock': 'peacock',
  };

  return mapping[providerName] || null;
}
```

## Vibe Derivation Logic

The script automatically creates "vibes" based on genre combinations:

| Genres | Vibes |
|--------|-------|
| Action | Edge-of-seat |
| Comedy | Laugh-out-loud, Feel-good |
| Drama | Tearjerker, Epic |
| Horror + Thriller | Dark, Edge-of-seat |
| Sci-Fi | Mind-bending |
| Romance | Feel-good, Tearjerker |
| Fantasy + Adventure | Epic |
| Documentary | Mind-bending |
| Crime | Dark |

**Example:**
- Movie: "The Dark Knight"
- Genres: Action, Crime, Drama, Thriller
- Derived Vibes: "Edge-of-seat", "Dark", "Tearjerker", "Epic"

## Maintaining Your Catalog

### Recommended Schedule

1. **Daily**: Fetch new releases
   ```bash
   # Cron job
   0 3 * * * cd /path/to/binge && yarn etl:tmdb >> logs/etl.log 2>&1
   ```

2. **Weekly**: Update popular titles
3. **Monthly**: Refresh entire catalog

### Prevent Duplicates

The script uses `upsert` with `onConflict: 'id'`, so running it multiple times won't create duplicates - it will update existing titles.

## Troubleshooting

### Rate Limit Errors

```
TMDB API error: Too Many Requests
```

**Solution**: Increase delay between requests:
```typescript
await new Promise(resolve => setTimeout(resolve, 500)); // Increase from 250ms
```

### Missing Service Role Key

```
❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables
```

**Solution**: Add service role key to `.env.local` (see Setup step 2)

### No Trailers Found

Some titles don't have trailers. This is normal - the script handles it gracefully with `null`.

## Future Enhancements

- ✅ Fetch from TMDB
- ✅ Derive vibes
- ⏳ Real streaming availability (JustWatch/Watchmode)
- ⏳ Internationalization (multiple regions)
- ⏳ Delta updates (only fetch new titles)
- ⏳ Keyword-based vibe enhancement
- ⏳ User-generated vibe tags

---

**Questions?** Check the [TMDB API docs](https://developers.themoviedb.org/3) or open an issue.
