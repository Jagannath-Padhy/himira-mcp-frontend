import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Divider,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import { QuoteData, JourneyContext, JourneyStage } from '@interfaces';

type CheckoutInterfaceProps = {
  quoteData: QuoteData;
  journeyContext: JourneyContext;
  onSend: (msg: string) => void;
};

const CheckoutInterface = ({ quoteData, journeyContext, onSend }: CheckoutInterfaceProps) => {
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    building: '',
    street: '',
    locality: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    phone: '',
    email: '',
    gps: '12.9716,77.5946',
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

  const getActiveStep = (stage: JourneyStage): number => {
    switch (stage) {
      case 'delivery_quotes_received':
        return 0;
      case 'order_initialized':
        return 1;
      case 'payment_created':
        return 2;
      case 'order_confirmed':
        return 3;
      default:
        return 0;
    }
  };

  const handleInitializeOrder = () => {
    const details = `my name is ${customerDetails.name}, building is ${customerDetails.building}, street is ${customerDetails.street}, locality is ${customerDetails.locality}, phone is ${customerDetails.phone}, email is ${customerDetails.email}, and I want to pay via ${paymentMethod} and my gps is ${customerDetails.gps} and ${customerDetails.city}, ${customerDetails.state} ${customerDetails.pincode}`;
    onSend(details);
  };

  const handleCreatePayment = () => {
    onSend(`create payment for ${paymentMethod} method`);
  };

  const handleConfirmOrder = () => {
    onSend("confirm_order(payment_status='PAID')");
  };

  const steps = ['Delivery Options', 'Order Details', 'Payment', 'Confirmation'];

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Checkout Process
        </Typography>

        <Stepper activeStep={getActiveStep(journeyContext.stage)} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Delivery Quotes */}
        {journeyContext.stage === 'delivery_quotes_received' && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Delivery Options
            </Typography>

            <Stack spacing={2}>
              {quoteData.providers?.map((provider) => (
                <Card key={provider.id} variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {provider.name}
                      </Typography>
                      <Chip label="Available" color="success" size="small" />
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Items: {provider.items?.length || 0}
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight={600}>
                        {formatPrice(provider.total_value || 0)}
                      </Typography>
                    </Box>

                    {provider.delivery_charges !== undefined && (
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                        <Typography variant="body2" color="text.secondary">
                          Delivery Charges:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatPrice(provider.delivery_charges)}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>

            <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
              Good news! Delivery is available to your location.
            </Alert>

            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Delivery Details
            </Typography>

            <Stack spacing={2}>
              <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={customerDetails.name}
                  onChange={(e) =>
                    setCustomerDetails((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={customerDetails.phone}
                  onChange={(e) =>
                    setCustomerDetails((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  required
                />
              </Box>
              <TextField
                fullWidth
                label="Email"
                value={customerDetails.email}
                onChange={(e) => setCustomerDetails((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
              <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                <TextField
                  fullWidth
                  label="Building/Apartment"
                  value={customerDetails.building}
                  onChange={(e) =>
                    setCustomerDetails((prev) => ({ ...prev, building: e.target.value }))
                  }
                  required
                />
                <TextField
                  fullWidth
                  label="Street"
                  value={customerDetails.street}
                  onChange={(e) =>
                    setCustomerDetails((prev) => ({ ...prev, street: e.target.value }))
                  }
                  required
                />
              </Box>
              <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                <TextField
                  fullWidth
                  label="Locality"
                  value={customerDetails.locality}
                  onChange={(e) =>
                    setCustomerDetails((prev) => ({ ...prev, locality: e.target.value }))
                  }
                  required
                />
                <TextField
                  fullWidth
                  label="Pincode"
                  value={customerDetails.pincode}
                  onChange={(e) =>
                    setCustomerDetails((prev) => ({ ...prev, pincode: e.target.value }))
                  }
                  required
                />
              </Box>
            </Stack>

            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handleInitializeOrder}
              sx={{ mt: 3 }}
              disabled={!customerDetails.name || !customerDetails.phone || !customerDetails.email}
            >
              Initialize Order
            </Button>
          </Box>
        )}

        {/* Payment Creation */}
        {journeyContext.stage === 'order_initialized' && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Payment Method
            </Typography>

            <Alert severity="success" sx={{ mb: 2 }}>
              Order initialized successfully! Ready for payment.
            </Alert>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Select Payment Method:
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  label="Razorpay"
                  color={paymentMethod === 'razorpay' ? 'primary' : 'default'}
                  onClick={() => setPaymentMethod('razorpay')}
                  clickable
                />
                <Chip
                  label="Cash on Delivery"
                  color={paymentMethod === 'cod' ? 'primary' : 'default'}
                  onClick={() => setPaymentMethod('cod')}
                  clickable
                />
              </Stack>
            </Box>

            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handleCreatePayment}
            >
              Create Payment
            </Button>
          </Box>
        )}

        {/* Payment Created */}
        {journeyContext.stage === 'payment_created' && (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              Payment created successfully! Ready for confirmation.
            </Alert>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Order Summary
              </Typography>
              <Typography variant="h6" color="primary" fontWeight={600}>
                {formatPrice(quoteData.total_value || 0)}
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handleConfirmOrder}
            >
              Confirm Order
            </Button>
          </Box>
        )}

        {/* Next Operations */}
        {journeyContext.next_operations && journeyContext.next_operations.length > 0 && (
          <Box mt={3}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Suggested Actions:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {journeyContext.next_operations.map((operation) => (
                <Button
                  key={operation}
                  variant="outlined"
                  size="small"
                  onClick={() => onSend(operation.replace(/_/g, ' '))}
                >
                  {operation.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </Button>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CheckoutInterface;
