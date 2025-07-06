
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Thermometer, Sun, Cloud, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Event {
  id: string;
  name: string;
  time: string;
  location: string;
  dressCode: string;
  temperature?: number;
  weatherIcon?: string;
  hasOutfitSuggestion?: boolean;
}

interface DailyOutfitSnapshotProps {
  userName?: string;
}

const DailyOutfitSnapshot: React.FC<DailyOutfitSnapshotProps> = ({ userName = "there" }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock events for today
  const mockEvents: Event[] = [
    {
      id: '1',
      name: 'Morning Meeting',
      time: '9:00 AM',
      location: 'Office Conference Room',
      dressCode: 'Business Casual',
      temperature: 18,
      weatherIcon: 'cloud',
      hasOutfitSuggestion: true
    },
    {
      id: '2',
      name: 'Lunch with Client',
      time: '12:30 PM',
      location: 'The Garden Restaurant',
      dressCode: 'Smart Casual',
      temperature: 22,
      weatherIcon: 'sun',
      hasOutfitSuggestion: true
    },
    {
      id: '3',
      name: 'Evening Yoga',
      time: '6:00 PM',
      location: 'Downtown Studio',
      dressCode: 'Activewear',
      temperature: 16,
      weatherIcon: 'cloud',
      hasOutfitSuggestion: true
    }
  ];

  useEffect(() => {
    loadTodaysEvents();
  }, [currentDate]);

  const loadTodaysEvents = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Try to load real calendar events
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
            temperature: Math.floor(Math.random() * 10) + 15, // Mock temperature
            weatherIcon: Math.random() > 0.5 ? 'sun' : 'cloud',
            hasOutfitSuggestion: true
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

  const handleViewOutfit = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    toast({
      title: "Opening Outfit Suggestions",
      description: `Showing personalized outfits for ${event?.name}`,
    });
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

  const getWeatherIcon = (icon: string) => {
    return icon === 'sun' ? <Sun className="h-4 w-4 text-yellow-500" /> : <Cloud className="h-4 w-4 text-gray-500" />;
  };

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

  const isToday = currentDate.toDateString() === new Date().toDateString();
  const dateDisplay = isToday ? 'Today' : currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            {getGreeting()}, {userName}! Here's {isToday ? "today's" : "your"} plan.
          </h2>
          <p className="text-gray-600 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {dateDisplay}
          </p>
        </div>
        
        {/* Date Navigation */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigateDate('prev')}
            className="border-indigo-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigateDate('next')}
            className="border-indigo-200"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Event Cards */}
      {events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="bg-white/70 border border-white/50 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">{event.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {event.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.location}
                          </div>
                          <div className="flex items-center">
                            {getWeatherIcon(event.weatherIcon || 'sun')}
                            <span className="ml-1">{event.temperature}°C</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={`${getDressCodeColor(event.dressCode)} text-xs`}>
                        {event.dressCode}
                      </Badge>
                      
                      <Button 
                        onClick={() => handleViewOutfit(event.id)}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm px-4 py-2"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Suggested Outfit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No events scheduled</h3>
          <p className="text-gray-500">
            {isToday ? "Enjoy your free day!" : "No events planned for this date."}
          </p>
        </div>
      )}
    </div>
  );
};

export default DailyOutfitSnapshot;
