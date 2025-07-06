
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Camera, Palette, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [newPreferredColor, setNewPreferredColor] = useState('');
  const [newPreferredPattern, setNewPreferredPattern] = useState('');
  const [newPreferredFabric, setNewPreferredFabric] = useState('');
  const [newStylePersonality, setNewStylePersonality] = useState('');

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
      // Transform the data to match our interface
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

  const addToArray = (arrayName: keyof StyleProfile, value: string, setter: (value: string) => void) => {
    if (value.trim() && profile) {
      const currentArray = (profile[arrayName] as string[]) || [];
      if (!currentArray.includes(value.trim())) {
        setProfile({
          ...profile,
          [arrayName]: [...currentArray, value.trim()],
        });
        setter('');
      }
    }
  };

  const removeFromArray = (arrayName: keyof StyleProfile, index: number) => {
    if (profile) {
      const currentArray = (profile[arrayName] as string[]) || [];
      setProfile({
        ...profile,
        [arrayName]: currentArray.filter((_, i) => i !== index),
      });
    }
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

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="body_type">Body Type</Label>
              <Input
                id="body_type"
                value={profile?.body_type || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, body_type: e.target.value } : null)}
                placeholder="e.g., Apple, Pear, Hourglass"
              />
            </div>
            <div>
              <Label htmlFor="style_confidence">Style Confidence (1-10)</Label>
              <Input
                id="style_confidence"
                type="number"
                min="1"
                max="10"
                value={profile?.style_confidence_score || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, style_confidence_score: Number(e.target.value) } : null)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Style Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preferred Colors */}
          <div>
            <Label className="text-base font-semibold">Preferred Colors</Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {profile?.preferred_colors?.map((color, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-2">
                  {color}
                  <button
                    onClick={() => removeFromArray('preferred_colors', index)}
                    className="hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a preferred color"
                value={newPreferredColor}
                onChange={(e) => setNewPreferredColor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addToArray('preferred_colors', newPreferredColor, setNewPreferredColor)}
              />
              <Button
                onClick={() => addToArray('preferred_colors', newPreferredColor, setNewPreferredColor)}
                disabled={!newPreferredColor.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Preferred Patterns */}
          <div>
            <Label className="text-base font-semibold">Preferred Patterns</Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {profile?.preferred_patterns?.map((pattern, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-2">
                  {pattern}
                  <button
                    onClick={() => removeFromArray('preferred_patterns', index)}
                    className="hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a preferred pattern"
                value={newPreferredPattern}
                onChange={(e) => setNewPreferredPattern(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addToArray('preferred_patterns', newPreferredPattern, setNewPreferredPattern)}
              />
              <Button
                onClick={() => addToArray('preferred_patterns', newPreferredPattern, setNewPreferredPattern)}
                disabled={!newPreferredPattern.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Preferred Fabrics */}
          <div>
            <Label className="text-base font-semibold">Preferred Fabrics</Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {profile?.preferred_fabrics?.map((fabric, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-2">
                  {fabric}
                  <button
                    onClick={() => removeFromArray('preferred_fabrics', index)}
                    className="hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a preferred fabric"
                value={newPreferredFabric}
                onChange={(e) => setNewPreferredFabric(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addToArray('preferred_fabrics', newPreferredFabric, setNewPreferredFabric)}
              />
              <Button
                onClick={() => addToArray('preferred_fabrics', newPreferredFabric, setNewPreferredFabric)}
                disabled={!newPreferredFabric.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Style Personality */}
          <div>
            <Label className="text-base font-semibold">Style Personality</Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {profile?.style_personality?.map((personality, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-2">
                  {personality}
                  <button
                    onClick={() => removeFromArray('style_personality', index)}
                    className="hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a style personality trait"
                value={newStylePersonality}
                onChange={(e) => setNewStylePersonality(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addToArray('style_personality', newStylePersonality, setNewStylePersonality)}
              />
              <Button
                onClick={() => addToArray('style_personality', newStylePersonality, setNewStylePersonality)}
                disabled={!newStylePersonality.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Color Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="analysis_image">Upload Photo for Analysis</Label>
              <Input
                id="analysis_image"
                type="file"
                accept="image/*"
                onChange={(e) => setAnalysisImage(e.target.files?.[0] || null)}
                className="mt-1"
              />
            </div>
            {profile?.analysis_image_url && (
              <div>
                <Label>Current Analysis Image</Label>
                <img
                  src={profile.analysis_image_url}
                  alt="Color analysis"
                  className="mt-2 max-w-xs rounded-lg"
                />
              </div>
            )}
            {profile?.color_analysis && (
              <div>
                <Label>Analysis Results</Label>
                <Textarea
                  value={JSON.stringify(profile.color_analysis, null, 2)}
                  readOnly
                  rows={6}
                  className="mt-1 font-mono text-sm"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
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
