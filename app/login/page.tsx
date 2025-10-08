'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { emailSchema, type EmailFormData } from '@/lib/validation';
import { useToast } from '@/lib/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import { logger } from '@/lib/utils/logger';
import { getAuthRedirectUrl } from '@/lib/auth/config';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data: EmailFormData) => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: getAuthRedirectUrl(),
        },
      });

      if (error) throw error;

      toast.success('Check your email for the magic link!');
      logger.info('Magic link sent successfully', { email: data.email });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast.error(message);
      logger.error('Failed to send magic link', error, { email: data.email });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      <Card variant="elevated" className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Binge</h1>
          <p className="text-gray-600">Find what to watch together</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            id="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            disabled={loading}
            error={errors.email?.message}
            {...register('email')}
          />

          <Button
            type="submit"
            loading={loading}
            fullWidth
          >
            Send magic link
          </Button>
        </form>
      </Card>
    </div>
  );
}
