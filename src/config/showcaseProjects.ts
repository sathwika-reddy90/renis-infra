// The 4 full-screen project showcase slides (GSAP pinned scroll reveal,
// same mechanic as the homepage hero). Swap `image` to a local file under
// public/images/projects/ to replace without touching code.
export const SHOWCASE_PROJECTS = [
  {
    id: "aureate",
    title: "The Aureate",
    location: "Road No. 45, Jubilee Hills, Hyderabad",
    description: "A limited collection of sky residences with private lift lobbies and panoramic city views.",
    image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=2000&q=80",
    href: "/projects/jubilee-hills",
  },
  {
    id: "skyline-residences",
    title: "Skyline Residences",
    location: "Gachibowli, Hyderabad",
    description: "Contemporary towers set within landscaped grounds, minutes from the city's financial district.",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=2000&q=80",
    href: "/projects",
  },
  {
    id: "the-meridian",
    title: "The Meridian",
    location: "Banjara Hills, Hyderabad",
    description: "Boutique low-rise residences defined by clean architecture and uncompromising craftsmanship.",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2000&q=80",
    href: "/projects",
  },
  {
    id: "palm-grove-villas",
    title: "Palm Grove Villas",
    location: "Kokapet, Hyderabad",
    description: "Gated villa plots on a wooded 5-acre estate, built for families who value privacy and space.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=80",
    href: "/projects",
  },
] as const;
