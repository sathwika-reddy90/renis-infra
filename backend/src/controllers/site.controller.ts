import { siteService } from "../services/site.service";
import type { SiteSettingsUpdateInput } from "../types/site";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

export const siteController = {
  get: asyncHandler(async (_req, res) => {
    const settings = await siteService.get();
    res.json(ApiResponse.ok(settings));
  }),

  update: asyncHandler(async (req, res) => {
    const settings = await siteService.update(req.body as SiteSettingsUpdateInput);
    res.json(ApiResponse.ok(settings, "Updated"));
  }),
};
