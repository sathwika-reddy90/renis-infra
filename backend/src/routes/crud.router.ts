import { Router, type RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import type { BaseService } from "../services/base.service";
import type { BaseEntity } from "../types/common";
import { createCrudController } from "../controllers/crud.controller";
import { validate } from "../middleware/validate";

interface CrudOptions {
  create?: ZodTypeAny;
  update?: ZodTypeAny;
  /** Auth/authorization middleware per operation. Omitted = public. */
  guards?: {
    read?: RequestHandler[];
    create?: RequestHandler[];
    update?: RequestHandler[];
    remove?: RequestHandler[];
  };
}

/** Standard REST router: list, get, create, update (PUT/PATCH), remove. */
export function createCrudRouter<T extends BaseEntity, C, U>(
  service: BaseService<T, C, U>,
  options: CrudOptions = {},
): Router {
  const controller = createCrudController(service);
  const router = Router();
  const g = options.guards ?? {};

  const read = g.read ?? [];
  const createGuards = [...(g.create ?? []), ...(options.create ? [validate(options.create)] : [])];
  const updateGuards = [...(g.update ?? []), ...(options.update ? [validate(options.update)] : [])];
  const removeGuards = g.remove ?? [];

  router.get("/", ...read, controller.list);
  router.get("/:id", ...read, controller.get);
  router.post("/", ...createGuards, controller.create);
  router.put("/:id", ...updateGuards, controller.update);
  router.patch("/:id", ...updateGuards, controller.update);
  router.delete("/:id", ...removeGuards, controller.remove);

  return router;
}
