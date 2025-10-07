'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function GroupSetupPage() {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create group with unanimous default (trigger auto-adds owner as member)
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: groupName,
          owner: user.id,
          match_threshold: 'unanimous',
        })
        .select()
        .single();

      if (groupError) throw groupError;

      router.push(`/onboarding/preferences?group_id=${group.id}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify group exists
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .eq('id', inviteCode)
        .single();

      if (groupError || !group) throw new Error('Invalid invite code');

      // Add user as member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
        });

      if (memberError) throw memberError;

      router.push(`/onboarding/preferences?group_id=${group.id}`);
    } catch (err: any) {
      setError(err.message || 'Invalid invite code');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'choose') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
        <Card variant="elevated" className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join or Create a Group</h1>
            <p className="text-gray-600">Watch together with friends</p>
          </div>

          <div className="space-y-4">
            <Button fullWidth size="lg" onClick={() => setMode('create')}>
              Create a new group
            </Button>
            <Button fullWidth size="lg" variant="secondary" onClick={() => setMode('join')}>
              Join an existing group
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
        <Card variant="elevated" className="w-full max-w-md">
          <button
            onClick={() => setMode('choose')}
            className="text-gray-600 hover:text-gray-900 mb-6 flex items-center"
          >
            ← Back
          </button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a Group</h1>
            <p className="text-gray-600">Give your group a name</p>
          </div>

          <form onSubmit={handleCreateGroup} className="space-y-6">
            <Input
              id="groupName"
              type="text"
              label="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
              minLength={2}
              maxLength={50}
              placeholder="Movie Night Crew"
              disabled={loading}
            />

            {error && (
              <div className="p-4 bg-red-50 text-red-800 rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} fullWidth>
              Create Group
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <Card variant="elevated" className="w-full max-w-md">
        <button
          onClick={() => setMode('choose')}
          className="text-gray-600 hover:text-gray-900 mb-6 flex items-center"
        >
          ← Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join a Group</h1>
          <p className="text-gray-600">Enter your invite code</p>
        </div>

        <form onSubmit={handleJoinGroup} className="space-y-6">
          <Input
            id="inviteCode"
            type="text"
            label="Invite Code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            required
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            disabled={loading}
            className="font-mono"
          />

          {error && (
            <div className="p-4 bg-red-50 text-red-800 rounded-lg">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} fullWidth>
            Join Group
          </Button>
        </form>
      </Card>
    </div>
  );
}
