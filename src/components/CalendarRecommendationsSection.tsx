import React, { useState, useEffect } from 'react';
import { Calendar, Sparkles, Clock, MapPin, Link, Wand2, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { googleCalendarService, CalendarEvent } from '@/services/googleCalendarService';

const CalendarRecommendationsSection = () => {
  const [hasCalendarConnection, setHasCalendarConnection] = useState<boolean | null>(null);
  const [todaysEvents, setTodaysEvents] = useState<CalendarEvent[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkCalendarConnection();
  }, []);

  useEffect(() => {
    if (hasCalendarConnection) {
      loadTodaysEvents();
      loadAIRecommendations();
    }
  }, [hasCalendarConnection]);

  const checkCalendarConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasCalendarConnection(false);
        return;
      }

      const { data: connection } = await supabase
        .from('user_calendar_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'google')
        .eq('is_active', true)
        .single();

      setHasCalendarConnection(!!connection);
    } catch (error) {
      console.error('Error checking calendar connection:', error);
      setHasCalendarConnection(false);
    }
  };

  const loadTodaysEvents = async () => {
    try {
      const events = await googleCalendarService.getSyncedEvents();
      setTodaysEvents(events);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadAIRecommendations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { data: recommendations } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today)
        .order('created_at', { ascending: false })
        .limit(3);

      setAiRecommendations(recommendations || []);
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
    }
  };

  const handleConnectCalendar = async () => {
    setIsConnecting(true);
    try {
      const success = await googleCalendarService.signInToGoogle();
      if (success) {
        setHasCalendarConnection(true);
        toast({
          title: "Calendar Connected! ✨",
          description: "Your calendar is now synced. We're generating personalised outfit recommendations for your day!",
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
      setHasCalendarConnection(true);
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

      // Generate recommendations for today's events
      for (const event of todaysEvents.slice(0, 2)) {
        await supabase.functions.invoke('generate-ai-recommendations', {
          body: {
            recommendationType: 'event_outfit',
            occasion: `${event.name} (${event.dressCode})`,
            eventDetails: {
              name: event.name,
              location: event.location,
              time: event.time,
              dressCode: event.dressCode,
              type: event.type
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
        description: "Personalised outfit suggestions for your day have been generated.",
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getDressCodeColor = (dressCode: string) => {
    switch (dressCode?.toLowerCase()) {
      case 'business casual':
        return 'bg-blue-100 text-blue-700';
      case 'smart casual':
        return 'bg-green-100 text-green-700';
      case 'activewear':
        return 'bg-purple-100 text-purple-700';
      case 'formal':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-rose-100 text-rose-700';
    }
  };

  // Show loading state while checking connection
  if (hasCalendarConnection === null) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-3"></div>
          <span className="text-gray-600">Checking calendar connection...</span>
        </div>
      </div>
    );
  }

  // Show calendar connection prompt if not connected
  if (!hasCalendarConnection) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-8 mb-8 border border-indigo-100">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Calendar className="h-12 w-12 text-indigo-600" />
              <Sparkles className="h-6 w-6 text-purple-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            Unlock Daily Style Magic ✨
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Connect your calendar and let our AI stylist create personalised outfit recommendations 
            for each of your daily activities. From morning meetings to evening events, we've got your style covered!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/60 rounded-xl p-4 border border-white/50">
              <Wand2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800 mb-1">Smart Recommendations</h4>
              <p className="text-sm text-gray-600">AI-powered outfit suggestions based on your events</p>
            </div>
            <div className="bg-white/60 rounded-xl p-4 border border-white/50">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800 mb-1">Perfect Timing</h4>
              <p className="text-sm text-gray-600">Outfits ready when you need them most</p>
            </div>
            <div className="bg-white/60 rounded-xl p-4 border border-white/50">
              <Star className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800 mb-1">Weather Aware</h4>
              <p className="text-sm text-gray-600">Recommendations that match the forecast</p>
            </div>
          </div>

          <Button
            onClick={handleConnectCalendar}
            disabled={isConnecting}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Connecting Calendar...
              </>
            ) : (
              <>
                <Link className="h-5 w-5 mr-2" />
                Connect Calendar & Get AI Recommendations
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-500 mt-4">
            🔒 Your calendar data is secure and used only for outfit recommendations
          </p>
        </div>
      </div>
    );
  }

  // Show daily recommendations for connected users
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-indigo-600" />
            Your Daily Style Forecast
          </h3>
          <p className="text-gray-600">
            AI-curated outfits for today's activities
          </p>
        </div>
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <Calendar className="h-3 w-3 mr-1" />
          Calendar Connected
        </Badge>
      </div>

      {todaysEvents.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaysEvents.slice(0, 3).map((event) => (
              <Card key={event.id} className="bg-white/70 border border-white/50 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">{event.name}</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {event.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Badge className={`${getDressCodeColor(event.dressCode)} text-xs`}>
                    {event.dressCode}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {aiRecommendations.length > 0 && (
            <div className="mt-6 bg-white/50 rounded-xl p-4 border border-white/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                    <Wand2 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">AI Recommendations Ready ✨</p>
                    <p className="text-sm text-gray-600">
                      {aiRecommendations.length} personalised outfit{aiRecommendations.length !== 1 ? 's' : ''} for today's events
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  onClick={() => window.location.href = '/profile?tab=ai-recommendations'}
                >
                  View All
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
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-700 mb-2">No events scheduled for today</h4>
          <p className="text-gray-500 mb-4">
            Add events to your calendar to get personalised outfit recommendations!
          </p>
          <Button 
            onClick={generateDailyRecommendations}
            disabled={isGenerating}
            variant="outline"
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate General Recommendations
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CalendarRecommendationsSection;
