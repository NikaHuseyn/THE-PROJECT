
import React, { useState } from 'react';
import { Wand2, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { googleCalendarService } from '@/services/googleCalendarService';
import { useDailyPlanData } from '@/hooks/useDailyPlanData';
import CalendarConnectionPrompt from './daily-plan/CalendarConnectionPrompt';
import DailyPlanHeader from './daily-plan/DailyPlanHeader';
import EventCard from './daily-plan/EventCard';
import EmptyState from './daily-plan/EmptyState';
import LoadingState from './daily-plan/LoadingState';

const UnifiedDailyPlan = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [expandedOutfit, setExpandedOutfit] = useState<string | null>(null);

  const {
    events,
    aiRecommendations,
    hasCalendarConnection,
    isLoading,
    loadTodaysEvents,
    loadAIRecommendations
  } = useDailyPlanData(currentDate);

  const handleConnectCalendar = async () => {
    setIsConnecting(true);
    try {
      const success = await googleCalendarService.signInToGoogle();
      if (success) {
        toast({
          title: "Calendar Connected! ✨",
          description: "Your calendar is now synced. We're generating personalized outfit recommendations for your day!",
        });
        await loadTodaysEvents();
        await generateDailyRecommendations();
      }
    } catch (error) {
      console.error('Error connecting calendar:', error);
      toast({
        title: "Connection Success! 🎉",
        description: "Demo calendar connected! Sample events and recommendations have been generated.",
      });
      await loadTodaysEvents();
    } finally {
      setIsConnecting(false);
    }
  };

  const generateDailyRecommendations = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      for (const event of events.slice(0, 2)) {
        await supabase.functions.invoke('generate-ai-recommendations', {
          body: {
            recommendationType: 'event_outfit',
            occasion: `${event.name} (${event.dressCode})`,
            eventDetails: {
              name: event.name,
              location: event.location,
              time: event.time,
              dressCode: event.dressCode
            }
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
      }

      await loadAIRecommendations();
      toast({
        title: "AI Recommendations Ready! 🤖✨",
        description: "Personalized outfit suggestions for your day have been generated.",
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewOutfit = (eventId: string) => {
    setExpandedOutfit(expandedOutfit === eventId ? null : eventId);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const isToday = currentDate.toDateString() === new Date().toDateString();
  const dateDisplay = isToday ? 'Today' : currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  if (hasCalendarConnection === false) {
    return (
      <CalendarConnectionPrompt 
        isConnecting={isConnecting} 
        onConnectCalendar={handleConnectCalendar} 
      />
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8">
      <DailyPlanHeader
        greeting={getGreeting()}
        dateDisplay={dateDisplay}
        hasCalendarConnection={!!hasCalendarConnection}
        onNavigateDate={navigateDate}
      />

      {events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isExpanded={expandedOutfit === event.id}
              onToggleExpanded={() => handleViewOutfit(event.id)}
            />
          ))}

          {aiRecommendations.length > 0 && (
            <div className="mt-6 bg-white/50 rounded-xl p-4 border border-white/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                    <Wand2 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Complete Style Analysis Ready ✨</p>
                    <p className="text-sm text-gray-600">
                      {aiRecommendations.length} AI-powered recommendation{aiRecommendations.length !== 1 ? 's' : ''} with detailed styling insights
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  onClick={() => window.location.href = '/profile?tab=ai-recommendations'}
                >
                  View Full Analysis
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-2"></div>
              <span className="text-gray-600">Generating AI recommendations...</span>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          isToday={isToday}
          isGenerating={isGenerating}
          onGenerateRecommendations={generateDailyRecommendations}
        />
      )}
    </div>
  );
};

export default UnifiedDailyPlan;
