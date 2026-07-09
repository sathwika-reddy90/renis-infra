import { Prisma, type Blog as BlogRow } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { PrismaRepository } from "./prisma.repository";
import { run } from "../utils/prismaError";
import { opt } from "../utils/optional";
import type { PageArgs } from "../utils/pagination";
import type { Blog, BlogCreateInput, BlogUpdateInput } from "../types/blog";

class BlogRepository extends PrismaRepository<BlogRow, Blog, BlogCreateInput, BlogUpdateInput> {
  protected readonly resource = "Blog";

  protected toDto(row: BlogRow): Blog {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      content: row.content,
      category: row.category,
      tags: row.tags,
      coverImage: row.coverImage,
      readTime: row.readTime,
      status: row.status,
      publishedAt: opt(row.publishedAt),
      metaTitle: opt(row.metaTitle),
      metaDescription: opt(row.metaDescription),
      keywords: row.keywords,
      authorId: opt(row.authorId),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  protected queryMany(args: PageArgs): Promise<BlogRow[]> {
    return prisma.blog.findMany({
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: args.skip,
      take: args.take,
    });
  }

  // GET /:id resolves either a cuid or a slug.
  protected queryOne(id: string): Promise<BlogRow | null> {
    return prisma.blog.findFirst({ where: { OR: [{ id }, { slug: id }] } });
  }

  protected insert(data: BlogCreateInput): Promise<BlogRow> {
    const create: Prisma.BlogUncheckedCreateInput = {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      tags: data.tags,
      coverImage: data.coverImage,
      readTime: data.readTime,
      status: data.status,
      publishedAt: data.publishedAt ?? undefined,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      keywords: data.keywords,
      authorId: data.authorId ?? undefined,
    };
    return prisma.blog.create({ data: create });
  }

  protected change(id: string, data: BlogUpdateInput): Promise<BlogRow> {
    const update: Prisma.BlogUncheckedUpdateInput = {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      tags: data.tags,
      coverImage: data.coverImage,
      readTime: data.readTime,
      status: data.status,
      publishedAt: data.publishedAt ?? undefined,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      keywords: data.keywords,
      authorId: data.authorId ?? undefined,
    };
    return prisma.blog.update({ where: { id }, data: update });
  }

  protected async remove(id: string): Promise<void> {
    await prisma.blog.delete({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Blog | null> {
    const row = await run(this.resource, () => prisma.blog.findUnique({ where: { slug } }));
    return row ? this.toDto(row) : null;
  }
}

export const blogRepository = new BlogRepository();
