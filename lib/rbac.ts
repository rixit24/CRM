// SQLite has no enum type, so Membership.role is a plain String column in
// the schema (see prisma/schema.prisma) — this union is the app-level
// source of truth for which values are valid.
export type Role = "OWNER" | "ADMIN" | "MEMBER";

// Permission matrix. Kept as a flat table (not nested if/else) so adding a
// new permission or role is a one-line change and stays easy to audit.
const PERMISSIONS = {
  "contacts.view": ["OWNER", "ADMIN", "MEMBER"],
  "contacts.edit": ["OWNER", "ADMIN", "MEMBER"],
  "contacts.delete": ["OWNER", "ADMIN"],
  "deals.view": ["OWNER", "ADMIN", "MEMBER"],
  "deals.edit": ["OWNER", "ADMIN", "MEMBER"],
  "deals.delete": ["OWNER", "ADMIN"],
  "reports.view": ["OWNER", "ADMIN", "MEMBER"],
  "team.manage": ["OWNER", "ADMIN"],
  "team.remove": ["OWNER"],
  "billing.manage": ["OWNER"],
  "branding.manage": ["OWNER", "ADMIN"],
  "apikeys.manage": ["OWNER", "ADMIN"],
  "pipeline.manage": ["OWNER", "ADMIN"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: string, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
}
