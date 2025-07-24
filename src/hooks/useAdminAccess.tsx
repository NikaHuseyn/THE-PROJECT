import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface UseAdminAccessResult {
  user: User | null;
  isAdmin: boolean;
  isModerator: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  hasRole: (role: 'admin' | 'moderator' | 'super_admin') => boolean;
}

export const useAdminAccess = (): UseAdminAccessResult => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async (currentUser: User | null) => {
      if (!currentUser) {
        setIsAdmin(false);
        setIsModerator(false);
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check all admin roles
        const [adminCheck, moderatorCheck, superAdminCheck] = await Promise.all([
          supabase.rpc('is_admin', { target_user_id: currentUser.id, required_role: 'admin' }),
          supabase.rpc('is_admin', { target_user_id: currentUser.id, required_role: 'moderator' }),
          supabase.rpc('is_admin', { target_user_id: currentUser.id, required_role: 'super_admin' })
        ]);

        setIsAdmin(adminCheck.data === true);
        setIsModerator(moderatorCheck.data === true);
        setIsSuperAdmin(superAdminCheck.data === true);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
        setIsModerator(false);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        checkAccess(currentUser);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      checkAccess(currentUser);
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasRole = (role: 'admin' | 'moderator' | 'super_admin'): boolean => {
    switch (role) {
      case 'admin':
        return isAdmin;
      case 'moderator':
        return isModerator;
      case 'super_admin':
        return isSuperAdmin;
      default:
        return false;
    }
  };

  return {
    user,
    isAdmin,
    isModerator,
    isSuperAdmin,
    loading,
    hasRole
  };
};