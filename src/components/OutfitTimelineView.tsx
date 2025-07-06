
import React, { useState, useEffect } from 'react';
import { Clock, ThumbsUp, ThumbsDown, RefreshCw, Lightbulb, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface OutfitFeedback {
  id: string;
  eventId: string;
  liked: boolean;
  notes?: string;
  alternatives?: string[];
  timestamp: Date;
}

interface TimelineEvent {
  id: string;
  name: string;
  time: string;
  status: 'upcoming' | 'current' | 'completed';
  outfitPreview?: {
    description: string;
    items: string[];
    alternatives?: string[];
  };
  feedback?: OutfitFeedback;
  learnings?: string[];
}

interface OutfitTimelineViewProps {
  selectedDate: Date;
}

const OutfitTimelineView: React.FC<OutfitTimelineViewProps> = ({ selectedDate }) => {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock timeline data
  const mockTimelineData: TimelineEvent[] = [
    {
      id: '1',
      name: 'Morning Meeting',
      time: '9:00 AM',
      status: 'completed',
      outfitPreview: {
        description: 'Professional blazer look',
        items: ['Navy blazer', 'White blouse', 'Black trousers', 'Block heels'],
        alternatives: ['Swap heels for flats', 'Add a statement necklace']
      },
      feedback: {
        id: 'f1',
        eventId: '1',
        liked: true,
        notes: 'Felt confident and professional',
        timestamp: new Date()
      },
      learnings: ['User prefers blazers for meetings', 'Comfortable in block heels']
    },
    {
      id: '2',
      name: 'Lunch with Client',
      time: '12:30 PM',
      status: 'current',
      outfitPreview: {
        description: 'Smart casual ensemble',
        items: ['Cream sweater', 'Dark jeans', 'Ankle boots', 'Cross-body bag'],
        alternatives: ['Swap jeans for chinos', 'Add a scarf for warmth']
      }
    },
    {
      id: '3',
      name: 'Evening Yoga',
      time: '6:00 PM',
      status: 'upcoming',
      outfitPreview: {
        description: 'Comfortable activewear',
        items: ['Sports bra', 'Leggings', 'Light jacket', 'Trainers'],
        alternatives: ['Bring extra layer for after class']
      }
    }
  ];

  useEffect(() => {
    loadTimelineData();
  }, [selectedDate]);

  const loadTimelineData = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would load actual data from the database
      // For now, we'll use mock data
      setTimeout(() => {
        setTimelineEvents(mockTimelineData);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading timeline data:', error);
      setTimelineEvents(mockTimelineData);
      setIsLoading(false);
    }
  };

  const handleFeedback = async (eventId: string, liked: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // In a real app, you would save this to the database
      setTimelineEvents(prev => prev.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            feedback: {
              id: `f${eventId}`,
              eventId,
              liked,
              timestamp: new Date()
            }
          };
        }
        return event;
      }));

      toast({
        title: "Feedback Recorded! 📝",
        description: `Your ${liked ? 'positive' : 'negative'} feedback helps us learn your preferences.`,
      });
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  };

  const handleSwapOutfit = (eventId: string, newItem: string) => {
    toast({
      title: "Outfit Updated! ✨",
      description: `Swapped to: ${newItem}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'current':
        return 'bg-blue-100 text-blue-700';
      case 'upcoming':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'current':
        return '⏰';
      case 'upcoming':
        return '📅';
      default:
        return '📅';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-indigo-600" />
            Daily Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-bold text-gray-800">
          <Clock className="h-5 w-5 mr-2 text-indigo-600" />
          Daily Timeline & Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {timelineEvents.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Timeline connector */}
              {index < timelineEvents.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-16 bg-gray-200"></div>
              )}
              
              <div className="flex items-start space-x-4">
                {/* Timeline dot */}
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-lg
                  ${event.status === 'completed' ? 'bg-green-100' : 
                    event.status === 'current' ? 'bg-blue-100' : 'bg-gray-100'}
                `}>
                  {getStatusIcon(event.status)}
                </div>
                
                {/* Event content */}
                <div className="flex-1 min-w-0">
                  <Card className={`
                    ${event.status === 'current' ? 'ring-2 ring-blue-200 bg-blue-50/50' : 'bg-white'}
                  `}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{event.name}</h3>
                          <p className="text-sm text-gray-600">{event.time}</p>
                        </div>
                        <Badge className={`${getStatusColor(event.status)} capitalize`}>
                          {event.status}
                        </Badge>
                      </div>
                      
                      {/* Outfit Preview */}
                      {event.outfitPreview && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                            <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
                            {event.outfitPreview.description}
                          </h4>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {event.outfitPreview.items.map((item, idx) => (
                              <div key={idx} className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                                {item}
                              </div>
                            ))}
                          </div>
                          
                          {/* Alternative suggestions */}
                          {event.outfitPreview.alternatives && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-600 mb-2">Alternatives:</p>
                              <div className="space-y-1">
                                {event.outfitPreview.alternatives.map((alt, idx) => (
                                  <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-6 px-2 mr-2 mb-1"
                                    onClick={() => handleSwapOutfit(event.id, alt)}
                                  >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    {alt}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Feedback section */}
                      {event.status === 'completed' && (
                        <div className="border-t pt-3">
                          {!event.feedback ? (
                            <div>
                              <p className="text-sm text-gray-600 mb-2">How did this outfit work?</p>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleFeedback(event.id, true)}
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  Worked great!
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleFeedback(event.id, false)}
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  <ThumbsDown className="h-4 w-4 mr-1" />
                                  Needs work
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className={`
                                flex items-center text-sm px-2 py-1 rounded
                                ${event.feedback.liked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                              `}>
                                {event.feedback.liked ? <ThumbsUp className="h-3 w-3 mr-1" /> : <ThumbsDown className="h-3 w-3 mr-1" />}
                                {event.feedback.liked ? 'Loved it!' : 'Not quite right'}
                              </div>
                              {event.feedback.notes && (
                                <p className="text-xs text-gray-600 italic">"{event.feedback.notes}"</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Learnings */}
                      {event.learnings && event.learnings.length > 0 && (
                        <div className="mt-3 p-2 bg-purple-50 rounded-lg">
                          <div className="flex items-center text-sm font-medium text-purple-700 mb-1">
                            <Star className="h-3 w-3 mr-1" />
                            AI Learnings
                          </div>
                          <ul className="text-xs text-purple-600 space-y-1">
                            {event.learnings.map((learning, idx) => (
                              <li key={idx}>• {learning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OutfitTimelineView;
