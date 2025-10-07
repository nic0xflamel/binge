'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface Group {
  id: string;
  name: string;
  owner: string;
  match_threshold: string;
  region: string;
  adult_content: boolean;
}

interface Member {
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    display_name: string;
    avatar_url?: string;
  } | null;
}

interface GroupSettingsProps {
  group: Group;
  members: Member[];
  currentUserId: string;
}

export default function GroupSettings({ group, members, currentUserId }: GroupSettingsProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [removing, setRemoving] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [showEditThresholdModal, setShowEditThresholdModal] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [editingThreshold, setEditingThreshold] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const isOwner = group.owner === currentUserId;

  const handleCopyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/join/${group.id}`;

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(inviteLink);
        setCopySuccess(true);
      } else {
        // Fallback for non-HTTPS or older browsers
        const textArea = document.createElement('textarea');
        textArea.value = inviteLink;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
          setCopySuccess(true);
        } catch (err) {
          console.error('Fallback copy failed:', err);
          alert(`Copy failed. Please copy manually: ${inviteLink}`);
        }

        textArea.remove();
      }

      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert(`Copy failed. Please copy manually: ${inviteLink}`);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    setRemoving(true);
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', group.id)
        .eq('user_id', memberToRemove.user_id);

      if (error) throw error;

      setShowRemoveModal(false);
      setMemberToRemove(null);
      router.refresh();
    } catch (err: any) {
      console.error('Error removing member:', err);
      alert(err.message || 'Failed to remove member');
    } finally {
      setRemoving(false);
    }
  };

  const openRemoveModal = (member: Member) => {
    setMemberToRemove(member);
    setShowRemoveModal(true);
  };

  const openEditNameModal = () => {
    setEditingName(group.name);
    setShowEditNameModal(true);
  };

  const openEditThresholdModal = () => {
    setEditingThreshold(group.match_threshold);
    setShowEditThresholdModal(true);
  };

  const handleUpdateGroupName = async () => {
    if (!editingName.trim() || editingName === group.name) {
      setShowEditNameModal(false);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('groups')
        .update({ name: editingName.trim() })
        .eq('id', group.id);

      if (error) throw error;

      setShowEditNameModal(false);
      router.refresh();
    } catch (err: any) {
      console.error('Error updating group name:', err);
      alert(err.message || 'Failed to update group name');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMatchThreshold = async () => {
    if (!editingThreshold || editingThreshold === group.match_threshold) {
      setShowEditThresholdModal(false);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('groups')
        .update({ match_threshold: editingThreshold })
        .eq('id', group.id);

      if (error) throw error;

      setShowEditThresholdModal(false);
      router.refresh();
    } catch (err: any) {
      console.error('Error updating match threshold:', err);
      alert(err.message || 'Failed to update match threshold');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Group Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Group Information</h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Group Name</label>
                {isOwner && (
                  <button
                    onClick={openEditNameModal}
                    className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>
              <p className="text-lg text-gray-900">{group.name}</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Match Rule</label>
                {isOwner && (
                  <button
                    onClick={openEditThresholdModal}
                    className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>
              <p className="text-lg text-gray-900 capitalize">{group.match_threshold}</p>
              <p className="text-sm text-gray-600 mt-1">
                {group.match_threshold === 'unanimous'
                  ? 'Everyone must swipe yes to create a match'
                  : 'Half or more must swipe yes to create a match'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <p className="text-lg text-gray-900">{group.region}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adult Content</label>
              <p className="text-lg text-gray-900">{group.adult_content ? 'Enabled' : 'Disabled'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invite Link</label>
              <div className="flex items-center gap-3">
                <code className="flex-1 px-4 py-2 bg-purple-50 rounded-lg font-mono text-sm text-purple-900 break-all border border-purple-200">
                  {typeof window !== 'undefined' ? `${window.location.origin}/join/${group.id}` : `https://binge.app/join/${group.id}`}
                </code>
                <Button
                  onClick={handleCopyInviteLink}
                  size="md"
                  className="shrink-0"
                >
                  {copySuccess ? '✓ Copied!' : 'Copy Link'}
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Share this link with friends to invite them to your group
              </p>
            </div>
          </div>
        </div>

        {/* Members */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Members ({members?.length || 0})
          </h2>

          <div className="space-y-3">
            {members?.map(member => (
              <div
                key={member.user_id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    name={member.profiles?.display_name || 'Unknown'}
                    imageUrl={member.profiles?.avatar_url}
                    size="md"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.profiles?.display_name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {member.user_id === group.owner ? 'Owner' : 'Member'}
                    </p>
                  </div>
                </div>

                {isOwner && member.user_id !== currentUserId && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => openRemoveModal(member)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Remove Member Confirmation Modal */}
      <Modal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        title="Remove Member"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to remove{' '}
            <strong>{memberToRemove?.profiles?.display_name}</strong> from the group?
          </p>
          <p className="text-sm text-gray-600">
            They will lose access to all group matches and data. They can rejoin with an invite code.
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowRemoveModal(false)}
              disabled={removing}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleRemoveMember}
              loading={removing}
            >
              Remove Member
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Group Name Modal */}
      <Modal
        isOpen={showEditNameModal}
        onClose={() => setShowEditNameModal(false)}
        title="Edit Group Name"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Enter group name"
              maxLength={50}
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowEditNameModal(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={handleUpdateGroupName}
              loading={saving}
              disabled={!editingName.trim() || editingName === group.name}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Match Threshold Modal */}
      <Modal
        isOpen={showEditThresholdModal}
        onClose={() => setShowEditThresholdModal(false)}
        title="Edit Match Rule"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Match Rule
            </label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="threshold"
                  value="majority"
                  checked={editingThreshold === 'majority'}
                  onChange={(e) => setEditingThreshold(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold text-gray-900">Majority</div>
                  <div className="text-sm text-gray-600">
                    Half or more must swipe yes to create a match
                  </div>
                </div>
              </label>
              <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="threshold"
                  value="unanimous"
                  checked={editingThreshold === 'unanimous'}
                  onChange={(e) => setEditingThreshold(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold text-gray-900">Unanimous</div>
                  <div className="text-sm text-gray-600">
                    Everyone must swipe yes to create a match
                  </div>
                </div>
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowEditThresholdModal(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={handleUpdateMatchThreshold}
              loading={saving}
              disabled={editingThreshold === group.match_threshold}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
