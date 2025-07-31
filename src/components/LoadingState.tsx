import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'card' | 'inline' | 'overlay';
  showSpinner?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading...", 
  size = 'md',
  variant = 'card',
  showSpinner = true
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {showSpinner && (
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      )}
      <p className="text-muted-foreground text-center">{message}</p>
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center p-8">
        {content}
      </CardContent>
    </Card>
  );
};

export default LoadingState;