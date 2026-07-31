import { dehydrate, QueryClient, type DehydratedState } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { makeQueryClient } from "./queryClient";
import { fetchSiteContent } from "@/lib/api/siteContent";
import { fetchSiteSettings } from "@/lib/api/site";
import { fetchProjects } from "@/lib/api/properties";

/**
 * Server-side prefetch for the public site.
 *
 * Without this, every page painted skeletons first and crawlers saw an empty
 * shell — the sections are client components that fetch on mount. Prefetching
 * here and hydrating the cache means the initial HTML carries real content.
 *
 * `prefetchQuery` never throws, so a backend that is down at build time
 * degrades to the previous client-fetch behaviour rather than failing the
 * render.
 */
export async function prefetchSiteData(): Promise<DehydratedState> {
  const qc: QueryClient = makeQueryClient();

  await Promise.all([
    qc.prefetchQuery({
      queryKey: queryKeys.site.content(),
      queryFn: () => fetchSiteContent(),
    }),
    qc.prefetchQuery({
      queryKey: queryKeys.site.settings(),
      queryFn: () => fetchSiteSettings(),
    }),
    qc.prefetchQuery({
      queryKey: queryKeys.projects.list(),
      queryFn: () => fetchProjects(),
    }),
  ]);

  return dehydrate(qc);
}
