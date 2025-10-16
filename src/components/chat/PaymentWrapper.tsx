import RazorpayPayment from './RazorpayPayment';

interface PaymentWrapperProps {
  orderId: string;
  amount: number;
  currency?: string;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
  onPaymentCancel: () => void;
}

const PaymentWrapper = (props: PaymentWrapperProps) => {
  const isTestMode = import.meta.env.VITE_PAYMENT_TEST_MODE === 'true';

  if (isTestMode) {
    console.log('🧪 TEST MODE: Using real Razorpay UI with test key');
  } else {
    console.log('🔴 PRODUCTION MODE: Using real Razorpay UI with production key');
  }

  // Always use real Razorpay component
  // The component itself handles test vs production mode
  return <RazorpayPayment {...props} />;
};

export default PaymentWrapper;
