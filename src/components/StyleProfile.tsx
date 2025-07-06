
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera, User, Palette, Shirt, DollarSign, Shield, Heart } from 'lucide-react';
import { toast } from 'sonner';

interface StyleProfile {
  id?: string;
  display_name?: string;
  profile_photo_url?: string;
  face_shape?: string;
  skin_tone?: string;
  body_type?: string;
  height_cm?: number;
  weight_kg?: number;
  standard_size_top?: string;
  standard_size_bottom?: string;
  standard_size_shoes?: string;
  fit_preference?: string;
  preferred_colors?: string[];
  preferred_patterns?: string[];
  preferred_fabrics?: string[];
  preferred_brands?: string[];
  preferred_retailers?: string[];
  disliked_colors?: string[];
  disliked_styles?: string[];
  style_personality?: string[];
  style_confidence_score?: number;
  budget_min?: number;
  budget_max?: number;
  public_profile_enabled?: boolean;
  gdpr_consent_date?: string;
  data_export_requested?: boolean;
  notification_preferences?: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    events: boolean;
  };
  analysis_image_url?: string;
}

const StyleProfile = () => {
  const [profile, setProfile] = useState<StyleProfile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'style' | 'budget' | 'privacy'>('basic');

  const faceShapes = ['Oval', 'Round', 'Square', 'Heart', 'Diamond', 'Oblong'];
  const skinTones = ['Fair', 'Light', 'Medium', 'Olive', 'Tan', 'Deep'];
  const bodyTypes = ['Pear', 'Apple', 'Hourglass', 'Rectangle', 'Inverted Triangle'];
  const fitPreferences = ['tight', 'regular', 'loose'];
  
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

  const brandOptions = [
    'Zara', 'H&M', 'Nike', 'Adidas', 'Uniqlo', 'COS', 'ASOS', 'Mango',
    'Gucci', 'Prada', 'Chanel', 'Dior', 'Louis Vuitton', 'Burberry'
  ];

  const retailerOptions = [
    'Amazon', 'ASOS', 'Zalando', 'Net-A-Porter', 'Farfetch', 'Nordstrom',
    'Selfridges', 'Harvey Nichols', 'Matches Fashion', 'Browns'
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

  const updateNotificationPreference = (key: string, value: boolean) => {
    setProfile(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'style', label: 'Style Preferences', icon: Palette },
    { id: 'budget', label: 'Budget & Brands', icon: DollarSign },
    { id: 'privacy', label: 'Privacy & Social', icon: Shield }
  ];

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
        <>
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-rose-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeTab === 'basic' && (
              <>
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Display Name</Label>
                      {editMode ? (
                        <Input
                          value={profile.display_name || ''}
                          onChange={(e) => updateProfile('display_name', e.target.value)}
                          placeholder="How should we address you?"
                        />
                      ) : (
                        <p className="text-gray-700 mt-1">{profile.display_name || 'Not specified'}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Height (cm)</Label>
                        {editMode ? (
                          <Input
                            type="number"
                            value={profile.height_cm || ''}
                            onChange={(e) => updateProfile('height_cm', parseInt(e.target.value) || null)}
                            placeholder="170"
                          />
                        ) : (
                          <p className="text-gray-700 mt-1">{profile.height_cm ? `${profile.height_cm} cm` : 'Not specified'}</p>
                        )}
                      </div>
                      <div>
                        <Label>Weight (kg)</Label>
                        {editMode ? (
                          <Input
                            type="number"
                            value={profile.weight_kg || ''}
                            onChange={(e) => updateProfile('weight_kg', parseFloat(e.target.value) || null)}
                            placeholder="65"
                          />
                        ) : (
                          <p className="text-gray-700 mt-1">{profile.weight_kg ? `${profile.weight_kg} kg` : 'Not specified'}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Face Shape</Label>
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
                        <p className="text-gray-700 mt-1">{profile.face_shape || 'Not specified'}</p>
                      )}
                    </div>

                    <div>
                      <Label>Skin Tone</Label>
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
                        <p className="text-gray-700 mt-1">{profile.skin_tone || 'Not specified'}</p>
                      )}
                    </div>

                    <div>
                      <Label>Body Type</Label>
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
                        <p className="text-gray-700 mt-1">{profile.body_type || 'Not specified'}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Size Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Size Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Standard Size - Tops</Label>
                      {editMode ? (
                        <Input
                          value={profile.standard_size_top || ''}
                          onChange={(e) => updateProfile('standard_size_top', e.target.value)}
                          placeholder="e.g., M, L, XL"
                        />
                      ) : (
                        <p className="text-gray-700 mt-1">{profile.standard_size_top || 'Not specified'}</p>
                      )}
                    </div>

                    <div>
                      <Label>Standard Size - Bottoms</Label>
                      {editMode ? (
                        <Input
                          value={profile.standard_size_bottom || ''}
                          onChange={(e) => updateProfile('standard_size_bottom', e.target.value)}
                          placeholder="e.g., 32, 34, M, L"
                        />
                      ) : (
                        <p className="text-gray-700 mt-1">{profile.standard_size_bottom || 'Not specified'}</p>
                      )}
                    </div>

                    <div>
                      <Label>Shoe Size</Label>
                      {editMode ? (
                        <Input
                          value={profile.standard_size_shoes || ''}
                          onChange={(e) => updateProfile('standard_size_shoes', e.target.value)}
                          placeholder="e.g., 8, 9.5, 42"
                        />
                      ) : (
                        <p className="text-gray-700 mt-1">{profile.standard_size_shoes || 'Not specified'}</p>
                      )}
                    </div>

                    <div>
                      <Label>Fit Preference</Label>
                      {editMode ? (
                        <select
                          value={profile.fit_preference || ''}
                          onChange={(e) => updateProfile('fit_preference', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                        >
                          <option value="">Select fit preference</option>
                          {fitPreferences.map(fit => (
                            <option key={fit} value={fit}>{fit.charAt(0).toUpperCase() + fit.slice(1)}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-gray-700 mt-1">{profile.fit_preference ? profile.fit_preference.charAt(0).toUpperCase() + profile.fit_preference.slice(1) : 'Not specified'}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'style' && (
              <>
                {/* Style Personality */}
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

                {/* Disliked Colors */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <Heart className="h-4 w-4 inline mr-2" />
                      Colors to Avoid
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editMode ? (
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map(color => (
                          <Badge
                            key={color}
                            variant={profile.disliked_colors?.includes(color) ? "default" : "outline"}
                            className={`cursor-pointer ${
                              profile.disliked_colors?.includes(color) 
                                ? 'bg-red-100 text-red-800 border-red-300' 
                                : 'hover:bg-gray-100'
                            }`}
                            onClick={() => updateProfile('disliked_colors', 
                              toggleArrayItem(profile.disliked_colors, color)
                            )}
                          >
                            {color}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.disliked_colors?.length ? 
                          profile.disliked_colors.map(color => (
                            <Badge key={color} className="bg-red-100 text-red-800">
                              {color}
                            </Badge>
                          )) : <p className="text-gray-500">No colors to avoid specified</p>
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
              </>
            )}

            {activeTab === 'budget' && (
              <>
                {/* Budget Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Budget Min (£)</Label>
                        {editMode ? (
                          <Input
                            type="number"
                            value={profile.budget_min || ''}
                            onChange={(e) => updateProfile('budget_min', parseFloat(e.target.value) || null)}
                            placeholder="50"
                          />
                        ) : (
                          <p className="text-gray-700 mt-1">{profile.budget_min ? `£${profile.budget_min}` : 'Not specified'}</p>
                        )}
                      </div>
                      <div>
                        <Label>Budget Max (£)</Label>
                        {editMode ? (
                          <Input
                            type="number"
                            value={profile.budget_max || ''}
                            onChange={(e) => updateProfile('budget_max', parseFloat(e.target.value) || null)}
                            placeholder="500"
                          />
                        ) : (
                          <p className="text-gray-700 mt-1">{profile.budget_max ? `£${profile.budget_max}` : 'Not specified'}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Preferred Brands */}
                <Card>
                  <CardHeader>
                    <CardTitle>Preferred Brands</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editMode ? (
                      <div className="flex flex-wrap gap-2">
                        {brandOptions.map(brand => (
                          <Badge
                            key={brand}
                            variant={profile.preferred_brands?.includes(brand) ? "default" : "outline"}
                            className={`cursor-pointer ${
                              profile.preferred_brands?.includes(brand) 
                                ? 'bg-rose-100 text-rose-800 border-rose-300' 
                                : 'hover:bg-gray-100'
                            }`}
                            onClick={() => updateProfile('preferred_brands', 
                              toggleArrayItem(profile.preferred_brands, brand)
                            )}
                          >
                            {brand}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.preferred_brands?.length ? 
                          profile.preferred_brands.map(brand => (
                            <Badge key={brand} className="bg-purple-100 text-purple-800">
                              {brand}
                            </Badge>
                          )) : <p className="text-gray-500">No brand preferences selected</p>
                        }
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Preferred Retailers */}
                <Card>
                  <CardHeader>
                    <CardTitle>Preferred Retailers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editMode ? (
                      <div className="flex flex-wrap gap-2">
                        {retailerOptions.map(retailer => (
                          <Badge
                            key={retailer}
                            variant={profile.preferred_retailers?.includes(retailer) ? "default" : "outline"}
                            className={`cursor-pointer ${
                              profile.preferred_retailers?.includes(retailer) 
                                ? 'bg-rose-100 text-rose-800 border-rose-300' 
                                : 'hover:bg-gray-100'
                            }`}
                            onClick={() => updateProfile('preferred_retailers', 
                              toggleArrayItem(profile.preferred_retailers, retailer)
                            )}
                          >
                            {retailer}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.preferred_retailers?.length ? 
                          profile.preferred_retailers.map(retailer => (
                            <Badge key={retailer} className="bg-indigo-100 text-indigo-800">
                              {retailer}
                            </Badge>
                          )) : <p className="text-gray-500">No retailer preferences selected</p>
                        }
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Preferred Fabrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Preferred Fabrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editMode ? (
                      <div className="flex flex-wrap gap-2">
                        {fabricOptions.map(fabric => (
                          <Badge
                            key={fabric}
                            variant={profile.preferred_fabrics?.includes(fabric) ? "default" : "outline"}
                            className={`cursor-pointer ${
                              profile.preferred_fabrics?.includes(fabric) 
                                ? 'bg-rose-100 text-rose-800 border-rose-300' 
                                : 'hover:bg-gray-100'
                            }`}
                            onClick={() => updateProfile('preferred_fabrics', 
                              toggleArrayItem(profile.preferred_fabrics, fabric)
                            )}
                          >
                            {fabric}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.preferred_fabrics?.length ? 
                          profile.preferred_fabrics.map(fabric => (
                            <Badge key={fabric} className="bg-yellow-100 text-yellow-800">
                              {fabric}
                            </Badge>
                          )) : <p className="text-gray-500">No fabric preferences selected</p>
                        }
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'privacy' && (
              <>
                {/* Privacy Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Public Profile</Label>
                        <p className="text-sm text-gray-500">Allow others to see your style profile</p>
                      </div>
                      <Switch
                        checked={profile.public_profile_enabled || false}
                        onCheckedChange={(checked) => updateProfile('public_profile_enabled', checked)}
                        disabled={!editMode}
                      />
                    </div>

                    {profile.gdpr_consent_date && (
                      <div>
                        <Label>GDPR Consent</Label>
                        <p className="text-sm text-gray-500">
                          Consent given on: {new Date(profile.gdpr_consent_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Notification Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Likes</Label>
                        <p className="text-sm text-gray-500">Notify when someone likes your posts</p>
                      </div>
                      <Switch
                        checked={profile.notification_preferences?.likes || false}
                        onCheckedChange={(checked) => updateNotificationPreference('likes', checked)}
                        disabled={!editMode}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Comments</Label>
                        <p className="text-sm text-gray-500">Notify when someone comments on your posts</p>
                      </div>
                      <Switch
                        checked={profile.notification_preferences?.comments || false}
                        onCheckedChange={(checked) => updateNotificationPreference('comments', checked)}
                        disabled={!editMode}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Follows</Label>
                        <p className="text-sm text-gray-500">Notify when someone follows you</p>
                      </div>
                      <Switch
                        checked={profile.notification_preferences?.follows || false}
                        onCheckedChange={(checked) => updateNotificationPreference('follows', checked)}
                        disabled={!editMode}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Events</Label>
                        <p className="text-sm text-gray-500">Notify about upcoming events and outfit suggestions</p>
                      </div>
                      <Switch
                        checked={profile.notification_preferences?.events || false}
                        onCheckedChange={(checked) => updateNotificationPreference('events', checked)}
                        disabled={!editMode}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StyleProfile;
