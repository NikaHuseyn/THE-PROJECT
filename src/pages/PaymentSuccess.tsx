import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setVerifying(false);
      setPaymentStatus('failed');
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { session_id: sessionId }
      });

      if (error) throw error;

      setPaymentDetails(data);
      setPaymentStatus(data.payment_status === 'paid' ? 'success' : 'failed');

      if (data.payment_status === 'paid') {
        toast({
          title: "Payment Successful! 🎉",
          description: "Your subscription has been activated. Enjoy unlimited AI recommendations!",
        });
      }

    } catch (error) {
      console.error('Error verifying payment:', error);
      setPaymentStatus('failed');
      toast({
        title: "Verification Failed",
        description: "Unable to verify payment status. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleContinue = () => {
    navigate('/');
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Verifying Payment...</h2>
            <p className="text-muted-foreground text-center">
              Please wait while we confirm your payment details.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 mb-4">
            {paymentStatus === 'success' ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <AlertCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className={paymentStatus === 'success' ? 'text-green-900' : 'text-red-900'}>
            {paymentStatus === 'success' ? 'Payment Successful!' : 'Payment Failed'}
          </CardTitle>
          <CardDescription>
            {paymentStatus === 'success' 
              ? 'Your subscription has been activated successfully.'
              : 'There was an issue processing your payment.'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {paymentDetails && paymentStatus === 'success' && (
            <div className="bg-green-50 p-4 rounded-lg space-y-2">
              <h3 className="font-medium text-green-900">Payment Details</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>Amount: ${(paymentDetails.session_details.amount_total / 100).toFixed(2)}</p>
                <p>Email: {paymentDetails.session_details.customer_email}</p>
                <p>Payment Method: {paymentDetails.session_details.payment_method_types?.join(', ')}</p>
              </div>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">What's Next?</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your increased AI recommendation limits are now active</li>
                <li>• Access advanced styling features</li>
                <li>• Enjoy priority customer support</li>
                <li>• Explore character costume suggestions</li>
              </ul>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-medium text-red-900 mb-2">Need Help?</h3>
              <p className="text-sm text-red-700">
                If you believe this is an error, please contact our support team. 
                Your payment method was not charged.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={handleContinue} className="w-full">
              {paymentStatus === 'success' ? 'Start Using Premium Features' : 'Return to App'}
            </Button>
            
            {paymentStatus === 'failed' && (
              <Button variant="outline" onClick={() => navigate('/profile')} className="w-full">
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;