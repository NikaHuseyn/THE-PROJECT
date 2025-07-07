
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { User, Settings, Heart, ShoppingBag, Calendar, BarChart3, Palette } from 'lucide-react';
import PersonalInfoForm from '@/components/profile/PersonalInfoForm';
import SizePreferencesForm from '@/components/profile/SizePreferencesForm';
import StylePreferencesForm from '@/components/profile/StylePreferencesForm';
import PrivacySettingsForm from '@/components/profile/PrivacySettingsForm';
import UserWishlist from '@/components/profile/UserWishlist';
import OutfitHistory from '@/components/profile/OutfitHistory';
import PurchaseHistory from '@/components/profile/PurchaseHistory';
import StyleProfile from '@/components/StyleProfile';
import AuthGuard from '@/components/AuthGuard';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('personal');

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['userProfile'],
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

  const handleProfileUpdate = () => {
    refetch();
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full flex items-center justify-center">
                    {profile?.profile_photo_url ? (
                      <img 
                        src={profile.profile_photo_url} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profile?.display_name || 'Your Profile'}
                    </h1>
                    <p className="text-gray-600">Manage your style preferences and settings</p>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-8">
              <TabsTrigger value="personal" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Personal</span>
              </TabsTrigger>
              <TabsTrigger value="sizes" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Sizes</span>
              </TabsTrigger>
              <TabsTrigger value="style" className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Style</span>
              </TabsTrigger>
              <TabsTrigger value="styleprofile" className="flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Style Profile</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center space-x-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Wishlist</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
              <TabsTrigger value="purchases" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Purchases</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <PersonalInfoForm profile={profile} onUpdate={handleProfileUpdate} />
            </TabsContent>

            <TabsContent value="sizes">
              <SizePreferencesForm profile={profile} onUpdate={handleProfileUpdate} />
            </TabsContent>

            <TabsContent value="style">
              <StylePreferencesForm profile={profile} onUpdate={handleProfileUpdate} />
            </TabsContent>

            <TabsContent value="styleprofile">
              <StyleProfile />
            </TabsContent>

            <TabsContent value="wishlist">
              <UserWishlist />
            </TabsContent>

            <TabsContent value="history">
              <OutfitHistory />
            </TabsContent>

            <TabsContent value="purchases">
              <PurchaseHistory />
            </TabsContent>

            <TabsContent value="privacy">
              <PrivacySettingsForm profile={profile} onUpdate={handleProfileUpdate} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Profile;
