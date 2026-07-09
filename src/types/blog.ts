import type { SEO } from "./property";

export interface BlogAuthor {
  name: string;
  role?: string;
  avatar?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: BlogAuthor;
  coverImage: string;
  readTime: string;
  published: boolean;
  publishedAt: string;
  seo: SEO;
  createdAt: string;
  updatedAt: string;
}
