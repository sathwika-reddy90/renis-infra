import { Router } from "express";
import { siteContentController } from "../controllers/siteContent.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { siteContentUpdateSchema } from "../types/siteContent";

// Marketing copy is a singleton: public read (the site renders it), protected
// write. Guarded by the same `settings` resource as SiteSettings.
export const siteContentRoutes = Router();

const writeContent = [authenticate, authorize("settings", "write")];

siteContentRoutes.get("/", siteContentController.get);
siteContentRoutes.put(
  "/",
  ...writeContent,
  validate(siteContentUpdateSchema),
  siteContentController.update,
);
siteContentRoutes.patch(
  "/",
  ...writeContent,
  validate(siteContentUpdateSchema),
  siteContentController.update,
);
