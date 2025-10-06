export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  provider: {
    id: string;
    name: string;
    delivery_available: boolean;
  };
  images: string[];
};
