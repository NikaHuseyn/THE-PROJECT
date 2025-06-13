
import React from 'react';
import { Users } from 'lucide-react';

interface ErrorStateProps {
  error: string;
}

const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Users className="h-6 w-6 mr-2" />
          Community Feed
        </h2>
      </div>
      <div className="text-center py-8 text-red-600">
        Error loading posts: {error}
      </div>
    </div>
  );
};

export default ErrorState;
