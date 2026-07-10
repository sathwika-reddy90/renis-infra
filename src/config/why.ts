// Data for the homepage "Why RENISINFRA? / Why Invest With RENISINFRA?"
// split section — 8 items per side (4 per row x 2 rows), matching the
// Danube-style icon-grid layout. No dedicated backend endpoint.

export const WHY_RENISINFRA_STATS = [
  { icon: "years", stat: "18+", label: "Years of Craftsmanship" },
  { icon: "residences", stat: "42+", label: "Landmark Residences" },
  { icon: "sqft", stat: "3.2M", label: "Sq.Ft. Delivered" },
  { icon: "families", stat: "6,500+", label: "Families at Home" },
  { icon: "delivery", stat: "100%", label: "On-Time Handovers" },
  { icon: "awards", stat: "15+", label: "Design Awards" },
  { icon: "amenities", stat: "40+", label: "Premium Amenities" },
  { icon: "locations", stat: "6", label: "Signature Addresses" },
] as const;

export const INVEST_REASONS = [
  { icon: "location", stat: "12+", label: "Prime Locations" },
  { icon: "roi", stat: "9.5%", label: "Avg. Rental ROI" },
  { icon: "shield", stat: "100%", label: "RERA Approved" },
  { icon: "clock", stat: "0", label: "Delayed Handovers" },
  { icon: "freehold", stat: "100%", label: "Freehold Ownership" },
  { icon: "interest", stat: "0%", label: "Interest-Free Plans" },
  { icon: "growth", stat: "30+", label: "Years of Legacy Value" },
  { icon: "support", stat: "24/7", label: "Advisor Support" },
] as const;
