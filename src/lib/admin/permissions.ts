// Mirrors the backend RBAC matrix (backend remains the source of truth /
// enforcement point; this drives nav gating + client-side guards only).

export const ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"] as const;
export type Role = (typeof ROLES)[number];

export type Resource =
  | "properties"
  | "gallery"
  | "blogs"
  | "team"
  | "testimonials"
  | "faqs"
  | "amenities"
  | "offers"
  | "inquiries"
  | "settings"
  | "users"
  | "media";

export type Action = "read" | "write";

const WRITE_ACCESS: Record<Role, Resource[] | "*"> = {
  SUPER_ADMIN: "*",
  ADMIN: [
    "properties",
    "gallery",
    "blogs",
    "team",
    "testimonials",
    "faqs",
    "amenities",
    "offers",
    "inquiries",
    "settings",
    "media",
  ],
  EDITOR: ["properties", "gallery", "blogs", "faqs", "testimonials", "offers", "media"],
};

const READ_ACCESS: Record<Role, Resource[] | "*"> = {
  SUPER_ADMIN: "*",
  ADMIN: "*",
  EDITOR: ["properties", "gallery", "blogs", "faqs", "testimonials", "team", "amenities", "media"],
};

export function can(role: Role, resource: Resource, action: Action): boolean {
  const table = action === "write" ? WRITE_ACCESS : READ_ACCESS;
  const allowed = table[role];
  return allowed === "*" || allowed.includes(resource);
}

export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
};

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  mustChangePassword: boolean;
}
