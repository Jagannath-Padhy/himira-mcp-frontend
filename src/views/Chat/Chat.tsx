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
import { useUser } from '../../contexts/UserContext';
import { getOrCreateDeviceId } from '../../utils/deviceFingerprint';

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
  const currentStreamIdRef = useRef<string | null>(null);
  const { user, isLoading: userLoading } = useUser();
  

  // Helper function to transform raw products to Product format
  const transformRawProduct = useCallback((rawProduct: RawProduct): Product => {

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

  // Helper function to remove thinking and tool executing messages from current stream
  const removeThinkingMessages = useCallback(() => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== activeChatId) return c;

        // Filter out thinking and tool executing messages from current stream only
        const messagesWithoutThinking = c.messages.filter(
          (m) => {
            const isThinkingOrTool = m.type === 'bot_thinking' || m.type === 'bot_tool_executing';
            const isCurrentStream = m.streamId === currentStreamIdRef.current;
            return !(isThinkingOrTool && isCurrentStream);
          }
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


      const thinkingMsg: ChatMessage = {
        id: `thinking${Date.now()}`,
        type: 'bot_thinking',
        content: message,
        streamId: currentStreamIdRef.current || undefined,
      };

      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== activeChatId) return c;

          // Remove any existing thinking messages from current stream and add new one
          const messagesWithoutThinking = c.messages.filter(
            (m) => !(m.type === 'bot_thinking' && m.streamId === currentStreamIdRef.current)
          );

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


      const toolMsg: ChatMessage = {
        id: `tool${Date.now()}`,
        type: 'bot_tool_executing',
        tool: tool,
        status: status,
        streamId: currentStreamIdRef.current || undefined,
      };

      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== activeChatId) return c;

          // Remove any existing tool executing messages from current stream and add new one
          const messagesWithoutToolExec = c.messages.filter(
            (m) => !(m.type === 'bot_tool_executing' && m.streamId === currentStreamIdRef.current)
          );

          return {
            ...c,
            messages: [...messagesWithoutToolExec, toolMsg],
          };
        }),
      );
    },
    [activeChatId],
  );

  // Handle intermediate conversation chunks (status updates between thinking and response)
  const handleConversationChunk = useCallback(
    (chunk: StreamingResponse & { type: 'conversation_chunk' }) => {
      // Update session ID if provided
      if (chunk.session_id) {
        setSessionId(chunk.session_id);
      }

      const chunkMsg: ChatMessage = {
        id: `chunk${Date.now()}`,
        type: 'bot_conversation_chunk',
        content: chunk.message,
        stage: (chunk as any).stage,
        streamId: currentStreamIdRef.current || undefined,
      };

      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== activeChatId) return c;
          // Keep existing conversation chunks minimal: replace any existing chunk from current stream
          const withoutOldChunks = c.messages.filter(
            (m) => !(m.type === 'bot_conversation_chunk' && m.streamId === currentStreamIdRef.current)
          );
          return { ...c, messages: [...withoutOldChunks, chunkMsg] };
        }),
      );
    },
    [activeChatId],
  );

  const handleResponse = useCallback(
    (response: StreamingResponse & { type: 'response' }) => {
      // Don't set isLoading to false here - wait for stream complete

      // Update session ID if provided
      if (response.session_id) {
        setSessionId(response.session_id);
      }

      // Skip initialization messages from being displayed
      if (
        response.content?.includes('initialized a new shopping session') ||
        response.content?.includes('Session Ready')
      ) {
        removeThinkingMessages();
        return;
      }

      // Check if this is a payment initialization message
      if (response.content?.includes('Your order has been initialized')) {

        // Extract amount from the response content
        const amountMatch = response.content.match(/₹(\d+\.?\d*)/);
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

        // Generate a mock order ID (in real implementation, this would come from backend)
        const orderId = `order_${Date.now()}`;

        // Create payment message
        const paymentMessage: ChatMessage = {
          id: `payment_${Date.now()}`,
          type: 'bot_payment_initiated',
          orderId: orderId,
          amount: amount,
          currency: 'INR',
        };

        // Add the response message and payment component
        setChats((prev) =>
          prev.map((c) => {
            if (c.id !== activeChatId) return c;

            // Filter out thinking/tool messages from current stream and add response + payment
            const messagesWithoutThinking = c.messages.filter(
              (m) => {
                const isThinkingOrTool = m.type === 'bot_thinking' || m.type === 'bot_tool_executing';
                const isCurrentStream = m.streamId === currentStreamIdRef.current;
                return !(isThinkingOrTool && isCurrentStream);
              }
            );

            return {
              ...c,
              messages: [
                ...messagesWithoutThinking,
                {
                  id: `response_${Date.now()}`,
                  type: 'bot',
                  content: response.content,
                },
                paymentMessage,
              ],
            };
          }),
        );
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

      // Remove thinking/tool/chunk messages from current stream and add response messages
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== activeChatId) return c;

          // Filter out thinking, tool executing, and conversation chunk messages from current stream
          const messagesWithoutThinking = c.messages.filter(
            (m) => {
              const isTemporary = 
                m.type === 'bot_thinking' ||
                m.type === 'bot_tool_executing' ||
                m.type === 'bot_conversation_chunk';
              const isCurrentStream = m.streamId === currentStreamIdRef.current;
              return !(isTemporary && isCurrentStream);
            }
          );


          return {
            ...c,
            messages: [...messagesWithoutThinking, ...newMessages],
          };
        }),
      );

    },
    [activeChatId, sessionId, removeThinkingMessages],
  );

  const handleRawProducts = useCallback(
    (response: StreamingResponse & { type: 'raw_products' }) => {
      // Don't set isLoading to false here - wait for stream complete
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
      // const filteredProducts = [response.products[0]];
      const transformedProducts: Product[] = response.products.map(transformRawProduct);
      // const transformedProducts: Product[] = filteredProducts.map(transformRawProduct);

      // Create product list message with stream ID
      const productMessage: ChatMessage = {
        id: `raw_products${Date.now()}`,
        type: 'bot_product_list',
        products: transformedProducts,
        streamId: currentStreamIdRef.current || undefined,
      };

      // Remove thinking, tool executing, conversation chunks from current stream
      // AND ONLY product lists from the CURRENT stream (keep product lists from other streams)
      setChats((prev) => {
        return prev.map((c) => {
          if (c.id !== activeChatId) {
            return c;
          }


          // Filter out:
          // 1. thinking/tool/chunk messages from current stream (they're temporary)
          // 2. ONLY bot_product_list messages from the CURRENT stream (replace within stream)
          // 3. Keep bot_product_list messages from OTHER streams (persist across API calls)
          const messagesWithoutDuplicates = c.messages.filter(
            (m) => {
              const isCurrentStreamTemporary = 
                (m.type === 'bot_thinking' || 
                 m.type === 'bot_tool_executing' || 
                 m.type === 'bot_conversation_chunk') &&
                m.streamId === currentStreamIdRef.current;
              
              const isCurrentStreamProductList = 
                m.type === 'bot_product_list' && 
                m.streamId === currentStreamIdRef.current;
              
              return !isCurrentStreamTemporary && !isCurrentStreamProductList;
            }
          );


          const newMessages = [...messagesWithoutDuplicates, productMessage];

          return {
              ...c,
            messages: newMessages,
          };
        });
      });

    },
    [activeChatId, transformRawProduct, removeThinkingMessages],
  );

  const handleRawCart = useCallback(
    (response: StreamingResponse & { type: 'raw_cart' }) => {

      // Update session ID if provided
      if (response.session_id) {
        setSessionId(response.session_id);
      }

      // Normalize cart summary: if items are missing in cart_summary, build from cart_items
      const hasSummaryItems = Array.isArray((response as any).cart_summary?.items) &&
        ((response as any).cart_summary.items as unknown[]).length > 0;

      let normalizedCartSummary = (response as any).cart_summary as any;

      if (!hasSummaryItems && Array.isArray((response as any).cart_items) && (response as any).cart_items.length > 0) {
        try {
          const cartItems = (response as any).cart_items as any[];

          const extractFirstImageUrl = (product: any): string | undefined => {
            const imagesFromDescriptor = product?.descriptor?.images;
            if (Array.isArray(imagesFromDescriptor) && imagesFromDescriptor.length > 0) {
              return imagesFromDescriptor[0];
            }
            const tags = product?.tags;
            if (Array.isArray(tags)) {
              const imageTag = tags.find((t: any) => t?.code === 'image');
              const urlEntry = imageTag?.list?.find((l: any) => l?.code === 'url');
              if (urlEntry?.value && typeof urlEntry.value === 'string') return urlEntry.value;
            }
            return undefined;
          };

          const synthesizedItems = cartItems.map((ci: any) => {
            const product = ci?.item?.product ?? {};
            const provider = ci?.item?.provider ?? {};
            const quantityFromItem = Number(ci?.count ?? product?.quantity?.count ?? 1) || 1;
            const priceValue = Number(product?.price?.value ?? 0) || 0;
            const subtotalValue = typeof product?.subtotal === 'number' ? product.subtotal : priceValue * quantityFromItem;

            return {
              id: ci?.item?.id ?? ci?.id ?? String(Date.now()),
              name: product?.descriptor?.name ?? 'Item',
              price: priceValue,
              quantity: quantityFromItem,
              category: product?.category_id ?? 'Uncategorized',
              image_url: extractFirstImageUrl(product),
              description: product?.descriptor?.short_desc ?? product?.descriptor?.long_desc,
              provider: {
                id: provider?.id ?? '',
                descriptor: { name: provider?.descriptor?.name ?? 'Unknown Provider' },
              },
              provider_id: provider?.id ?? '',
              location_id: product?.location_id ?? '',
              fulfillment_id: product?.fulfillment_id ?? '',
              subtotal: subtotalValue,
            };
          });

          normalizedCartSummary = {
            items: synthesizedItems,
            total_items: (response as any).cart_summary?.total_items ?? synthesizedItems.reduce((acc: number, it: any) => acc + (Number(it.quantity) || 0), 0),
            total_value: (response as any).cart_summary?.total_value ?? synthesizedItems.reduce((acc: number, it: any) => acc + (Number(it.subtotal) || 0), 0),
            is_empty: false,
          };
        } catch (e) {
          console.warn('⚠️ Failed to synthesize cart summary from cart_items:', e);
        }
      }

      // If still no items and nothing to show, just clean up and exit
      const hasItemsNow = Array.isArray(normalizedCartSummary?.items) && normalizedCartSummary.items.length > 0;
      if (!hasItemsNow) {
        removeThinkingMessages();
        // Don't set isLoading to false here - wait for stream complete
        return;
      }

      // Don't set isLoading to false here - wait for stream complete

      // Transform raw cart summary to CartContext format
      const cartContext = transformRawCartSummary(normalizedCartSummary);

      // Update cart state in header
      setCartState({
        itemCount: cartContext.total_items || 0,
        total: cartContext.total_value || 0,
      });

      // Create cart view message with stream ID
      const cartMessage: ChatMessage = {
        id: `raw_cart${Date.now()}`,
        type: 'bot_cart_view',
        cartContext: cartContext,
        streamId: currentStreamIdRef.current || undefined,
      };

      // Remove thinking/tool/chunk messages from current stream
      // AND ONLY cart views from the CURRENT stream (keep cart views from other streams)
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== activeChatId) return c;

          // Filter out:
          // 1. thinking/tool/chunk messages from current stream (they're temporary)
          // 2. ONLY bot_cart_view messages from the CURRENT stream (replace within stream)
          // 3. Keep bot_cart_view messages from OTHER streams (persist across API calls)
          const messagesWithoutDuplicates = c.messages.filter(
            (m) => {
              const isCurrentStreamTemporary = 
                (m.type === 'bot_thinking' || 
                 m.type === 'bot_tool_executing' || 
                 m.type === 'bot_conversation_chunk') &&
                m.streamId === currentStreamIdRef.current;
              
              const isCurrentStreamCartView = 
                m.type === 'bot_cart_view' && 
                m.streamId === currentStreamIdRef.current;
              
              return !isCurrentStreamTemporary && !isCurrentStreamCartView;
            }
          );

     

          return {
            ...c,
            messages: [...messagesWithoutDuplicates, cartMessage],
          };
        }),
      );

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
    setIsLoading(false);

    // Always remove all thinking messages when stream completes
    removeThinkingMessages();
  }, [removeThinkingMessages]);

  const { sendMessage: sendStreamMessage } = useChatStream({
    onThinking: handleThinking,
    onToolStart: handleToolStart,
    onConversationChunk: handleConversationChunk,
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
      // Generate a unique stream ID for this API call
      const newStreamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      currentStreamIdRef.current = newStreamId;
      
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

  // Initialize shopping session only once when component mounts and user is available
  useEffect(() => {
    const initializeSession = async () => {
      if (!hasInitialized.current && !userLoading && user?.uid) {
        hasInitialized.current = true;

        try {
          // Get or create device ID using browser fingerprinting
          const deviceId = await getOrCreateDeviceId();

          const initMessage = `initialize_shopping (userId: ${user.uid}, deviceid: ${deviceId})`;
          
          sendMessage(initMessage, false);
        } catch (error) {
          console.error('❌ Error initializing shopping session:', error);
          
          // Fallback to basic device ID if fingerprinting fails
          const fallbackDeviceId = localStorage.getItem('device_id') || `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          if (!localStorage.getItem('device_id')) {
            localStorage.setItem('device_id', fallbackDeviceId);
          }

          const initMessage = `initialize_shopping (userId: ${user.uid}, deviceid: ${fallbackDeviceId})`;
          
          sendMessage(initMessage, false);
        }
      }
    };

    initializeSession();
  }, [sendMessage, user, userLoading]); // Include user and userLoading in dependencies

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
