import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

const PaymentCanceled = () => {
  const navigate = useNavigate();

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleTryAgain = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 mb-4">
            <XCircle className="h-16 w-16 text-orange-500" />
          </div>
          <CardTitle className="text-orange-900">Payment Canceled</CardTitle>
          <CardDescription>
            Your payment was canceled. No charges were made to your account.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-medium text-orange-900 mb-2">What Happened?</h3>
            <p className="text-sm text-orange-700">
              You chose to cancel the payment process. Your subscription remains unchanged, 
              and you can continue using the free tier of our AI styling service.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Want to Upgrade Later?</h3>
            <p className="text-sm text-blue-700">
              You can upgrade to Premium or Pro at any time from your profile page 
              to get more AI recommendations and advanced features.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleReturnHome} className="w-full">
              Return to App
            </Button>
            <Button variant="outline" onClick={handleTryAgain} className="w-full">
              View Subscription Options
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCanceled;