import { readFileSync } from "node:fs";
import path from "node:path";
import { Prisma, PrismaClient } from "@prisma/client";

/*
 * The RENISINFRA project catalogue.
 *
 * Facts here are limited to what each project's own site stated publicly at
 * the time of writing. Where a figure was absent — or where third-party
 * listing sites disagreed — the field is left empty rather than guessed, and
 * the UI hides sections that have no content. `developer` records the
 * originating builder.
 *
 * Imagery lives in the Media Library; project-images.json maps a slug to its
 * uploaded paths. Paths are root-relative so they survive a change of host.
 */

const IMAGES: Record<string, string[]> = JSON.parse(
  readFileSync(path.join(__dirname, "project-images.json"), "utf8"),
);

const json = (value: unknown) => value as Prisma.InputJsonValue;

/** Falls back to a placeholder so a project without scraped imagery still renders. */
const normalizeImage = (p?: string): string => {
  if (!p) return "/images/placeholder-project.jpg";
  // Replace developer-local or upload paths with a safe public placeholder
  // so production seeds don't point at localhost or non-existent upload folders.
  if (p.startsWith("http://localhost") || p.startsWith("http://127.0.0.1") || p.startsWith("/uploads")) {
    return "/images/placeholder-project.jpg";
  }
  return p;
};

const img = (slug: string, i: number): string => normalizeImage(IMAGES[slug]?.[i] ?? IMAGES[slug]?.[0]);

const gallery = (slug: string, from = 1): string[] => (IMAGES[slug] ?? []).slice(from);

/** Hero slider. Every project now carries 11+ images, so 4 panels is safe. */
const heroes = (slug: string, count = 4): string[] => (IMAGES[slug] ?? []).slice(0, count);

interface Highlight {
  title: string;
  description: string;
  icon?: string;
}

interface SeedProject {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  location: string;
  city: string;
  state: string;
  price: number;
  priceLabel: string;
  propertyType: "APARTMENTS" | "VILLAS" | "PENTHOUSES" | "PLOTS";
  status: "NEW_LAUNCH" | "NOW_SELLING" | "READY_TO_MOVE" | "COMING_SOON" | "SOLD_OUT";
  bedrooms: string;
  bathrooms: number;
  area: string;
  possession: string;
  reraNumber: string;
  developer: string;
  amenities: string[];
  certifications?: string[];
  overviewStats: { label: string; value: string }[];
  highlights: Highlight[];
  floorPlans?: { id: string; type: string; area: string; image: string; details: string[]; price?: string }[];
  nearbyLandmarks?: { place: string; distance: string; category?: string }[];
  specifications?: { category: string; items: string[] }[];
  featured?: boolean;
  order: number;
  lat?: number;
  lng?: number;
}

