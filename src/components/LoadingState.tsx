import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading...", 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        <p className="text-muted-foreground text-center">{message}</p>
      </CardContent>
    </Card>
  );
};

export default LoadingState;