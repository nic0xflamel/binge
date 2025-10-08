'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { SwipeWithProfile } from '@/lib/types/database';
import { isNotNull } from '@/lib/types/database';
import { useToast } from '@/lib/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import { logger } from '@/lib/utils/logger';
import { RATE_LIMITS, DURATIONS } from '@/lib/constants';
import { generateFeed, type FeedItem } from '@/lib/services/feedGenerator';
import { components, layouts, gradients } from '@/lib/design-system';
import { triggerHaptic } from '@/lib/capacitor/init';

interface MatchResult {
  isMatch: boolean;
  totalMembers: number;
  yesVotes: number;
  yesVoters: string[];
}

export default function SwipePage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [swiping, setSwiping] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();
  const lastSwipeTime = useRef<number>(0);
  const isLoadingMoreRef = useRef(false);
  const feedCacheRef = useRef<Map<number, FeedItem[]>>(new Map()); // Cache feed results by offset
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    initializeFeed();
  }, []);

  // Automatically load more when running low
  useEffect(() => {
    const remainingItems = feedItems.length - currentIndex;

    if (remainingItems < 5 && !isLoadingMoreRef.current && !loadingMore && userId && groupId) {
      loadMoreItems();
    }
  }, [currentIndex, feedItems.length, userId, groupId, loadingMore]);

  const initializeFeed = async (retry = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);

      // Get user's group (optional - they can swipe solo)
      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)
        .limit(1);

      const gid = memberships && memberships.length > 0 ? memberships[0].group_id : null;
      setGroupId(gid);

      // Load initial feed
      logger.info('Initializing feed', { userId: user.id, groupId: gid, retry });
      const items = await generateFeed(supabase, {
        userId: user.id,
        groupId: gid,
        limit: 50,
        offset: 0
      });

      setFeedItems(items);
      logger.info('Feed initialized', { itemCount: items.length });

      // Clear any previous errors on successful load
      if (retry) {
        toast.success('Feed loaded successfully!');
      }
    } catch (error) {
      logger.error('Error initializing feed', error);
      toast.error('Failed to load your feed. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreItems = useCallback(async () => {
    if (!userId || !groupId || isLoadingMoreRef.current) return;

    isLoadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const offset = feedItems.length;
      logger.info('Loading more feed items', { currentCount: offset });

      // Check cache first
      const cached = feedCacheRef.current.get(offset);
      if (cached) {
        logger.info('Using cached feed items', { count: cached.length });
        setFeedItems(prev => [...prev, ...cached]);
        return;
      }

      // Fetch from database
      const moreItems = await generateFeed(supabase, {
        userId,
        groupId,
        limit: 50,
        offset
      });

      if (moreItems.length > 0) {
        // Cache the results
        feedCacheRef.current.set(offset, moreItems);
        setFeedItems(prev => [...prev, ...moreItems]);
        logger.info('More items loaded and cached', { newItemCount: moreItems.length });
      } else {
        logger.info('No more items available');
      }
    } catch (error) {
      logger.error('Error loading more items', error);
      toast.error('Failed to load more items. Please try refreshing.');
    } finally {
      setLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, [userId, groupId, feedItems.length, supabase, toast]);

  /**
   * Checks if a swiped title has reached the threshold for a match
   */
  const checkForMatch = useCallback(async (titleId: number) => {
    if (!groupId) return;

    try {
      // Get all group members
      const { data: members } = await supabase
        .from('group_members')
        .select('user_id, profiles(display_name)')
        .eq('group_id', groupId);

      const totalMembers = members?.length || 0;

      // Require at least 2 members for matches
      if (totalMembers < 2) {
        return;
      }

      // Get group threshold
      const { data: group } = await supabase
        .from('groups')
        .select('match_threshold')
        .eq('id', groupId)
        .single();

      // Get all swipes for this title
      const { data: swipes } = await supabase
        .from('swipes')
        .select('user_id, decision, profiles(display_name)')
        .eq('group_id', groupId)
        .eq('title_id', titleId);

      const totalSwipes = swipes?.length || 0;
      const typedSwipes = swipes as SwipeWithProfile[] | null;
      const yesVoters = typedSwipes?.filter(s => s.decision === 'yes') || [];
      const yesVotes = yesVoters.length;

      // Only show match after ALL members have swiped
      if (totalSwipes !== totalMembers) {
        return;
      }

      // Check if it's a match based on threshold
      const threshold = group?.match_threshold || 'majority';
      let isMatch = false;

      if (threshold === 'unanimous') {
        isMatch = yesVotes === totalMembers;
      } else if (threshold === 'majority') {
        isMatch = yesVotes > totalMembers / 2;
      }

      if (isMatch) {
        // Safely extract display names
        const voterNames = yesVoters
          .map(s => s.profiles?.display_name)
          .filter(isNotNull);

        // Trigger celebration haptic
        await triggerHaptic('heavy');

        setMatchResult({
          isMatch: true,
          totalMembers,
          yesVotes,
          yesVoters: voterNames.length > 0 ? voterNames : ['Unknown'],
        });
        setShowMatchModal(true);
      }
    } catch (error) {
      logger.error('Error checking for match', error, { titleId });
    }
  }, [groupId, supabase]);

  /**
   * Touch handlers for swipe gestures
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (swiping || rateLimitCooldown) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  }, [swiping, rateLimitCooldown]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || swiping || rateLimitCooldown) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    // Only allow horizontal swiping if the gesture is more horizontal than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
      setDragOffset({ x: deltaX, y: deltaY * 0.1 });
    }
  }, [isDragging, swiping, rateLimitCooldown]);

  /**
   * Handles user swipe decision (yes/no) with rate limiting
   */
  const handleSwipe = useCallback(async (decision: 'yes' | 'no') => {
    // Check if already swiping or rate limited
    if (swiping || currentIndex >= feedItems.length || !groupId || rateLimitCooldown) return;

    // Enforce minimum time between swipes
    const now = Date.now();
    const timeSinceLastSwipe = now - lastSwipeTime.current;
    if (timeSinceLastSwipe < RATE_LIMITS.SWIPE_COOLDOWN_MS) {
      setRateLimitCooldown(true);
      setTimeout(() => setRateLimitCooldown(false), RATE_LIMITS.SWIPE_COOLDOWN_MS - timeSinceLastSwipe);
      return;
    }

    lastSwipeTime.current = now;
    setSwiping(true);
    const currentItem = feedItems[currentIndex];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('swipes')
        .insert({
          group_id: groupId,
          user_id: user.id,
          title_id: currentItem.id,
          decision,
        });

      if (error) throw error;

      // Trigger haptic feedback
      await triggerHaptic(decision === 'yes' ? 'medium' : 'light');

      // Show immediate feedback
      if (decision === 'yes') {
        toast.success('Added to your likes! ❤️');
      }

      // Check if this swipe created a match (only if user voted yes and is in a group)
      if (decision === 'yes' && groupId) {
        await checkForMatch(currentItem.id);
      }

      // Move to next card
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setSwiping(false);
      }, DURATIONS.CARD_TRANSITION_MS);
    } catch (error) {
      logger.error('Error swiping', error, { titleId: currentItem.id, decision });
      toast.error('Failed to save your swipe. Please try again.');
      setSwiping(false);
    }
  }, [swiping, currentIndex, feedItems, groupId, rateLimitCooldown, supabase, toast, checkForMatch]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100; // Minimum swipe distance

    if (Math.abs(dragOffset.x) > threshold) {
      // Determine swipe direction
      const decision = dragOffset.x > 0 ? 'yes' : 'no';
      handleSwipe(decision);
    }

    // Reset drag offset
    setDragOffset({ x: 0, y: 0 });
  }, [isDragging, dragOffset.x, handleSwipe]);

  if (loading) {
    return (
      <div className={`${layouts.page} pb-24`}>
        <div className="max-w-2xl mx-auto px-4 pt-8 py-6">
          <div className={`${components.card.solid} overflow-hidden animate-pulse`}>
            {/* Skeleton Poster */}
            <div className="aspect-[2/3] bg-gradient-to-br from-sky-100 via-pink-100 to-sky-200 rounded-t-3xl"></div>
            {/* Skeleton Info */}
            <div className="p-6 space-y-4">
              <div className="h-8 bg-gradient-to-r from-sky-100 to-pink-100 rounded-lg w-3/4"></div>
              <div className="h-4 bg-sky-100 rounded w-1/2"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-sky-100 rounded-full w-20"></div>
                <div className="h-6 bg-sky-100 rounded-full w-20"></div>
                <div className="h-6 bg-pink-100 rounded-full w-20"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-sky-50 rounded w-full"></div>
                <div className="h-4 bg-sky-50 rounded w-5/6"></div>
              </div>
              <div className="flex gap-3 pt-2">
                <div className="flex-1 h-12 bg-gradient-to-r from-sky-100 to-pink-100 rounded-lg"></div>
                <div className="flex-1 h-12 bg-gradient-to-r from-pink-100 to-sky-100 rounded-lg"></div>
                <div className="flex-1 h-12 bg-sky-100 rounded-lg"></div>
              </div>
            </div>
          </div>
          <div className="text-center mt-4 text-gray-800 font-medium">Loading your feed...</div>
        </div>
      </div>
    );
  }

  if (feedItems.length === 0 || currentIndex >= feedItems.length) {
    return (
      <div className={`${layouts.page} flex items-center justify-center p-4`}>
        <div className={`${components.card.base} p-8 max-w-md w-full text-center`}>
          <div className={`${components.icon.large} mx-auto mb-6`}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">All Caught Up!</h1>
          <p className="text-gray-800 mb-8 leading-relaxed">
            You&apos;ve swiped through all available titles. Check back soon for more recommendations!
          </p>
          <button
            onClick={() => {
              feedCacheRef.current.clear();
              setLoading(true);
              setCurrentIndex(0);
              initializeFeed(true);
            }}
            className={`w-full ${components.button.primary} mb-3`}
          >
            Refresh Feed
          </button>
          <button
            onClick={() => router.push('/matches')}
            className={`w-full ${components.button.secondary} mb-3`}
          >
            View Matches
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full text-gray-600 hover:text-gray-900 font-medium py-3"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentTitle = feedItems[currentIndex];

  return (
    <div className={`${layouts.page} h-screen overflow-hidden flex flex-col`}>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      {/* Solo Swiping Banner */}
      {!groupId && (
        <div className="flex-shrink-0 max-w-2xl mx-auto px-4 pt-4">
          <div className={`${gradients.primary} rounded-2xl p-4 text-white shadow-lg animate-slide-up`}>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold mb-1">Swiping Solo</p>
                <p className="text-sm text-sky-100 mb-3">
                  You&apos;re building your personal watchlist. Join a group to find matches with friends!
                </p>
                <button
                  onClick={() => router.push('/onboarding/group')}
                  className="bg-white text-sky-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-sky-50 transition-colors"
                >
                  Create or Join a Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Stack */}
      <div className="flex-1 flex items-center justify-center overflow-hidden px-4">
        <div className="w-full max-w-2xl max-h-full flex items-center justify-center">
          <div className="relative w-full" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            {/* Next card shadow */}
            {currentIndex + 1 < feedItems.length && (
              <div className="absolute inset-0 bg-white/60 rounded-3xl transform scale-95 -z-10" style={{ top: '10px' }} />
            )}

            {/* Main Card */}
            <div
              ref={cardRef}
              className={`${components.card.solid} overflow-hidden transition-transform flex flex-col`}
              style={{
                transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.05}deg)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                maxHeight: 'calc(100vh - 120px)',
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Poster */}
              <div className="aspect-[2/3] max-h-[50vh] bg-gradient-to-br from-sky-100 to-pink-100 relative rounded-t-3xl flex-shrink-0">
              {currentTitle.poster_url ? (
                <Image
                  src={currentTitle.poster_url}
                  alt={currentTitle.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 672px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 overflow-y-auto flex-1" style={{ maxHeight: '40vh' }}>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {currentTitle.name}
              </h2>
              <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 mb-5">
                <span>{currentTitle.year}</span>
                <span>•</span>
                <span>{currentTitle.runtime_min} min</span>
              </div>

              {/* Genres */}
              {currentTitle.genres && currentTitle.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {currentTitle.genres.slice(0, 3).map(genre => (
                    <span
                      key={genre}
                      className="px-3 py-1.5 bg-sky-100 text-sky-800 rounded-full text-sm font-semibold border border-sky-200"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Vibes */}
              {currentTitle.vibes && currentTitle.vibes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {currentTitle.vibes.slice(0, 3).map(vibe => (
                    <span
                      key={vibe}
                      className="px-3 py-1.5 bg-pink-100 text-pink-800 rounded-full text-sm font-semibold border border-pink-200"
                    >
                      {vibe}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              <p className="text-gray-800 leading-relaxed mb-6 text-[15px]">
                {currentTitle.overview}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleSwipe('no')}
                  disabled={swiping || rateLimitCooldown}
                  className={`flex-1 ${components.button.ghost} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group`}
                  aria-label={`Skip ${currentTitle.name}`}
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Pass
                </button>
                {currentTitle.trailer_url && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    disabled={swiping}
                    className={`flex-1 ${components.button.secondary} disabled:opacity-50 flex items-center justify-center gap-2 group`}
                    aria-label={`Watch trailer for ${currentTitle.name}`}
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                    Trailer
                  </button>
                )}
                <button
                  onClick={() => handleSwipe('yes')}
                  disabled={swiping || rateLimitCooldown}
                  className={`flex-1 ${components.button.primary} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group hover:shadow-xl`}
                  style={{ backgroundImage: 'linear-gradient(to right, #0284c7, #db2777)' }}
                  aria-label={`Like ${currentTitle.name}`}
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  Like
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Trailer Modal */}
      {showTrailer && currentTitle.trailer_url && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setShowTrailer(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Trailer video"
        >
          <div
            className="bg-white rounded-2xl p-4 max-w-4xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Trailer</h3>
              <button
                onClick={() => setShowTrailer(false)}
                className="text-gray-600 hover:text-gray-900 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <iframe
                src={currentTitle.trailer_url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Match Celebration Modal */}
      {showMatchModal && matchResult && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => {
            setShowMatchModal(false);
            setMatchResult(null);
          }}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-md w-full text-center animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Celebration */}
            <div className={`w-24 h-24 ${gradients.primaryBr} rounded-full mx-auto mb-6 flex items-center justify-center animate-bounce`}>
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">It&apos;s a Match!</h2>
            <p className="text-lg text-gray-600 mb-6">
              <span className="font-semibold text-sky-600">{matchResult.yesVotes}</span> out of <span className="font-semibold">{matchResult.totalMembers}</span> members loved this title
            </p>

            {/* Who voted yes */}
            <div className="bg-gradient-to-br from-sky-50 to-pink-50 rounded-2xl p-5 mb-6 border border-sky-100">
              <h3 className="font-semibold text-gray-900 mb-3">Matched with:</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {matchResult.yesVoters.map((name, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-white text-sky-700 rounded-full text-sm font-semibold shadow-sm"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setShowMatchModal(false);
                setMatchResult(null);
              }}
              className={`w-full ${components.button.primary} mb-3`}
            >
              Keep Swiping
            </button>
            <button
              onClick={() => router.push('/matches')}
              className={`w-full ${components.link.primary} font-semibold py-3`}
            >
              View All Matches
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
