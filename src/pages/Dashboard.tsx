
import React, { useState } from 'react';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import OutfitPlanner from '@/components/OutfitPlanner';
import CommunityFeed from '@/components/CommunityFeed';
import TrendDashboard from '@/components/TrendDashboard';
import DailyOutfitAssistant from '@/components/DailyOutfitAssistant';
import WeatherBanner from '@/components/WeatherBanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, TrendingUp, Sparkles } from 'lucide-react';

const Dashboard = () => {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Style Dashboard</h1>
            <p className="text-gray-600">
              Your comprehensive hub for outfit planning, trends, and community inspiration
            </p>
          </div>

          <WeatherBanner />
          <DailyOutfitAssistant />

          <Tabs defaultValue="planner" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="planner" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Outfit Planner
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="community" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Community
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Assistant
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="planner" className="mt-6">
              <OutfitPlanner />
            </TabsContent>
            
            <TabsContent value="trends" className="mt-6">
              <TrendDashboard />
            </TabsContent>
            
            <TabsContent value="community" className="mt-6">
              <CommunityFeed />
            </TabsContent>
            
            <TabsContent value="ai" className="mt-6">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 text-center">
                <Sparkles className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">AI Style Assistant</h3>
                <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                  Get personalized outfit recommendations, style advice, and fashion insights powered by AI. 
                  Chat with your virtual stylist to discover new looks and optimize your wardrobe.
                </p>
                <div className="bg-white rounded-xl p-6 max-w-md mx-auto">
                  <p className="text-sm text-gray-500 mb-2">Coming Soon</p>
                  <p className="text-gray-700">Interactive AI chat for instant style advice and outfit generation</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
