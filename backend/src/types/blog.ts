import { z } from "zod";
import type { BaseEntity } from "./common";
import { BlogStatusSchema } from "./enums";

export const blogCreateSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string(),
  content: z.string(),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().url(),
  readTime: z.string(),
  status: BlogStatusSchema.default("DRAFT"),
  publishedAt: z.coerce.date().nullable().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  authorId: z.string().nullable().optional(),
});

export const blogUpdateSchema = blogCreateSchema.partial();

export type BlogCreateInput = z.infer<typeof blogCreateSchema>;
export type BlogUpdateInput = z.infer<typeof blogUpdateSchema>;
export type Blog = BlogCreateInput & BaseEntity;
