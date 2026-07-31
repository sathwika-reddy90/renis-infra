import type { Metadata } from "next";
import BlogListingContent from "@/components/BlogListingContent";

export const metadata: Metadata = {
  title: "Blog",
  description: "News, launches and insights from RENISINFRA.",
};

export default function BlogPage() {
  return <BlogListingContent />;
}
