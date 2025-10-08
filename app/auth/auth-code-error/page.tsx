'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <Card variant="elevated" className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Authentication Failed
        </h1>
        <p className="text-gray-600 mb-6">
          We couldn&apos;t verify your magic link. This could happen if:
        </p>
        <ul className="text-left text-gray-600 mb-6 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>The link has expired (links are valid for 1 hour)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>The link was already used</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>You opened the link in a different browser</span>
          </li>
        </ul>
        <div className="space-y-3">
          <Link href="/login">
            <Button fullWidth>
              Request New Magic Link
            </Button>
          </Link>
          <p className="text-sm text-gray-500">
            Need help? Check your email for the most recent link.
          </p>
        </div>
      </Card>
    </div>
  );
}
