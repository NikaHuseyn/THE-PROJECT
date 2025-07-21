import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ErrorStateProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  onRetry?: () => void;
  error?: Error;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try again.",
  showHomeButton = true,
  onRetry,
  error
}) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-red-900">{title}</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {process.env.NODE_ENV === 'development' && error && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-900 mb-2">Error Details:</p>
            <p className="text-xs text-gray-600 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          {showHomeButton && (
            <Button onClick={handleGoHome} variant="outline" className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          )}
          <Button onClick={handleReload} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorState;