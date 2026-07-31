import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedProjects } from "./projects.seed";

const prisma = new PrismaClient();

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const json = (value: unknown) => value as Prisma.InputJsonValue;

/* --------------------------------- Amenities -------------------------------- */

const amenities = [
  { id: "amn-pool", title: "Infinity Sky Pool", description: "A temperature-controlled edge pool overlooking the skyline.", icon: "pool" },
  { id: "amn-spa", title: "Private Wellness Spa", description: "Steam, sauna and treatment suites reserved for residents.", icon: "spa" },
  { id: "amn-concierge", title: "Signature Concierge", description: "24-hour lifestyle management and doorstep service.", icon: "concierge" },
  { id: "amn-gardens", title: "Landscaped Sky Gardens", description: "Elevated green terraces designed by award-winning studios.", icon: "gardens" },
  { id: "amn-lobby", title: "Grand Arrival Lobby", description: "A double-height gallery lobby finished in natural stone.", icon: "lobby" },
  { id: "amn-fitness", title: "State-of-Art Fitness", description: "Technogym-equipped studio with dedicated pilates & yoga.", icon: "fitness" },
];

/* ---------------------------------- Team ----------------------------------- */

const team = [
  { id: "team-rohan", name: "Rohan Varma", role: "Founder & Chairman", image: img("1560250097-0b93528c311a", 800), bio: "Founded RENISINFRA in 2007 with a belief in craft over compromise.", order: 0 },
  { id: "team-meera", name: "Meera Iyer", role: "Chief Executive Officer", image: img("1573497019940-1c28c88b4f3e", 800), bio: "Leads delivery and growth across the RENISINFRA portfolio.", order: 1 },
  { id: "team-aditya", name: "Aditya Nair", role: "Head of Design", image: img("1519085360753-af0119f7cbe7", 800), bio: "Shapes the architectural language behind every landmark residence.", order: 2 },
  { id: "team-priya", name: "Priya Kapoor", role: "Head of Customer Experience", image: img("1580489944761-15a19d654956", 800), bio: "Champions the lifelong service culture our residents rely on.", order: 3 },
];

/* --------------------------------- Gallery --------------------------------- */

const gallery: { id: string; src: string; alt: string; category: "INTERIORS" | "EXTERIORS" | "AMENITIES" | "LIFESTYLE" }[] = [
  { id: "g01", src: img("1600596542815-ffad4c1539a9", 900), alt: "Interior detail", category: "INTERIORS" },
  { id: "g02", src: img("1512453979798-5ea266f8880c", 900), alt: "Tower exterior at dusk", category: "EXTERIORS" },
  { id: "g03", src: img("1600566753086-00f18fb6b3ea", 900), alt: "Living space", category: "INTERIORS" },
  { id: "g04", src: img("1571902943202-507ec2618e8f", 900), alt: "Infinity pool", category: "AMENITIES" },
  { id: "g05", src: img("1545324418-cc1a3fa10c00", 900), alt: "Residence facade", category: "EXTERIORS" },
  { id: "g06", src: img("1600607687939-ce8a6c25118c", 900), alt: "Bedroom suite", category: "INTERIORS" },
  { id: "g07", src: img("1600585154526-990dced4db0d", 900), alt: "Dining area", category: "INTERIORS" },
  { id: "g08", src: img("1600585152220-90363fe7e115", 900), alt: "Landmark tower", category: "EXTERIORS" },
  { id: "g09", src: img("1540555700478-4be289fbecef", 900), alt: "Wellness lounge", category: "AMENITIES" },
  { id: "g10", src: img("1600047509807-ba8f99d2cdde", 900), alt: "Lifestyle moment", category: "LIFESTYLE" },
  { id: "g11", src: img("1600566752355-35792bedcfea", 900), alt: "Kitchen detail", category: "INTERIORS" },
  { id: "g12", src: img("1600585154340-be6161a56a0c", 900), alt: "Villa exterior", category: "EXTERIORS" },
  { id: "g13", src: img("1534438327276-14e5300c3a48", 900), alt: "Fitness studio", category: "AMENITIES" },
  { id: "g14", src: img("1600210492486-724fe5c67fb0", 900), alt: "Terrace living", category: "LIFESTYLE" },
];

/* -------------------------------- Property --------------------------------- */

