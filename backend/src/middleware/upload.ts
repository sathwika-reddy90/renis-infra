import multer from "multer";
import { env } from "../config/env";

// Files are buffered in memory; MediaService validates type/size and hands the
// buffer to the StorageProvider, keeping multer decoupled from storage mechanics.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024 },
});
