import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOnboarding = () => {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        setUser(session.user);

        // Check if onboarding was completed in localStorage first (faster)
        const localOnboardingCompleted = localStorage.getItem('onboarding_completed');
        if (localOnboardingCompleted === 'true') {
          setShouldShowOnboarding(false);
          setIsLoading(false);
          return;
        }

        // Check if user has a style profile (indicates completed onboarding)
        const { data: profile, error } = await supabase
          .from('user_style_profiles')
          .select('user_id, display_name, style_personality, preferred_colors')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking profile:', error);
          setShouldShowOnboarding(true);
        } else if (!profile || !profile.display_name || !profile.style_personality?.length) {
          // No profile or incomplete profile = needs onboarding
          setShouldShowOnboarding(true);
        } else {
          // Profile exists and is complete
          setShouldShowOnboarding(false);
          localStorage.setItem('onboarding_completed', 'true');
        }
      } catch (error) {
        console.error('Error in onboarding check:', error);
        setShouldShowOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          // Clear local storage flag on new sign in to recheck onboarding
          localStorage.removeItem('onboarding_completed');
          await checkOnboardingStatus();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setShouldShowOnboarding(false);
          localStorage.removeItem('onboarding_completed');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const completeOnboarding = () => {
    setShouldShowOnboarding(false);
    localStorage.setItem('onboarding_completed', 'true');
  };

  const resetOnboarding = () => {
    setShouldShowOnboarding(true);
    localStorage.removeItem('onboarding_completed');
  };

  return {
    shouldShowOnboarding,
    isLoading,
    user,
    completeOnboarding,
    resetOnboarding
  };
};