import { z } from "zod";

export const ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"] as const;
export type Role = (typeof ROLES)[number];

/** Resources the RBAC layer can guard. */
export const RESOURCES = [
  "properties",
  "gallery",
  "blogs",
  "team",
  "testimonials",
  "faqs",
  "amenities",
  "inquiries",
  "settings",
  "users",
  "media",
] as const;
export type Resource = (typeof RESOURCES)[number];

export type Action = "read" | "write";

/** The authenticated principal attached to each request. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  mustChangePassword: boolean;
}

/**
 * Write permissions per role. `"*"` means every resource. This is the single
 * source of truth for authorization — the frontend mirrors it for nav gating.
 */
const WRITE_ACCESS: Record<Role, readonly Resource[] | "*"> = {
  SUPER_ADMIN: "*",
  ADMIN: [
    "properties",
    "gallery",
    "blogs",
    "team",
    "testimonials",
    "faqs",
    "amenities",
    "inquiries",
    "settings",
    "media",
  ],
  EDITOR: ["properties", "gallery", "blogs", "faqs", "testimonials", "media"],
};

/**
 * Read permissions for admin-only resources (public reads bypass auth entirely).
 * Content resources are world-readable, so only sensitive ones are listed.
 */
const READ_ACCESS: Record<Role, readonly Resource[] | "*"> = {
  SUPER_ADMIN: "*",
  ADMIN: "*",
  EDITOR: ["properties", "gallery", "blogs", "faqs", "testimonials", "team", "amenities", "media"],
};

export function can(role: Role, resource: Resource, action: Action): boolean {
  const table = action === "write" ? WRITE_ACCESS : READ_ACCESS;
  const allowed = table[role];
  return allowed === "*" || allowed.includes(resource);
}

/* --------------------------------- Schemas --------------------------------- */

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// Password policy: 8+ chars, upper, lower, number, symbol.
export const passwordPolicy = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[0-9]/, "Include a number")
  .regex(/[^A-Za-z0-9]/, "Include a symbol");

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordPolicy,
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
