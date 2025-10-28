/* eslint-disable @typescript-eslint/no-explicit-any */
import { Product } from './product';

// Chat API Response Structure
export type ChatApiResponse = {
  response: string;
  session_id: string;
  device_id: string;
  timestamp: string;
  data?: {
    success?: boolean;
    message?: string;
    session?: {
      session_id: string;
    };
    products?: Product[];
    total_results?: number;
    search_type?: string;
    page?: number;
    page_size?: number;
    cart_context?: CartContext;
    journey_context?: JourneyContext;
    quote_data?: QuoteData;
    payment_data?: PaymentData;
    order_data?: OrderData;
    simple_data?: SimpleData;
    full_data?: FullData;
  };
  context_type?: ContextType;
  action_required?: boolean;
  tools_called?: string[];
  agent_thoughts?: string | null;
};

// Context Types
export type ContextType =
  | 'success_message'
  | 'search_results'
  | 'cart_view'
  | 'checkout_stage'
  | 'error_message'
  | 'order_confirmation';

// Journey Context
export type JourneyContext = {
  stage: JourneyStage;
  next_operations?: string[];
  ready_for_checkout?: boolean;
  ready_for_init?: boolean;
  ready_for_payment?: boolean;
  ready_for_confirm?: boolean;
  order_complete?: boolean;
};

export type JourneyStage =
  | 'none'
  | 'search_completed'
  | 'item_added'
  | 'cart_viewed'
  | 'delivery_quotes_received'
  | 'order_initialized'
  | 'payment_created'
  | 'order_confirmed';

// Cart Context
export type CartContext = {
  items?: CartItem[];
  total_items?: number;
  total_value?: number;
  is_empty?: boolean;
  ready_for_checkout?: boolean;
  providers?: string[];
  provider_count?: number;
  contains_required_fields?: boolean;
  operation_success?: boolean;
  item_added?: boolean;
};

export type CartItem = {
  id: string;
  local_id?: string;
  name: string;
  quantity: number;
  price: number;
  total_price: number;
  provider_id: string;
  provider_name: string;
  location_id: string;
  fulfillment_id: string;
  category: string;
  currency: string;
  image_url?: string;
};

// Quote Data
export type QuoteData = {
  providers?: QuoteProvider[];
  total_value?: number;
  total_delivery?: number;
  items?: QuoteItem[];
  fulfillments?: Fulfillment[];
  raw_quotes?: any[];
};

export type QuoteProvider = {
  id: string;
  name: string;
  locations?: Array<{ id: string }>;
  items?: QuoteItem[];
  total_value?: number;
  delivery_charges?: number;
  currency?: string;
};

export type QuoteItem = {
  id: string;
  title: string;
  quantity: number;
  price: number;
  currency: string;
};

export type Fulfillment = {
  id: string;
  provider_name: string;
  type: string;
  category: string;
  tat: string;
  tracking: boolean;
};

// Payment Data
export type PaymentData = {
  payment_id: string;
  order_id?: string;
  amount: number;
  currency: string;
  status: string;
};

// Order Data
export type OrderData = {
  order_id: string;
  status: string;
  total_amount: number;
  currency: string;
  customer_name: string;
  delivery_address: string;
  ready_for_payment?: boolean;
};

// Simple Data
export type SimpleData = {
  quotes_context?: {
    delivery_options?: any[];
    total_options?: number;
    available?: boolean;
    message?: string;
  };
  order_context?: OrderData;
  payment_context?: {
    payment_id: string;
    amount: number;
    status: string;
    ready_for_confirm?: boolean;
    is_mock?: boolean;
  };
  confirm_context?: {
    order_id: string;
    order_confirmed: boolean;
    total_amount: number;
    order_status: string;
    ready_for_tracking?: boolean;
  };
  stage?: string;
  next_step?: string;
  next_actions?: any;
};

// Full Data
export type FullData = {
  quote_data?: QuoteData;
  init_data?: any;
  payment_data?: PaymentData;
  order_details?: any;
  confirm_data?: any;
};

