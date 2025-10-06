import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import { CheckCircle, LocalShipping, Receipt, TrackChanges } from '@mui/icons-material';
import { OrderData } from '@interfaces';

type OrderConfirmationProps = {
  orderData: OrderData;
  onSend: (msg: string) => void;
};

const OrderConfirmation = ({ orderData, onSend }: OrderConfirmationProps) => {
  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

  return (
    <Card sx={{ mb: 2, border: '2px solid', borderColor: 'success.main' }}>
      <CardContent>
        {/* Success Header */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <CheckCircle color="success" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="success.main">
              Order Confirmed!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Thank you for your purchase
            </Typography>
          </Box>
        </Box>

        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            🎉 Your order has been successfully placed!
          </Typography>
        </Alert>

        {/* Order Details */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Order Details
            </Typography>

            <Stack spacing={2}>
              <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Order ID
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    {orderData.order_id}
                  </Typography>
                </Box>

                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip label={orderData.status.toUpperCase()} color="success" variant="filled" />
                </Box>
              </Box>

              <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    {formatPrice(orderData.total_amount)}
                  </Typography>
                </Box>

                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Customer
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {orderData.customer_name}
                  </Typography>
                </Box>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Delivery Address
              </Typography>
              <Typography variant="body1">{orderData.delivery_address}</Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Box mb={3}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            What's Next?
          </Typography>

          <Stack spacing={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Receipt color="primary" />
              <Typography variant="body1">
                You will receive an order confirmation email shortly
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <LocalShipping color="primary" />
              <Typography variant="body1">
                Your order will be processed and shipped within 1-2 business days
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <TrackChanges color="primary" />
              <Typography variant="body1">
                You can track your order status using the order ID
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Action Buttons */}
        <Stack spacing={2}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            startIcon={<TrackChanges />}
            onClick={() => onSend(`track order ${orderData.order_id}`)}
          >
            Track Your Order
          </Button>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => onSend('start new shopping session')}
            >
              Continue Shopping
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={() => onSend('view order history')}
            >
              Order History
            </Button>
          </Stack>
        </Stack>

        {/* Additional Information */}
        <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Need Help?
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="text" size="small" onClick={() => onSend('contact support')}>
              Contact Support
            </Button>
            <Button variant="text" size="small" onClick={() => onSend('cancel order')}>
              Cancel Order
            </Button>
            <Button variant="text" size="small" onClick={() => onSend('modify order')}>
              Modify Order
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrderConfirmation;
