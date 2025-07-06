
import React from 'react';
import Header from '@/components/Header';
import StyleProfile from '@/components/StyleProfile';
import AIRecommendations from '@/components/AIRecommendations';
import CommunityFeed from '@/components/CommunityFeed';
import DailyRecommendationSettings from '@/components/DailyRecommendationSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const StyleAnalysis = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Style Analysis</h1>
          <p className="text-gray-600">
            AI-powered style insights, personalized recommendations, and community inspiration
          </p>
        </div>

        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            <TabsTrigger value="profile">Style Profile</TabsTrigger>
            <TabsTrigger value="settings">Daily Settings</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommendations" className="mt-6">
            <AIRecommendations />
          </TabsContent>
          
          <TabsContent value="profile" className="mt-6">
            <StyleProfile />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <DailyRecommendationSettings />
            </div>
          </TabsContent>
          
          <TabsContent value="community" className="mt-6">
            <CommunityFeed />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StyleAnalysis;
