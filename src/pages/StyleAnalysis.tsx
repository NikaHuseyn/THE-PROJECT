
import React, { useState } from 'react';
import Header from '@/components/Header';
import AIRecommendations from '@/components/AIRecommendations';
import DailyRecommendationSettings from '@/components/DailyRecommendationSettings';
import MultiDayCalendarOverview from '@/components/MultiDayCalendarOverview';
import OutfitTimelineView from '@/components/OutfitTimelineView';
import UnifiedDailyPlan from '@/components/UnifiedDailyPlan';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const StyleAnalysis = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDaySelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Style Analysis</h1>
          <p className="text-gray-600">
            AI-powered style insights, personalized recommendations, and calendar integration
          </p>
        </div>

        {/* Unified Daily Plan at the top */}
        <UnifiedDailyPlan />

        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="timeline">Timeline & Feedback</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommendations" className="mt-6">
            <AIRecommendations />
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-6">
            <div className="space-y-6">
              <MultiDayCalendarOverview onDaySelect={handleDaySelect} />
              <OutfitTimelineView selectedDate={selectedDate} />
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-6">
            <OutfitTimelineView selectedDate={selectedDate} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StyleAnalysis;
