
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { googleCalendarService } from '@/services/googleCalendarService';
import { Event } from '@/components/daily-plan/EventCard';

interface AIRecommendation {
  id: string;
  occasion: string;
  confidence_score: number;
  reasoning: string;
  recommended_items: any;
  created_at: string;
}

export const useDailyPlanData = (currentDate: Date) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [hasCalendarConnection, setHasCalendarConnection] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock events data
  const mockEvents: Event[] = [
    {
      id: '1',
      name: 'Morning Meeting',
      time: '9:00 AM',
      location: 'Office Conference Room',
      dressCode: 'Business Casual',
      temperature: 18,
      weatherIcon: 'cloud',
      hasAIRecommendation: true,
      aiReasoning: 'Perfect professional look for cooler weather. The navy blazer provides warmth while maintaining a polished appearance.',
      outfitRecommendation: {
        top: 'Navy blazer with crisp white button-down shirt',
        bottom: 'Charcoal grey tailored trousers',
        shoes: 'Brown leather oxford shoes',
        accessories: ['Silver watch', 'Brown leather belt', 'Navy pocket square'],
        colors: ['Navy', 'White', 'Charcoal', 'Brown'],
        notes: 'Layer with a light sweater underneath for extra warmth. The brown accessories add warmth to the cool color palette.'
      }
    },
    {
      id: '2',
      name: 'Lunch with Client',
      time: '12:30 PM',
      location: 'The Garden Restaurant',
      dressCode: 'Smart Casual',
      temperature: 22,
      weatherIcon: 'sun',
      hasAIRecommendation: true,
      aiReasoning: 'Elevated casual style ideal for outdoor dining. Light layers work perfectly for the warming afternoon temperature.',
      outfitRecommendation: {
        top: 'Light blue chambray shirt, sleeves rolled up',
        bottom: 'Khaki chinos',
        shoes: 'White leather sneakers',
        accessories: ['Brown leather watch', 'Sunglasses', 'Canvas belt'],
        colors: ['Light Blue', 'Khaki', 'White', 'Brown'],
        notes: 'Perfect for transitioning from indoor to outdoor dining. The chambray breathes well in warmer weather.'
      }
    },
    {
      id: '3',
      name: 'Evening Yoga',
      time: '6:00 PM',
      location: 'Downtown Studio',
      dressCode: 'Activewear',
      temperature: 16,
      weatherIcon: 'cloud',
      hasAIRecommendation: true,
      aiReasoning: 'Functional yet stylish activewear. Breathable fabrics with light layering for post-workout comfort in cooler evening air.',
      outfitRecommendation: {
        top: 'Moisture-wicking long-sleeve top in sage green',
        bottom: 'High-waisted black leggings',
        shoes: 'Non-slip yoga shoes or barefoot',
        accessories: ['Hair tie', 'Water bottle', 'Yoga mat', 'Light jacket for after'],
        colors: ['Sage Green', 'Black'],
        notes: 'Bring a light jacket for the walk home. Choose fabrics that move with you and keep you comfortable throughout practice.'
      }
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
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && hasCalendarConnection) {
        const { data: syncedEvents } = await supabase
          .from('synced_calendar_events')
          .select('*')
          .eq('user_id', user.id)
          .gte('start_time', currentDate.toISOString().split('T')[0])
          .lt('start_time', new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString());

        if (syncedEvents && syncedEvents.length > 0) {
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
          setEvents(formattedEvents);
        } else {
          setEvents(mockEvents);
        }
      } else {
        setEvents(mockEvents);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents(mockEvents);
    } finally {
      setIsLoading(false);
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
  }, [hasCalendarConnection, currentDate]);

  return {
    events,
    aiRecommendations,
    hasCalendarConnection,
    isLoading,
    checkCalendarConnection,
    loadTodaysEvents,
    loadAIRecommendations
  };
};
