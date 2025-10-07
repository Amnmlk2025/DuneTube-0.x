export type Publisher = {
  slug: string;
  name: string;
  avatar_url?: string | null;
};

export type Teacher = {
  id: number;
  name: string;
  avatar_url?: string | null;
};

export type Course = {
  id: number;
  title: string;
  description: string;
  thumbnail_url?: string | null;
  publisher: Publisher;
  teacher: Teacher;
  price_amount: number | string;
  price_currency: string;
  language: string;
  tags: string[];
  participants_count: number;
  rating_avg: number | string;
  published_at: string;
};

export type PaginatedCourses = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Course[];
};
