import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { loginRateLimiter } from "../middleware/rateLimit";
import { loginSchema, changePasswordSchema } from "../types/auth";

export const authRoutes = Router();

authRoutes.post("/login", loginRateLimiter, validate(loginSchema), authController.login);
authRoutes.post("/refresh", authController.refresh);
authRoutes.post("/logout", authController.logout);
authRoutes.get("/me", authenticate, authController.me);
authRoutes.put(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);
