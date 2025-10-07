export type Lesson = {
  id: number;
  course: number;
  order: number;
  title: string;
  description: string;
  video_url?: string | null;
  duration_seconds: number;
  is_free_preview: boolean;
  created_at: string;
  updated_at: string;
};
