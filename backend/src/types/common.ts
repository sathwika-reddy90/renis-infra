/** Fields present on every persisted record. */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Keys managed by the persistence layer (never accepted as input). */
export type EntityKeys = keyof BaseEntity;
