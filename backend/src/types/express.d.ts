import type { AuthUser } from "./auth";

// Augment Express so `req.user` is typed everywhere after authentication.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
