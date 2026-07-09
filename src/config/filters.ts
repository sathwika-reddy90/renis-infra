import type { PropertyStatus, PropertyType } from "@/types/property";

// Filter taxonomy for the projects explorer (display labels, UI config).
export const PROJECT_TYPES: PropertyType[] = ["Apartments", "Villas", "Penthouses"];

export const PROJECT_STATUSES: PropertyStatus[] = [
  "New Launch",
  "Now Selling",
  "Ready to Move",
  "Coming Soon",
];

export const PROJECT_LOCATIONS = [
  "Jubilee Hills",
  "Banjara Hills",
  "Gachibowli",
  "Kokapet",
  "Financial District",
] as const;
