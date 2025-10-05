export type Course = {
  id: number;
  title: string;
  description: string;
  price_amount: number | string;
  price_currency: string;
  language: string;
  tags: string[];
  thumbnail_url?: string;
  publisher: string;
  created_at: string;
  updated_at: string;
};
