# Binge - Group Movie & TV Recommendation App

A Hinge-style group picker for movies and TV shows. Swipe on titles with your group, and when enough members say "yes," you get a match with trailer and streaming links!

## Features

- 🔐 **Magic Link Authentication** - Passwordless login via email
- 👥 **Group Swiping** - Create or join groups and swipe together
- 🎬 **Infinite Feed** - Personalized recommendations based on group preferences
- ✨ **Smart Matching** - Majority or unanimous matching rules
- 🔔 **Real-time Notifications** - Instant match notifications via Supabase Realtime
- ⭐ **Ratings & Reviews** - Rate titles after watching
- 🎯 **Preferences** - Filter by services, genres, moods, and runtime
- 🔒 **RLS Security** - Row-level security for data protection

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TailwindCSS
- **Backend**: Supabase (Postgres, Auth, Realtime)
- **APIs**: TMDB (metadata), JustWatch (streaming availability)

## Architecture

### Database Schema
- **profiles** - User profiles
- **groups** - Watch groups with match rules
- **group_members** - Group membership
- **titles** - Movie/TV metadata from TMDB
- **streaming_availability** - Regional streaming data
- **swipes** - User decisions (yes/no)
- **matches** - Group matches when threshold met
- **ratings** - Post-watch ratings & reactions
- **preferences** - Per-user, per-group filtering

### Feed Algorithm

The app uses a smart feed generation algorithm that prioritizes:

1. **Group Interest (Priority 1)** - Titles that other group members have already liked (×1000 weight)
2. **Genre Matches (Priority 2)** - Titles matching user's preferred genres (×100 weight)
3. **Vibe Matches (Priority 3)** - Titles matching user's preferred moods (×50 weight)
4. **Popularity (Priority 4)** - Popular titles as baseline recommendation

The feed automatically loads more titles as you swipe, providing a seamless infinite scrolling experience similar to Tinder/Hinge.

### Key Features
- **Triggers**: Auto-match creation on swipes, owner transfer on leave
- **RLS**: Comprehensive row-level security policies
- **Indexes**: Optimized GIN and composite indexes for fast feed generation

## Setup

### Prerequisites
- Node.js 18+ and Yarn
- Supabase account

### 1. Clone & Install

```bash
git clone <repo-url>
cd binge
yarn install
```

### 2. Environment Variables

The `.env.local` file has been created with your Supabase credentials.

### 3. Database Setup

All migrations have been applied to your Supabase project:
- ✅ Tables created
- ✅ Indexes added
- ✅ RLS policies enabled
- ✅ Triggers configured
- ✅ Sample data loaded (10 titles)

### 4. Run Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage Flow

### 1. Onboarding
1. Sign in with magic link (check email)
2. Create profile (display name)
3. Create or join a group (invite code)
4. Set preferences (services, genres, moods, runtime)

### 2. Swiping
- View title cards with poster, info, genres, vibes
- Actions: Yes, No, Trailer
- Feed automatically loads more titles as you swipe
- Backend automatically checks for matches
- Matches appear only after ALL group members have swiped (privacy maintained)

### 3. Matches
- Realtime notifications when group threshold met
- View all matches with trailer & streaming links
- Rate titles after watching

### 4. Group Management
- View members
- Copy invite code
- Change match rule (owner only)
- Leave group (auto-transfers ownership)

## Database

### Sample Data
10 classic movies pre-loaded:
- Fight Club, Forrest Gump, The Shawshank Redemption
- The Godfather, Pulp Fiction, The Dark Knight
- The Green Mile, Schindler's List, 12 Angry Men, Spirited Away

Streaming availability for US and EU regions.

### Adding More Titles

**Use the included TMDB ETL script** to populate your database with real movie/TV data:

```bash
# 1. Get TMDB API key from https://www.themoviedb.org/settings/api
# 2. Add to .env.local:
#    TMDB_API_KEY=your_key_here
#    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 3. Install tsx
yarn add -D tsx

# 4. Run the ETL script
yarn etl:tmdb
```

This will fetch 100 movies + 100 TV shows from TMDB with metadata, posters, trailers, and derived "vibes".

📖 **Full ETL documentation**: [scripts/README.md](./scripts/README.md)

## Key Decisions

### Feed-Based Architecture
- **No Decks**: Eliminated deck system in favor of dynamic infinite feed
- **Real-time Generation**: Feed is generated on-the-fly based on user preferences and group behavior
- **Automatic Loading**: More titles load automatically as user swipes (triggered at 5 remaining)
- **Smart Scoring**: Multi-factor scoring prioritizes likely matches while maintaining variety

### Region Handling
- Stored at group level for Slice-0
- Can extend to per-user in future

### Watched Tracking
- Uses `ratings` table (rating = watched)
- `exclude_watched` preference filters rated titles

### Vibes Derivation
- Derived from TMDB genres/keywords during ETL
- Example: Action + Sci-Fi → "Mind-bending"

### Matching Privacy
- Matches only appear after ALL group members have swiped
- No visibility into who/how many have swiped until match threshold met
- Prevents biasing group members' decisions

## Security

### RLS Policies
- All tables protected with row-level security
- `is_group_member()` helper ensures data isolation
- Public tables (titles, streaming data) readable by all auth users

### Auth
- Supabase Auth with magic links
- JWT-based API authentication
- Middleware protects all routes except login

## Performance

### Feed Optimization
- GIN indexes on `titles.genres` and `titles.vibes` for fast array queries
- Composite indexes on `swipes` table for quick preference lookups
- Client-side caching of feed items reduces database queries
- Automatic prefetching when running low on titles

## Future Enhancements (Post-Slice-0)

- 💬 In-app chat
- 📅 Watch scheduling
- 🎥 Teleparty/SharePlay integration
- 🤖 Advanced collaborative filtering with ML
- 📱 Mobile apps (React Native)
- 🌐 More regions & streaming services
- 🎨 Custom themes & avatars
- 🔥 Swipe gestures and animations

## Project Structure

```
binge/
├── app/                    # Next.js App Router
│   ├── login/             # Magic link login
│   ├── auth/callback/     # Auth callback
│   ├── onboarding/        # Profile, group, preferences setup
│   ├── dashboard/         # Main dashboard
│   ├── swipe/             # Swiping UI with infinite feed
│   ├── matches/           # Matches list & detail
│   └── group/             # Group settings
├── lib/
│   ├── supabase/          # Supabase client utilities
│   └── services/          # Business logic
│       └── feedGenerator.ts # Feed generation algorithm
├── .env.local             # Environment variables
└── package.json
```

## Contributing

This is Slice-0 (MVP). Contributions welcome for:
- Bug fixes
- UI/UX improvements
- Performance optimizations
- Documentation

## License

MIT

## Support

For issues or questions:
- Check Supabase dashboard logs
- Review RLS policies for access errors
- Verify environment variables
- Check browser console for client errors

---

Built with ❤️ using Next.js, Supabase, and TailwindCSS
