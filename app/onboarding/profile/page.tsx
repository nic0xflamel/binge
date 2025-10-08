'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { profileSchema, type ProfileFormData } from '@/lib/validation';

export default function ProfileSetupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          display_name: data.displayName,
        });

      if (profileError) throw profileError;

      router.push('/onboarding/group');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <Card variant="elevated" className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Binge!</h1>
          <p className="text-gray-600">Let&apos;s set up your profile</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            id="displayName"
            type="text"
            label="Display Name"
            placeholder="Your name"
            disabled={loading}
            error={errors.displayName?.message}
            {...register('displayName')}
          />

          {error && (
            <div className="p-4 bg-red-50 text-red-800 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            fullWidth
          >
            Continue
          </Button>
        </form>
      </Card>
    </div>
  );
}
