'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { RATING_CONFIG } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function RatePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const matchId = params.id as string;

  const [rating, setRating] = useState(0);
  const [reaction, setReaction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [titleName, setTitleName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [titleId, setTitleId] = useState<number>(0);

  useEffect(() => {
    loadMatchDetails();
  }, []);

  const loadMatchDetails = async () => {
    try {
      const { data: match } = await supabase
        .from('matches')
        .select('group_id, title_id, titles(name)')
        .eq('id', matchId)
        .single();

      if (match) {
        setGroupId(match.group_id);
        setTitleId(match.title_id);
        const title = match.titles as unknown as { name: string } | null;
        setTitleName(title?.name || '');
      }
    } catch (err) {
      console.error('Error loading match:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: ratingError } = await supabase
        .from('ratings')
        .insert({
          group_id: groupId,
          user_id: user.id,
          title_id: titleId,
          rating,
          reaction: reaction || null,
        });

      if (ratingError) throw ratingError;

      router.push(`/matches/${matchId}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4 flex items-center justify-center">
      <Card variant="elevated" className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rate This Title</h1>
        <p className="text-gray-600 mb-6">{titleName}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Your Rating
            </label>
            <div className="flex gap-2">
              {Array.from({ length: RATING_CONFIG.MAX_STARS }, (_, i) => i + 1).map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-4xl transition-all hover:scale-110"
                >
                  {star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                {rating}/{RATING_CONFIG.MAX_STARS} stars
              </p>
            )}
          </div>

          {/* Reaction */}
          <Input
            as="textarea"
            id="reaction"
            label="Reaction (Optional)"
            value={reaction}
            onChange={(e) => setReaction(e.target.value)}
            rows={4}
            maxLength={RATING_CONFIG.MAX_REACTION_LENGTH}
            placeholder="Share your thoughts..."
            disabled={loading}
            showCharCount
          />

          {error && (
            <div className="p-4 bg-red-50 text-red-800 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(`/matches/${matchId}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={rating === 0}
              fullWidth
            >
              Submit Rating
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
