import { cn } from "@/lib/cn";

type Tone = "light" | "cream" | "ink" | "bare";

const TONE: Record<Tone, string> = {
  light: "border border-line bg-white",
  cream: "border border-line bg-cream",
  ink: "border border-white/10 bg-ink-800 text-white",
  bare: "border border-line",
};

export default function Card({
  children,
  tone = "light",
  hover = false,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  /** Adds the shared lift-on-hover treatment. */
  hover?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative transition-all duration-[var(--duration-base)] ease-[var(--ease-lux)]",
        TONE[tone],
        hover && "hover:border-gold/50 hover:shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}
