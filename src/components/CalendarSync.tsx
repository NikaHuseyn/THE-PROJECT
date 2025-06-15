
import React, { useState } from 'react';
import { Calendar, Link, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { googleCalendarService } from '@/services/googleCalendarService';

interface CalendarSyncProps {
  onEventsUpdated: () => void;
}

const CalendarSync: React.FC<CalendarSyncProps> = ({ onEventsUpdated }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnectGoogleCalendar = async () => {
    setIsConnecting(true);
    try {
      const success = await googleCalendarService.signInToGoogle();
      if (success) {
        setIsConnected(true);
        toast({
          title: "Calendar Connected!",
          description: "Successfully connected to Google Calendar. Your events will now sync automatically.",
        });
        onEventsUpdated();
      } else {
        toast({
          title: "Connection Failed",
          description: "Unable to connect to Google Calendar. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast({
        title: "Connection Error",
        description: "An error occurred while connecting to Google Calendar.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncEvents = async () => {
    setIsSyncing(true);
    try {
      await googleCalendarService.fetchTodaysEvents();
      toast({
        title: "Events Synced!",
        description: "Your calendar events have been updated successfully.",
      });
      onEventsUpdated();
    } catch (error) {
      console.error('Error syncing events:', error);
      toast({
        title: "Sync Failed",
        description: "Unable to sync calendar events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

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
          <p className="text-sm text-gray-600 mb-4">
            Connect your Google Calendar to get personalized outfit recommendations based on your actual events.
          </p>
          <Button
            onClick={handleConnectGoogleCalendar}
            disabled={isConnecting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Link className="h-4 w-4 mr-2" />
                Connect Google Calendar
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Connected to Google Calendar
          </div>
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
                Sync Events
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CalendarSync;
