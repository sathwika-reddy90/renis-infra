/** Operational HTTP error carrying a status code and optional details. */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;
  readonly isOperational: boolean;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message = "Bad Request", details?: unknown): ApiError {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Unauthorized", details?: unknown): ApiError {
    return new ApiError(401, message, details);
  }

  static forbidden(message = "Forbidden", details?: unknown): ApiError {
    return new ApiError(403, message, details);
  }

  static notFound(message = "Not Found", details?: unknown): ApiError {
    return new ApiError(404, message, details);
  }

  static conflict(message = "Conflict", details?: unknown): ApiError {
    return new ApiError(409, message, details);
  }

  static internal(message = "Internal Server Error", details?: unknown): ApiError {
    return new ApiError(500, message, details);
  }
}
