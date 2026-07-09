import { mediaService } from "../services/media.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import type { MediaListQuery, MediaRenameInput } from "../types/media";

export const mediaController = {
  list: asyncHandler(async (req, res) => {
    const result = await mediaService.list(req.query as unknown as MediaListQuery);
    res.json(
      ApiResponse.ok(result.items, undefined, {
        total: result.total,
        page: result.page,
        limit: result.limit,
      }),
    );
  }),

  get: asyncHandler(async (req, res) => {
    const item = await mediaService.get(req.params.id);
    res.json(ApiResponse.ok(item));
  }),

  upload: asyncHandler(async (req, res) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const single = req.file as Express.Multer.File | undefined;
    const all = single ? [single] : files;

    if (all.length === 0) throw ApiError.badRequest("No file provided");

    const created =
      all.length === 1 ? [await mediaService.upload(all[0])] : await mediaService.uploadMany(all);

    res.status(201).json(ApiResponse.ok(created, "Uploaded"));
  }),

  rename: asyncHandler(async (req, res) => {
    const { fileName } = req.body as MediaRenameInput;
    const updated = await mediaService.rename(req.params.id, fileName);
    res.json(ApiResponse.ok(updated, "Renamed"));
  }),

  replace: asyncHandler(async (req, res) => {
    const file = req.file as Express.Multer.File | undefined;
    if (!file) throw ApiError.badRequest("No file provided");
    const updated = await mediaService.replace(req.params.id, file);
    res.json(ApiResponse.ok(updated, "Replaced"));
  }),

  remove: asyncHandler(async (req, res) => {
    await mediaService.remove(req.params.id);
    res.status(204).send();
  }),
};
