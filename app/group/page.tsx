import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import GroupSettings from '@/components/group/GroupSettings';
import { components, layouts } from '@/lib/design-system';

export default async function GroupPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get user's groups
  const { data: memberships } = await supabase
    .from('group_members')
    .select(`
      group_id,
      role,
      joined_at,
      groups (
        id,
        name,
        owner,
        match_threshold,
        region,
        adult_content,
        created_at
      )
    `)
    .eq('user_id', user.id);

  type GroupData = { id: string; name: string; owner: string; match_threshold: string; region: string; adult_content: boolean; created_at: string };
  const activeGroup = memberships?.[0]?.groups as GroupData | undefined;
  if (!activeGroup) {
    redirect('/onboarding/group');
  }

  // Get all group members
  const { data: members } = await supabase
    .from('group_members')
    .select(`
      user_id,
      role,
      joined_at,
      profiles (
        display_name,
        avatar_url
      )
    `)
    .eq('group_id', activeGroup.id)
    .order('joined_at', { ascending: true });

  type MemberData = {
    user_id: string;
    role: string;
    joined_at: string;
    profiles: { display_name: string; avatar_url?: string } | null;
  };
  const typedMembers = (members as MemberData[] | null) || [];

  return (
    <div className={layouts.pageWithHeader}>
      <div className="max-w-4xl mx-auto p-6 pt-8">
        <GroupSettings
          group={activeGroup}
          members={typedMembers}
          currentUserId={user.id}
        />

        {/* Danger Zone */}
        <div className={`${components.card.solid} p-8 border-2 border-red-200 mt-6`}>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Danger Zone</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Leave Group</h3>
                <p className="text-sm text-gray-600">
                  {activeGroup.owner === user.id
                    ? 'Ownership will transfer to the next member. If you\'re the last member, the group will be deleted.'
                    : 'You will no longer have access to this group\'s matches and data.'}
                </p>
              </div>
              <button className={components.button.danger}>
                Leave Group
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
