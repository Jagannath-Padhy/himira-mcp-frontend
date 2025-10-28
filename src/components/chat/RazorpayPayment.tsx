import { useEffect, useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { Payment as PaymentIcon } from '@mui/icons-material';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  orderId: string;
  amount: number;
  currency?: string;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
  onPaymentCancel: () => void;
}

const RazorpayPayment = ({
  orderId,
  amount,
  currency = 'INR',
  onPaymentSuccess,
  onPaymentError,
  onPaymentCancel,
}: RazorpayPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const isTestMode = import.meta.env.VITE_PAYMENT_TEST_MODE === 'true';

  // Load Razorpay script
  useEffect(() => {
    const loadScript = (src: string): Promise<boolean> => {
      return new Promise((resolve) => {
        // Check if script is already loaded
        if (document.querySelector(`script[src="${src}"]`)) {
          setIsScriptLoaded(true);
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
          setIsScriptLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          setError('Failed to load Razorpay SDK');
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadScript('https://checkout.razorpay.com/v1/checkout.js');
  }, []);

  const handlePayment = async () => {
    if (!isScriptLoaded) {
      setError('Razorpay SDK is still loading. Please wait...');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In test mode, we don't use order_id to avoid backend dependency
      // Razorpay will accept payments without order_id for testing
      const options: any = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_QrDVqZa5WeeqIa',
        amount: amount * 100, // Razorpay expects amount in paise
        currency: currency,
        name: 'Himira',
        description: 'Order Payment',
        // Only include order_id in production mode when you have backend
        ...(!isTestMode && orderId ? { order_id: orderId } : {}),
        config: {
          display: {
            blocks: {
              utib: {
                instruments: [
                  {
                    method: 'upi',
                    apps: ['google_pay', 'phonepe'],
                    flows: ['qr'],
                  },
                ],
              },
            },
            sequence: ['block.utib', 'block.other'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        handler: (response: any) => {
          if (response?.razorpay_payment_id) {
            onPaymentSuccess(response.razorpay_payment_id);
          } else {
            onPaymentError('Payment ID not received');
          }
        },
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
          contact: '+919876543210',
        },
        notes: {
          order_id: orderId,
          platform: 'Himira Chatbot',
        },
        theme: {
          color: '#1976d2', // Material-UI primary color
        },
        modal: {
          escape: false,
          ondismiss: () => {
            onPaymentCancel();
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('Payment error:', err);
      onPaymentError('Failed to initialize payment');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'primary.light',
        borderRadius: 2,
        backgroundColor: 'primary.50',
        mb: 2,
        mt: 4,
      }}
    >

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <PaymentIcon sx={{ color: 'primary.main', mr: 1 }} />
        <Typography variant="h6" color="primary.main" fontWeight={600}>
          Complete Your Payment
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Order ID: {orderId}
      </Typography>

      <Typography variant="h6" sx={{ mb: 3 }}>
        Amount: ₹{amount.toFixed(2)}
      </Typography>

      <Button
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        onClick={handlePayment}
        disabled={isLoading || !isScriptLoaded}
        startIcon={isLoading ? <CircularProgress size={20} /> : <PaymentIcon />}
        sx={{
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 600,
          bgcolor: 'rgb(255, 205, 54)',
          color: 'rgb(26, 26, 26)',
          '&:hover': {
            bgcolor: 'rgb(235, 185, 53)',
          },
          '&:disabled': {
            bgcolor: 'rgba(255, 205, 54, 0.5)',
            color: 'rgba(26, 26, 26, 0.5)',
          },
        }}
      >
        {isLoading ? 'Opening Razorpay...' : 'Pay with Razorpay'}
      </Button>

      {!isScriptLoaded && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Loading Razorpay payment gateway...
        </Typography>
      )}
    </Box>
  );
};

export default RazorpayPayment;
