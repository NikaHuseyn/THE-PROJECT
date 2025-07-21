import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Clock, CheckCircle, X } from 'lucide-react';

interface RateLimitDisplayProps {
  className?: string;
}

const RateLimitDisplay: React.FC<RateLimitDisplayProps> = ({ className }) => {
  const [rateLimitInfo, setRateLimitInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkRateLimit();
  }, []);

  const checkRateLimit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('check_ai_rate_limit', {
        user_email: user.email,
        target_user_id: user.id
      });

      if (error) throw error;
      setRateLimitInfo(data);
    } catch (error) {
      console.error('Error checking rate limit:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !rateLimitInfo) {
    return null;
  }

  const usagePercentage = Math.round((rateLimitInfo.current_usage / rateLimitInfo.rate_limit) * 100);
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = rateLimitInfo.current_usage >= rateLimitInfo.rate_limit;

  return (
    <Card className={`${className} ${isAtLimit ? 'border-red-200 bg-red-50' : isNearLimit ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isAtLimit ? (
              <X className="h-4 w-4 text-red-500" />
            ) : isNearLimit ? (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm font-medium">
              AI Recommendations: {rateLimitInfo.current_usage}/{rateLimitInfo.rate_limit}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={rateLimitInfo.subscription_tier === 'free' ? 'secondary' : 'default'}>
              {rateLimitInfo.subscription_tier.toUpperCase()}
            </Badge>
            {isAtLimit && (
              <Badge variant="destructive">
                Limit Reached
              </Badge>
            )}
          </div>
        </div>
        {isAtLimit && (
          <div className="mt-2 text-sm text-red-600">
            <Clock className="h-3 w-3 inline mr-1" />
            Resets: {new Date(rateLimitInfo.reset_time).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RateLimitDisplay;