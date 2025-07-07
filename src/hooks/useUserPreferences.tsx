
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserPreferences {
  preferred_colors?: string[];
  disliked_colors?: string[];
  preferred_patterns?: string[];
  preferred_fabrics?: string[];
  style_personality?: string[];
  disliked_styles?: string[];
  preferred_brands?: string[];
  preferred_retailers?: string[];
  budget_min?: number;
  budget_max?: number;
  style_confidence_score?: number;
  notification_preferences?: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    events: boolean;
  };
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPreferences(null);
        return;
      }

      const { data, error } = await supabase
        .from('user_style_profiles')
        .select(`
          preferred_colors,
          disliked_colors,
          preferred_patterns,
          preferred_fabrics,
          style_personality,
          disliked_styles,
          preferred_brands,
          preferred_retailers,
          budget_min,
          budget_max,
          style_confidence_score,
          notification_preferences
        `)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setPreferences(data || {});
    } catch (error) {
      console.error('Error loading preferences:', error);
      setPreferences({});
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const updatedPreferences = { ...preferences, ...updates };
      
      const { error } = await supabase
        .from('user_style_profiles')
        .upsert({
          user_id: user.id,
          ...updatedPreferences,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;

      setPreferences(updatedPreferences);
      
      toast({
        title: "Preferences Updated",
        description: "Your style preferences have been saved successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Update Failed",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const addToArrayPreference = (key: keyof UserPreferences, value: string) => {
    if (!preferences) return false;
    
    const currentArray = (preferences[key] as string[]) || [];
    if (currentArray.includes(value)) return false;
    
    const updates = {
      [key]: [...currentArray, value]
    };
    
    return updatePreferences(updates);
  };

  const removeFromArrayPreference = (key: keyof UserPreferences, index: number) => {
    if (!preferences) return false;
    
    const currentArray = (preferences[key] as string[]) || [];
    const updates = {
      [key]: currentArray.filter((_, i) => i !== index)
    };
    
    return updatePreferences(updates);
  };

  const updateBudgetRange = (min: number, max: number) => {
    return updatePreferences({
      budget_min: min,
      budget_max: max
    });
  };

  const updateStyleConfidence = (score: number) => {
    return updatePreferences({
      style_confidence_score: score / 100 // Convert from 0-100 to 0-1
    });
  };

  const updateNotificationPreferences = (notifications: UserPreferences['notification_preferences']) => {
    return updatePreferences({
      notification_preferences: notifications
    });
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  return {
    preferences,
    isLoading,
    isSaving,
    loadPreferences,
    updatePreferences,
    addToArrayPreference,
    removeFromArrayPreference,
    updateBudgetRange,
    updateStyleConfidence,
    updateNotificationPreferences
  };
};
