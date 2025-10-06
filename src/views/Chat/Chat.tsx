import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AppLayout, Sidebar, Header } from '@components';
import ChatArea from './ChatArea';
import { ChatMessage, ChatSession, ChatApiResponse } from '@interfaces';
import usePost from '../../hooks/usePost';

const Chat = () => {
  const [chats, setChats] = useState<ChatSession[]>([
    { id: 'c1', title: 'New Chat', messages: [] },
  ]);

  const [activeChatId, setActiveChatId] = useState('c1');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [cartState, setCartState] = useState({ itemCount: 0, total: 0 });

  const hasInitialized = useRef(false);

  // Helper function to create messages based on API response
  const createMessagesFromResponse = (responseData: ChatApiResponse): ChatMessage[] => {
    const messages: ChatMessage[] = [];
    const timestamp = Date.now();

    // Always add the response text as a bot message first
    if (responseData.response) {
      messages.push({
        id: `b${timestamp}`,
        type: 'bot',
        content: responseData.response,
      });
    }

    // Handle different context types
    if (responseData.data) {
      const { data } = responseData;

      // Handle search results
      if (
        responseData.context_type === 'search_results' &&
        data.products &&
        data.products.length > 0
      ) {
        messages.push({
          id: `p${timestamp}`,
          type: 'bot_product_list',
          products: data.products,
        });
      }

      // Handle cart view
      if (responseData.context_type === 'cart_view' && data.cart_context) {
        messages.push({
          id: `c${timestamp}`,
          type: 'bot_cart_view',
          cartContext: data.cart_context,
        });
      }

      // Handle checkout stage
      if (responseData.context_type === 'checkout_stage' && data.journey_context) {
        messages.push({
          id: `ch${timestamp}`,
          type: 'bot_checkout_stage',
          quoteData: data.quote_data || { providers: [] },
          journeyContext: data.journey_context,
        });
      }

      // Handle order confirmation
      if (responseData.context_type === 'order_confirmation' && data.simple_data?.confirm_context) {
        messages.push({
          id: `oc${timestamp}`,
          type: 'bot_order_confirmation',
          orderData: {
            order_id: data.simple_data.confirm_context.order_id,
            status: data.simple_data.confirm_context.order_status,
            total_amount: data.simple_data.confirm_context.total_amount,
            currency: 'INR',
            customer_name: 'Customer',
            delivery_address: 'Address on file',
          },
        });
      }

      // Handle error messages
      if (responseData.context_type === 'error_message' || data.success === false) {
        messages.push({
          id: `e${timestamp}`,
          type: 'bot_error',
          error: {
            success: data.success || false,
            error_type: 'api_error',
            message: responseData.response || 'An error occurred',
            retry_possible: true,
          },
        });
      }

      // Handle success messages with next operations
      if (
        responseData.context_type === 'success_message' &&
        data.journey_context?.next_operations
      ) {
        messages.push({
          id: `s${timestamp}`,
          type: 'bot_success',
          message: responseData.response || 'Operation completed successfully',
          nextOperations: data.journey_context.next_operations,
        });
      }
    }

    return messages;
  };

  const { mutate: sendChatMessage } = usePost({
    onSuccess: (response: unknown) => {
      setIsLoading(false);
      const responseData = response as ChatApiResponse;

      // Update session and device IDs
      if (responseData.session_id) {
        setSessionId(responseData.session_id);
      }

      if (responseData.device_id) {
        setDeviceId(responseData.device_id);
      }

      // Skip initialization messages from being displayed
      if (
        responseData.response?.includes('initialized a new shopping session') ||
        responseData.response?.includes('Session Ready')
      ) {
        return;
      }

      // Update cart state if cart context is present
      if (responseData.data?.cart_context) {
        setCartState({
          itemCount: responseData.data.cart_context.total_items || 0,
          total: responseData.data.cart_context.total_value || 0,
        });
      }

      // if responseData.data?.simple_data?.next_step is not null, then show buttons and if user click on that api will call

      // Create messages based on response
      const newMessages = createMessagesFromResponse(responseData);

      // Add messages to chat
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? {
                ...c,
                messages: [...c.messages, ...newMessages],
              }
            : c,
        ),
      );
    },
    onError: (error: unknown) => {
      setIsLoading(false);
      console.error('Chat API error:', error);

      // Get the current active chat to check if we should append message
      const currentChat = chats.find((c) => c.id === activeChatId);
      const shouldAppendMessage = currentChat && currentChat.messages.length > 0;

      if (shouldAppendMessage) {
        const errorMsg: ChatMessage = {
          id: `e${Date.now()}`,
          type: 'bot_error',
          error: {
            success: false,
            error_type: 'network_error',
            message: 'Sorry, I encountered an error. Please try again.',
            retry_possible: true,
            recovery_action: 'retry_operation',
          },
        };

        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChatId ? { ...c, messages: [...c.messages, errorMsg] } : c,
          ),
        );
      }
    },
  });

  // Memoize activeChat to prevent unnecessary rerenders
  const activeChat = useMemo(
    () => chats.find((c) => c.id === activeChatId)!,
    [chats, activeChatId],
  );

  const sendMessage = useCallback(
    (msg: string, appendMessage = true) => {
      // Add user message immediately

      if (appendMessage) {
        const newMsg: ChatMessage = { id: `m${Date.now()}`, type: 'user', content: msg };

        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChatId ? { ...c, messages: [...c.messages, newMsg] } : c,
          ),
        );
      }

      // Show loading state
      setIsLoading(true);

      // Call /chat API
      sendChatMessage({
        url: '/chat',
        payload: { message: msg, session_id: sessionId },
      });
    },
    [activeChatId, sessionId, deviceId, sendChatMessage],
  );

  const createChat = useCallback(() => {
    const id = `c${Date.now()}`;
    setChats((prev) => [...prev, { id, title: 'New Chat', messages: [] }]);
    setActiveChatId(id);
  }, []);

  const deleteChat = useCallback(
    (id: string) => {
      setChats((prev) => {
        if (prev.length === 1) return prev;
        const updated = prev.filter((c) => c.id !== id);
        if (activeChatId === id) setActiveChatId(updated[0].id);
        return updated;
      });
    },
    [activeChatId],
  );

  const switchChat = useCallback((id: string) => setActiveChatId(id), []);

  const handleMenuClick = useCallback(() => setMobileSidebarOpen(true), []);
  const handleCloseMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);
  const handleCartClick = useCallback(() => {
    sendMessage('show me my cart');
  }, [sendMessage]);

  // Initialize shopping session only once when component mounts
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;

      sendMessage(
        'initialize_shopping (userId: EUSJ0ypAJJVdo3gXrUJe4uIBwDB2, deviceid: ed0bda0dd8c167a73721be5bb142dfc9)',
        false,
      );
    }
  }, [sendMessage]); // Include sendMessage in dependencies

  return (
    <AppLayout
      sidebar={
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onCreate={createChat}
          onDelete={deleteChat}
          onSwitch={switchChat}
        />
      }
      header={
        <Header
          onMenuClick={handleMenuClick}
          cartItemCount={cartState.itemCount}
          cartTotal={cartState.total}
          onCartClick={handleCartClick}
        />
      }
      mobileSidebarOpen={mobileSidebarOpen}
      onCloseMobileSidebar={handleCloseMobileSidebar}
    >
      <ChatArea messages={activeChat.messages} onSend={sendMessage} isLoading={isLoading} />
    </AppLayout>
  );
};

export default Chat;
