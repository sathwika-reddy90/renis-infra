import { cn } from "@/lib/cn";

type Tone = "gold" | "ink" | "light" | "outline" | "success";

const TONE: Record<Tone, string> = {
  gold: "bg-gold text-white",
  ink: "bg-ink text-white",
  light: "bg-white/90 text-ink backdrop-blur-sm",
  outline: "border border-current text-gold",
  success: "bg-emerald-600 text-white",
};

export default function Badge({
  children,
  tone = "gold",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.2em]",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
