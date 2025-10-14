import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AppLayout, Sidebar, Header } from '@components';
import ChatArea from './ChatArea';
import {
  ChatMessage,
  ChatSession,
  ChatApiResponse,
  StreamingResponse,
  RawProduct,
  RawCartSummary,
  CartContext,
  CartItem,
} from '@interfaces';
import { useChatStream } from '../../hooks';
import { Product } from '@interfaces';

const Chat = () => {
  const [chats, setChats] = useState<ChatSession[]>([
    { id: 'c1', title: 'New Chat', messages: [] },
  ]);

  const [activeChatId, setActiveChatId] = useState('c1');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cartState, setCartState] = useState({ itemCount: 0, total: 0 });

  const hasInitialized = useRef(false);

  // Helper function to transform raw products to Product format
  const transformRawProduct = useCallback((rawProduct: RawProduct): Product => {
    console.log('🔄 Transforming raw product:', rawProduct);

    try {
      // Handle inconsistent API structure - some products have different field names
      const providerId =
        rawProduct.provider_id ||
        rawProduct.provider_details?.id ||
        (rawProduct as any).provider?.id ||
        'unknown';

      const providerName =
        rawProduct.provider_name ||
        rawProduct.provider_details?.descriptor?.name ||
        (rawProduct as any).provider?.descriptor?.name ||
        (rawProduct as any).bpp_details?.name ||
        'Unknown Provider';

      let productImages = rawProduct.images || rawProduct.item_details?.descriptor?.images || [];

      // Handle images - they can be strings or objects with {url, type, alt_text}
      if (Array.isArray(productImages) && productImages.length > 0) {
        productImages = productImages
          .map((img: any) => {
            if (typeof img === 'string') {
              return img;
            } else if (typeof img === 'object' && img.url) {
              return img.url;
            }
            return '';
          })
          .filter((url: string) => url && url.trim() !== '');
      }

      console.log('🖼️ Product images for', rawProduct.name, ':', productImages);

      // Handle category - it can be a string or an object with {id, name, description, parent_id, level}
      let categoryString = 'Uncategorized';
      if (rawProduct.category) {
        if (typeof rawProduct.category === 'string') {
          categoryString = rawProduct.category;
        } else if (typeof rawProduct.category === 'object' && (rawProduct.category as any).name) {
          // Category is an object, extract the name
          categoryString =
            (rawProduct.category as any).name || (rawProduct.category as any).id || 'Uncategorized';
        }
      } else if (rawProduct.item_details?.category_id) {
        categoryString = rawProduct.item_details.category_id;
      }

      const transformed = {
        id: rawProduct.id,
        name: rawProduct.name || rawProduct.item_details?.descriptor?.name || 'Unnamed Product',
        description:
          rawProduct.description ||
          rawProduct.long_description ||
          rawProduct.item_details?.descriptor?.short_desc ||
          rawProduct.item_details?.descriptor?.long_desc ||
          '',
        price: rawProduct.price?.value || rawProduct.item_details?.price?.value || 0,
        category: categoryString,
        provider: {
          id: providerId,
          name: providerName,
          delivery_available: true,
        },
        images: productImages,
      };

      console.log('✅ Transformed product:', transformed);
      return transformed;
    } catch (error) {
      console.error('❌ Error transforming product:', error, rawProduct);
      // Return a fallback product to prevent the entire list from failing
      return {
        id: rawProduct.id || 'unknown',
        name: 'Error loading product',
        description: 'This product could not be loaded',
        price: 0,
        category: 'Unknown',
        provider: {
          id: 'unknown',
          name: 'Unknown Provider',
          delivery_available: false,
        },
        images: [],
      };
    }
  }, []);

  // Helper function to transform raw cart summary to CartContext format
  const transformRawCartSummary = useCallback((rawCartSummary: RawCartSummary): CartContext => {
    // Handle case where items might be undefined or empty
    const cartItems: CartItem[] = (rawCartSummary.items || []).map((item) => ({
      id: item.id,
      local_id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total_price: item.subtotal,
      provider_id: item.provider_id,
      // Extract provider name from provider object or use provider_id as fallback
      provider_name:
        item.provider?.descriptor?.name ||
        item.provider?.id?.split('_').pop() ||
        'Unknown Provider',
      location_id: item.location_id,
      fulfillment_id: item.fulfillment_id,
      category: item.category,
      currency: 'INR',
      image_url: item.image_url || '',
    }));

    return {
      items: cartItems,
      total_items: rawCartSummary.total_items || 0,
      total_value: rawCartSummary.total_value || 0,
      is_empty:
        rawCartSummary.is_empty !== undefined ? rawCartSummary.is_empty : cartItems.length === 0,
      ready_for_checkout: !rawCartSummary.is_empty && cartItems.length > 0,
    };
  }, []);

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

  // Helper function to remove all thinking and tool executing messages
  const removeThinkingMessages = useCallback(() => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== activeChatId) return c;

        // Filter out ALL thinking and tool executing messages
        const messagesWithoutThinking = c.messages.filter(
          (m) => m.type !== 'bot_thinking' && m.type !== 'bot_tool_executing',
        );

        console.log(
          '🗑️ Removing thinking/tool messages, before:',
          c.messages.length,
          'after:',
          messagesWithoutThinking.length,
        );

        return {
          ...c,
          messages: messagesWithoutThinking,
        };
      }),
    );
  }, [activeChatId]);

  const handleThinking = useCallback(
    (message: string, session_id?: string) => {
      // Update session ID if provided
      if (session_id) {
        setSessionId(session_id);
      }

      console.log('💭 Thinking message:', message);

      const thinkingMsg: ChatMessage = {
        id: `thinking${Date.now()}`,
        type: 'bot_thinking',
        content: message,
      };

      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== activeChatId) return c;

          // Remove any existing thinking messages (but keep tool executing) and add new one
          const messagesWithoutThinking = c.messages.filter((m) => m.type !== 'bot_thinking');

          return {
            ...c,
            messages: [...messagesWithoutThinking, thinkingMsg],
          };
        }),
      );
    },
    [activeChatId],
  );

  const handleToolStart = useCallback(
    (tool: string, status: string, session_id?: string) => {
      // Update session ID if provided
      if (session_id) {
        setSessionId(session_id);
      }

      console.log('🔧 Tool execution message:', tool, status);

      const toolMsg: ChatMessage = {
        id: `tool${Date.now()}`,
        type: 'bot_tool_executing',
        tool: tool,
        status: status,
      };

      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== activeChatId) return c;

          // Remove any existing tool executing messages and add new one
          const messagesWithoutToolExec = c.messages.filter((m) => m.type !== 'bot_tool_executing');

          return {
            ...c,
            messages: [...messagesWithoutToolExec, toolMsg],
          };
        }),
      );
    },
    [activeChatId],
  );

  const handleResponse = useCallback(
    (response: StreamingResponse & { type: 'response' }) => {
      console.log('🎯 handleResponse called with:', response);
      setIsLoading(false);

      // Update session ID if provided
      if (response.session_id) {
        setSessionId(response.session_id);
      }

      // Skip initialization messages from being displayed
      if (
        response.content?.includes('initialized a new shopping session') ||
        response.content?.includes('Session Ready')
      ) {
        console.log('⏭️ Skipping initialization message, removing thinking messages');
        removeThinkingMessages();
        return;
      }

      // Create response data in the format expected by createMessagesFromResponse
      const responseData: ChatApiResponse = {
        response: response.content,
        session_id: response.session_id || sessionId || '',
        device_id: '',
        timestamp: response.timestamp || new Date().toISOString(),
        data: response.data,
        context_type: response.context_type,
      };

      // Update cart state if cart context is present
      if (response.data?.cart_context) {
        setCartState({
          itemCount: response.data.cart_context.total_items || 0,
          total: response.data.cart_context.total_value || 0,
        });
      }

      // Create messages based on response
      const newMessages = createMessagesFromResponse(responseData);
      console.log('📝 New messages created:', newMessages.length, newMessages);

      // Remove ALL thinking messages and add response messages
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== activeChatId) return c;

          // Filter out ALL thinking and tool executing messages
          const messagesWithoutThinking = c.messages.filter(
            (m) => m.type !== 'bot_thinking' && m.type !== 'bot_tool_executing',
          );

          console.log(
            '🗑️ Removing thinking messages in handleResponse, before:',
            c.messages.length,
            'after:',
            messagesWithoutThinking.length,
          );

          return {
            ...c,
            messages: [...messagesWithoutThinking, ...newMessages],
          };
        }),
      );

      console.log('✅ Response handled, thinking messages removed');
    },
    [activeChatId, sessionId, removeThinkingMessages],
  );

  const handleRawProducts = useCallback(
    (response: StreamingResponse & { type: 'raw_products' }) => {
      console.log('🛍️ handleRawProducts called with:', response);
      console.log('🛍️ Number of raw products:', response.products?.length);
      console.log('🛍️ Active chat ID:', activeChatId);
      setIsLoading(false);

      // Update session ID if provided
      if (response.session_id) {
        setSessionId(response.session_id);
      }

      // Check if products exist
      if (!response.products || response.products.length === 0) {
        console.warn('⚠️ No products in raw_products response');
        removeThinkingMessages();
        return;
      }

      // Transform raw products to Product format
      const filteredProducts = [response.products[0]];
      // const transformedProducts: Product[] = response.products.map(transformRawProduct);
      const transformedProducts: Product[] = filteredProducts.map(transformRawProduct);
      console.log('📦 Transformed products:', transformedProducts.length, transformedProducts);

      // Create product list message
      const productMessage: ChatMessage = {
        id: `raw_products${Date.now()}`,
        type: 'bot_product_list',
        products: transformedProducts,
      };
      console.log('📝 Created product message:', productMessage);

      // Remove ALL thinking messages and add product message
      setChats((prev) => {
        console.log('🔄 Updating chats state, current chats:', prev.length);
        return prev.map((c) => {
          if (c.id !== activeChatId) {
            console.log('⏭️ Skipping chat:', c.id);
            return c;
          }

          console.log('🎯 Updating active chat:', c.id, 'Current messages:', c.messages.length);

          // Filter out ALL thinking and tool executing messages
          const messagesWithoutThinking = c.messages.filter(
            (m) => m.type !== 'bot_thinking' && m.type !== 'bot_tool_executing',
          );

          console.log(
            '🗑️ Removing thinking messages in handleRawProducts, before:',
            c.messages.length,
            'after:',
            messagesWithoutThinking.length,
          );

          const newMessages = [...messagesWithoutThinking, productMessage];
          console.log('✨ New messages array length:', newMessages.length);

          return {
            ...c,
            messages: newMessages,
          };
        });
      });

      console.log('✅ Raw products handled, thinking messages removed');
    },
    [activeChatId, transformRawProduct, removeThinkingMessages],
  );

  const handleRawCart = useCallback(
    (response: StreamingResponse & { type: 'raw_cart' }) => {
      console.log('🛒 handleRawCart called with:', response);

      // Update session ID if provided
      if (response.session_id) {
        setSessionId(response.session_id);
      }

      // Check if cart_summary is valid and has items
      if (
        !response.cart_summary ||
        !response.cart_summary.items ||
        response.cart_summary.items.length === 0
      ) {
        console.log('⚠️ Skipping raw_cart with empty or invalid cart_summary');
        // Just remove thinking messages without adding cart UI
        removeThinkingMessages();
        setIsLoading(false);
        return;
      }

      setIsLoading(false);

      // Transform raw cart summary to CartContext format
      const cartContext = transformRawCartSummary(response.cart_summary);
      console.log('🛒 Transformed cart context:', cartContext);

      // Update cart state in header
      setCartState({
        itemCount: cartContext.total_items || 0,
        total: cartContext.total_value || 0,
      });

      // Create cart view message
      const cartMessage: ChatMessage = {
        id: `raw_cart${Date.now()}`,
        type: 'bot_cart_view',
        cartContext: cartContext,
      };

      // Remove ALL thinking messages and add cart message
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== activeChatId) return c;

          // Filter out ALL thinking and tool executing messages
          const messagesWithoutThinking = c.messages.filter(
            (m) => m.type !== 'bot_thinking' && m.type !== 'bot_tool_executing',
          );

          console.log(
            '🗑️ Removing thinking messages in handleRawCart, before:',
            c.messages.length,
            'after:',
            messagesWithoutThinking.length,
          );

          return {
            ...c,
            messages: [...messagesWithoutThinking, cartMessage],
          };
        }),
      );

      console.log('✅ Raw cart handled, thinking messages removed');
    },
    [activeChatId, transformRawCartSummary, removeThinkingMessages],
  );

  const handleStreamError = useCallback(
    (error: Error) => {
      setIsLoading(false);
      console.error('❌ Chat stream error:', error);

      // Remove all thinking messages
      removeThinkingMessages();

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
    [activeChatId, chats, removeThinkingMessages],
  );

  const handleStreamComplete = useCallback(() => {
    console.log('🏁 handleStreamComplete called - removing ALL thinking messages');
    setIsLoading(false);

    // Always remove all thinking messages when stream completes
    removeThinkingMessages();
  }, [removeThinkingMessages]);

  const { sendMessage: sendStreamMessage } = useChatStream({
    onThinking: handleThinking,
    onToolStart: handleToolStart,
    onResponse: handleResponse,
    onRawProducts: handleRawProducts,
    onRawCart: handleRawCart,
    onError: handleStreamError,
    onComplete: handleStreamComplete,
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

      // Call streaming API
      sendStreamMessage(msg, sessionId);
    },
    [activeChatId, sessionId, sendStreamMessage],
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
