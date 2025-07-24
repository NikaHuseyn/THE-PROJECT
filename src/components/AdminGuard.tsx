import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import LoadingState from '@/components/LoadingState';
import { AlertTriangle, Shield } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'moderator' | 'super_admin';
}

const AdminGuard = ({ children, requiredRole = 'admin' }: AdminGuardProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          setLoading(false);
          navigate('/auth');
          return;
        }

        // Check admin permissions
        await checkAdminAccess(session.user.id);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        setLoading(false);
        navigate('/auth');
        return;
      }

      await checkAdminAccess(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate, requiredRole]);

  const checkAdminAccess = async (userId: string) => {
    try {
      // Use the is_admin function we created in the database
      const { data, error } = await supabase.rpc('is_admin', {
        target_user_id: userId,
        required_role: requiredRole
      });

      if (error) {
        console.error('Error checking admin access:', error);
        setHasAccess(false);
        toast({
          title: "Access Error",
          description: "Unable to verify admin permissions.",
          variant: "destructive",
        });
      } else {
        setHasAccess(data === true);
        if (data !== true) {
          toast({
            title: "Access Denied",
            description: `You need ${requiredRole} privileges to access this page.`,
            variant: "destructive",
          });
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error in admin check:', error);
      setHasAccess(false);
      toast({
        title: "Access Error",
        description: "An error occurred while checking permissions.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Verifying admin access..." />;
  }

  if (!user || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface via-surface-variant to-surface flex items-center justify-center">
        <div className="card-elegant p-8 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">
            You must be logged in to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface via-surface-variant to-surface flex items-center justify-center">
        <div className="card-elegant p-8 text-center max-w-md">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have the required {requiredRole} privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;