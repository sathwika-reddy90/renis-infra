import { Router } from "express";
import { mediaController } from "../controllers/media.controller";
import { upload } from "../middleware/upload";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { mediaListQuerySchema, mediaRenameSchema } from "../types/media";

// Media library is admin-only end to end (no public reads).
export const mediaRoutes = Router();

const readGuard = [authenticate, authorize("media", "read")];
const writeGuard = [authenticate, authorize("media", "write")];

mediaRoutes.get("/", ...readGuard, validate(mediaListQuerySchema, "query"), mediaController.list);
mediaRoutes.get("/:id", ...readGuard, mediaController.get);
mediaRoutes.post("/upload", ...writeGuard, upload.array("files", 20), mediaController.upload);
mediaRoutes.patch("/:id/rename", ...writeGuard, validate(mediaRenameSchema), mediaController.rename);
mediaRoutes.put("/:id/replace", ...writeGuard, upload.single("file"), mediaController.replace);
mediaRoutes.delete("/:id", ...writeGuard, mediaController.remove);
