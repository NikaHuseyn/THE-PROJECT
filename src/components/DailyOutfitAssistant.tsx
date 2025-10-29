
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { googleCalendarService, CalendarEvent } from '@/services/googleCalendarService';
import CalendarSync from './CalendarSync';

const DailyOutfitAssistant = () => {
  const [todaysEvents, setTodaysEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock events as fallback
  const mockEvents: CalendarEvent[] = [
    {
      id: "1",
      name: "Team Meeting",
      time: "9:00 AM",
      location: "Conference Room A",
      dressCode: "Business Casual",
      type: "work",
      start: new Date().toISOString(),
      end: new Date().toISOString()
    },
    {
      id: "2",
      name: "Lunch with Sarah",
      time: "12:30 PM",
      location: "The Garden Cafe",
      dressCode: "Smart Casual",
      type: "social",
      start: new Date().toISOString(),
      end: new Date().toISOString()
    },
    {
      id: "3",
      name: "Yoga Class",
      time: "6:00 PM",
      location: "Downtown Studio",
      dressCode: "Activewear",
      type: "fitness",
      start: new Date().toISOString(),
      end: new Date().toISOString()
    }
  ];

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      // Try to load synced events first
      const syncedEvents = await googleCalendarService.getSyncedEvents();
      
      if (syncedEvents.length > 0) {
        setTodaysEvents(syncedEvents);
      } else {
        // Fall back to mock events if no synced events available
        setTodaysEvents(mockEvents);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setTodaysEvents(mockEvents);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const getDressCodeColor = (dressCode: string) => {
    switch (dressCode.toLowerCase()) {
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

  const handleGetAllRecommendations = () => {
    toast({
      title: "Generating Outfit Recommendations",
      description: "We're creating personalised outfits for all your events today!",
    });
    console.log('Getting recommendations for all events:', todaysEvents);
  };

  const handleViewStyles = (eventId: string) => {
    const event = todaysEvents.find(e => e.id === eventId);
    toast({
      title: `Viewing Styles for ${event?.name}`,
      description: `Showing outfit recommendations for ${event?.dressCode.toLowerCase()} dress code.`,
    });
    console.log('Viewing styles for event:', event);
  };

  const handleViewAll = () => {
    toast({
      title: "Opening All Recommendations",
      description: "Displaying all curated outfits for today's events.",
    });
    console.log('Viewing all smart recommendations');
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 mb-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-indigo-600" />
            Daily Outfit Assistant
          </h3>
          <p className="text-gray-600">
            Get personalised outfit recommendations based on your calendar events and preferences
          </p>
        </div>
        <Button 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          onClick={handleGetAllRecommendations}
        >
          Get All Recommendations
        </Button>
      </div>

      {/* Calendar Sync Component */}
      <div className="mb-6">
        <CalendarSync onEventsUpdated={loadEvents} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {todaysEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
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
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            
            <div className="mb-3">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDressCodeColor(event.dressCode)}`}>
                {event.dressCode}
              </span>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Outfit recommendation</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  onClick={() => handleViewStyles(event.id)}
                >
                  View Styles
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white/50 rounded-xl p-4 border border-white/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Sparkles className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Smart Recommendations Ready</p>
              <p className="text-sm text-gray-600">{todaysEvents.length} personalised outfits curated for today's events</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            onClick={handleViewAll}
          >
            View All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DailyOutfitAssistant;
