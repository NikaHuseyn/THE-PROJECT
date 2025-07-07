
import { useState } from 'react';
import { trendDataIntegrationService } from '@/services/trendDataIntegrationService';
import { toast } from 'sonner';

export const useTrendDataIntegration = () => {
  const [isIntegrating, setIsIntegrating] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const integrateTrendData = async () => {
    setIsIntegrating(true);
    try {
      await trendDataIntegrationService.fetchAndIntegrateTrendData();
      setLastSyncTime(new Date());
      toast.success('Trend data integration completed successfully!');
    } catch (error) {
      console.error('Trend data integration failed:', error);
      toast.error('Failed to integrate trend data. Please try again.');
    } finally {
      setIsIntegrating(false);
    }
  };

  const canSync = () => {
    if (!lastSyncTime) return true;
    const hoursSinceLastSync = (Date.now() - lastSyncTime.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastSync >= 1; // Allow sync every hour
  };

  return {
    isIntegrating,
    lastSyncTime,
    integrateTrendData,
    canSync: canSync()
  };
};
