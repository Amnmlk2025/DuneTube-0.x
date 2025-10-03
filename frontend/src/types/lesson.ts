export type LessonProgress = {
  last_position: number;
  updated_at: string | null;
};

export type Lesson = {
  id: number;
  course: number;
  title: string;
  description: string;
  video_url?: string | null;
  stream_url?: string | null;
  duration_seconds: number;
  position: number;
  created_at: string;
  updated_at: string;
  progress: LessonProgress;
};

export type LessonNote = {
  id: number;
  lesson: number;
  lesson_title: string;
  body: string;
  timestamp?: number | null;
  created_at: string;
  updated_at: string;
};
