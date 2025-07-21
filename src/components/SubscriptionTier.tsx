import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Crown, Zap, Check, X } from 'lucide-react';

interface SubscriptionTierProps {
  currentTier?: string;
  usageData?: {
    current_usage: number;
    rate_limit: number;
    reset_time: string;
  };
}

const SubscriptionTier: React.FC<SubscriptionTierProps> = ({ 
  currentTier = 'free', 
  usageData 
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async (productType: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          paymentType: productType.includes('subscription') ? 'subscription' : 'one_time',
          productType: productType
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }

    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Payment Error",
        description: "Failed to start payment process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      features: [
        '5 AI recommendations per day',
        'Basic styling tips',
        'Weather-based suggestions',
        'Community access'
      ],
      limitations: [
        'Limited daily recommendations',
        'No priority support',
        'Basic features only'
      ],
      buttonText: 'Current Plan',
      buttonVariant: 'outline' as const,
      icon: <Sparkles className="h-5 w-5" />,
      current: currentTier === 'free'
    },
    {
      name: 'Premium',
      price: '$19.99',
      period: '/month',
      features: [
        '50 AI recommendations per day',
        'Advanced styling insights',
        'Character costume suggestions',
        'Priority customer support',
        'Style preference learning',
        'Wardrobe analysis'
      ],
      limitations: [],
      buttonText: 'Upgrade to Premium',
      buttonVariant: 'default' as const,
      icon: <Crown className="h-5 w-5 text-yellow-500" />,
      current: currentTier === 'premium',
      productType: 'premium_subscription'
    },
    {
      name: 'Pro',
      price: '$49.99',
      period: '/month',
      features: [
        '100 AI recommendations per day',
        'All Premium features',
        'Unlimited wardrobe items',
        'Advanced analytics',
        'Custom style profiles',
        'VIP support',
        'Early access to new features'
      ],
      limitations: [],
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'default' as const,
      icon: <Zap className="h-5 w-5 text-purple-500" />,
      current: currentTier === 'pro',
      productType: 'pro_subscription'
    }
  ];

  const oneTimeOptions = [
    {
      name: 'AI Credits Pack',
      price: '$9.99',
      period: 'one-time',
      description: 'Get 50 additional AI recommendations instantly',
      buttonText: 'Buy Credits',
      productType: 'ai_credits_pack'
    }
  ];

  const usagePercentage = usageData ? 
    Math.round((usageData.current_usage / usageData.rate_limit) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Current Usage Display */}
      {usageData && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage</CardTitle>
            <CardDescription>
              AI recommendations used today ({currentTier} tier)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {usageData.current_usage} of {usageData.rate_limit} used
                </span>
                <Badge variant={usagePercentage >= 80 ? "destructive" : "secondary"}>
                  {usagePercentage}%
                </Badge>
              </div>
              <Progress value={usagePercentage} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Resets: {new Date(usageData.reset_time).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Tiers */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <Card key={tier.name} className={`relative ${tier.current ? 'ring-2 ring-primary' : ''}`}>
              {tier.current && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                  Current Plan
                </Badge>
              )}
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {tier.icon}
                  <CardTitle className="ml-2">{tier.name}</CardTitle>
                </div>
                <div className="text-3xl font-bold">
                  {tier.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    {tier.period}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                  {tier.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center text-sm text-muted-foreground">
                      <X className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                      {limitation}
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full"
                  variant={tier.buttonVariant}
                  disabled={tier.current || loading}
                  onClick={() => tier.productType && handleUpgrade(tier.productType)}
                >
                  {loading ? 'Processing...' : tier.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* One-time Options */}
      <div>
        <h2 className="text-xl font-bold mb-4">One-time Purchases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {oneTimeOptions.map((option) => (
            <Card key={option.name}>
              <CardHeader>
                <CardTitle className="text-lg">{option.name}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {option.price}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {option.period}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleUpgrade(option.productType)}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : option.buttonText}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionTier;