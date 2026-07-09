/** Prisma returns `null` for absent optionals; DTOs use `undefined`. */
export const opt = <T>(value: T | null): T | undefined => (value === null ? undefined : value);
