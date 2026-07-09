import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

// Read-only directory (id/name/email/role) for admin pickers, e.g. lead
// assignment. Full user management is out of scope.
export const userRoutes = Router();

userRoutes.get("/", authenticate, authorize("users", "read"), userController.list);
