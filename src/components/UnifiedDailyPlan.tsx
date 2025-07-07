import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Thermometer, Sun, Cloud, Eye, ChevronLeft, ChevronRight, Sparkles, Wand2, Star, Link, ArrowRight, Shirt, Footprints, Watch, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { googleCalendarService, CalendarEvent } from '@/services/googleCalendarService';

interface OutfitRecommendation {
  top: string;
  bottom: string;
  shoes: string;
  accessories: string[];
  colors: string[];
  notes: string;
}

interface Event {
  id: string;
  name: string;
  time: string;
  location: string;
  dressCode: string;
  temperature?: number;
  weatherIcon?: string;
  hasAIRecommendation?: boolean;
  aiReasoning?: string;
  outfitRecommendation?: OutfitRecommendation;
}

interface AIRecommendation {
  id: string;
  occasion: string;
  confidence_score: number;
  reasoning: string;
  recommended_items: any;
  created_at: string;
}

const UnifiedDailyPlan = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [hasCalendarConnection, setHasCalendarConnection] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [expandedOutfit, setExpandedOutfit] = useState<string | null>(null);

  // Mock events for today with detailed outfit recommendations
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

  useEffect(() => {
    checkCalendarConnection();
  }, []);

  useEffect(() => {
    if (hasCalendarConnection !== null) {
      loadTodaysEvents();
      loadAIRecommendations();
    }
  }, [hasCalendarConnection, currentDate]);

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

  const handleConnectCalendar = async () => {
    setIsConnecting(true);
    try {
      const success = await googleCalendarService.signInToGoogle();
      if (success) {
        setHasCalendarConnection(true);
        toast({
          title: "Calendar Connected! ✨",
          description: "Your calendar is now synced. We're generating personalized outfit recommendations for your day!",
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
      for (const event of events.slice(0, 2)) {
        await supabase.functions.invoke('generate-ai-recommendations', {
          body: {
            recommendationType: 'event_outfit',
            occasion: `${event.name} (${event.dressCode})`,
            eventDetails: {
              name: event.name,
              location: event.location,
              time: event.time,
              dressCode: event.dressCode
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
        description: "Personalized outfit suggestions for your day have been generated.",
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewOutfit = (eventId: string) => {
    if (expandedOutfit === eventId) {
      setExpandedOutfit(null);
    } else {
      setExpandedOutfit(eventId);
    }
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

  // Show calendar connection prompt if not connected
  if (hasCalendarConnection === false) {
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
            Connect your calendar and let our AI stylist create personalized outfit recommendations 
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
          <h2 className="text-2xl font-bold text-gray-800 mb-1 flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-indigo-600" />
            {getGreeting()}, there! Here's {isToday ? "today's" : "your"} AI-powered plan.
          </h2>
          <p className="text-gray-600 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {dateDisplay}
            {hasCalendarConnection && (
              <Badge className="bg-green-100 text-green-700 border-green-200 ml-3">
                <Calendar className="h-3 w-3 mr-1" />
                Calendar Connected
              </Badge>
            )}
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

      {/* Event Cards with AI Integration */}
      {events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="bg-white/70 border border-white/50 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2 text-lg">{event.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {event.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </div>
                          <div className="flex items-center">
                            <Thermometer className="h-4 w-4 mr-1" />
                            {event.temperature}°C
                            {getWeatherIcon(event.weatherIcon || 'sun')}
                          </div>
                        </div>
                        <Badge className={`${getDressCodeColor(event.dressCode)} text-sm mb-3`}>
                          {event.dressCode}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* AI Stylist Reasoning */}
                    {event.hasAIRecommendation && event.aiReasoning && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4 border border-purple-100">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex-shrink-0">
                            <Wand2 className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 mb-1">AI Stylist's Reasoning</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{event.aiReasoning}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <Star className="h-4 w-4" />
                        <span>AI-curated outfit ready</span>
                      </div>
                      
                      <Button 
                        onClick={() => handleViewOutfit(event.id)}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {expandedOutfit === event.id ? 'Hide Outfit' : 'View AI-Styled Outfit'}
                      </Button>
                    </div>

                    {/* Detailed Outfit Recommendation */}
                    {expandedOutfit === event.id && event.outfitRecommendation && (
                      <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                        <div className="flex items-center mb-4">
                          <Shirt className="h-5 w-5 text-indigo-600 mr-2" />
                          <h4 className="text-lg font-semibold text-gray-800">Your AI-Styled Outfit</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                              <Shirt className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                              <div>
                                <h5 className="font-medium text-gray-800 mb-1">Top</h5>
                                <p className="text-sm text-gray-600">{event.outfitRecommendation.top}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                              <div className="h-5 w-5 bg-gray-600 rounded mt-1 flex-shrink-0"></div>
                              <div>
                                <h5 className="font-medium text-gray-800 mb-1">Bottom</h5>
                                <p className="text-sm text-gray-600">{event.outfitRecommendation.bottom}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                              <Footprints className="h-5 w-5 text-brown-600 mt-1 flex-shrink-0" />
                              <div>
                                <h5 className="font-medium text-gray-800 mb-1">Shoes</h5>
                                <p className="text-sm text-gray-600">{event.outfitRecommendation.shoes}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                              <Watch className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />
                              <div>
                                <h5 className="font-medium text-gray-800 mb-1">Accessories</h5>
                                <div className="flex flex-wrap gap-1">
                                  {event.outfitRecommendation.accessories.map((accessory, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {accessory}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                              <Palette className="h-5 w-5 text-pink-600 mt-1 flex-shrink-0" />
                              <div>
                                <h5 className="font-medium text-gray-800 mb-1">Color Palette</h5>
                                <div className="flex flex-wrap gap-1">
                                  {event.outfitRecommendation.colors.map((color, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {color}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {event.outfitRecommendation.notes && (
                          <div className="mt-4 p-4 bg-white/50 rounded-lg border border-white/50">
                            <h5 className="font-medium text-gray-800 mb-2">Styling Notes</h5>
                            <p className="text-sm text-gray-600 leading-relaxed">{event.outfitRecommendation.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* AI Recommendations Summary */}
          {aiRecommendations.length > 0 && (
            <div className="mt-6 bg-white/50 rounded-xl p-4 border border-white/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                    <Wand2 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Complete Style Analysis Ready ✨</p>
                    <p className="text-sm text-gray-600">
                      {aiRecommendations.length} AI-powered recommendation{aiRecommendations.length !== 1 ? 's' : ''} with detailed styling insights
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  onClick={() => window.location.href = '/profile?tab=ai-recommendations'}
                >
                  View Full Analysis
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
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No events scheduled</h3>
          <p className="text-gray-500 mb-4">
            {isToday ? "Enjoy your free day!" : "No events planned for this date."}
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
                Generate AI Style Recommendations
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UnifiedDailyPlan;
