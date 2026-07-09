import type { Repository } from "../repositories/repository.interface";
import type { BaseEntity } from "../types/common";
import { ApiError } from "../utils/ApiError";

/**
 * Generic CRUD service. Holds no business rules yet — it simply enforces
 * existence and delegates persistence to the repository.
 */
export class BaseService<T extends BaseEntity, C, U> {
  constructor(
    protected readonly repository: Repository<T, C, U>,
    protected readonly label: string,
  ) {}

  list(): Promise<T[]> {
    return this.repository.findAll();
  }

  async get(id: string): Promise<T> {
    const item = await this.repository.findById(id);
    if (!item) throw ApiError.notFound(`${this.label} not found`);
    return item;
  }

  create(data: C): Promise<T> {
    return this.repository.create(data);
  }

  async update(id: string, data: U): Promise<T> {
    const item = await this.repository.update(id, data);
    if (!item) throw ApiError.notFound(`${this.label} not found`);
    return item;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw ApiError.notFound(`${this.label} not found`);
  }
}
