import React from 'react';
import { LoadingState, LoadingCard } from '@/components/ui/loading';

const StyleAnalysisLoadingState = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface-variant to-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-muted rounded w-1/3 mb-2 shimmer"></div>
          <div className="h-4 bg-muted rounded w-2/3 shimmer"></div>
        </div>

        {/* Daily Plan Loading */}
        <div className="mb-8">
          <LoadingState
            variant="fashion"
            title="Loading your style analysis..."
            description="Analysing your calendar and generating personalised recommendations"
            icon="sparkles"
          />
        </div>

        {/* Calendar Section Loading */}
        <div className="card-elegant p-6">
          <div className="mb-6">
            <div className="h-6 bg-muted rounded w-1/4 mb-2 shimmer"></div>
            <div className="h-4 bg-muted rounded w-1/2 shimmer"></div>
          </div>
          
          <div className="space-y-6">
            {/* Calendar grid skeleton */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded shimmer"></div>
              ))}
            </div>
            
            {/* Timeline skeleton */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleAnalysisLoadingState;