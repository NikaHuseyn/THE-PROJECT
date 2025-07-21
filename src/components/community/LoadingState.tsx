
import React from 'react';
import { Users } from 'lucide-react';
import { LoadingState as UILoadingState } from '@/components/ui/loading';

const LoadingState = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text flex items-center">
          <Users className="h-6 w-6 mr-2" />
          Community Feed
        </h2>
      </div>
      <UILoadingState
        variant="elegant"
        title="Loading community posts..."
        description="Discovering the latest style inspiration from the community"
        icon="heart"
      />
    </div>
  );
};

export default LoadingState;
