// Homepage News & Events grid — no dedicated backend endpoint, config-driven.
// Swap `image` to a local file under public/images/news/ to replace without touching code.
export const NEWS_ITEMS = [
  {
    id: "n1",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80",
    date: "12 Jun 2026",
    title: "RENISINFRA breaks ground on The Aureate, Jubilee Hills",
    href: "/projects/jubilee-hills",
  },
  {
    id: "n2",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
    date: "28 Apr 2026",
    title: "RENISINFRA wins Realty Excellence Award for Design Innovation",
    href: "/about",
  },
  {
    id: "n3",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",
    date: "15 Feb 2026",
    title: "A look inside our newest experience centre in Gachibowli",
    href: "/gallery",
  },
  {
    id: "n4",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
    date: "03 Jan 2026",
    title: "6,500 families and counting — a milestone for RENISINFRA",
    href: "/about",
  },
] as const;