const PROJECTS: SeedProject[] = [
  {
    slug: "one-by-msn",
    title: "ONE by MSN",
    subtitle: "4 BHK Expansive Residences",
    description:
      "A landmark address in Kokapet's Neopolis layout, ONE by MSN is a collection of expansive 4 BHK residences across five towers. Its 180,000 sq.ft. of amenities span a 70,000+ sq.ft. podium, a yacht-shaped clubhouse and a sky park set 200 metres above the city.",
    location: "Plot No. 1, Neopolis, Kokapet",
    city: "Hyderabad",
    state: "Telangana",
    price: 0,
    priceLabel: "Price on request",
    propertyType: "APARTMENTS",
    status: "NOW_SELLING",
    bedrooms: "4 BHK",
    bathrooms: 4,
    area: "",
    possession: "",
    reraNumber: "TG RERA P02400009393",
    developer: "MSN Realty",
    amenities: [
      "Swimming Pool",
      "Tennis Court",
      "Gymnasium",
      "Spa",
      "Private Cinema",
      "Yoga Studio",
      "Library",
      "Amphitheatre",
      "Badminton Court",
      "Guest Rooms",
    ],
    overviewStats: [
      { label: "Configuration", value: "4 BHK" },
      { label: "Towers", value: "5" },
      { label: "Amenities", value: "180,000 sq.ft." },
      { label: "Podium", value: "70,000+ sq.ft." },
      { label: "Sky Park", value: "200m elevation" },
      { label: "RERA", value: "P02400009393" },
    ],
    highlights: [
      {
        title: "Yacht-Shaped Clubhouse",
        description: "A sculptural clubhouse anchoring the estate's social life.",
        icon: "clubhouse",
      },
      {
        title: "Sky Park at 200 Metres",
        description: "Landscaped gardens suspended high above the Kokapet skyline.",
        icon: "gardens",
      },
      {
        title: "70,000 Sq.Ft. Podium",
        description: "An elevated amenity deck connecting all five towers.",
        icon: "amenities",
      },
    ],
    nearbyLandmarks: [
      { place: "Outer Ring Road", distance: "Nearby", category: "Connectivity" },
      { place: "Financial District", distance: "Nearby", category: "Business" },
      { place: "Gandipet", distance: "Nearby", category: "Leisure" },
    ],
    featured: true,
    order: 1,
  },
  {
    slug: "the-cascades-neopolis",
    title: "The Cascades Neopolis",
    subtitle: "3 & 4 BHK Residences and Triplex Penthouses",
    description:
      "Rising 63 storeys across five towers on 7.34 acres, The Cascades Neopolis brings sky lounges, infinity pools and helipads to Kokapet. Ten triplex penthouses with private pools crown the development, which is pre-certified IGBC Platinum and WELL.",
    location: "Neopolis Layout, Kokapet",
    city: "Hyderabad",
    state: "Telangana",
    price: 0,
    priceLabel: "Price on request",
    propertyType: "APARTMENTS",
    status: "NOW_SELLING",
    bedrooms: "3 & 4 BHK",
    bathrooms: 4,
    area: "2,560 – 4,825 sq.ft.",
    possession: "",
    reraNumber: "P02400009538",
    developer: "GHR Infra · Lakshmi Infra · Urbanblocks Realty",
    certifications: ["IGBC Platinum Pre-Certified", "WELL Pre-Certified"],
    amenities: [
      "Sky Lounges",
      "Infinity Pools",
      "State-of-the-Art Gym",
      "Co-working Hub",
      "Kids Play Zone",
      "Sports Courts",
      "Landscaped Gardens",
      "Clubhouse",
      "Sky Garden",
      "Helipad",
      "Podium Landscape",
    ],
    overviewStats: [
      { label: "Land Parcel", value: "7.34 Acres" },
      { label: "Towers", value: "5" },
      { label: "Storeys", value: "63 (217 m)" },
      { label: "Residences", value: "1,189 + 10 Penthouses" },
      { label: "Configuration", value: "3 & 4 BHK" },
      { label: "RERA", value: "P02400009538" },
    ],
    highlights: [
      {
        title: "Triplex Penthouses with Private Pools",
        description: "Ten crowning residences, each with its own pool deck.",
        icon: "pool",
      },
      {
        title: "IGBC Platinum & WELL Pre-Certified",
        description: "Independently verified for sustainability and occupant wellness.",
        icon: "sustainability",
      },
      {
        title: "Seven Levels of Indulgence",
        description: "Amenity floors layered through the towers, from podium to sky garden.",
        icon: "amenities",
      },
    ],
    floorPlans: [
      {
        id: "fp-cascades-3bhk",
        type: "3 BHK Residence",
        area: "2,560 – 3,390 sq.ft.",
        image: img("the-cascades-neopolis", 1),
        details: ["3 Bedrooms", "Sky lounge access", "Landscaped podium views"],
      },
      {
        id: "fp-cascades-4bhk",
        type: "4 BHK Residence",
        area: "3,895 – 4,825 sq.ft.",
        image: img("the-cascades-neopolis", 2),
        details: ["4 Bedrooms", "Expansive deck", "Corner aspect"],
      },
    ],
    nearbyLandmarks: [
      { place: "Outer Ring Road", distance: "Nearby", category: "Connectivity" },
      { place: "Financial District", distance: "Nearby", category: "Business" },
    ],
    featured: true,
    order: 2,
  },
  {
    slug: "brigade-neopolis",
    title: "Brigade Neopolis",
    subtitle: "3 & 4 BHK Sky Residences",
    description:
      "A single G+52 tower on four acres in Kokapet, Brigade Neopolis pairs 679 residences with a grand clubhouse of roughly 75,000–80,000 sq.ft. Configurations run from 3 BHK through 3 BHK with study to expansive 4 BHK homes.",
    location: "Neopolis, Kokapet",
    city: "Hyderabad",
    state: "Telangana",
    price: 38700000,
    priceLabel: "₹ 3.87 Cr onwards",
    propertyType: "APARTMENTS",
    status: "NOW_SELLING",
    bedrooms: "3 & 4 BHK",
    bathrooms: 4,
    area: "2,785 – 3,750 sq.ft.",
    possession: "",
    reraNumber: "PRM/KA/RERA/1251/309/AG/220113/002710",
    developer: "Brigade Group",
    amenities: [
      "Grand Clubhouse",
      "Swimming Pool",
      "Gymnasium",
      "Basketball Court",
      "Lawn Terraces",
      "Kids Play Area",
      "Amphitheatre",
      "Jogging Track",
      "Skating Rink",
      "Multipurpose Lawn",
    ],
    overviewStats: [
      { label: "Land Parcel", value: "4 Acres" },
      { label: "Tower", value: "1 · G+52" },
      { label: "Residences", value: "679" },
      { label: "Parking Levels", value: "5" },
      { label: "Clubhouse", value: "75,000–80,000 sq.ft." },
      { label: "Configuration", value: "3 & 4 BHK" },
    ],
    highlights: [
      {
        title: "G+52 Landmark Tower",
        description: "One of Kokapet's tallest single-tower addresses.",
        icon: "residences",
      },
      {
        title: "80,000 Sq.Ft. Grand Clubhouse",
        description: "A full lifestyle floorplate dedicated to residents.",
        icon: "clubhouse",
      },
    ],
    floorPlans: [
      {
        id: "fp-brigade-3bhk",
        type: "3 BHK",
        area: "2,785 – 2,990 sq.ft.",
        image: img("brigade-neopolis", 1),
        details: ["3 Bedrooms", "Open kitchen", "Balcony"],
        price: "₹ 3.87 Cr onwards",
      },
      {
        id: "fp-brigade-3bhk-study",
        type: "3 BHK + 3T + Study",
        area: "3,300 sq.ft.",
        image: img("brigade-neopolis", 2),
        details: ["3 Bedrooms + Study", "3 Bathrooms"],
        price: "₹ 4.89 Cr onwards",
      },
      {
        id: "fp-brigade-4bhk",
        type: "4 BHK",
        area: "3,750 sq.ft.",
        image: img("brigade-neopolis", 3),
        details: ["4 Bedrooms", "Expansive living", "Corner aspect"],
        price: "₹ 5.79 Cr onwards",
      },
    ],
    nearbyLandmarks: [
      { place: "Outer Ring Road", distance: "Nearby", category: "Connectivity" },
      { place: "Financial District", distance: "Nearby", category: "Business" },
    ],
    featured: true,
    order: 3,
  },
  {
    slug: "sattva-lago",
    title: "Sattva Lago",
    subtitle: "3, 3.5 & 4 BHK Lakeside Residences",
    description:
      "Set on ten acres beside Osman Sagar lake, Sattva Lago rises G+46 with 34,630 sq.ft. of water bodies woven through the landscape and a generous 3.6-metre floor-to-floor height. The Outer Ring Road is two minutes away; the airport, twenty-three.",
    location: "Neopolis, Kokapet",
    city: "Hyderabad",
    state: "Telangana",
    price: 40000000,
    priceLabel: "₹ 4 Cr onwards",
    propertyType: "APARTMENTS",
    status: "NEW_LAUNCH",
    bedrooms: "3, 3.5 & 4 BHK",
    bathrooms: 4,
    area: "",
    possession: "",
    reraNumber: "P02400010916",
    developer: "Sattva Group",
    amenities: [
      "Clubhouse",
      "Swimming Pool",
      "Landscaped Gardens",
      "Gymnasium",
      "Children's Play Area",
      "Wellness Spaces",
      "Integrated Retail",
    ],
    overviewStats: [
      { label: "Land Parcel", value: "10 Acres" },
      { label: "Structure", value: "G+46" },
      { label: "Water Bodies", value: "34,630 sq.ft." },
      { label: "Floor Height", value: "3.6 m" },
      { label: "Configuration", value: "3, 3.5 & 4 BHK" },
      { label: "RERA", value: "P02400010916" },
    ],
    highlights: [
      {
        title: "Beside Osman Sagar Lake",
        description: "A rare waterfront setting on the Kokapet corridor.",
        icon: "landscape",
      },
      {
        title: "34,630 Sq.Ft. of Water Bodies",
        description: "Water designed through the landscape, not merely beside it.",
        icon: "pool",
      },
      {
        title: "3.6 Metre Floor Heights",
        description: "Volume and light well beyond the category standard.",
        icon: "residences",
      },
    ],
    nearbyLandmarks: [
      { place: "Nehru Outer Ring Road Exit 1(A)", distance: "2 min", category: "Connectivity" },
      { place: "Schools & Tech Institutes", distance: "5 min", category: "Education" },
      { place: "Rajiv Gandhi Intl. Airport", distance: "23 min", category: "Connectivity" },
    ],
    featured: true,
    order: 4,
  },
  {
    slug: "poulomi-palazzo",
    title: "Poulomi Palazzo",
    subtitle: "4 BHK Sky Residences",
    description:
      "Fifty-five floors of 4 BHK residences in Kokapet, Poulomi Palazzo layers its lifestyle across a rooftop bar, indoor pool, co-work lounge and wellness zones — with infinity pools, private spas and zen gardens set through the towers.",
    location: "Kokapet",
    city: "Hyderabad",
    state: "Telangana",
    price: 0,
    priceLabel: "Price on request",
    propertyType: "APARTMENTS",
    status: "NOW_SELLING",
    bedrooms: "4 BHK",
    bathrooms: 4,
    area: "",
    possession: "",
    reraNumber: "P02400004428",
    developer: "Poulomi Estates",
    amenities: [
      "Clubhouse",
      "Rooftop Bar",
      "Co-work Lounge",
      "Children's Playroom",
      "Indoor Pool",
      "Fitness & Yoga Deck",
      "Infinity Pools",
      "Private Spas",
      "Zen Gardens",
      "Wellness Zones",
    ],
    overviewStats: [
      { label: "Configuration", value: "4 BHK" },
      { label: "Floors", value: "55" },
      { label: "Status", value: "Ongoing" },
      { label: "RERA", value: "P02400004428" },
    ],
    highlights: [
      {
        title: "Rooftop Bar & Sky Lounge",
        description: "Entertaining space set above the Kokapet skyline.",
        icon: "dining",
      },
      {
        title: "Zen Gardens & Private Spas",
        description: "Wellness designed into the building, not bolted on.",
        icon: "spa",
      },
    ],
    nearbyLandmarks: [
      { place: "Outer Ring Road", distance: "Nearby", category: "Connectivity" },
      { place: "Financial District", distance: "Nearby", category: "Business" },
    ],
    order: 5,
  },
  {
    slug: "iris-by-raghava",
    title: "IRIS by Raghava",
    subtitle: "4 & 6 BHK Ultra-Luxury Residences",
    description:
      "Three 45-storey towers on nine acres in Manikonda, IRIS offers 4 and 6 BHK residences with a Sky Island amenity deck. KIMS Hospital sits 300 metres away and IKEA Hyderabad within 2.5 kilometres.",
    location: "Off Dargah Road, Manikonda",
    city: "Hyderabad",
    state: "Telangana",
    price: 201600000,
    priceLabel: "₹ 20.16 Cr onwards (6 BHK)",
    propertyType: "APARTMENTS",
    status: "NOW_SELLING",
    bedrooms: "4 & 6 BHK",
    bathrooms: 6,
    area: "5,450 – 6,605 sq.ft. (4 BHK)",
    possession: "September 2028",
    reraNumber: "P02400005078",
    developer: "Raghava",
    amenities: [
      "Sky Island",
      "Clubhouse",
      "Swimming Pool",
      "Gymnasium",
      "Landscaped Gardens",
      "Children's Play Area",
      "Concierge",
    ],
    overviewStats: [
      { label: "Land Parcel", value: "9 Acres" },
      { label: "Towers", value: "3 · 45 Storeys" },
      { label: "Configuration", value: "4 & 6 BHK" },
      { label: "4 BHK Sizes", value: "5,450 – 6,605 sq.ft." },
      { label: "Possession", value: "September 2028" },
      { label: "RERA", value: "P02400005078" },
    ],
    highlights: [
      {
        title: "Sky Island",
        description: "An elevated amenity deck suspended between the towers.",
        icon: "gardens",
      },
      {
        title: "6 BHK Ultra-Luxury Floorplates",
        description: "Among the largest private residences in west Hyderabad.",
        icon: "residences",
      },
    ],
    floorPlans: [
      {
        id: "fp-iris-4bhk",
        type: "4 BHK Residence",
        area: "5,450 – 6,605 sq.ft.",
        image: img("iris-by-raghava", 1),
        details: ["4 Bedrooms", "Private lift lobby", "Panoramic aspect"],
      },
      {
        id: "fp-iris-6bhk",
        type: "6 BHK Residence",
        area: "",
        image: img("iris-by-raghava", 2),
        details: ["6 Bedrooms", "Sky Island access"],
        price: "₹ 20.16 Cr onwards",
      },
    ],
    nearbyLandmarks: [
      { place: "KIMS Hospital", distance: "300 m", category: "Healthcare" },
      { place: "Malkam Lake", distance: "550 m", category: "Leisure" },
      { place: "IKEA Hyderabad", distance: "2.5 km", category: "Retail" },
    ],
    featured: true,
    order: 6,
  },
  {
    slug: "elan-by-meenakshi",
    title: "Elan by Meenakshi",
    subtitle: "3 & 4 BHK Residences · One Home per Wing",
    description:
      "Three towers and six wings rising 45 floors in Khajaguda, Elan gives each wing a single apartment per floor, its own clubhouse and its own concierge. Homes run from 7,300 to 9,300 sq.ft. across 74 per cent open space.",
    location: "Khajaguda, Puppalaguda",
    city: "Hyderabad",
    state: "Telangana",
    price: 0,
    priceLabel: "Price on request",
    propertyType: "APARTMENTS",
    status: "NOW_SELLING",
    bedrooms: "3 & 4 BHK",
    bathrooms: 4,
    area: "7,300 – 9,300 sq.ft.",
    possession: "",
    reraNumber: "",
    developer: "Meenakshi Group",
    amenities: [
      "Clubhouse per Wing",
      "Concierge per Wing",
      "Yoga Hall",
      "Spa & Salon",
      "Banquet Hall",
      "Kids Play Area",
      "Indoor Games",
      "Pet Zone",
      "Kids Pool",
      "Gymnasium",
      "Sauna & Steam",
    ],
    overviewStats: [
      { label: "Towers", value: "3 · 6 Wings" },
      { label: "Floors", value: "45" },
      { label: "Density", value: "1 Home per Wing Floor" },
      { label: "Sizes", value: "7,300 – 9,300 sq.ft." },
      { label: "Open Space", value: "74%" },
      { label: "Clubhouse", value: "1 lakh+ sq.ft." },
    ],
    highlights: [
      {
        title: "One Residence per Wing Floor",
        description: "No shared landings, no shared walls — absolute privacy.",
        icon: "residences",
      },
      {
        title: "A Clubhouse for Every Wing",
        description: "Over a lakh square feet of clubhouse, divided by wing.",
        icon: "clubhouse",
      },
      {
        title: "74% Open Space",
        description: "The estate gives back three quarters of its footprint to landscape.",
        icon: "gardens",
      },
    ],
    nearbyLandmarks: [
      { place: "Financial District", distance: "Nearby", category: "Business" },
      { place: "ORR", distance: "Nearby", category: "Connectivity" },
    ],
    featured: true,
    order: 7,
  },
  {
    slug: "the-trilight",
    title: "The Trilight",
    subtitle: "Luxury Residences, Kokapet",
    description:
      "The Trilight is built around three distinct clubhouses — The White Gloves, Up & Above, and Thousands of Stars — with a salon and spa, cigar lounge, home theatre and its Atrium of Life. The ORR is two minutes away, the Financial District and ISB five.",
    location: "Kokapet, West Hyderabad",
    city: "Hyderabad",
    state: "Telangana",
    price: 35000000,
    priceLabel: "₹ 3.5 Cr onwards",
    propertyType: "APARTMENTS",
    status: "NOW_SELLING",
    bedrooms: "",
    bathrooms: 3,
    area: "",
    possession: "",
    reraNumber: "P02400005390",
    developer: "",
    amenities: [
      "Three Clubhouses",
      "Salon & Spa",
      "Cigar Lounge",
      "Home Theatre",
      "Atrium of Life",
      "Reception Lounges",
    ],
    overviewStats: [
      { label: "Clubhouses", value: "3" },
      { label: "Price From", value: "₹ 3.5 Cr" },
      { label: "ORR", value: "2 min" },
      { label: "Airport", value: "25 min" },
      { label: "RERA", value: "P02400005390" },
    ],
    highlights: [
      {
        title: "Three Distinct Clubhouses",
        description: "The White Gloves, Up & Above, and Thousands of Stars.",
        icon: "clubhouse",
      },
      {
        title: "The Atrium of Life",
        description: "A full-height central volume at the heart of the address.",
        icon: "landscape",
      },
    ],
    nearbyLandmarks: [
      { place: "ORR", distance: "2 min", category: "Connectivity" },
      { place: "Star Hotels", distance: "5 min", category: "Leisure" },
      { place: "Financial District", distance: "5 min", category: "Business" },
      { place: "ISB Campus", distance: "5 min", category: "Education" },
      { place: "Rajiv Gandhi Intl. Airport", distance: "25 min", category: "Connectivity" },
    ],
    order: 8,
  },
  {
    slug: "high-9",
    title: "HIGH 9",
    subtitle: "2 & 3 BHK Apartments · 4 BHK Sky Villas",
    description:
      "Nine towers of thirty floors across fifteen acres at Kollur, HIGH 9 is linked by a 1.6 kilometre skywalk and organised around a one-acre central courtyard. Two amenity blocks carry everything from a doctor's clinic to a jacuzzi and sauna.",
    location: "Off ORR Exit-2, Kollur",
    city: "Hyderabad",
    state: "Telangana",
    price: 0,
    priceLabel: "Price on request",
    propertyType: "APARTMENTS",
    status: "NOW_SELLING",
    bedrooms: "2, 3 & 4 BHK",
    bathrooms: 4,
    area: "",
    possession: "",
    reraNumber: "TS RERA P01100008195",
    developer: "Anvita Group · RS Pasura",
    amenities: [
      "Clubhouse",
      "Gymnasium",
      "Spa & Salon",
      "Yoga Studio",
      "Library",
      "Multipurpose Hall",
      "Creche",
      "Doctor's Clinic",
      "Cafeteria",
      "Swimming Pools",
      "Jacuzzi & Sauna",
      "Skating Rink",
      "Cricket Nets",
      "Jogging Track",
      "Pet Park",
      "Amphitheatre",
      "1.6 km Skywalk",
    ],
    overviewStats: [
      { label: "Land Parcel", value: "15 Acres" },
      { label: "Towers", value: "9" },
      { label: "Floors", value: "30" },
      { label: "Skywalk", value: "1.6 km" },
      { label: "Central Courtyard", value: "~1 Acre" },
      { label: "RERA", value: "P01100008195" },
    ],
    highlights: [
      {
        title: "1.6 Kilometre Skywalk",
        description: "An elevated promenade threading all nine towers together.",
        icon: "connectivity",
      },
      {
        title: "One-Acre Central Courtyard",
        description: "A green heart at the centre of the fifteen-acre estate.",
        icon: "gardens",
      },
      {
        title: "Two Dedicated Amenity Blocks",
        description: "Clinic, creche, bank and cafeteria alongside the wellness floors.",
        icon: "amenities",
      },
    ],
    specifications: [
      {
        category: "Safety & Services",
        items: [
          "24/7 security with CCTV",
          "100% power backup",
          "Solar fencing",
          "Piped LPG supply",
        ],
      },
    ],
    floorPlans: [
      {
        id: "fp-high9-2bhk",
        type: "2 BHK Lifestyle Apartment",
        area: "",
        image: img("high-9", 1),
        details: ["2 Bedrooms", "Courtyard aspect"],
      },
      {
        id: "fp-high9-3bhk",
        type: "3 BHK Lifestyle Apartment",
        area: "",
        image: img("high-9", 2),
        details: ["3 Bedrooms", "Designer terrace"],
      },
      {
        id: "fp-high9-4bhk",
        type: "4 BHK Sky Villa",
        area: "",
        image: img("high-9", 3),
        details: ["4 Bedrooms", "Sky villa floorplate"],
      },
    ],
    nearbyLandmarks: [
      { place: "ORR Exit-2", distance: "Adjacent", category: "Connectivity" },
      { place: "Financial District", distance: "Nearby", category: "Business" },
    ],
    order: 9,
  },
  {
    slug: "prestige-budvel",
    title: "Prestige Budvel",
    subtitle: "2, 3 & 4 BHK Apartments · 5 BHK Villas",
    description:
      "Prestige Budvel spans 31.14 acres of apartments and a further 24 acres of villas at Rajendra Nagar — thirteen towers rising 42 floors alongside 119 G+2 villas. Homes range from 3 BHK apartments to 8,800 sq.ft. villas.",
    location: "Budvel, Rajendra Nagar",
    city: "Hyderabad",
    state: "Telangana",
    price: 11300000,
    priceLabel: "₹ 1.13 Cr onwards",
    propertyType: "APARTMENTS",
    status: "NEW_LAUNCH",
    bedrooms: "2, 3, 4 & 5 BHK",
    bathrooms: 5,
    area: "1,631 – 8,804 sq.ft.",
    possession: "",
    reraNumber: "P02400006711 · P02400007209",
    developer: "Prestige Group",
    amenities: [
      "Swimming Pool",
      "Gymnasium",
      "Spa",
      "Kids Play Area",
      "Walking Path",
      "Multipurpose Hall",
      "Convenience Store",
      "Reflexology Track",
    ],
    overviewStats: [
      { label: "Land Parcel", value: "31.14 + 24 Acres" },
      { label: "Towers", value: "13 · 42 Floors" },
      { label: "Residences", value: "4,647 Apartments" },
      { label: "Villas", value: "119 · G+2 + Terrace" },
      { label: "Sizes", value: "1,631 – 8,804 sq.ft." },
      { label: "RERA", value: "P02400006711" },
    ],
    highlights: [
      {
        title: "Apartments and Villas on One Estate",
        description: "Two distinct addresses sharing a single masterplan.",
        icon: "residences",
      },
      {
        title: "55 Acres in Total",
        description: "Among the largest launches on the city's southern corridor.",
        icon: "location",
      },
    ],
    floorPlans: [
      {
        id: "fp-budvel-3bhk",
        type: "3 BHK Apartment",
        area: "1,631 – 2,433 sq.ft.",
        image: img("prestige-budvel", 1),
        details: ["3 Bedrooms", "Tower residence"],
        price: "₹ 1.13 Cr",
      },
      {
        id: "fp-budvel-4bhk",
        type: "4 BHK Apartment",
        area: "3,348 – 3,431 sq.ft.",
        image: img("prestige-budvel", 2),
        details: ["4 Bedrooms", "Expansive living"],
        price: "₹ 2.62 Cr",
      },
      {
        id: "fp-budvel-5bhk",
        type: "5 BHK Villa",
        area: "5,308 – 8,804 sq.ft.",
        image: img("prestige-budvel", 3),
        details: ["5 Bedrooms", "G+2 with terrace", "Private garden"],
        price: "₹ 11 Cr",
      },
    ],
    nearbyLandmarks: [
      { place: "Rajendra Nagar", distance: "Adjacent", category: "Connectivity" },
      { place: "Rajiv Gandhi Intl. Airport", distance: "Nearby", category: "Connectivity" },
    ],
    order: 10,
  },
  {
    slug: "prestige-golden-grove",
    title: "Prestige Golden Grove",
    subtitle: "2, 3 & 4 BHK Apartments",
    description:
      "Prestige Golden Grove brings 2, 3 and 4 BHK homes to Tellapur on the western corridor, arranged around a forest-themed central park. Detailed specifications are released progressively as the project advances.",
    location: "Tellapur",
    city: "Hyderabad",
    state: "Telangana",
    price: 0,
    priceLabel: "Price on request",
    propertyType: "APARTMENTS",
    status: "COMING_SOON",
    bedrooms: "2, 3 & 4 BHK",
    bathrooms: 4,
    area: "",
    possession: "",
    reraNumber: "P01100010708",
    developer: "Prestige Group",
    amenities: ["Central Park", "Clubhouse", "Swimming Pool", "Gymnasium", "Landscaped Gardens"],
    overviewStats: [
      { label: "Configuration", value: "2, 3 & 4 BHK" },
      { label: "Location", value: "Tellapur" },
      { label: "RERA", value: "P01100010708" },
    ],
    highlights: [
      {
        title: "Forest-Themed Central Park",
        description: "A landscaped green core at the heart of the community.",
        icon: "gardens",
      },
    ],
    nearbyLandmarks: [
      { place: "Tellapur", distance: "Adjacent", category: "Connectivity" },
      { place: "Financial District", distance: "Nearby", category: "Business" },
    ],
    order: 11,
  },
];

