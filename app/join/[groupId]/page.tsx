import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function JoinGroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const supabase = await createClient();
  const { groupId } = await params;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login with a return URL
    redirect(`/login?redirect=/join/${groupId}`);
  }

  // Verify group exists
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id, name')
    .eq('id', groupId)
    .single();

  if (groupError || !group) {
    redirect('/onboarding/group?error=invalid_invite');
  }

  // Check if user is already a member
  const { data: existingMembership } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single();

  if (existingMembership) {
    // Already a member, redirect to dashboard
    redirect('/dashboard');
  }

  // Add user as member
  const { error: memberError } = await supabase
    .from('group_members')
    .insert({
      group_id: group.id,
      user_id: user.id,
    });

  if (memberError) {
    redirect('/onboarding/group?error=failed_to_join');
  }

  // Update any previous swipes to be associated with this group
  const { error: updateError } = await supabase
    .from('swipes')
    .update({ group_id: group.id })
    .eq('user_id', user.id)
    .is('group_id', null);

  if (updateError) {
    console.error('Failed to update previous swipes:', updateError);
  }

  // Redirect to preferences setup for this group
  redirect(`/onboarding/preferences?group_id=${group.id}`);
}
