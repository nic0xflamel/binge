'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function TestLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const loginAs = async (email: string, password: string) => {
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('Logged in as:', data.user?.email);
      router.push('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <Card variant="elevated" className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Test Login</h1>
          <p className="text-gray-600">Dev-only password authentication</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={() => loginAs('testuser1@example.com', 'TestPassword123!')}
            loading={loading}
            fullWidth
            variant="primary"
          >
            Login as Test User 1
          </Button>

          <Button
            onClick={() => loginAs('testuser2@example.com', 'TestPassword123!')}
            loading={loading}
            fullWidth
            variant="secondary"
          >
            Login as Test User 2
          </Button>

          <div className="text-sm text-gray-600 text-center pt-4">
            <p>Test User 1: testuser1@example.com</p>
            <p>Test User 2: testuser2@example.com</p>
            <p className="mt-2">Password: TestPassword123!</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
