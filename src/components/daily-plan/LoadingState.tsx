
import React from 'react';
import { LoadingState as UILoadingState } from '@/components/ui/loading';

const LoadingState = () => {
  return (
    <UILoadingState
      variant="fashion"
      title="Loading your daily plan..."
      description="Gathering your events and generating personalised outfit recommendations"
      icon="sparkles"
    />
  );
};

export default LoadingState;