const aureate: Prisma.PropertyCreateInput = {
  id: "prop-aureate",
  slug: "the-aureate",
  title: "The Aureate",
  subtitle: "4 & 5 BHK Sky Residences",
  description:
    "The Aureate is our most exclusive address — a limited collection of 4 & 5 BHK sky residences set within a gated 3-acre estate in the heart of Jubilee Hills. Designed for those who value privacy, provenance and panoramic city views as standard.",
  location: "Road No. 45, Jubilee Hills, Hyderabad",
  city: "Hyderabad",
  state: "Telangana",
  price: 84000000,
  priceLabel: "₹ 8.4 Cr onwards",
  propertyType: "PENTHOUSES",
  status: "NOW_SELLING",
  bedrooms: "4 & 5 BHK",
  bathrooms: 5,
  area: "4,200 – 6,800 sq.ft.",
  possession: "Q4 2028",
  reraNumber: "P02400001234",
  developer: "RENISINFRA",
  featuredImage: img("1600585152220-90363fe7e115", 2000),
  brochure: "/brochures/the-aureate.pdf",
  masterPlan: img("1524230572899-a752b3835840", 1600),
  masterLegend: ["Tower A & B", "Central Water Court", "Clubhouse & Spa", "Sky Gardens", "Arrival Plaza", "Visitor Parking"],
  gallery: [
    img("1600607687939-ce8a6c25118c"),
    img("1600566753086-00f18fb6b3ea"),
    img("1600585154526-990dced4db0d"),
    img("1600047509807-ba8f99d2cdde"),
    img("1600596542815-ffad4c1539a9"),
    img("1600566752355-35792bedcfea"),
  ],
  amenities: ["Infinity Sky Pool", "Private Wellness Spa", "Signature Concierge", "Sky Gardens", "Grand Arrival Lobby", "Technogym Fitness", "Private Cinema", "Banquet & Lounge"],
  floorPlans: json([
    { id: "fp-4bhk", type: "4 BHK Sky Residence", area: "4,200 sq.ft.", image: img("1721322800607-8c38375eef04", 1000), details: ["4 Bedrooms + Study", "Private Lift Lobby", "Double-height Deck", "Staff Quarter"], price: "₹ 8.4 Cr" },
    { id: "fp-5bhk", type: "5 BHK Grand Residence", area: "6,800 sq.ft.", image: img("1721322800607-8c38375eef04", 1000), details: ["5 En-suite Bedrooms", "Private Pool Deck", "Home Theatre", "2 Staff Quarters"], price: "₹ 12.6 Cr" },
  ]),
  specifications: json([
    { category: "Structure", items: ["Seismic-compliant RCC frame", "G+28 twin towers"] },
    { category: "Flooring", items: ["Imported marble in living areas", "Engineered wood in bedrooms"] },
    { category: "Kitchen", items: ["Modular kitchen with quartz counters", "Provision for hob & chimney"] },
    { category: "Security", items: ["3-tier access control", "24/7 CCTV surveillance"] },
  ]),
  paymentPlans: json([
    { id: "pp-clp", label: "Construction-Linked Plan", description: "Payments tied to construction milestones for balanced cash flow.", milestone: "10% on booking" },
    { id: "pp-possession", label: "Possession-Linked Plan", description: "A larger share deferred to handover for buyers preferring flexibility.", milestone: "20% on booking" },
  ]),
  nearbyLandmarks: json([
    { place: "Jubilee Hills Check Post", distance: "1.2 km", category: "Connectivity" },
    { place: "KBR National Park", distance: "2.4 km", category: "Leisure" },
    { place: "Apollo Hospitals", distance: "3.0 km", category: "Healthcare" },
    { place: "GVK One Mall", distance: "3.6 km", category: "Retail" },
    { place: "Hitec City", distance: "6.8 km", category: "Business" },
    { place: "Intl. Airport", distance: "34 km", category: "Connectivity" },
  ]),
  overviewStats: json([
    { label: "Configuration", value: "4 & 5 BHK" },
    { label: "Sizes", value: "4,200 – 6,800 sq.ft." },
    { label: "Towers", value: "2 Towers · G+28" },
    { label: "Residences", value: "96 Exclusive Homes" },
    { label: "Land Parcel", value: "3.2 Acres" },
    { label: "Possession", value: "Q4 2028" },
  ]),
  lat: 17.4239,
  lng: 78.4108,
  seo: json({
    metaTitle: "The Aureate, Jubilee Hills — RENISINFRA",
    metaDescription: "4 & 5 BHK sky residences in the heart of Jubilee Hills, Hyderabad.",
    keywords: ["Jubilee Hills", "The Aureate", "RENISINFRA"],
    ogImage: img("1600585152220-90363fe7e115", 1200),
  }),
};

/* ------------------------------- Testimonials ------------------------------ */

const testimonials = [
  { id: "tst-ananya", quote: "From the arrival lobby to the finish of every handle, RENISINFRA obsesses over detail. It feels less like a building and more like a private commission.", name: "Ananya Rao", role: "Resident, The Aureate", project: "The Aureate", rating: 5, featured: true, propertyId: "prop-aureate" as string | undefined },
  { id: "tst-karan", quote: "The team delivered ahead of schedule without compromising a single specification. A genuinely rare experience in this market.", name: "Karan Mehta", role: "Investor & Homeowner", rating: 5, featured: false, propertyId: undefined, project: undefined as string | undefined },
  { id: "tst-sana", quote: "Our home in Jubilee Hills is exactly what was promised — quiet luxury, impeccable service and an address that speaks for itself.", name: "Dr. Sana Fernandes", role: "Resident, Vantage Row", project: "Vantage Row", rating: 5, featured: false, propertyId: undefined },
];

