import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { CartContext, CartItem } from '@interfaces';

type CartInterfaceProps = {
  cartContext: CartContext;
  onSend: (msg: string) => void;
};

const CartInterface = ({ cartContext, onSend }: CartInterfaceProps) => {
  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      onSend(`remove ${item.name} from cart`);
    } else {
      onSend(`update quantity of ${item.name} to ${newQuantity}`);
    }
  };

  const handleRemoveItem = (item: CartItem) => {
    onSend(`remove ${item.name} from cart`);
  };

  const handleCheckout = () => {
    onSend('proceed to checkout');
  };

  if (cartContext.is_empty) {
    return (
      <Card sx={{ mb: 2, bgcolor: 'grey.50' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Start shopping to add items to your cart
          </Typography>
          <Button variant="contained" color="primary" onClick={() => onSend('show me products')}>
            Browse Products
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600}>
            Shopping Cart
          </Typography>
          <Chip
            label={`${cartContext.total_items || 0} items`}
            color="primary"
            variant="outlined"
          />
        </Box>

        <Stack spacing={2}>
          {cartContext.items?.map((item) => (
            <Box key={item.id}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.provider_name} • {item.category}
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight={600}>
                    {formatPrice(item.price)} each
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton
                    size="small"
                    onClick={() => handleQuantityChange(item, item.quantity - 1)}
                  >
                    <Remove fontSize="small" />
                  </IconButton>
                  <Typography variant="body1" fontWeight={600} minWidth={30} textAlign="center">
                    {item.quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleQuantityChange(item, item.quantity + 1)}
                  >
                    <Add fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleRemoveItem(item)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <Typography variant="body2" color="text.secondary">
                  {item.quantity} × {formatPrice(item.price)}
                </Typography>
                <Typography variant="subtitle1" fontWeight={600} color="primary">
                  {formatPrice(item.total_price)}
                </Typography>
              </Box>

              <Divider sx={{ mt: 1 }} />
            </Box>
          ))}
        </Stack>

        <Box mt={3} pt={2} borderTop={1} borderColor="divider">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600}>
              Total
            </Typography>
            <Typography variant="h5" fontWeight={700} color="primary">
              {formatPrice(cartContext.total_value || 0)}
            </Typography>
          </Box>

          {cartContext.provider_count && cartContext.provider_count > 1 && (
            <Box mb={2}>
              <Chip
                label={`Items from ${cartContext.provider_count} providers`}
                color="warning"
                variant="outlined"
                size="small"
              />
            </Box>
          )}

          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={!cartContext.ready_for_checkout}
            onClick={handleCheckout}
          >
            {cartContext.ready_for_checkout ? 'Proceed to Checkout' : 'Complete Cart Setup'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CartInterface;
