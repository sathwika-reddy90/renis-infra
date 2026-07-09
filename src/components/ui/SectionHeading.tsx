import Reveal from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
  invert?: boolean;
};

// Consistent eyebrow + display title block used across every section.
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  invert = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <span className="eyebrow flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2
          className={cn(
            "font-display text-4xl font-light leading-[1.05] md:text-5xl lg:text-[3.4rem]",
            invert ? "text-white" : "text-ink",
          )}
        >
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.1}>
          <p
            className={cn(
              "max-w-xl text-[0.98rem] leading-relaxed",
              align === "center" ? "mx-auto" : "",
              invert ? "text-white/70" : "text-muted",
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
