
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { googleCalendarService } from '@/services/googleCalendarService';

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  location?: string;
  description?: string;
  dress_code?: string;
  event_type?: string;
}

export const useCalendarEvents = (date?: Date) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasConnection, setHasConnection] = useState<boolean | null>(null);

  const checkCalendarConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasConnection(false);
        return false;
      }

      const { data: connection } = await supabase
        .from('user_calendar_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'google')
        .eq('is_active', true)
        .single();

      const connectionExists = !!connection;
      setHasConnection(connectionExists);
      return connectionExists;
    } catch (error) {
      console.error('Error checking calendar connection:', error);
      setHasConnection(false);
      return false;
    }
  };

  const loadEvents = async (targetDate?: Date) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      const dateToUse = targetDate || date || new Date();
      const startOfDay = new Date(dateToUse);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(dateToUse);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: syncedEvents, error: fetchError } = await supabase
        .from('synced_calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setEvents(syncedEvents || []);
    } catch (err) {
      console.error('Error loading calendar events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load events');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const connectCalendar = async () => {
    try {
      setError(null);
      const success = await googleCalendarService.signInToGoogle();
      if (success) {
        await checkCalendarConnection();
        await loadEvents();
      }
      return success;
    } catch (error) {
      console.error('Error connecting calendar:', error);
      setError('Failed to connect calendar');
      return false;
    }
  };

  const syncEvents = async () => {
    if (!hasConnection) return false;
    
    try {
      setError(null);
      // This would trigger a sync with the external calendar service
      await googleCalendarService.syncEvents();
      await loadEvents();
      return true;
    } catch (error) {
      console.error('Error syncing events:', error);
      setError('Failed to sync events');
      return false;
    }
  };

  useEffect(() => {
    checkCalendarConnection();
  }, []);

  useEffect(() => {
    if (hasConnection && date) {
      loadEvents(date);
    }
  }, [hasConnection, date]);

  return {
    events,
    isLoading,
    error,
    hasConnection,
    loadEvents,
    connectCalendar,
    syncEvents,
    checkCalendarConnection
  };
};
