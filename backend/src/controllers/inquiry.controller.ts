import { inquiryService } from "../services/inquiry.service";
import { currentUser } from "../middleware/authenticate";
import type { InquiryCreateInput, InquiryUpdateInput } from "../types/inquiry";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

export const inquiryController = {
  list: asyncHandler(async (_req, res) => {
    const items = await inquiryService.list();
    res.json(ApiResponse.ok(items, undefined, { total: items.length }));
  }),

  get: asyncHandler(async (req, res) => {
    const item = await inquiryService.get(req.params.id);
    res.json(ApiResponse.ok(item));
  }),

  create: asyncHandler(async (req, res) => {
    const created = await inquiryService.create(req.body as InquiryCreateInput);
    res.status(201).json(ApiResponse.ok(created, "Created"));
  }),

  update: asyncHandler(async (req, res) => {
    const actor = currentUser(req);
    const updated = await inquiryService.update(req.params.id, req.body as InquiryUpdateInput, actor.id);
    res.json(ApiResponse.ok(updated, "Updated"));
  }),

  remove: asyncHandler(async (req, res) => {
    await inquiryService.remove(req.params.id);
    res.status(204).send();
  }),

  history: asyncHandler(async (req, res) => {
    const entries = await inquiryService.history(req.params.id);
    res.json(ApiResponse.ok(entries));
  }),
};
