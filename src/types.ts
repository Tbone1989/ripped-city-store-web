export interface Product {
  id: string;
  handle: string;
  title: string;
  price: number;
  image?: string;
  images: string[];
  category: string;
  sizes?: string[];
  colors?: string[];
  description: string;
}
