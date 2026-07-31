import Container from "@/components/ui/Container";
import { cn } from "@/lib/cn";

type Tone = "light" | "sand" | "cream" | "ink";
type Rhythm = "sm" | "md" | "lg" | "none";

const TONE: Record<Tone, string> = {
  light: "bg-background text-ink",
  sand: "bg-sand text-ink",
  cream: "bg-cream text-ink",
  ink: "bg-ink text-white",
};

const RHYTHM: Record<Rhythm, string> = {
  none: "",
  sm: "py-section-sm",
  md: "py-section",
  lg: "py-section-lg",
};

export interface SectionProps {
  children: React.ReactNode;
  /** Background + text pairing. Defaults to the white page surface. */
  tone?: Tone;
  /** Vertical rhythm from the spacing scale. */
  rhythm?: Rhythm;
  /** Anchor target for the sticky sub-nav / scrollspy. */
  id?: string;
  className?: string;
  /** Set false to opt out of the max-width gutter (full-bleed sections). */
  contained?: boolean;
  containerClassName?: string;
}

/**
 * Standard page section: owns background tone and vertical rhythm so no
 * section hand-writes `py-24 md:py-32 bg-cream` again.
 */
export default function Section({
  children,
  tone = "light",
  rhythm = "md",
  id,
  className,
  contained = true,
  containerClassName,
}: SectionProps) {
  return (
    <section id={id} className={cn("relative", TONE[tone], RHYTHM[rhythm], className)}>
      {contained ? (
        <Container className={containerClassName}>{children}</Container>
      ) : (
        children
      )}
    </section>
  );
}
