import { userService } from "../services/user.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

export const userController = {
  list: asyncHandler(async (_req, res) => {
    const users = await userService.list();
    res.json(ApiResponse.ok(users));
  }),
};
