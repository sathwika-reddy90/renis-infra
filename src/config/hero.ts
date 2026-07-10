// Hero scroll-storytelling slides (GSAP ScrollTrigger wipe transitions).
// Swap `image` to a local file under public/images/hero/ to replace without touching code.
export const HERO_SLIDES = [
  {
    category: "Entrance",
    image: "https://images.unsplash.com/photo-1600585153490-76fb20a32601?auto=format&fit=crop&w=2000&q=80",
    title: "The Aureate",
    location: "Road No. 45, Jubilee Hills, Hyderabad",
    cta: { label: "Discover Projects", href: "#projects" },
  },
  {
    category: "Villa",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=2000&q=80",
    title: "Luxury Villas",
    location: "Gated Address · 3-Acre Estate",
    cta: { label: "Discover Projects", href: "#projects" },
  },
  {
    category: "Balcony",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2000&q=80",
    title: "Sky Residences",
    location: "Panoramic City & Skyline Views",
    cta: { label: "Discover Projects", href: "#projects" },
  },
  {
    category: "Exterior",
    image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=2000&q=80",
    title: "Jubilee Hills Collection",
    location: "Hyderabad's Most Coveted Address",
    cta: { label: "Schedule a Visit", href: "#contact" },
  },
] as const;
