import { userRepository, type UserSummary } from "../repositories/user.repository";

/** Read-only directory service (assignment pickers), not full user management. */
class UserService {
  list(): Promise<UserSummary[]> {
    return userRepository.listActive();
  }
}

export const userService = new UserService();
