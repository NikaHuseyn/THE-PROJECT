
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import BasicInfoSection from './profile/BasicInfoSection';
import StylePreferencesSection from './profile/StylePreferencesSection';
import ColorAnalysisSection from './profile/ColorAnalysisSection';

interface StyleProfile {
  id?: string;
  user_id: string;
  color_analysis?: any;
  style_confidence_score?: number;
  body_type?: string;
  preferred_colors?: string[];
  preferred_patterns?: string[];
  preferred_fabrics?: string[];
  style_personality?: string[];
  analysis_image_url?: string;
  created_at?: string;
  updated_at?: string;
  display_name?: string;
  profile_photo_url?: string;
  height_cm?: number;
  weight_kg?: number;
  standard_size_top?: string;
  standard_size_bottom?: string;
  standard_size_shoes?: string;
  fit_preference?: string;
  disliked_colors?: string[];
  disliked_styles?: string[];
  budget_min?: number;
  budget_max?: number;
  preferred_brands?: string[];
  preferred_retailers?: string[];
  public_profile_enabled?: boolean;
  gdpr_consent_date?: string;
  data_export_requested?: boolean;
  notification_preferences?: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    events: boolean;
  };
  face_shape?: string;
  skin_tone?: string;
}

const StyleProfile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<StyleProfile | null>(null);
  const [analysisImage, setAnalysisImage] = useState<File | null>(null);

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['userStyleProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('user_style_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
  });

  useEffect(() => {
    if (userProfile) {
      const transformedProfile: StyleProfile = {
        ...userProfile,
        notification_preferences: typeof userProfile.notification_preferences === 'object' 
          ? userProfile.notification_preferences as { likes: boolean; comments: boolean; follows: boolean; events: boolean; }
          : { likes: true, comments: true, follows: true, events: true }
      };
      setProfile(transformedProfile);
    }
  }, [userProfile]);

  const createOrUpdateProfile = useMutation({
    mutationFn: async (profileData: Partial<StyleProfile>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const dataToSave = {
        user_id: user.id,
        ...profileData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_style_profiles')
        .upsert(dataToSave, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const transformedProfile: StyleProfile = {
        ...data,
        notification_preferences: typeof data.notification_preferences === 'object' 
          ? data.notification_preferences as { likes: boolean; comments: boolean; follows: boolean; events: boolean; }
          : { likes: true, comments: true, follows: true, events: true }
      };
      setProfile(transformedProfile);
      queryClient.invalidateQueries({ queryKey: ['userStyleProfile'] });
      toast({
        title: "Profile Updated",
        description: "Your style profile has been successfully updated!",
      });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    if (profile) {
      createOrUpdateProfile.mutate(profile);
    }
  };

  const handleProfileChange = (updates: Partial<StyleProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Style Profile</h1>
        <p className="text-gray-600">Create and customize your personal style preferences</p>
      </div>

      <BasicInfoSection 
        profile={profile} 
        onProfileChange={handleProfileChange}
      />

      <StylePreferencesSection 
        profile={profile} 
        onProfileChange={handleProfileChange}
      />

      <ColorAnalysisSection 
        profile={profile} 
        analysisImage={analysisImage}
        onAnalysisImageChange={setAnalysisImage}
      />

      <div className="flex justify-center">
        <Button
          onClick={handleSaveProfile}
          disabled={createOrUpdateProfile.isPending}
          size="lg"
          className="px-8"
        >
          {createOrUpdateProfile.isPending ? 'Saving...' : 'Save Style Profile'}
        </Button>
      </div>
    </div>
  );
};

export default StyleProfile;
