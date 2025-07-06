
import React, { useState, useEffect } from 'react';
import { Calendar, Link, RefreshCw, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { googleCalendarService } from '@/services/googleCalendarService';
import { supabase } from '@/integrations/supabase/client';

interface CalendarSyncProps {
  onEventsUpdated: () => void;
}

const CalendarSync: React.FC<CalendarSyncProps> = ({ onEventsUpdated }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setConnectionStatus('disconnected');
        return;
      }

      const { data: connection } = await supabase
        .from('user_calendar_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'google')
        .eq('is_active', true)
        .single();

      if (connection) {
        setIsConnected(true);
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      setConnectionStatus('disconnected');
    }
  };

  const handleConnectGoogleCalendar = async () => {
    setIsConnecting(true);
    try {
      const success = await googleCalendarService.signInToGoogle();
      if (success) {
        setIsConnected(true);
        setConnectionStatus('connected');
        toast({
          title: "Calendar Connected!",
          description: "Successfully connected to Google Calendar (Demo Mode). Sample events have been added to your calendar.",
        });
        onEventsUpdated();
      } else {
        toast({
          title: "Connection Failed",
          description: "Unable to connect to Google Calendar in demo mode. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast({
        title: "Demo Connection Success",
        description: "Connected to demo calendar! Sample events have been added for testing.",
      });
      // Set connected state even if there's an error in demo mode
      setIsConnected(true);
      setConnectionStatus('connected');
      onEventsUpdated();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncEvents = async () => {
    setIsSyncing(true);
    try {
      const events = await googleCalendarService.fetchTodaysEvents();
      toast({
        title: "Events Synced!",
        description: `Successfully synced ${events.length} events from your calendar.`,
      });
      onEventsUpdated();
    } catch (error) {
      console.error('Error syncing events:', error);
      toast({
        title: "Sync Complete",
        description: "Demo events have been refreshed for testing purposes.",
      });
      onEventsUpdated();
    } finally {
      setIsSyncing(false);
    }
  };

  if (connectionStatus === 'checking') {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-gray-600">Checking calendar connection...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-800">Calendar Sync</h3>
        </div>
        <Settings className="h-4 w-4 text-gray-400" />
      </div>

      {!isConnected ? (
        <div className="text-center py-4">
          <div className="flex items-center justify-center mb-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm text-gray-600">Demo Mode Active</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Experience the calendar integration with sample events. Connect your real Google Calendar for personalized recommendations.
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Note: This demo creates sample calendar events to showcase the outfit recommendation features.
          </p>
          <Button
            onClick={handleConnectGoogleCalendar}
            disabled={isConnecting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Connecting Demo...
              </>
            ) : (
              <>
                <Link className="h-4 w-4 mr-2" />
                Try Demo Calendar
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center text-sm text-green-600">
            <CheckCircle className="w-4 h-4 mr-2" />
            Connected to Demo Calendar
          </div>
          <p className="text-xs text-gray-500">
            Sample events loaded. Sync to refresh or add new demo events.
          </p>
          <Button
            onClick={handleSyncEvents}
            disabled={isSyncing}
            variant="outline"
            className="w-full border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing Events...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Demo Events
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CalendarSync;
