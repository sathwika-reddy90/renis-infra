export interface SuccessBody<T> {
  success: true;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ErrorBody {
  success: false;
  message: string;
  details?: unknown;
}

/** Consistent envelope for all API responses. */
export const ApiResponse = {
  ok<T>(data: T, message?: string, meta?: Record<string, unknown>): SuccessBody<T> {
    return { success: true, message, data, meta };
  },
  fail(message: string, details?: unknown): ErrorBody {
    return { success: false, message, details };
  },
};
