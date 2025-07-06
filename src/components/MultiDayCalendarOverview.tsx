
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Shirt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DayEvent {
  id: string;
  name: string;
  time: string;
  dressCode: string;
  outfitIcon?: string;
}

interface CalendarDay {
  date: Date;
  events: DayEvent[];
  hasOutfits: boolean;
}

interface MultiDayCalendarOverviewProps {
  onDaySelect: (date: Date) => void;
}

const MultiDayCalendarOverview: React.FC<MultiDayCalendarOverviewProps> = ({ onDaySelect }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weekDays, setWeekDays] = useState<CalendarDay[]>([]);

  // Mock data for the week
  const mockWeekData = (startDate: Date): CalendarDay[] => {
    const days: CalendarDay[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const mockEvents: DayEvent[] = [];
      
      // Add some sample events for certain days
      if (i === 0) { // Today
        mockEvents.push(
          { id: '1', name: 'Morning Meeting', time: '9:00 AM', dressCode: 'Business Casual' },
          { id: '2', name: 'Lunch Date', time: '12:30 PM', dressCode: 'Smart Casual' }
        );
      } else if (i === 2) { // Day after tomorrow
        mockEvents.push(
          { id: '3', name: 'Client Presentation', time: '2:00 PM', dressCode: 'Formal' }
        );
      } else if (i === 4) { // Later in the week
        mockEvents.push(
          { id: '4', name: 'Gym Session', time: '6:00 PM', dressCode: 'Activewear' },
          { id: '5', name: 'Dinner Out', time: '8:00 PM', dressCode: 'Cocktail' }
        );
      }
      
      days.push({
        date,
        events: mockEvents,
        hasOutfits: mockEvents.length > 0
      });
    }
    
    return days;
  };

  useEffect(() => {
    const startOfWeek = getStartOfWeek(currentWeek);
    setWeekDays(mockWeekData(startOfWeek));
  }, [currentWeek]);

  const getStartOfWeek = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day;
    start.setDate(diff);
    return start;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getOutfitIcon = (dressCode: string) => {
    switch (dressCode.toLowerCase()) {
      case 'formal':
        return '👔';
      case 'business casual':
        return '👔';
      case 'smart casual':
        return '👕';
      case 'activewear':
        return '🏃‍♀️';
      case 'cocktail':
        return '👗';
      default:
        return '👕';
    }
  };

  const getDressCodeColor = (dressCode: string) => {
    switch (dressCode.toLowerCase()) {
      case 'business casual':
        return 'bg-blue-100 text-blue-700';
      case 'smart casual':
        return 'bg-green-100 text-green-700';
      case 'formal':
        return 'bg-gray-100 text-gray-700';
      case 'activewear':
        return 'bg-purple-100 text-purple-700';
      case 'cocktail':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-rose-100 text-rose-700';
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-xl font-bold text-gray-800">
            <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
            Week at a Glance
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateWeek('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-3">
              {getStartOfWeek(currentWeek).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })} - {new Date(getStartOfWeek(currentWeek).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateWeek('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={day} className="text-center">
              <div className="text-xs font-medium text-gray-500 mb-2">{day}</div>
            </div>
          ))}
          
          {weekDays.map((day, index) => (
            <div 
              key={index} 
              className={`
                min-h-[120px] p-2 rounded-lg border cursor-pointer transition-all hover:shadow-md
                ${isToday(day.date) 
                  ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }
              `}
              onClick={() => onDaySelect(day.date)}
            >
              <div className={`
                text-sm font-medium mb-2 text-center
                ${isToday(day.date) ? 'text-indigo-700' : 'text-gray-700'}
              `}>
                {day.date.getDate()}
              </div>
              
              <div className="space-y-1">
                {day.events.slice(0, 2).map((event) => (
                  <div key={event.id} className="text-xs">
                    <div className="flex items-center justify-center mb-1">
                      <span className="text-lg">{getOutfitIcon(event.dressCode)}</span>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-700 mb-1 truncate" title={event.name}>
                        {event.name.length > 12 ? event.name.substring(0, 12) + '...' : event.name}
                      </div>
                      <Badge className={`${getDressCodeColor(event.dressCode)} text-xs px-1 py-0`}>
                        {event.dressCode}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {day.events.length > 2 && (
                  <div className="text-xs text-center text-gray-500 mt-1">
                    +{day.events.length - 2} more
                  </div>
                )}
                
                {day.events.length === 0 && (
                  <div className="text-xs text-center text-gray-400 italic">
                    No events
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiDayCalendarOverview;
