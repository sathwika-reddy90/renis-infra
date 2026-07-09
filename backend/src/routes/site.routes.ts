import { Router } from "express";
import { siteController } from "../controllers/site.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { siteSettingsUpdateSchema } from "../types/site";

// Site settings is a singleton: public read, protected write.
export const siteRoutes = Router();

const writeSettings = [authenticate, authorize("settings", "write")];

siteRoutes.get("/", siteController.get);
siteRoutes.put("/", ...writeSettings, validate(siteSettingsUpdateSchema), siteController.update);
siteRoutes.patch("/", ...writeSettings, validate(siteSettingsUpdateSchema), siteController.update);
