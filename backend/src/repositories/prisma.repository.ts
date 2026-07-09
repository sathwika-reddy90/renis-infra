import type { Repository } from "./repository.interface";
import { run, runNullable } from "../utils/prismaError";
import { toPageArgs, type PageArgs, type PaginationParams } from "../utils/pagination";

/**
 * Generic Prisma-backed CRUD base. Subclasses supply the raw model queries and
 * a row → DTO mapper; this base centralizes error handling, pagination and the
 * DTO conversion so no CRUD flow is duplicated across resources.
 *
 * `Row` is the Prisma model type and never leaves the repository — every public
 * method returns the typed DTO.
 */
export abstract class PrismaRepository<Row, DTO, CInput, UInput>
  implements Repository<DTO, CInput, UInput>
{
  protected abstract readonly resource: string;

  protected abstract toDto(row: Row): DTO;

  /** Sorted, paginated fetch of many rows. */
  protected abstract queryMany(args: PageArgs): Promise<Row[]>;
  /** Single lookup (by id, optionally falling back to slug). */
  protected abstract queryOne(id: string): Promise<Row | null>;
  protected abstract insert(data: CInput): Promise<Row>;
  protected abstract change(id: string, data: UInput): Promise<Row>;
  protected abstract remove(id: string): Promise<void>;

  async findAll(params?: PaginationParams): Promise<DTO[]> {
    const rows = await run(this.resource, () => this.queryMany(toPageArgs(params)));
    return rows.map((row) => this.toDto(row));
  }

  async findById(id: string): Promise<DTO | null> {
    const row = await run(this.resource, () => this.queryOne(id));
    return row ? this.toDto(row) : null;
  }

  async create(data: CInput): Promise<DTO> {
    const row = await run(this.resource, () => this.insert(data));
    return this.toDto(row);
  }

  async update(id: string, data: UInput): Promise<DTO | null> {
    const row = await runNullable(this.resource, () => this.change(id, data));
    return row ? this.toDto(row) : null;
  }

  async delete(id: string): Promise<boolean> {
    const done = await runNullable(this.resource, async () => {
      await this.remove(id);
      return true;
    });
    return done === true;
  }
}
