'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import BottomNav from './BottomNav';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ErrorBoundary from '@/components/ErrorBoundary';
import { GroupProvider } from '@/lib/context/GroupContext';

// Pages that should not show the header
const NO_HEADER_ROUTES = [
  '/login',
  '/auth/callback',
  '/auth/auth-code-error',
  '/onboarding/profile',
  '/onboarding/group',
  '/onboarding/preferences',
];

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const [groupName, setGroupName] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const supabase = createClient();

  const shouldShowHeader = !NO_HEADER_ROUTES.some(route => pathname?.startsWith(route));

  useEffect(() => {
    if (shouldShowHeader) {
      loadHeaderData();
    }
  }, [pathname, shouldShowHeader]);

  const loadHeaderData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserName((profile as { display_name: string }).display_name);
      }

      // Get user's active group
      const { data: memberships } = await supabase
        .from('group_members')
        .select('groups(name)')
        .eq('user_id', user.id)
        .limit(1);

      type GroupName = { name: string };
      if (memberships && memberships.length > 0 && memberships[0].groups) {
        setGroupName((memberships[0].groups as unknown as GroupName).name);
      }
    } catch (error) {
      console.error('Error loading header data:', error);
    }
  };

  if (!shouldShowHeader) {
    return (
      <GroupProvider>
        <ErrorBoundary>{children}</ErrorBoundary>
      </GroupProvider>
    );
  }

  return (
    <GroupProvider>
      <ErrorBoundary>
        <div className="relative">
          <Header groupName={groupName} userName={userName} />
          <div className="relative z-0">
            {children}
          </div>
          <BottomNav />
        </div>
      </ErrorBoundary>
    </GroupProvider>
  );
}
