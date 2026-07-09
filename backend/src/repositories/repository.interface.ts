/**
 * Data-access contract consumed by the service layer. Concrete repositories
 * (Prisma-backed) implement this and return typed DTOs — never Prisma models.
 */
export interface Repository<T, C, U> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: C): Promise<T>;
  update(id: string, data: U): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}
