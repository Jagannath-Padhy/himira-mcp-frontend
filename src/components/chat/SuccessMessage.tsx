import { Box, Card, CardContent, Typography, Button, Alert, Stack } from '@mui/material';
import { CheckCircle, ShoppingCart, Search, Visibility } from '@mui/icons-material';

type SuccessMessageProps = {
  message: string;
  nextOperations?: string[];
  onSend: (msg: string) => void;
};

const SuccessMessage = ({ message, nextOperations, onSend }: SuccessMessageProps) => {
  const getOperationIcon = (operation: string) => {
    switch (operation.toLowerCase()) {
      case 'view_cart':
        return <ShoppingCart />;
      case 'continue_shopping':
      case 'search_products':
        return <Search />;
      case 'select_items_for_order':
        return <Visibility />;
      default:
        return <CheckCircle />;
    }
  };

  const getOperationLabel = (operation: string) => {
    switch (operation.toLowerCase()) {
      case 'view_cart':
        return 'View Cart';
      case 'continue_shopping':
        return 'Continue Shopping';
      case 'search_products':
        return 'Search Products';
      case 'select_items_for_order':
        return 'Proceed to Checkout';
      case 'initialize_order':
        return 'Enter Delivery Details';
      case 'create_payment':
        return 'Make Payment';
      case 'confirm_order':
        return 'Confirm Order';
      case 'add_to_cart':
        return 'Add More Items';
      default:
        return operation.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  const getOperationColor = (operation: string): 'primary' | 'secondary' | 'success' => {
    switch (operation.toLowerCase()) {
      case 'view_cart':
      case 'select_items_for_order':
        return 'primary';
      case 'continue_shopping':
      case 'search_products':
        return 'secondary';
      default:
        return 'success';
    }
  };

  const handleOperationClick = (operation: string) => {
    switch (operation.toLowerCase()) {
      case 'view_cart':
        onSend('show me my cart');
        break;
      case 'continue_shopping':
        onSend('show me products');
        break;
      case 'search_products':
        onSend('search for products');
        break;
      case 'select_items_for_order':
        onSend('proceed to checkout');
        break;
      case 'initialize_order':
        onSend('initialize order');
        break;
      case 'create_payment':
        onSend('create payment');
        break;
      case 'confirm_order':
        onSend('confirm order');
        break;
      default:
        onSend(operation.replace(/_/g, ' '));
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Alert severity="success" sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircle />
            <Typography variant="body1" fontWeight={600}>
              Success!
            </Typography>
          </Box>
        </Alert>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {message}
        </Typography>

        {nextOperations && nextOperations.length > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              What would you like to do next?
            </Typography>

            <Stack spacing={1}>
              {nextOperations.map((operation) => (
                <Button
                  key={operation}
                  variant="outlined"
                  color={getOperationColor(operation)}
                  startIcon={getOperationIcon(operation)}
                  onClick={() => handleOperationClick(operation)}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {getOperationLabel(operation)}
                </Button>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SuccessMessage;
