
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, User, Palette, Shirt } from 'lucide-react';
import { toast } from 'sonner';

interface StyleProfile {
  id?: string;
  face_shape?: string;
  skin_tone?: string;
  body_type?: string;
  preferred_colors?: string[];
  preferred_patterns?: string[];
  preferred_fabrics?: string[];
  style_personality?: string[];
  style_confidence_score?: number;
  analysis_image_url?: string;
}

const StyleProfile = () => {
  const [profile, setProfile] = useState<StyleProfile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const faceShapes = ['Oval', 'Round', 'Square', 'Heart', 'Diamond', 'Oblong'];
  const skinTones = ['Fair', 'Light', 'Medium', 'Olive', 'Tan', 'Deep'];
  const bodyTypes = ['Pear', 'Apple', 'Hourglass', 'Rectangle', 'Inverted Triangle'];
  
  const colorOptions = [
    'Black', 'White', 'Navy', 'Gray', 'Beige', 'Brown', 'Red', 'Pink', 
    'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Burgundy'
  ];
  
  const patternOptions = [
    'Solid', 'Stripes', 'Polka Dots', 'Floral', 'Geometric', 'Plaid', 
    'Animal Print', 'Abstract'
  ];
  
  const fabricOptions = [
    'Cotton', 'Silk', 'Wool', 'Linen', 'Denim', 'Leather', 'Cashmere', 
    'Polyester', 'Velvet', 'Chiffon'
  ];
  
  const stylePersonalities = [
    'Minimalist', 'Bohemian', 'Classic', 'Trendy', 'Edgy', 'Romantic', 
    'Casual', 'Professional', 'Artistic', 'Sporty'
  ];

  useEffect(() => {
    fetchStyleProfile();
  }, []);

  const fetchStyleProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_style_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile(data);
      } else {
        setEditMode(true);
      }
    } catch (error) {
      console.error('Error fetching style profile:', error);
      toast.error('Failed to load style profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const profileData = {
        ...profile,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (profile.id) {
        const { error } = await supabase
          .from('user_style_profiles')
          .update(profileData)
          .eq('id', profile.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('user_style_profiles')
          .insert(profileData)
          .select()
          .single();
        if (error) throw error;
        setProfile(data);
      }

      toast.success('Style profile saved successfully!');
      setEditMode(false);
    } catch (error) {
      console.error('Error saving style profile:', error);
      toast.error('Failed to save style profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleArrayItem = (array: string[] = [], item: string): string[] => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    } else {
      return [...array, item];
    }
  };

  const updateProfile = (field: keyof StyleProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">My Style Profile</h2>
        {!editMode ? (
          <Button
            onClick={() => setEditMode(true)}
            className="bg-gradient-to-r from-rose-500 to-pink-600"
          >
            <User className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="bg-gradient-to-r from-rose-500 to-pink-600"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditMode(false)}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {!profile.id && !editMode ? (
        <Card>
          <CardContent className="text-center py-8">
            <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Create Your Style Profile</h3>
            <p className="text-gray-500 mb-4">Tell us about your style preferences to get personalized recommendations!</p>
            <Button
              onClick={() => setEditMode(true)}
              className="bg-gradient-to-r from-rose-500 to-pink-600"
            >
              Get Started
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Face Shape</label>
                {editMode ? (
                  <select
                    value={profile.face_shape || ''}
                    onChange={(e) => updateProfile('face_shape', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Select face shape</option>
                    {faceShapes.map(shape => (
                      <option key={shape} value={shape}>{shape}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-700">{profile.face_shape || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Skin Tone</label>
                {editMode ? (
                  <select
                    value={profile.skin_tone || ''}
                    onChange={(e) => updateProfile('skin_tone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Select skin tone</option>
                    {skinTones.map(tone => (
                      <option key={tone} value={tone}>{tone}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-700">{profile.skin_tone || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Body Type</label>
                {editMode ? (
                  <select
                    value={profile.body_type || ''}
                    onChange={(e) => updateProfile('body_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Select body type</option>
                    {bodyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-700">{profile.body_type || 'Not specified'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Style Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Style Personality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {editMode ? (
                  <div className="flex flex-wrap gap-2">
                    {stylePersonalities.map(personality => (
                      <Badge
                        key={personality}
                        variant={profile.style_personality?.includes(personality) ? "default" : "outline"}
                        className={`cursor-pointer ${
                          profile.style_personality?.includes(personality) 
                            ? 'bg-rose-100 text-rose-800 border-rose-300' 
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => updateProfile('style_personality', 
                          toggleArrayItem(profile.style_personality, personality)
                        )}
                      >
                        {personality}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.style_personality?.length ? 
                      profile.style_personality.map(personality => (
                        <Badge key={personality} className="bg-rose-100 text-rose-800">
                          {personality}
                        </Badge>
                      )) : <p className="text-gray-500">No style preferences selected</p>
                    }
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preferred Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Preferred Colors</CardTitle>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <Badge
                      key={color}
                      variant={profile.preferred_colors?.includes(color) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        profile.preferred_colors?.includes(color) 
                          ? 'bg-rose-100 text-rose-800 border-rose-300' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => updateProfile('preferred_colors', 
                        toggleArrayItem(profile.preferred_colors, color)
                      )}
                    >
                      {color}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.preferred_colors?.length ? 
                    profile.preferred_colors.map(color => (
                      <Badge key={color} className="bg-blue-100 text-blue-800">
                        {color}
                      </Badge>
                    )) : <p className="text-gray-500">No color preferences selected</p>
                  }
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preferred Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Preferred Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <div className="flex flex-wrap gap-2">
                  {patternOptions.map(pattern => (
                    <Badge
                      key={pattern}
                      variant={profile.preferred_patterns?.includes(pattern) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        profile.preferred_patterns?.includes(pattern) 
                          ? 'bg-rose-100 text-rose-800 border-rose-300' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => updateProfile('preferred_patterns', 
                        toggleArrayItem(profile.preferred_patterns, pattern)
                      )}
                    >
                      {pattern}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.preferred_patterns?.length ? 
                    profile.preferred_patterns.map(pattern => (
                      <Badge key={pattern} className="bg-green-100 text-green-800">
                        {pattern}
                      </Badge>
                    )) : <p className="text-gray-500">No pattern preferences selected</p>
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StyleProfile;
