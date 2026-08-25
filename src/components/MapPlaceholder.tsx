import { MapPin } from "lucide-react";

// Styled map placeholder (no API key / backend). Links out to Google Maps search.
export default function MapPlaceholder({
  label,
  query,
  className = "",
}: {
  label: string;
  query: string;
  className?: string;
}) {
  const href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative block overflow-hidden bg-cream ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gold/10" />
      <div className="relative flex h-full min-h-[320px] flex-col items-center justify-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-white shadow-lg transition-transform duration-500 ease-[var(--ease-lux)] group-hover:-translate-y-1">
          <MapPin size={24} />
        </span>
        <div>
          <p className="font-display text-2xl font-medium">{label}</p>
          <p className="mt-1 text-[0.75rem] uppercase tracking-[0.2em] text-gold">
            View on Google Maps
          </p>
        </div>
      </div>
    </a>
  );
}
