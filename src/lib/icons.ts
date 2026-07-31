import type { LucideIcon } from "lucide-react";
import {
  Award,
  Bath,
  Building2,
  CalendarCheck,
  Car,
  Clock,
  Dumbbell,
  Flower2,
  Gamepad2,
  Headset,
  Home,
  Hotel,
  KeyRound,
  LayoutGrid,
  Leaf,
  LineChart,
  MapPin,
  MapPinned,
  Percent,
  Projector,
  ShieldCheck,
  Sparkles,
  TreePine,
  TrendingUp,
  Trophy,
  Users,
  UtensilsCrossed,
  Waves,
  Wifi,
} from "lucide-react";

/**
 * Icon registry shared by CMS-authored content — the "why us" / "invest"
 * stat grids, property highlights and amenities all store a plain string key
 * rather than a component, so editors can pick an icon without a deploy.
 *
 * Unknown keys fall back to `Sparkles` instead of rendering nothing.
 */
export const ICONS: Record<string, LucideIcon> = {
  // Company / trust
  years: Award,
  residences: Building2,
  sqft: Home,
  families: Users,
  delivery: CalendarCheck,
  awards: Trophy,
  amenities: LayoutGrid,
  locations: MapPin,

  // Investment
  location: MapPinned,
  roi: TrendingUp,
  shield: ShieldCheck,
  clock: Clock,
  freehold: KeyRound,
  interest: Percent,
  growth: LineChart,
  support: Headset,

  // Project amenities / highlights
  pool: Waves,
  spa: Flower2,
  gym: Dumbbell,
  fitness: Dumbbell,
  clubhouse: Hotel,
  concierge: Headset,
  gardens: TreePine,
  landscape: Leaf,
  lobby: Hotel,
  cinema: Projector,
  dining: UtensilsCrossed,
  games: Gamepad2,
  parking: Car,
  wellness: Bath,
  connectivity: Wifi,
  sustainability: Leaf,
};

export const FALLBACK_ICON: LucideIcon = Sparkles;

/** Resolves a CMS icon key, never returning undefined. */
export function resolveIcon(key: string | undefined): LucideIcon {
  if (!key) return FALLBACK_ICON;
  return ICONS[key] ?? FALLBACK_ICON;
}

/** Keys offered to editors, for pickers and documentation. */
export const ICON_KEYS = Object.keys(ICONS);
