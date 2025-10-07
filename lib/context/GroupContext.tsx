'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Group {
  id: string;
  name: string;
}

interface GroupContextType {
  activeGroup: Group | null;
  groups: Group[];
  setActiveGroup: (group: Group) => void;
  loading: boolean;
  error: string | null;
  refreshGroups: () => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: ReactNode }) {
  const [activeGroup, setActiveGroupState] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setGroups([]);
        setActiveGroupState(null);
        return;
      }

      // Get user's groups
      const { data: memberships, error: membershipsError } = await supabase
        .from('group_members')
        .select('groups(id, name)')
        .eq('user_id', user.id);

      if (membershipsError) throw membershipsError;

      type GroupData = { id: string; name: string };
      const userGroups = memberships
        ?.map(m => m.groups as unknown as GroupData | null)
        .filter((g): g is GroupData => g !== null) || [];

      setGroups(userGroups);

      // Set active group from localStorage or first group
      const savedGroupId = typeof window !== 'undefined'
        ? localStorage.getItem('activeGroupId')
        : null;

      const activeGroupToSet = savedGroupId
        ? userGroups.find(g => g.id === savedGroupId) || userGroups[0]
        : userGroups[0];

      if (activeGroupToSet) {
        setActiveGroupState(activeGroupToSet);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load groups');
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const setActiveGroup = (group: Group) => {
    setActiveGroupState(group);
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeGroupId', group.id);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const value: GroupContextType = {
    activeGroup,
    groups,
    setActiveGroup,
    loading,
    error,
    refreshGroups: loadGroups,
  };

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
}
