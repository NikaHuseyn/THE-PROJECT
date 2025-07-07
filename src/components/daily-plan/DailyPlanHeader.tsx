
import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DailyPlanHeaderProps {
  greeting: string;
  dateDisplay: string;
  hasCalendarConnection: boolean;
  onNavigateDate: (direction: 'prev' | 'next') => void;
}

const DailyPlanHeader = ({ 
  greeting, 
  dateDisplay, 
  hasCalendarConnection, 
  onNavigateDate 
}: DailyPlanHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1 flex items-center">
          <Sparkles className="h-6 w-6 mr-2 text-indigo-600" />
          {greeting}, there! Here's your AI-powered plan.
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
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onNavigateDate('prev')}
          className="border-indigo-200"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onNavigateDate('next')}
          className="border-indigo-200"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DailyPlanHeader;
