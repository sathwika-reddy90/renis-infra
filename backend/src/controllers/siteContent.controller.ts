import { siteContentService } from "../services/siteContent.service";
import type { SiteContentUpdateInput } from "../types/siteContent";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

export const siteContentController = {
  get: asyncHandler(async (_req, res) => {
    const content = await siteContentService.get();
    res.json(ApiResponse.ok(content));
  }),

  update: asyncHandler(async (req, res) => {
    const content = await siteContentService.update(req.body as SiteContentUpdateInput);
    res.json(ApiResponse.ok(content, "Updated"));
  }),
};
