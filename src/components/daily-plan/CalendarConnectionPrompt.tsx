
import React from 'react';
import { Calendar, Sparkles, Wand2, Clock, Star, Link, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarConnectionPromptProps {
  isConnecting: boolean;
  onConnectCalendar: () => void;
}

const CalendarConnectionPrompt = ({ isConnecting, onConnectCalendar }: CalendarConnectionPromptProps) => {
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
          onClick={onConnectCalendar}
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
};

export default CalendarConnectionPrompt;
