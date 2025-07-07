
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GoogleCalendarService } from '@/services/googleCalendarService';

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
  location?: string;
  event_type?: string;
  dress_code?: string;
}

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const checkConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: connections } = await supabase
        .from('user_calendar_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      setIsConnected(connections && connections.length > 0);
    } catch (err) {
      console.error('Error checking calendar connection:', err);
    }
  };

  const fetchEvents = async (days = 7) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + days);

      const { data, error: fetchError } = await supabase
        .from('synced_calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: true });

      if (fetchError) throw fetchError;

      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  const connectCalendar = async () => {
    try {
      setIsLoading(true);
      const calendarService = new GoogleCalendarService();
      await calendarService.authorize();
      await checkConnection();
      if (isConnected) {
        await fetchEvents();
      }
    } catch (err) {
      console.error('Error connecting calendar:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect calendar');
    } finally {
      setIsLoading(false);
    }
  };

  const syncEvents = async () => {
    try {
      setIsLoading(true);
      const calendarService = new GoogleCalendarService();
      // Sync recent events
      await fetchEvents();
    } catch (err) {
      console.error('Error syncing events:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync events');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshEvents = () => {
    fetchEvents();
  };

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchEvents();
    }
  }, [isConnected]);

  return {
    events,
    isLoading,
    error,
    isConnected,
    fetchEvents,
    connectCalendar,
    syncEvents,
    refreshEvents
  };
};
