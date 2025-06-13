
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Cloud, Users, Sparkles, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBehaviorAnalytics } from '@/hooks/useBehaviorAnalytics';

interface EventPlan {
  id?: string;
  event_name: string;
  event_date: string;
  event_time: string;
  location: string;
  weather_forecast?: any;
  dress_code: string;
  attendees?: number;
  outfit_suggestions?: any[];
  notes?: string;
}

const OutfitPlanner = () => {
  const [events, setEvents] = useState<EventPlan[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState<EventPlan>({
    event_name: '',
    event_date: '',
    event_time: '',
    location: '',
    dress_code: '',
    attendees: 1,
    notes: ''
  });
  const { trackEvent } = useBehaviorAnalytics();

  const dressCodeOptions = [
    'Casual', 'Smart Casual', 'Business Casual', 'Business Formal', 
    'Cocktail', 'Black Tie', 'White Tie', 'Themed', 'Activewear'
  ];

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Mock weather data - in a real app, you'd fetch from a weather API
      const mockWeather = {
        temperature: Math.floor(Math.random() * 30) + 10,
        condition: ['sunny', 'cloudy', 'rainy', 'overcast'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 40) + 40
      };

      const eventPlan = {
        ...newEvent,
        user_id: user.id,
        weather_forecast: mockWeather,
        created_at: new Date().toISOString()
      };

      // In a real app, you'd save to a planned_events table
      setEvents(prev => [...prev, { ...eventPlan, id: Date.now().toString() }]);
      
      toast.success('Event added to your planner!');
      setNewEvent({
        event_name: '',
        event_date: '',
        event_time: '',
        location: '',
        dress_code: '',
        attendees: 1,
        notes: ''
      });
      setShowAddForm(false);

      // Track event planning
      trackEvent({
        event_type: 'event_planned',
        event_data: {
          dress_code: newEvent.dress_code,
          has_location: !!newEvent.location,
          attendees: newEvent.attendees
        }
      });
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Failed to add event');
    }
  };

  const generateOutfitSuggestions = (event: EventPlan) => {
    // Mock outfit suggestions based on dress code and weather
    const suggestions = [
      {
        name: `${event.dress_code} Outfit 1`,
        items: ['Tailored Blazer', 'Dress Pants', 'Oxford Shoes'],
        weather_appropriate: true
      },
      {
        name: `${event.dress_code} Outfit 2`, 
        items: ['Midi Dress', 'Cardigan', 'Ankle Boots'],
        weather_appropriate: true
      }
    ];
    
    return suggestions;
  };

  const getWeatherIcon = (condition: string) => {
    return <Cloud className="h-4 w-4" />;
  };

  const getDressCodeColor = (dressCode: string) => {
    const colors: { [key: string]: string } = {
      'Casual': 'bg-green-100 text-green-800',
      'Smart Casual': 'bg-blue-100 text-blue-800',
      'Business Casual': 'bg-purple-100 text-purple-800',
      'Business Formal': 'bg-gray-100 text-gray-800',
      'Cocktail': 'bg-pink-100 text-pink-800',
      'Black Tie': 'bg-black text-white',
      'Activewear': 'bg-orange-100 text-orange-800'
    };
    return colors[dressCode] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Outfit Planner</h2>
          <p className="text-gray-600">Plan your outfits for upcoming events</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Plan Event
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Plan New Event</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Event Name *</label>
                  <Input
                    value={newEvent.event_name}
                    onChange={(e) => setNewEvent({ ...newEvent, event_name: e.target.value })}
                    placeholder="e.g., Business Meeting"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <Input
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="e.g., Downtown Office"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date *</label>
                  <Input
                    type="date"
                    value={newEvent.event_date}
                    onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time</label>
                  <Input
                    type="time"
                    value={newEvent.event_time}
                    onChange={(e) => setNewEvent({ ...newEvent, event_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dress Code *</label>
                  <select
                    value={newEvent.dress_code}
                    onChange={(e) => setNewEvent({ ...newEvent, dress_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select dress code</option>
                    {dressCodeOptions.map((code) => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expected Attendees</label>
                  <Input
                    type="number"
                    value={newEvent.attendees}
                    onChange={(e) => setNewEvent({ ...newEvent, attendees: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Input
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                  placeholder="Any additional details..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600">
                  Add Event
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No events planned</h3>
            <p className="text-gray-500 mb-4">Start planning your outfits for upcoming events!</p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              Plan Your First Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{event.event_name}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {event.event_date} {event.event_time}
                      </div>
                      {event.location && (
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={getDressCodeColor(event.dress_code)}>
                    {event.dress_code}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {event.weather_forecast && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getWeatherIcon(event.weather_forecast.condition)}
                        <span className="text-sm font-medium">Weather Forecast</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {event.weather_forecast.temperature}°C, {event.weather_forecast.condition}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Outfit Suggestions
                    </span>
                    <Button size="sm" variant="outline">
                      Generate Outfits
                    </Button>
                  </div>
                  
                  {event.attendees && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-3 w-3 mr-1" />
                      {event.attendees} attendee{event.attendees > 1 ? 's' : ''}
                    </div>
                  )}

                  {event.notes && (
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-sm text-gray-600">{event.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OutfitPlanner;
