'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { STREAMING_SERVICES, GENRES, MOODS, RUNTIME_CONFIG } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

function PreferencesForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const groupId = searchParams.get('group_id');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [services, setServices] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [maxRuntime, setMaxRuntime] = useState<number>(RUNTIME_CONFIG.DEFAULT);

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

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: prefsError } = await supabase
        .from('preferences')
        .insert({
          group_id: groupId,
          user_id: user.id,
          services,
          genres,
          moods,
          max_runtime_min: maxRuntime,
        });

      if (prefsError) throw prefsError;

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4 py-12">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">What's Your Vibe?</h1>
          <p className="text-gray-600">Help us find your perfect matches</p>
        </div>

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
                  className={`px-4 py-3 rounded-lg font-medium capitalize transition-all ${
                    services.includes(service)
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    genres.includes(genre)
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    moods.includes(mood)
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              <span>1 hour</span>
              <span>4 hours</span>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-800 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            disabled={services.length === 0}
            fullWidth
            size="lg"
          >
            Let's Find Something!
          </Button>

          {services.length === 0 && (
            <p className="text-center text-sm text-gray-600">
              Select at least one streaming service to continue
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default function PreferencesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PreferencesForm />
    </Suspense>
  );
}
