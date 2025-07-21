import React from 'react';
import { LoadingState, LoadingGrid } from '@/components/ui/loading';

const WardrobeLoadingState = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface-variant to-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-muted rounded w-1/4 mb-2 shimmer"></div>
          <div className="h-4 bg-muted rounded w-1/2 shimmer"></div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="h-10 w-32 bg-muted rounded shimmer"></div>
          <div className="h-10 w-40 bg-muted rounded shimmer"></div>
          <div className="h-10 w-36 bg-muted rounded shimmer"></div>
        </div>

        {/* Categories tabs skeleton */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-20 bg-muted rounded shimmer flex-shrink-0"></div>
          ))}
        </div>

        {/* Main content loading */}
        <LoadingState
          variant="elegant"
          title="Loading your wardrobe..."
          description="Organizing your clothing items and generating recommendations"
          icon="heart"
          className="mb-8"
        />

        {/* Items grid */}
        <LoadingGrid count={12} />
      </div>
    </div>
  );
};

export default WardrobeLoadingState;