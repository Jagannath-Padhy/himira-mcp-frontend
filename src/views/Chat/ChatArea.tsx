import { Box, Stack } from '@mui/material';
import { MessageBubble, MessageInput, ProductCard } from '@components';
import type { ChatMessage } from '@interfaces';

type ChatAreaProps = {
  messages: ChatMessage[];
  onSend: (msg: string) => void;
};

export default function ChatArea({ messages, onSend }: ChatAreaProps) {
  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Stack spacing={2} flexGrow={1} overflow="auto" p={2}>
        {messages.map((m) => {
          if (m.type === 'user' || m.type === 'bot') {
            return <MessageBubble key={m.id} type={m.type} content={m.content} />;
          }

          if (m.type === 'bot_product_list') {
            return (
              <Box key={m.id} display="flex" gap={2} flexWrap="wrap">
                {m.products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </Box>
            );
          }

          return null;
        })}
      </Stack>

      <Box p={2} borderTop={1} borderColor="divider">
        <MessageInput onSend={onSend} />
      </Box>
    </Box>
  );
}
