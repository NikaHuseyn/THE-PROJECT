
import React from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  isToday: boolean;
  isGenerating: boolean;
  onGenerateRecommendations: () => void;
}

const EmptyState = ({ isToday, isGenerating, onGenerateRecommendations }: EmptyStateProps) => {
  return (
    <div className="text-center py-8">
      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">No events scheduled</h3>
      <p className="text-gray-500 mb-4">
        {isToday ? "Enjoy your free day!" : "No events planned for this date."}
      </p>
      <Button 
        onClick={onGenerateRecommendations}
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
  );
};

export default EmptyState;
