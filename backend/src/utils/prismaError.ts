import { Prisma } from "@prisma/client";
import { ApiError } from "./ApiError";
import { logger } from "./logger";

/** Translate a Prisma error into a typed ApiError with the right status. */
export function toApiError(error: unknown, resource = "Resource"): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2025": // Record not found (update/delete target missing)
        return ApiError.notFound(`${resource} not found`);
      case "P2002": {
        // Unique constraint violation
        const target = error.meta?.target;
        const fields = Array.isArray(target) ? target.join(", ") : String(target ?? "field");
        return ApiError.conflict(`A ${resource} with this ${fields} already exists`);
      }
      case "P2003": // Foreign key constraint violation
        return ApiError.badRequest(`Related record does not exist for this ${resource}`);
      case "P2000": // Value too long for column
        return ApiError.badRequest(`A value is too long for this ${resource}`);
      default:
        logger.error(`Prisma error ${error.code}`, error.message);
        return ApiError.internal("Database request failed");
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return ApiError.badRequest("Invalid data supplied to the database layer");
  }

  logger.error("Unexpected database error", error);
  return ApiError.internal("Database failure");
}

/** Runs a data-access call, normalizing failures into ApiError. */
export async function run<T>(resource: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw toApiError(error, resource);
  }
}

/**
 * Like {@link run} but converts a "record not found" (P2025) into `null`,
 * letting the service layer raise its own labelled 404 on update/delete.
 */
export async function runNullable<T>(resource: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return null;
    }
    throw toApiError(error, resource);
  }
}
