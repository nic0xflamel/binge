'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { STREAMING_SERVICES, GENRES, MOODS, RUNTIME_CONFIG } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function PreferencesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(null);

  const [services, setServices] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [maxRuntime, setMaxRuntime] = useState<number>(RUNTIME_CONFIG.DEFAULT);
  const [excludeWatched, setExcludeWatched] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Get user's group
      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)
        .limit(1);

      if (!memberships || memberships.length === 0) {
        router.push('/onboarding/group');
        return;
      }

      const gid = memberships[0].group_id;
      setGroupId(gid);

      // Load existing preferences
      const { data: prefs } = await supabase
        .from('preferences')
        .select('*')
        .eq('group_id', gid)
        .eq('user_id', user.id)
        .single();

      if (prefs) {
        setServices(prefs.services || []);
        setGenres(prefs.genres || []);
        setMoods(prefs.moods || []);
        setMaxRuntime(prefs.max_runtime_min || RUNTIME_CONFIG.DEFAULT);
        setExcludeWatched(prefs.exclude_watched ?? true);
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (service: string) => {
    setServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const toggleGenre = (genre: string) => {
    setGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const toggleMood = (mood: string) => {
    setMoods(prev =>
      prev.includes(mood)
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) return;

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: prefsError } = await supabase
        .from('preferences')
        .upsert({
          group_id: groupId,
          user_id: user.id,
          services,
          genres,
          moods,
          max_runtime_min: maxRuntime,
          exclude_watched: excludeWatched,
        });

      if (prefsError) throw prefsError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-purple-100 hover:text-white inline-block mb-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold">Your Preferences</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Streaming Services */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Streaming Services
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STREAMING_SERVICES.map(service => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleService(service)}
                    className={`px-4 py-3 rounded-lg font-medium capitalize transition-all transform hover:scale-105 ${
                      services.includes(service)
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md ring-2 ring-purple-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>

            {/* Genres */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Favorite Genres
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GENRES.map(genre => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                      genres.includes(genre)
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md ring-2 ring-purple-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Moods */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Moods & Vibes
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {MOODS.map(mood => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => toggleMood(mood)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                      moods.includes(mood)
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md ring-2 ring-purple-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Runtime */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Max Runtime: {maxRuntime} minutes
              </label>
              <input
                type="range"
                min={RUNTIME_CONFIG.MIN}
                max={RUNTIME_CONFIG.MAX}
                step={RUNTIME_CONFIG.STEP}
                value={maxRuntime}
                onChange={(e) => setMaxRuntime(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>{RUNTIME_CONFIG.MIN / 60} hour</span>
                <span>{RUNTIME_CONFIG.MAX / 60} hours</span>
              </div>
            </div>

            {/* Exclude Watched */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeWatched}
                  onChange={(e) => setExcludeWatched(e.target.checked)}
                  className="w-5 h-5 text-purple-500 rounded focus:ring-2 focus:ring-purple-500"
                />
                <div>
                  <span className="text-lg font-semibold text-gray-900">
                    Exclude watched content
                  </span>
                  <p className="text-sm text-gray-600">
                    Don&apos;t show titles you&apos;ve already rated
                  </p>
                </div>
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-800 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 text-green-800 rounded-lg">
                ✓ Preferences saved successfully!
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={saving}
                disabled={services.length === 0}
                fullWidth
              >
                Save Preferences
              </Button>
            </div>

            {services.length === 0 && (
              <p className="text-center text-sm text-gray-600">
                Select at least one streaming service to save
              </p>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}
