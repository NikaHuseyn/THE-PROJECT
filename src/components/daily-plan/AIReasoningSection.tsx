
import React from 'react';
import { Wand2 } from 'lucide-react';

interface AIReasoningSectionProps {
  reasoning: string;
}

const AIReasoningSection = ({ reasoning }: AIReasoningSectionProps) => {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4 border border-purple-100">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex-shrink-0">
          <Wand2 className="h-4 w-4 text-purple-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-800 mb-1">AI Stylist's Reasoning</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{reasoning}</p>
        </div>
      </div>
    </div>
  );
};

export default AIReasoningSection;
