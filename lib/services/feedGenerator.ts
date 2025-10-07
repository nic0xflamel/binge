/**
 * Feed Generation Service
 * Generates personalized, infinite feeds for users based on:
 * 1. What other group members have liked (Priority 1 - highest weight)
 * 2. User's personal preferences (Priority 2-3)
 * 3. Popular/trending content (Priority 4 - baseline)
 */

import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/utils/logger';

export interface FeedOptions {
  userId: string;
  groupId: string | null;
  limit?: number;
  offset?: number;
}

export interface FeedItem {
  id: number;
  name: string;
  year: number;
  runtime_min: number;
  poster_url: string;
  trailer_url: string;
  overview: string;
  genres: string[];
  vibes: string[];
  priority_score: number;
  group_interest: number; // How many group members liked it
  type: 'movie' | 'tv';
  rating: number;
  popularity: number;
  adult: boolean;
}

/**
 * Generates a personalized feed for a user
 * Prioritizes titles that group members have already liked
 */
export async function generateFeed(
  supabase: SupabaseClient,
  options: FeedOptions
): Promise<FeedItem[]> {
  const { userId, groupId, limit = 50, offset = 0 } = options;

  try {
    logger.info('Generating feed', { userId, groupId, limit, offset });

    // Get user's preferences (if in a group)
    let preferences = null;
    if (groupId) {
      const { data: prefs, error: prefError } = await supabase
        .from('preferences')
        .select('genres, moods, services, max_runtime_min')
        .eq('user_id', userId)
        .eq('group_id', groupId)
        .single();

      if (prefError) {
        logger.warn('No preferences found for user', { userId, groupId, error: prefError });
      }
      preferences = prefs;
    }

    // Get titles already swiped by this user (in any group or solo)
    let swipeQuery = supabase
      .from('swipes')
      .select('title_id')
      .eq('user_id', userId);

    if (groupId) {
      swipeQuery = swipeQuery.eq('group_id', groupId);
    } else {
      swipeQuery = swipeQuery.is('group_id', null);
    }

    const { data: alreadySwiped, error: swipesError } = await swipeQuery;

    if (swipesError) {
      logger.error('Failed to fetch user swipes', swipesError, { userId, groupId });
      throw swipesError;
    }

    const swipedIds = alreadySwiped?.map(s => s.title_id) || [];
    logger.debug('User has already swiped on titles', { count: swipedIds.length });

    // Get titles that other group members have liked (only if in a group)
    let groupLikes = null;
    let groupLikesError = null;

    if (groupId) {
      const result = await supabase
        .from('swipes')
        .select('title_id, user_id')
        .eq('group_id', groupId)
        .eq('decision', 'yes')
        .neq('user_id', userId);

      groupLikes = result.data;
      groupLikesError = result.error;

      if (groupLikesError) {
        logger.error('Failed to fetch group likes', groupLikesError, { groupId });
        throw groupLikesError;
      }
    }

    // Count yes votes per title (only if in a group)
    const titleInterest = new Map<number, number>();
    if (groupLikes) {
      groupLikes.forEach(like => {
        titleInterest.set(like.title_id, (titleInterest.get(like.title_id) || 0) + 1);
      });

      logger.debug('Group interest calculated', {
        titlesWithInterest: titleInterest.size,
        maxInterest: Math.max(...Array.from(titleInterest.values()), 0)
      });
    }

    // Build the feed query with database-level pagination
    let query = supabase
      .from('titles')
      .select('*');

    // Exclude already swiped titles using scalable approach
    // For large numbers of swipes, this stays performant
    if (swipedIds.length > 0) {
      query = query.not('id', 'in', `(${swipedIds.join(',')})`);
    }

    // Apply user preferences as filters
    if (preferences?.max_runtime_min) {
      query = query.lte('runtime_min', preferences.max_runtime_min);
    }

    // Fetch titles with database-level pagination
    // Fetch 4x the requested limit to allow for in-memory scoring/sorting
    // This gives us a diverse pool while still being efficient
    const fetchSize = Math.min(limit * 4, 200);
    const { data: titles, error } = await query
      .range(0, fetchSize - 1); // Always start from 0, we'll handle offset after scoring

    if (error) {
      logger.error('Failed to fetch titles', error, { userId, groupId });
      throw error;
    }

    if (!titles || titles.length === 0) {
      logger.warn('No titles available for feed', { userId, groupId, swipedCount: swipedIds.length });
      return [];
    }

    logger.debug('Fetched title pool', { count: titles.length });

    // Score and sort titles
    const scoredTitles = titles.map(title => {
      let score = 0;

      // Priority 1: Group interest (highest weight)
      const groupInterest = titleInterest.get(title.id) || 0;
      score += groupInterest * 1000;

      // Priority 2: Genre match
      if (preferences?.genres) {
        const genreMatches = title.genres?.filter((g: string) =>
          preferences.genres?.includes(g)
        ).length || 0;
        score += genreMatches * 100;
      }

      // Priority 3: Vibe match
      if (preferences?.moods) {
        const vibeMatches = title.vibes?.filter((v: string) =>
          preferences.moods?.includes(v)
        ).length || 0;
        score += vibeMatches * 50;
      }

      // Priority 4: Popularity (base score)
      score += title.popularity || 0;

      return {
        ...title,
        priority_score: score,
        group_interest: groupInterest,
      };
    });

    // Sort by score (highest first) and add some randomness
    scoredTitles.sort((a, b) => {
      const scoreDiff = b.priority_score - a.priority_score;
      // If scores are close (within 100 points), randomize order
      if (Math.abs(scoreDiff) < 100) {
        return Math.random() - 0.5;
      }
      return scoreDiff;
    });

    // Apply offset after scoring to get diverse, personalized results
    const paginatedResults = scoredTitles.slice(offset, offset + limit);

    logger.info('Feed generated successfully', {
      totalScored: scoredTitles.length,
      returned: paginatedResults.length,
      topScore: paginatedResults[0]?.priority_score,
      hasGroupInterest: paginatedResults.filter(t => t.group_interest > 0).length
    });

    return paginatedResults;
  } catch (error) {
    logger.error('Failed to generate feed', error, { userId, groupId, limit, offset });
    throw error;
  }
}

/**
 * Checks if a swipe creates a match
 * Called after each swipe to see if threshold is met
 */
export async function checkForMatch(
  supabase: SupabaseClient,
  groupId: string,
  titleId: number
): Promise<boolean> {
  // Get group settings
  const { data: group } = await supabase
    .from('groups')
    .select('match_threshold')
    .eq('id', groupId)
    .single();

  // Get all swipes for this title in this group
  const { data: swipes } = await supabase
    .from('swipes')
    .select('user_id, decision')
    .eq('group_id', groupId)
    .eq('title_id', titleId);

  // Get group size
  const { data: members } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId);

  const groupSize = members?.length || 0;
  const totalSwipes = swipes?.length || 0;
  const yesVotes = swipes?.filter(s => s.decision === 'yes').length || 0;

  // Check if match threshold is met
  const threshold = group?.match_threshold || 'majority';
  let isMatch = false;

  // Wait for all members to swipe (current behavior)
  if (totalSwipes === groupSize) {
    if (threshold === 'unanimous') {
      isMatch = yesVotes === groupSize;
    } else if (threshold === 'majority') {
      isMatch = yesVotes > groupSize / 2;
    }
  }

  return isMatch;
}
