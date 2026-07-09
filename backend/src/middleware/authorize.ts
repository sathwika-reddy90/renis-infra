import type { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";
import { can, type Action, type Resource } from "../types/auth";
import { currentUser } from "./authenticate";

/**
 * Requires a role permitted to perform `action` on `resource`.
 * Must run after `authenticate`. Users forced to change their password are
 * blocked from everything except the change-password flow.
 */
export function authorize(resource: Resource, action: Action): RequestHandler {
  return (req, _res, next) => {
    const user = currentUser(req);
    if (user.mustChangePassword) {
      next(ApiError.forbidden("Password change required before continuing"));
      return;
    }
    if (!can(user.role, resource, action)) {
      next(ApiError.forbidden("You do not have permission to perform this action"));
      return;
    }
    next();
  };
}
