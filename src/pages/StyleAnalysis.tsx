
import React, { useState } from 'react';
import Header from '@/components/Header';
import MultiDayCalendarOverview from '@/components/MultiDayCalendarOverview';
import OutfitTimelineView from '@/components/OutfitTimelineView';
import UnifiedDailyPlan from '@/components/UnifiedDailyPlan';

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
            AI-powered style insights, personalised recommendations, and calendar integration
          </p>
        </div>

        {/* Unified Daily Plan with AI recommendations at the top */}
        <UnifiedDailyPlan />

        {/* Calendar Planning Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Calendar Planning</h2>
            <p className="text-gray-600">
              View your calendar and plan outfits for upcoming events
            </p>
          </div>
          
          <div className="space-y-6">
            <MultiDayCalendarOverview onDaySelect={handleDaySelect} />
            <OutfitTimelineView selectedDate={selectedDate} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StyleAnalysis;
