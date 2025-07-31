import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const NetworkStatusIndicator: React.FC = () => {
  const { isOnline } = useNetworkStatus();

  if (isOnline) {
    return null;
  }

  return (
    <Alert variant="destructive" className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-auto">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="flex items-center gap-2">
        You're offline. Some features may not work.
      </AlertDescription>
    </Alert>
  );
};

export default NetworkStatusIndicator;