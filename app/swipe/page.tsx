'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { SwipeWithProfile } from '@/lib/types/database';
import { isNotNull } from '@/lib/types/database';
import { useToast } from '@/lib/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import { SkeletonSwipeCard } from '@/components/ui/Skeleton';
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
  const [cooldownProgress, setCooldownProgress] = useState(100);
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
  const [swipeDirection, setSwipeDirection] = useState<'yes' | 'no' | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    initializeFeed();
  }, []);

  // Handle ESC key for modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showMatchModal) {
          setShowMatchModal(false);
          setMatchResult(null);
        } else if (showTrailer) {
          setShowTrailer(false);
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showMatchModal, showTrailer]);

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
      if (!retry) {
        toast.error('Failed to load your feed. Please try again.');
      }
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
      toast.error('Failed to load more items.');
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

      // Update swipe direction hint based on position
      const threshold = 100;
      if (Math.abs(deltaX) > threshold) {
        setSwipeDirection(deltaX > 0 ? 'yes' : 'no');
      } else {
        setSwipeDirection(null);
      }
    }
  }, [isDragging, swiping, rateLimitCooldown]);

  /**
   * Handles user swipe decision (yes/no) with rate limiting
   */
  const handleSwipe = useCallback(async (decision: 'yes' | 'no', animated = false) => {
    // Check if already swiping or rate limited
    if (swiping || currentIndex >= feedItems.length || !groupId || rateLimitCooldown) return;

    // Enforce minimum time between swipes
    const now = Date.now();
    const timeSinceLastSwipe = now - lastSwipeTime.current;
    if (timeSinceLastSwipe < RATE_LIMITS.SWIPE_COOLDOWN_MS) {
      setRateLimitCooldown(true);
      const remainingTime = RATE_LIMITS.SWIPE_COOLDOWN_MS - timeSinceLastSwipe;

      // Animate cooldown progress
      const startTime = Date.now();
      const intervalId = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.max(0, 100 - (elapsed / remainingTime) * 100);
        setCooldownProgress(progress);

        if (progress <= 0) {
          clearInterval(intervalId);
          setCooldownProgress(100);
        }
      }, 16); // ~60fps

      setTimeout(() => {
        setRateLimitCooldown(false);
        setCooldownProgress(100);
        clearInterval(intervalId);
      }, remainingTime);
      return;
    }

    lastSwipeTime.current = now;
    setSwiping(true);
    const currentItem = feedItems[currentIndex];

    // Trigger haptic feedback immediately for better responsiveness
    triggerHaptic(decision === 'yes' ? 'medium' : 'light');

    // If animated (from touch gesture), trigger exit animation
    if (animated) {
      setIsExiting(true);
      setSwipeDirection(decision);
      // Animate card off screen
      const exitDistance = window.innerWidth + 100;
      setDragOffset({
        x: decision === 'yes' ? exitDistance : -exitDistance,
        y: 0
      });

      // Wait for animation to complete before moving to next card
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setSwiping(false);
        setIsExiting(false);
        setDragOffset({ x: 0, y: 0 });
        setSwipeDirection(null);
      }, 300);
    } else {
      // For button clicks, move immediately
      setCurrentIndex(prev => prev + 1);
      setSwiping(false);
      setIsExiting(false);
      setDragOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
    }

    // Perform database operations asynchronously (don't block UI)
    (async () => {
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

        // Show feedback
        if (decision === 'yes') {
          toast.success('Added to your likes! ❤️');
        }

        // Check if this swipe created a match (only if user voted yes and is in a group)
        if (decision === 'yes' && groupId) {
          await checkForMatch(currentItem.id);
        }
      } catch (error) {
        logger.error('Error swiping', error, { titleId: currentItem.id, decision });
        toast.error('Failed to save your swipe.');
      }
    })();
  }, [swiping, currentIndex, feedItems, groupId, rateLimitCooldown, supabase, toast, checkForMatch]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 80; // Reduced threshold for easier swiping

    if (Math.abs(dragOffset.x) > threshold) {
      // Determine swipe direction and trigger animated swipe
      const decision = dragOffset.x > 0 ? 'yes' : 'no';
      handleSwipe(decision, true); // Pass true for animated exit
    } else {
      // Not enough swipe distance, reset position
      setDragOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
    }
  }, [isDragging, dragOffset.x, handleSwipe]);

  if (loading) {
    return (
      <div className={`${layouts.page} pb-24`}>
        <div className="max-w-2xl mx-auto px-4 pt-8 py-6">
          <SkeletonSwipeCard />
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
    <div className={`${layouts.page} min-h-screen pb-20 md:pb-8`}>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      {/* Solo Swiping Banner */}
      {!groupId && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
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
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2 sm:py-4">
        <div className="relative">
          {/* Next card shadow */}
          {currentIndex + 1 < feedItems.length && (
            <div className="absolute inset-0 bg-white/60 rounded-3xl transform scale-95 -z-10" style={{ top: '10px' }} />
          )}

          {/* Main Card */}
          <div
            ref={cardRef}
            className={`${components.card.solid} overflow-hidden relative`}
            style={{
              transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.05}deg)`,
              transition: isDragging ? 'none' : isExiting ? 'transform 0.3s cubic-bezier(0.4, 0, 1, 1)' : 'transform 0.3s ease-out',
              opacity: isExiting ? 0 : 1 - Math.abs(dragOffset.x) / 500,
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Swipe Direction Indicators */}
            {isDragging && (
              <>
                <div
                  className="absolute top-6 sm:top-8 right-6 sm:right-8 z-10 transition-opacity duration-200 pointer-events-none"
                  style={{
                    opacity: dragOffset.x > 80 ? Math.min((dragOffset.x - 80) / 100, 1) : 0,
                  }}
                >
                  <div className="bg-gradient-to-r from-sky-500 to-pink-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-base sm:text-lg shadow-lg flex items-center gap-2 border-3 sm:border-4 border-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    LIKE
                  </div>
                </div>
                <div
                  className="absolute top-6 sm:top-8 left-6 sm:left-8 z-10 transition-opacity duration-200 pointer-events-none"
                  style={{
                    opacity: dragOffset.x < -80 ? Math.min((-dragOffset.x - 80) / 100, 1) : 0,
                  }}
                >
                  <div className="bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-base sm:text-lg shadow-lg flex items-center gap-2 border-3 sm:border-4 border-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    PASS
                  </div>
                </div>
              </>
            )}
            {/* Poster */}
            <div className="w-full h-[45vh] sm:h-[50vh] bg-gradient-to-br from-sky-100 to-pink-100 relative rounded-t-xl">
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
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-2 leading-tight">
                {currentTitle.name}
              </h2>
              <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-semibold text-gray-600 mb-3">
                <span>{currentTitle.year}</span>
                <span>•</span>
                <span>{currentTitle.runtime_min} min</span>
              </div>

              {/* Genres */}
              {currentTitle.genres && currentTitle.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentTitle.genres.slice(0, 3).map(genre => (
                    <span
                      key={genre}
                      className={components.badge.primary}
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Vibes */}
              {currentTitle.vibes && currentTitle.vibes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {currentTitle.vibes.slice(0, 3).map(vibe => (
                    <span
                      key={vibe}
                      className={components.badge.secondary}
                    >
                      {vibe}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              <p className="text-gray-800 leading-relaxed mb-3 sm:mb-4 text-xs sm:text-sm line-clamp-3 sm:line-clamp-none">
                {currentTitle.overview}
              </p>

              {/* Actions */}
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => handleSwipe('no')}
                  disabled={swiping || rateLimitCooldown}
                  className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 px-2 sm:px-3 rounded-lg hover:bg-gray-300 active:scale-95 transform transition-all duration-200 border-2 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 group min-h-[44px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 relative"
                  aria-label={`Skip ${currentTitle.name}`}
                >
                  {rateLimitCooldown && (
                    <span className="absolute inset-0 bg-gray-400/30 rounded-lg flex items-center justify-center text-xs font-medium overflow-hidden">
                      <span className="absolute inset-0 bg-gray-600/20 origin-left transition-transform" style={{ transform: `scaleX(${cooldownProgress / 100})` }} />
                      <span className="relative z-10">Wait...</span>
                    </span>
                  )}
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-sm sm:text-base">Pass</span>
                </button>
                {currentTitle.trailer_url && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    disabled={swiping}
                    className="flex-1 bg-sky-100 text-sky-700 font-semibold py-3 px-2 sm:px-3 rounded-lg hover:bg-sky-200 active:scale-95 transform transition-all duration-200 border-2 border-sky-300 shadow-sm disabled:opacity-50 flex items-center justify-center gap-1 sm:gap-2 group min-h-[44px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                    aria-label={`Watch trailer for ${currentTitle.name}`}
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                    <span className="hidden sm:inline text-sm sm:text-base">Trailer</span>
                  </button>
                )}
                <button
                  onClick={() => handleSwipe('yes')}
                  disabled={swiping || rateLimitCooldown}
                  className="flex-1 bg-gradient-to-r from-sky-600 to-pink-600 text-white font-semibold py-3 sm:py-3.5 px-2 sm:px-3 rounded-lg hover:shadow-lg active:scale-95 transform transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 group hover:shadow-xl min-h-[44px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 relative"
                  aria-label={`Like ${currentTitle.name}`}
                >
                  {rateLimitCooldown && (
                    <span className="absolute inset-0 bg-gray-800/50 rounded-lg flex items-center justify-center text-xs font-medium overflow-hidden">
                      <span className="absolute inset-0 bg-gray-900/30 origin-left transition-transform" style={{ transform: `scaleX(${cooldownProgress / 100})` }} />
                      <span className="relative z-10">Wait...</span>
                    </span>
                  )}
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm sm:text-base">Like</span>
                </button>
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
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 match-modal-backdrop"
          onClick={() => {
            setShowMatchModal(false);
            setMatchResult(null);
          }}
        >
          {/* Confetti particles */}
          <div className="confetti confetti-1 bg-sky-400" style={{ top: '20%', left: '10%' }} />
          <div className="confetti confetti-2 bg-pink-400" style={{ top: '15%', left: '20%', animationDelay: '0.1s' }} />
          <div className="confetti confetti-3 bg-sky-300" style={{ top: '25%', left: '80%', animationDelay: '0.2s' }} />
          <div className="confetti confetti-1 bg-pink-300" style={{ top: '20%', right: '10%', animationDelay: '0.15s' }} />
          <div className="confetti confetti-2 bg-sky-500" style={{ top: '30%', left: '50%', animationDelay: '0.05s' }} />
          <div className="confetti confetti-3 bg-pink-500" style={{ top: '18%', right: '20%', animationDelay: '0.25s' }} />

          <div
            className="bg-white rounded-3xl p-8 max-w-md w-full text-center match-modal-content relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Celebration */}
            <div className={`w-24 h-24 ${gradients.primaryBr} rounded-full mx-auto mb-6 flex items-center justify-center animate-bounce`}>
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3 match-modal-text">It&apos;s a Match!</h2>
            <p className="text-lg text-gray-600 mb-6 match-modal-text">
              <span className="font-semibold text-sky-600">{matchResult.yesVotes}</span> out of <span className="font-semibold">{matchResult.totalMembers}</span> members loved this title
            </p>

            {/* Who voted yes */}
            <div className="bg-gradient-to-br from-sky-50 to-pink-50 rounded-2xl p-5 mb-6 border border-sky-100 match-modal-text">
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
              className={`w-full ${components.button.primary} mb-3 match-modal-button`}
            >
              Keep Swiping
            </button>
            <button
              onClick={() => router.push('/matches')}
              className={`w-full ${components.link.primary} font-semibold py-3 match-modal-button`}
            >
              View All Matches
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
