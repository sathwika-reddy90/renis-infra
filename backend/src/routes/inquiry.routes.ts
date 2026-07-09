import { Router } from "express";
import { inquiryController } from "../controllers/inquiry.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { inquiryCreateSchema, inquiryUpdateSchema } from "../types/inquiry";

// Leads (inquiries): the public contact / "Schedule a Visit" forms may POST;
// everything else is the CRM surface, admin-only.
export const inquiryRoutes = Router();

const readGuard = [authenticate, authorize("inquiries", "read")];
const writeGuard = [authenticate, authorize("inquiries", "write")];

inquiryRoutes.get("/", ...readGuard, inquiryController.list);
inquiryRoutes.get("/:id", ...readGuard, inquiryController.get);
inquiryRoutes.get("/:id/history", ...readGuard, inquiryController.history);
inquiryRoutes.post("/", validate(inquiryCreateSchema), inquiryController.create);
inquiryRoutes.put("/:id", ...writeGuard, validate(inquiryUpdateSchema), inquiryController.update);
inquiryRoutes.patch("/:id", ...writeGuard, validate(inquiryUpdateSchema), inquiryController.update);
inquiryRoutes.delete("/:id", ...writeGuard, inquiryController.remove);
