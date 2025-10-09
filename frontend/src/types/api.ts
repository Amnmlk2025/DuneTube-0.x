type ApiListResponse<T> = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
};

type ApiErrorPayload = {
  detail?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
};

class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export type { ApiErrorPayload, ApiListResponse };
export { ApiError };
