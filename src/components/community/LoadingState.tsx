
import React from 'react';
import { Users } from 'lucide-react';

const LoadingState = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Users className="h-6 w-6 mr-2" />
          Community Feed
        </h2>
      </div>
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
      </div>
    </div>
  );
};

export default LoadingState;
