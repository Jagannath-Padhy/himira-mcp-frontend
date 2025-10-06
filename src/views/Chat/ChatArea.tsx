import { Box, Stack, Typography, CircularProgress } from '@mui/material';
import {
  MessageBubble,
  MessageInput,
  ProductCard,
  CartInterface,
  CheckoutInterface,
  ErrorInterface,
  OrderConfirmation,
  SuccessMessage,
} from '@components';
import type { ChatMessage } from '@interfaces';

type ChatAreaProps = {
  messages: ChatMessage[];
  onSend: (msg: string) => void;
  isLoading?: boolean;
};

const ChatArea = ({ messages, onSend, isLoading = false }: ChatAreaProps) => {
  const renderMessage = (m: ChatMessage) => {
    console.log('Rendering message:', m);

    // User and bot text messages
    if (m.type === 'user' || m.type === 'bot') {
      return <MessageBubble key={m.id} type={m.type} content={m.content} />;
    }

    // Product list display
    if (m.type === 'bot_product_list') {
      return (
        <Box key={m.id} sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Products Found ({m.products.length})
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 2,
            }}
          >
            {m.products.map((p) => (
              <ProductCard key={p.id} product={p} onSend={onSend} />
            ))}
          </Box>
        </Box>
      );
    }

    // Cart view
    if (m.type === 'bot_cart_view') {
      return <CartInterface key={m.id} cartContext={m.cartContext} onSend={onSend} />;
    }

    // Checkout stage
    if (m.type === 'bot_checkout_stage') {
      return (
        <CheckoutInterface
          key={m.id}
          quoteData={m.quoteData}
          journeyContext={m.journeyContext}
          onSend={onSend}
        />
      );
    }

    // Error display
    if (m.type === 'bot_error') {
      return <ErrorInterface key={m.id} error={m.error} onSend={onSend} />;
    }

    // Order confirmation
    if (m.type === 'bot_order_confirmation') {
      return <OrderConfirmation key={m.id} orderData={m.orderData} onSend={onSend} />;
    }

    // Success message with actions
    if (m.type === 'bot_success') {
      return (
        <SuccessMessage
          key={m.id}
          message={m.message}
          nextOperations={m.nextOperations}
          onSend={onSend}
        />
      );
    }

    return null;
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Stack spacing={2} flexGrow={1} overflow="auto" p={2}>
        {messages.map(renderMessage)}

        {/* Loading indicator */}
        {isLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" py={2}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Processing your request...
            </Typography>
          </Box>
        )}
      </Stack>

      <Box p={2} borderTop={1} borderColor="divider">
        <MessageInput onSend={onSend} isLoading={isLoading} />
      </Box>
    </Box>
  );
};

export default ChatArea;
