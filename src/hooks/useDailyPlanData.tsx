
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { outfitRecommendationService } from '@/services/outfitRecommendationService';

export interface Event {
  id: string;
  name: string;
  time: string;
  location: string;
  dressCode: string;
  temperature?: number;
  weatherIcon?: string;
  hasAIRecommendation?: boolean;
  aiReasoning?: string;
  outfitRecommendation?: {
    top: string;
    bottom: string;
    shoes: string;
    accessories: string[];
    colors: string[];
    notes: string;
  };
}

export const useDailyPlanData = (currentDate: Date) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [hasCalendarConnection, setHasCalendarConnection] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock events for demonstration
  const mockEvents: Event[] = [
    {
      id: '1',
      name: 'Morning Team Meeting',
      time: '9:00 AM',
      location: 'Conference Room A',
      dressCode: 'Business Casual',
      temperature: 18,
      weatherIcon: 'cloud',
      hasAIRecommendation: true
    },
    {
      id: '2',
      name: 'Lunch with Client',
      time: '12:30 PM',
      location: 'The Garden Restaurant',
      dressCode: 'Smart Casual',
      temperature: 22,
      weatherIcon: 'sun',
      hasAIRecommendation: true
    },
    {
      id: '3',
      name: 'Evening Yoga Class',
      time: '6:00 PM',
      location: 'Downtown Studio',
      dressCode: 'Activewear',
      temperature: 16,
      weatherIcon: 'cloud',
      hasAIRecommendation: true
    }
  ];

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
        .eq('is_active', true)
        .maybeSingle();

      setHasCalendarConnection(!!connection);
    } catch (error) {
      console.error('Error checking calendar connection:', error);
      setHasCalendarConnection(false);
    }
  };

  const loadTodaysEvents = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setEvents(mockEvents);
        setIsLoading(false);
        return;
      }

      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Try to load real calendar events
      const { data: syncedEvents } = await supabase
        .from('synced_calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time', { ascending: true });

      if (syncedEvents && syncedEvents.length > 0) {
        // Convert synced events to our format
        const formattedEvents: Event[] = syncedEvents.map(event => ({
          id: event.id,
          name: event.title,
          time: new Date(event.start_time).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          }),
          location: event.location || 'Location TBD',
          dressCode: event.dress_code || 'Smart Casual',
          temperature: Math.floor(Math.random() * 10) + 15,
          weatherIcon: Math.random() > 0.5 ? 'sun' : 'cloud',
          hasAIRecommendation: true
        }));

        // Generate personalized recommendations
        await generatePersonalizedRecommendations(formattedEvents);
        setEvents(formattedEvents);
      } else {
        // Use mock events and generate recommendations
        await generatePersonalizedRecommendations(mockEvents);
        setEvents(mockEvents);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents(mockEvents);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePersonalizedRecommendations = async (eventList: Event[]) => {
    try {
      // Convert events to calendar event format for the service
      const calendarEvents = eventList.map(event => ({
        id: event.id,
        title: event.name,
        start_time: new Date().toISOString(), // Current time for demo
        location: event.location,
        dress_code: event.dressCode,
        event_type: 'general'
      }));

      // Generate personalized recommendations
      const recommendations = await outfitRecommendationService.generatePersonalizedRecommendations(calendarEvents);
      
      // Update events with AI recommendations
      const eventsWithRecommendations = eventList.map(event => {
        const recommendation = recommendations.find(rec => rec.eventId === event.id);
        if (recommendation) {
          return {
            ...event,
            hasAIRecommendation: true,
            aiReasoning: recommendation.reasoning,
            outfitRecommendation: {
              top: recommendation.top,
              bottom: recommendation.bottom,
              shoes: recommendation.shoes,
              accessories: recommendation.accessories,
              colors: recommendation.colors,
              notes: recommendation.notes
            }
          };
        }
        return event;
      });

      setEvents(eventsWithRecommendations);
      console.log('Generated personalized recommendations:', recommendations);
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      // Fallback to basic recommendations
      const eventsWithBasicRecs = eventList.map(event => ({
        ...event,
        hasAIRecommendation: true,
        aiReasoning: `Based on your ${event.dressCode.toLowerCase()} event, I recommend a professional yet comfortable look that aligns with current trends.`,
        outfitRecommendation: {
          top: `Professional ${event.dressCode.toLowerCase()} top`,
          bottom: `Matching ${event.dressCode.toLowerCase()} bottom`,
          shoes: 'Comfortable professional shoes',
          accessories: ['Watch', 'Belt'],
          colors: ['Navy', 'White', 'Gray'],
          notes: `Perfect for ${event.dressCode.toLowerCase()} occasions with a modern twist.`
        }
      }));
      setEvents(eventsWithBasicRecs);
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
        .limit(5);

      setAiRecommendations(recommendations || []);
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
    }
  };

  useEffect(() => {
    checkCalendarConnection();
  }, []);

  useEffect(() => {
    if (hasCalendarConnection !== null) {
      loadTodaysEvents();
      loadAIRecommendations();
    }
  }, [currentDate, hasCalendarConnection]);

  return {
    events,
    aiRecommendations,
    hasCalendarConnection,
    isLoading,
    loadTodaysEvents,
    loadAIRecommendations
  };
};
