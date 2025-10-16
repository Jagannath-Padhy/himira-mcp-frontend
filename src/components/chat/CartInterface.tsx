import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
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
    <Box>
      {/* Shopping Cart Header - Outside Card */}
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
        Shopping Cart
      </Typography>

      {/* Main Responsive Layout */}
      <Box
        display="flex"
        gap={3}
        sx={{
          flexDirection: {
            xs: 'column',  // Mobile: Vertical stack
            sm: 'column',  // Tablet: Vertical stack
            md: 'row',     // Desktop: Horizontal layout (unchanged)
          },
        }}
      >
        {/* Left Section - Product Cards */}
        <Box
          display="flex"
          flexDirection="column"
          gap={1.5}
          sx={{
            flex: {
              xs: 'none',   // Mobile: No flex, full width
              sm: 'none',   // Tablet: No flex, full width
              md: 1,        // Desktop: flex={1} (unchanged)
            },
          }}
        >
          {cartContext.items?.map((item) => (
            <Card
              key={item.id}
              sx={{
                border: '1px solid rgb(237, 237, 237)',
                borderRadius: '12px',
                p: 1.5,
              }}
            >
              <Box display="flex" justifyContent="space-between" width="100%">
                {/* Product Image + Info */}
                <Box display="flex" gap={2}>
                  {/* Product Image */}
                  <Box
                    component="img"
                    src={item.image_url && item.image_url.trim() !== '' ? item.image_url : '/FallbackImage.jpeg'}
                    alt={item.name}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = '/FallbackImage.jpeg';
                    }}
                    sx={{
                      width: 120,
                      height: 137,
                      borderRadius: '8px',
                      objectFit: 'cover',
                      cursor: 'pointer',
                    }}
                  />

                  {/* Product Info */}
                  <Box display="flex" flexDirection="column" gap={1.5} maxWidth={316}>
                    {/* Product Name & Details */}
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      <Typography variant="body1" fontWeight={400}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" fontWeight={400} color="text.primary">
                        {item.category}
                      </Typography>
                    </Box>

                    {/* Price */}
                    <Box display="flex" gap={0.75}>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {formatPrice(item.price)}
                      </Typography>
                    </Box>

                    {/* Quantity Controls */}
                    {/* <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      sx={{
                        border: '1px solid rgb(151, 151, 151)',
                        borderRadius: '32px',
                        width: '112px',
                        minWidth: '112px',
                        maxWidth: '112px',
                        minHeight: '44px',
                        bgcolor: 'rgb(255, 255, 255)',
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        sx={{ width: 24, height: 24 }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        textAlign="center"
                        sx={{ px: 1.875, py: 0.625 }}
                      >
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        sx={{ width: 24, height: 24 }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Box> */}
                  </Box>
                </Box>

                {/* Remove Button */}
                <IconButton
                  size="small"
                  onClick={() => handleRemoveItem(item)}
                  sx={{ width: 20, height: 20, alignSelf: 'flex-start' }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </Card>
          ))}
        </Box>

        {/* Right Section - Price Summary */}
        <Box
          sx={{
            width: {
              xs: '100%',   // Mobile: Full width
              sm: '100%',   // Tablet: Full width
              md: '45%',    // Desktop: 60% width (unchanged)
            },
          }}
        >
          <Card
            sx={{
              border: '1px solid rgb(237, 237, 237)',
              borderRadius: '12px',
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2.5 }}>
              {/* Price Details Header */}
              <Typography variant="h6" fontWeight={600}>
                Price Details
              </Typography>

              {/* Price Breakdown */}
              <Box display="flex" flexDirection="column" gap={1}>
                {/* Sub Total */}
                <Box display="flex" justifyContent="space-between" width="100%">
                  <Typography variant="body2" fontWeight={400} color="text.primary">
                    Sub Total
                  </Typography>
                  <Typography variant="body2" fontWeight={400} color="text.primary">
                    {formatPrice(cartContext.total_value || 0)}
                  </Typography>
                </Box>

                {/* Total Items */}
                <Box display="flex" justifyContent="space-between" width="100%">
                  <Typography variant="body2" fontWeight={400} color="text.primary">
                    Total Items
                  </Typography>
                  <Typography variant="body2" fontWeight={400} color="text.primary">
                    {cartContext.total_items || 0} items
                  </Typography>
                </Box>

                {/* Total Amount */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  width="100%"
                  sx={{ borderTop: '1px solid rgb(237, 237, 237)', pt: 2, mt: 2 }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Total Amount
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    {formatPrice(cartContext.total_value || 0)}
                  </Typography>
                </Box>
              </Box>

              {/* Proceed to Checkout Button */}
              <Button
                variant="contained"
                fullWidth
                disabled={!cartContext.ready_for_checkout}
                onClick={handleCheckout}
                sx={{
                  bgcolor: 'rgb(255, 205, 54)',
                  color: 'rgb(26, 26, 26)',
                  borderRadius: '78px',
                  height: 44,
                  fontWeight: 600,
                  fontSize: '14px',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: 'rgb(235, 185, 53)',
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(255, 205, 54, 0.5)',
                    color: 'rgba(26, 26, 26, 0.5)',
                  },
                }}
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default CartInterface;
