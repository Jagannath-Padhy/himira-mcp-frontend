import { Box, Stack, Typography, CircularProgress, keyframes } from '@mui/material';
import { useEffect, useRef } from 'react';
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
import BuildIcon from '@mui/icons-material/Build';

type ChatAreaProps = {
  messages: ChatMessage[];
  onSend: (msg: string) => void;
  isLoading?: boolean;
};

// Define keyframe animations
const pulseAnimation = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
`;

const shimmerAnimation = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const ChatArea = ({ messages, onSend, isLoading = false }: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const renderMessage = (m: ChatMessage) => {
    console.log('🎨 Rendering message:', {
      message: m,
      // id: m.id,
      // type: m.type,
      // has_cartContext: m.type === 'bot_cart_view' ? !!(m as any).cartContext : 'N/A',
    });

    // User and bot text messages
    if (m.type === 'user' || m.type === 'bot') {
      return <MessageBubble key={m.id} type={m.type} content={m.content} />;
    }

    // Thinking message (bot is processing)
    if (m.type === 'bot_thinking') {
      return (
        <Box
          key={m.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 2,
            p: 2,
            mb: 1,
          }}
        >
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {m.content}
          </Typography>
        </Box>
      );
    }

    // Tool executing message (animated and distinct from thinking)
    if (m.type === 'bot_tool_executing') {
      return (
        <Box
          key={m.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            mb: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2.5,
              py: 1.5,
              borderRadius: '12px',
              background: 'linear-gradient(90deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.12) 50%, rgba(25, 118, 210, 0.08) 100%)',
              backgroundSize: '1000px 100%',
              border: '1px solid',
              borderColor: 'primary.light',
              animation: `${shimmerAnimation} 2s linear infinite, ${pulseAnimation} 1.5s ease-in-out infinite`,
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
            }}
          >
            <BuildIcon
              sx={{
                color: 'primary.main',
                fontSize: 20,
                animation: `${pulseAnimation} 1s ease-in-out infinite`,
              }}
            />
            <Box>
              <Typography
                variant="body2"
                fontWeight={600}
                color="primary.main"
                sx={{ mb: 0.25 }}
              >
                Executing: {m.tool.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Status: {m.status}
              </Typography>
            </Box>
          </Box>
        </Box>
      );
    }

    // Product list display
    if (m.type === 'bot_product_list') {
      console.log('📦 Rendering product list with', m.products.length, 'products');
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
      console.log('🛒 Rendering CartInterface with context:', m.cartContext);
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
        <div ref={messagesEndRef} />
      </Stack>

      <Box p={2} borderTop={1} borderColor="divider">
        <MessageInput onSend={onSend} isLoading={isLoading} />
      </Box>
    </Box>
  );
};

export default ChatArea;
