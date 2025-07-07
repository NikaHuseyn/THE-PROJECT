
import React from 'react';
import { Clock, MapPin, Thermometer, Sun, Cloud, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AIReasoningSection from './AIReasoningSection';
import OutfitRecommendation from './OutfitRecommendation';

export interface Event {
  id: string;
  name: string;
  time: string;
  location: string;
  dressCode: string;
  temperature?: number;
  weatherIcon?: string;
  hasAIRecommendation?: boolean;
  aiReasoning?: string;
  outfitRecommendation?: {
    top: string;
    bottom: string;
    shoes: string;
    accessories: string[];
    colors: string[];
    notes: string;
  };
}

interface EventCardProps {
  event: Event;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const EventCard = ({ event, isExpanded, onToggleExpanded }: EventCardProps) => {
  const getWeatherIcon = (icon?: string) => {
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

  return (
    <Card className="bg-white/70 border border-white/50 hover:shadow-md transition-shadow">
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
                    {getWeatherIcon(event.weatherIcon)}
                  </div>
                </div>
                <Badge className={`${getDressCodeColor(event.dressCode)} text-sm mb-3`}>
                  {event.dressCode}
                </Badge>
              </div>
            </div>
            
            {event.hasAIRecommendation && event.aiReasoning && (
              <AIReasoningSection reasoning={event.aiReasoning} />
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <Star className="h-4 w-4" />
                <span>AI-curated outfit ready</span>
              </div>
              
              <Button 
                onClick={onToggleExpanded}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                {isExpanded ? 'Hide Outfit' : 'View AI-Styled Outfit'}
              </Button>
            </div>

            {isExpanded && event.outfitRecommendation && (
              <OutfitRecommendation recommendation={event.outfitRecommendation} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
