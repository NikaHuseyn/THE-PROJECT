import React from 'react';
import { LoadingState, LoadingGrid } from '@/components/ui/loading';

const FashionTrendsLoadingState = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface-variant to-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="h-10 bg-muted rounded w-1/3 mx-auto mb-4 shimmer"></div>
          <div className="h-5 bg-muted rounded w-1/2 mx-auto shimmer"></div>
        </div>

        {/* Tabs skeleton */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            <div className="h-10 w-32 bg-muted rounded shimmer"></div>
            <div className="h-10 w-32 bg-muted rounded shimmer"></div>
          </div>
        </div>

        {/* Content loading */}
        <LoadingState
          variant="fashion"
          title="Loading fashion trends..."
          description="Analysing the latest trends and fashion forecasts"
          icon="sparkles"
          className="mb-8"
        />

        {/* Trend cards grid */}
        <LoadingGrid count={8} />
      </div>
    </div>
  );
};

export default FashionTrendsLoadingState;