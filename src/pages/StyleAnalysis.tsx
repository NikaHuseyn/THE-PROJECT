
import React from 'react';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import StyleProfile from '@/components/StyleProfile';
import AIRecommendations from '@/components/AIRecommendations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const StyleAnalysis = () => {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Style Analysis</h1>
            <p className="text-gray-600">
              AI-powered style insights and personalized outfit recommendations
            </p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Style Profile</TabsTrigger>
              <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              <StyleProfile />
            </TabsContent>
            
            <TabsContent value="recommendations" className="mt-6">
              <AIRecommendations />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  );
};

export default StyleAnalysis;
