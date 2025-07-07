
import React from 'react';

const LoadingState = () => {
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
};

export default LoadingState;