/* ----------------------------------- FAQs ---------------------------------- */

const faqs = [
  { id: "faq-config", question: "What configurations are available?", answer: "The Aureate offers 4 & 5 BHK sky residences ranging from 4,200 to 6,800 sq.ft., each with a private lift lobby.", order: 0 },
  { id: "faq-possession", question: "What is the possession timeline?", answer: "Possession is scheduled for Q4 2028, with construction currently on schedule.", order: 1 },
  { id: "faq-rera", question: "Is the project RERA registered?", answer: "Yes. Full RERA registration details are shared during a private preview and documented in the agreement.", order: 2 },
  { id: "faq-payment", question: "What are the payment plans?", answer: "Flexible construction-linked and milestone plans are available. Our advisors will tailor a plan to your requirements.", order: 3 },
  { id: "faq-visit", question: "Can I book a private site visit?", answer: "Absolutely. Use the enquiry form below and a residence advisor will arrange a viewing at your convenience.", order: 4 },
];

/* ----------------------------------- Blogs --------------------------------- */

const blogs = [
  { id: "blog-jubilee-guide", slug: "why-jubilee-hills-remains-hyderabads-finest-address", title: "Why Jubilee Hills Remains Hyderabad's Finest Address", excerpt: "A look at the enduring appeal of Jubilee Hills — its greenery, connectivity and quiet exclusivity.", content: "Jubilee Hills has long been synonymous with prestige in Hyderabad...", category: "Neighbourhood", tags: ["Jubilee Hills", "Location", "Luxury"], coverImage: img("1600585152220-90363fe7e115"), readTime: "6 min read", publishedAt: new Date("2026-05-12T00:00:00.000Z"), authorId: "team-meera" },
  { id: "blog-buying-guide", slug: "a-buyers-guide-to-luxury-sky-residences", title: "A Buyer's Guide to Luxury Sky Residences", excerpt: "From floor plates to finishes — what to evaluate before investing in a premium high-rise home.", content: "Buying a sky residence is a different exercise from a conventional apartment purchase...", category: "Guides", tags: ["Buying", "Investment", "Design"], coverImage: img("1600596542815-ffad4c1539a9"), readTime: "8 min read", publishedAt: new Date("2026-06-18T00:00:00.000Z"), authorId: "team-aditya" },
  { id: "blog-design-philosophy", slug: "the-renisinfra-design-philosophy", title: "The RENISINFRA Design Philosophy", excerpt: "How an obsession with detail shapes every RENISINFRA residence, from lobby to light switch.", content: "Great design is invisible until it isn't...", category: "Craft", tags: ["Design", "Architecture", "Craft"], coverImage: img("1600566753086-00f18fb6b3ea"), readTime: "5 min read", publishedAt: new Date("2026-07-02T00:00:00.000Z"), authorId: "team-rohan" },
];

async function main() {
  // Default Super Admin — must change password on first login. `update: {}`
  // keeps re-seeding idempotent (never resets an already-changed password).
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);

  // Ordered so foreign keys resolve; whole seed runs in one transaction.
  await prisma.$transaction([
    prisma.user.upsert({
      where: { email: "admin@renisinfra.com" },
      update: {},
      create: {
        email: "admin@renisinfra.com",
        name: "Super Admin",
        passwordHash,
        role: "SUPER_ADMIN",
        mustChangePassword: true,
      },
    }),
    ...amenities.map((a) => prisma.amenity.upsert({ where: { id: a.id }, update: a, create: a })),
    ...team.map((t) => prisma.teamMember.upsert({ where: { id: t.id }, update: t, create: t })),
    prisma.property.upsert({ where: { id: "prop-aureate" }, update: aureate, create: aureate }),
    ...gallery.map((g) => prisma.galleryImage.upsert({ where: { id: g.id }, update: g, create: g })),
    ...testimonials.map((t) => prisma.testimonial.upsert({ where: { id: t.id }, update: t, create: t })),
    ...faqs.map((f) =>
      prisma.fAQ.upsert({
        where: { id: f.id },
        update: { ...f, category: "The Aureate", propertyId: "prop-aureate" },
        create: { ...f, category: "The Aureate", propertyId: "prop-aureate" },
      }),
    ),
    ...blogs.map((b) =>
      prisma.blog.upsert({
        where: { id: b.id },
        update: { ...b, status: "PUBLISHED" },
        create: { ...b, status: "PUBLISHED" },
      }),
    ),
    prisma.siteSettings.upsert({
      where: { id: "site-settings" },
      update: {},
      create: {
        id: "site-settings",
        siteName: "RENISINFRA",
        phone: "+91 90000 12345",
        email: "residences@renisinfra.com",
        address: "Road No. 45, Jubilee Hills, Hyderabad 500033",
      },
    }),
  ]);

  // The project catalogue is large enough to live in its own module, and it
  // reads project-images.json, so it runs outside the transaction above.
  await seedProjects(prisma);

  console.log("✔ Seed complete");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
