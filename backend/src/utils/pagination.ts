export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PageArgs {
  skip: number;
  take: number;
}

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 200;

/** Normalizes page/limit into Prisma `skip`/`take`. */
export function toPageArgs(params: PaginationParams = {}): PageArgs {
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(params.limit ?? DEFAULT_LIMIT)));
  return { skip: (page - 1) * limit, take: limit };
}
