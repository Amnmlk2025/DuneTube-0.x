import type { Course, PaginatedCourses } from "../types/course";
import type { Lesson } from "../types/lesson";
import type { Review } from "../types/review";

const DEFAULT_API_BASE = "http://127.0.0.1:8000/api";

const normalizeBase = (value: string | undefined): string => {
  const base = value && value.trim().length > 0 ? value.trim() : DEFAULT_API_BASE;
  return base.replace(/\/+$/, "");
};

const API_BASE = normalizeBase(import.meta.env.VITE_API_BASE);

type RequestOptions = Omit<RequestInit, "method">;

const buildUrl = (
  path: string,
  searchParams?: Record<string, string | number | boolean | undefined>,
): URL => {
  const normalizedPath = path.replace(/^\//, "");
  const url = new URL(`${API_BASE}/${normalizedPath}`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }
  return url;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    throw error;
  }
  return (await response.json()) as T;
};

const fetchJson = async <T>(input: string | URL, options?: RequestOptions): Promise<T> => {
  const response = await fetch(input, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });
  return handleResponse<T>(response);
};

const getHealth = async (options?: RequestOptions): Promise<{ ok: boolean; service: string }> => {
  const url = buildUrl("healthz/");
  return fetchJson(url.toString(), options);
};

type CourseQuery = {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
};

const listCourses = async (
  query?: CourseQuery,
  options?: RequestOptions,
): Promise<PaginatedCourses> => {
  const url = buildUrl("courses/", query);
  return fetchJson<PaginatedCourses>(url.toString(), options);
};

const getCourse = async (courseId: string | number, options?: RequestOptions): Promise<Course> => {
  const url = buildUrl(`courses/${courseId}/`);
  return fetchJson<Course>(url.toString(), options);
};

const listLessons = async (
  courseId: string | number,
  options?: RequestOptions,
): Promise<Lesson[]> => {
  const url = buildUrl("lessons/", { course: courseId, ordering: "order" });
  const payload = await fetchJson<Lesson[] | { results: Lesson[] }>(url.toString(), options);
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.results)) {
    return payload.results;
  }
  return [];
};

const listCourseReviews = async (
  courseId: string | number,
  options?: RequestOptions,
): Promise<Review[]> => {
  const url = buildUrl(`courses/${courseId}/reviews/`);
  const payload = await fetchJson<Review[] | { results: Review[] }>(url.toString(), options);
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.results)) {
    return payload.results;
  }
  return [];
};

export {
  API_BASE,
  getCourse,
  getHealth,
  listCourseReviews,
  listCourses,
  listLessons,
};
export type { CourseQuery };
