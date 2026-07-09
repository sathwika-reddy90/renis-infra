import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import { ApiError } from "../utils/ApiError";

type Target = "body" | "query" | "params";

/** Reusable validation middleware — parses & replaces the request target. */
export function validate(schema: ZodTypeAny, target: Target = "body"): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      next(ApiError.badRequest("Validation failed", result.error.flatten()));
      return;
    }
    // Assign parsed (and coerced) data back for typed downstream use.
    req[target] = result.data;
    next();
  };
}