// Enhanced Chat Message Types
export type ChatMessage =
  | { id: string; type: 'user' | 'bot'; content: string; streamId?: string }
  | { id: string; type: 'bot_thinking'; content: string; streamId?: string }
  | { id: string; type: 'bot_tool_executing'; tool: string; status: string; streamId?: string }
  | { id: string; type: 'bot_conversation_chunk'; content: string; stage?: string; streamId?: string }
  | { id: string; type: 'bot_product_list'; products: Product[]; streamId?: string }
  | { id: string; type: 'bot_cart_view'; cartContext: CartContext; streamId?: string }
  | { id: string; type: 'bot_checkout_stage'; quoteData: QuoteData; journeyContext: JourneyContext; streamId?: string }
  | { id: string; type: 'bot_error'; error: ErrorData; streamId?: string }
  | { id: string; type: 'bot_order_confirmation'; orderData: OrderData; streamId?: string }
  | { id: string; type: 'bot_success'; message: string; nextOperations?: string[]; streamId?: string }
  | {
      id: string;
      type: 'bot_payment_initiated';
      orderId: string;
      amount: number;
      currency: string;
      streamId?: string;
    };

export type ErrorData = {
  success: boolean;
  error_type: string;
  recovery_action?: string;
  retry_possible?: boolean;
  message: string;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
};

// SSE Streaming Response Types
export type StreamingResponse =
  | {
      type: 'thinking';
      message: string;
      timestamp?: string;
      session_id?: string;
    }
  | {
      type: 'conversation_chunk';
      message: string;
      session_id?: string;
      stage?: string;
      timestamp?: string;
    }
  | {
      type: 'tool_start';
      tool: string;
      status: string;
      session_id?: string;
      timestamp?: string;
    }
  | {
      type: 'response';
      content: string;
      session_id?: string;
      timestamp?: string;
      complete?: boolean;
      data?: ChatApiResponse['data'];
      context_type?: ContextType;
    }
  | {
      type: 'raw_products';
      tool_name?: string;
      session_id?: string;
      raw_data?: boolean;
      biap_specifications?: boolean;
      timestamp?: string;
      products: RawProduct[];
      total_results?: number;
      search_type?: string;
      page?: number;
      page_size?: number;
    }
  | {
      type: 'raw_cart';
      tool_name?: string;
      session_id?: string;
      raw_data?: boolean;
      biap_specifications?: boolean;
      timestamp?: string;
      cart_items: RawCartItem[];
      cart_summary: RawCartSummary;
    };

// Raw Product Type from BIAP API
// Note: API returns inconsistent structures, so most fields are optional
export type RawProduct = {
  item_details?: {
    id?: string;
    descriptor?: {
      name?: string;
      short_desc?: string;
      long_desc?: string;
      images?: string[];
    };
    price?: {
      currency?: string;
      value: number;
      maximum_value?: string;
    };
    category_id?: string;
    location_id?: string;
    fulfillment_id?: string;
  };
  provider_details?: {
    id: string;
    descriptor?: {
      name?: string;
    };
  };
  location_details?: {
    id: string;
  };
  id: string;
  name?: string;
  description?: string;
  long_description?: string;
  price?: {
    currency?: string;
    value: number;
  };
  currency?: string;
  images?: string[];
  category?: string;
  provider_id?: string;
  provider_name?: string;
  provider_location?: string;
  returnable?: boolean;
  cod_available?: boolean;
  available?: boolean;
};

// Raw Cart Types from BIAP API
export type RawCartItem = {
  _id: string;
  item_id: string;
  id: string;
  provider_id: string;
  count: number;
  item: {
    id: string;
    product: {
      descriptor: {
        name: string;
        images?: string[];
      };
      price: {
        currency: string;
        value: number;
      };
      category_id: string;
    };
    provider: {
      id: string;
      descriptor: {
        name: string;
      };
    };
  };
};

export type RawCartSummary = {
  items?: RawCartSummaryItem[];
  total_items?: number;
  total_value?: number;
  is_empty?: boolean;
};

export type RawCartSummaryItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image_url?: string;
  description?: string;
  provider?: {
    id: string;
    local_id?: string;
    locations?: string[];
    descriptor?: {
      name: string;
    };
  };
  provider_id: string;
  location_id: string;
  fulfillment_id: string;
  subtotal: number;
};
