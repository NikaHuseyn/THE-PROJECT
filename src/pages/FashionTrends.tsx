
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TrendDashboard from '@/components/TrendDashboard';
import TrendForecast from '@/components/TrendForecast';

const FashionTrends = () => {
  const [activeTab, setActiveTab] = useState('current-trends');

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Fashion Trends
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay ahead of the curve with the latest trend analysis and forecasting
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="current-trends">Current Trends</TabsTrigger>
            <TabsTrigger value="trend-forecast">Trend Forecast</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current-trends" className="space-y-6">
            <TrendDashboard />
          </TabsContent>
          
          <TabsContent value="trend-forecast" className="space-y-6">
            <TrendForecast />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FashionTrends;
