import { Router, type RequestHandler } from "express";
import { propertyController } from "../controllers/property.controller";
import { createCrudController } from "../controllers/crud.controller";
import { propertyService } from "../services/property.service";
import { validate } from "../middleware/validate";
import {
  propertyCreateSchema,
  propertyListQuerySchema,
  propertyUpdateSchema,
} from "../types/property";

/**
 * Properties need richer reads than the generic CRUD router provides
 * (filtering, sorting, pagination, facets, related), so they get a dedicated
 * router. Writes still reuse the shared CRUD controller so create/update/
 * remove behave identically to every other resource.
 */
export function createPropertyRouter(guards: RequestHandler[]): Router {
  const crud = createCrudController(propertyService);
  const router = Router();

  // Public reads.
  router.get("/", validate(propertyListQuerySchema, "query"), propertyController.list);
  router.get("/facets", propertyController.facets);
  router.get("/:slug/related", propertyController.related);
  // Registered after the literal paths above so "facets" is never read as an id.
  router.get("/:id", propertyController.get);

  // Protected writes.
  router.post("/", ...guards, validate(propertyCreateSchema), crud.create);
  router.put("/:id", ...guards, validate(propertyUpdateSchema), crud.update);
  router.patch("/:id", ...guards, validate(propertyUpdateSchema), crud.update);
  router.delete("/:id", ...guards, crud.remove);

  return router;
}
