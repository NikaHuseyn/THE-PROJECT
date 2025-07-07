
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NotificationPreferences {
  likes: boolean;
  comments: boolean;
  follows: boolean;
  events: boolean;
}

interface UserPreferences {
  preferred_colors: string[];
  disliked_colors: string[];
  preferred_patterns: string[];
  preferred_fabrics: string[];
  style_personality: string[];
  disliked_styles: string[];
  preferred_brands: string[];
  preferred_retailers: string[];
  budget_min: number | null;
  budget_max: number | null;
  notification_preferences: NotificationPreferences;
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferred_colors: [],
    disliked_colors: [],
    preferred_patterns: [],
    preferred_fabrics: [],
    style_personality: [],
    disliked_styles: [],
    preferred_brands: [],
    preferred_retailers: [],
    budget_min: null,
    budget_max: null,
    notification_preferences: {
      likes: true,
      comments: true,
      follows: true,
      events: true
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error: fetchError } = await supabase
        .from('user_style_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        const notificationPrefs = data.notification_preferences as any;
        setPreferences({
          preferred_colors: data.preferred_colors || [],
          disliked_colors: data.disliked_colors || [],
          preferred_patterns: data.preferred_patterns || [],
          preferred_fabrics: data.preferred_fabrics || [],
          style_personality: data.style_personality || [],
          disliked_styles: data.disliked_styles || [],
          preferred_brands: data.preferred_brands || [],
          preferred_retailers: data.preferred_retailers || [],
          budget_min: data.budget_min,
          budget_max: data.budget_max,
          notification_preferences: {
            likes: notificationPrefs?.likes ?? true,
            comments: notificationPrefs?.comments ?? true,
            follows: notificationPrefs?.follows ?? true,
            events: notificationPrefs?.events ?? true
          }
        });
      }
    } catch (err) {
      console.error('Error fetching user preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Prepare the update object with proper typing
      const updateData: any = {
        user_id: user.id,
        ...updates
      };

      // Convert notification_preferences to the expected JSON format
      if (updates.notification_preferences) {
        updateData.notification_preferences = updates.notification_preferences as any;
      }

      const { error: updateError } = await supabase
        .from('user_style_profiles')
        .upsert(updateData, { onConflict: 'user_id' });

      if (updateError) throw updateError;

      setPreferences(prev => ({ ...prev, ...updates }));
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    refreshPreferences: fetchPreferences
  };
};
