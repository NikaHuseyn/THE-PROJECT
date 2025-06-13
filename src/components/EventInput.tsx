
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const EventInput = ({ onEventSubmit }: { onEventSubmit: (event: string) => void }) => {
  const [eventDescription, setEventDescription] = useState('');

  const quickPrompts = [
    "Job interview at a tech company",
    "Wedding guest (outdoor ceremony)",
    "First date dinner",
    "Business presentation",
    "Brunch with friends",
    "Cocktail party",
    "Vacation dinner",
    "Work conference"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventDescription.trim()) {
      onEventSubmit(eventDescription);
    }
  };

  return (
    <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-8 mb-8">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          What's the occasion?
        </h2>
        <p className="text-gray-600 mb-8">
          Tell us about your event and we'll create the perfect outfit, considering weather, dress code, and your personal style.
        </p>
        
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Describe your event (e.g., dinner date, job interview, wedding...)"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="flex-1 h-12 text-lg border-rose-200 focus:border-rose-400 focus:ring-rose-400"
            />
            <Button 
              type="submit" 
              className="h-12 px-8 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200"
            >
              Style Me
            </Button>
          </div>
        </form>

        <div className="text-left">
          <p className="text-sm font-medium text-gray-700 mb-3">Quick suggestions:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setEventDescription(prompt)}
                className="text-left p-3 bg-white rounded-lg border border-rose-100 hover:border-rose-300 hover:bg-rose-50 transition-all duration-200 text-sm"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventInput;
