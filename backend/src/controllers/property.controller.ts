import { propertyService } from "../services/property.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import type { PropertyListQuery } from "../types/property";

/**
 * Dedicated read handlers for properties. The generic CRUD controller still
 * owns create/update/remove; list and get are overridden here so the public
 * site can filter, sort and paginate server-side instead of downloading the
 * whole table and filtering in the browser.
 */
export const propertyController = {
  list: asyncHandler(async (req, res) => {
    const result = await propertyService.search(req.query as unknown as PropertyListQuery);
    res.json(
      ApiResponse.ok(result.items, undefined, {
        total: result.total,
        page: result.page,
        limit: result.limit,
      }),
    );
  }),

  /** Accepts either a cuid or a slug — the repository resolves both. */
  get: asyncHandler(async (req, res) => {
    const item = await propertyService.get(req.params.id);
    res.json(ApiResponse.ok(item));
  }),

  related: asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 3;
    const items = await propertyService.related(req.params.slug, limit);
    res.json(ApiResponse.ok(items, undefined, { total: items.length }));
  }),

  /** Distinct filter options, derived from live data rather than a static list. */
  facets: asyncHandler(async (_req, res) => {
    const facets = await propertyService.facets();
    res.json(ApiResponse.ok(facets));
  }),
};
