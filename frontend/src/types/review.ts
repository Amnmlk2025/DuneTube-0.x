export type ReviewUser = {
  id: number;
  username: string;
  first_name?: string | null;
  last_name?: string | null;
};

export type Review = {
  id: number;
  course: number;
  rating: number;
  text: string;
  created_at: string;
  user: ReviewUser;
};