function toCreateInput(p: SeedProject): Prisma.PropertyCreateInput {
  const heroImages = heroes(p.slug);
  return {
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle,
    description: p.description,
    location: p.location,
    city: p.city,
    state: p.state,
    price: p.price,
    priceLabel: p.priceLabel,
    propertyType: p.propertyType,
    status: p.status,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.area,
    possession: p.possession,
    reraNumber: p.reraNumber,
    developer: p.developer,
    featuredImage: img(p.slug, 0),
    heroImages,
    masterPlan: img(p.slug, 0),
    masterLegend: [],
    certifications: p.certifications ?? [],
    featured: p.featured ?? false,
    order: p.order,
    gallery: gallery(p.slug),
    amenities: p.amenities,
    floorPlans: json(p.floorPlans ?? []),
    specifications: json(p.specifications ?? []),
    paymentPlans: json([]),
    nearbyLandmarks: json(p.nearbyLandmarks ?? []),
    overviewStats: json(p.overviewStats),
    highlights: json(p.highlights),
    lat: p.lat,
    lng: p.lng,
    seo: json({
      metaTitle: `${p.title}, ${p.location} — RENISINFRA`,
      metaDescription: p.description.slice(0, 155),
      keywords: [p.title, p.city, p.location, p.bedrooms].filter(Boolean),
      ogImage: img(p.slug, 0),
    }),
  };
}

export async function seedProjects(prisma: PrismaClient): Promise<void> {
  for (const project of PROJECTS) {
    const data = toCreateInput(project);
    await prisma.property.upsert({
      where: { slug: project.slug },
      update: data,
      create: data,
    });
  }
  console.log(`✔ Seeded ${PROJECTS.length} projects`);
}

export const PROJECT_SLUGS = PROJECTS.map((p) => p.slug);
