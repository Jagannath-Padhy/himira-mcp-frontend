import { Product } from './product';

export type ChatMessage =
  | { id: string; type: 'user' | 'bot'; content: string }
  | { id: string; type: 'bot_product_list'; products: Product[] };

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
};
