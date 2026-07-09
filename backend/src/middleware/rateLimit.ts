import rateLimit from "express-rate-limit";
import { ApiResponse } from "../utils/ApiResponse";

/** Throttles credential-guessing on the login endpoint. */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(ApiResponse.fail("Too many login attempts. Please try again later."));
  },
});
