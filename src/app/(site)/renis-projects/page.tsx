import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Renies Projects",
};

/**
 * Placeholder route for the "Renies Projects" nav item.
 *
 * Intentionally empty — the only markup is a spacer tall enough to hold the
 * footer below the fixed header, so the page doesn't collapse under the
 * navbar while it has no content. Build the section out here.
 */
export default function RenisProjectsPage() {
  return <section className="min-h-[60vh]" />;
}
