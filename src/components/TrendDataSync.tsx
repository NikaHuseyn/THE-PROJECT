
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { useTrendDataIntegration } from '@/hooks/useTrendDataIntegration';

const TrendDataSync = () => {
  const { isIntegrating, lastSyncTime, integrateTrendData, canSync } = useTrendDataIntegration();

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-600" />
          Trend Data Integration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                <span className="text-sm font-medium">Google Trends</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Active
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-4 w-4 mr-1 text-pink-600" />
                <span className="text-sm font-medium">Pinterest API</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Active
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-4 w-4 mr-1 text-purple-600" />
                <span className="text-sm font-medium">Instagram API</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Active
              </Badge>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Last synchronization:</p>
                <p className="text-sm font-medium flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatLastSync(lastSyncTime)}
                </p>
              </div>
              
              <Button
                onClick={integrateTrendData}
                disabled={isIntegrating || !canSync}
                className="bg-gradient-to-r from-blue-500 to-indigo-600"
              >
                {isIntegrating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
            </div>

            {!canSync && (
              <div className="flex items-center text-xs text-amber-600 bg-amber-50 p-2 rounded">
                <AlertCircle className="h-3 w-3 mr-1" />
                Please wait at least 1 hour between synchronizations
              </div>
            )}

            <div className="text-xs text-gray-500 mt-2">
              <p>Integration includes:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Current fashion trends from Google Trends</li>
                <li>Visual trend data from Pinterest</li>
                <li>Social engagement metrics from Instagram</li>
                <li>AI-generated seasonal forecasts</li>
                <li>Predictive trend analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendDataSync;
