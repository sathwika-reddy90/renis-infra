import type { RequestHandler } from "express";
import type { BaseService } from "../services/base.service";
import type { BaseEntity } from "../types/common";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

export interface CrudController {
  list: RequestHandler;
  get: RequestHandler;
  create: RequestHandler;
  update: RequestHandler;
  remove: RequestHandler;
}

/**
 * Builds standard CRUD handlers for any service. Bodies are already validated
 * by the route's validation middleware, so casts here are safe.
 */
export function createCrudController<T extends BaseEntity, C, U>(
  service: BaseService<T, C, U>,
): CrudController {
  return {
    list: asyncHandler(async (_req, res) => {
      const items = await service.list();
      res.json(ApiResponse.ok(items, undefined, { total: items.length }));
    }),

    get: asyncHandler(async (req, res) => {
      const item = await service.get(req.params.id);
      res.json(ApiResponse.ok(item));
    }),

    create: asyncHandler(async (req, res) => {
      const created = await service.create(req.body as C);
      res.status(201).json(ApiResponse.ok(created, "Created"));
    }),

    update: asyncHandler(async (req, res) => {
      const updated = await service.update(req.params.id, req.body as U);
      res.json(ApiResponse.ok(updated, "Updated"));
    }),

    remove: asyncHandler(async (req, res) => {
      await service.remove(req.params.id);
      res.status(204).send();
    }),
  };
}
