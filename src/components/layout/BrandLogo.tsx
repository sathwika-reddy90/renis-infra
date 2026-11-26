import { cn } from "@/lib/cn";

/*
 * The RENIS INFRA logo, set in type rather than shipped as an image, so it
 * stays sharp at every size and needs no request to paint.
 *
 *   header:  RENIS INFRA                 one line — large gold RENIS, small
 *            Luxury Lifestyle Projects   white INFRA centred on it; tagline below
 *
 *   footer:  RENIS                       stacked
 *            INFRA
 *            Luxury Lifestyle Projects
 *
 * Noto Serif (--font-logo, loaded in app/layout.tsx) is the serif of the
 * supplied artwork, and the gold is sampled from it.
 *
 * Letter-spacing also trails the last glyph, which would push the words off
 * centre; each tracked word's negative right margin cancels exactly that
 * trailing space, so the tagline centres on the letters themselves.
 *
 * `cn` only joins class names (no tailwind-merge), so anything that differs
 * between sizes — layout, weight, tracking, leading — lives in SIZES, never in
 * the shared classes below, where two values would clash.
 */

type Size = "header" | "footer";

const SIZES: Record<Size, { wordmark: string; renis: string; infra: string; tagline: string }> = {
  // Fits the fixed header (72px below lg, 80px from lg) without growing it.
  // Width is the real constraint: from lg the desktop menu and the
  // Contact/WhatsApp buttons share the row, so between 1024px and 1179px the
  // logo keeps the footprint of the previous logo (~148px), from 1180px it
  // returns to the tablet size, and xl gets the full desktop size. Tablets
  // have no desktop menu, so they can take the larger size.
  //
  // Each size owns its own, non-overlapping width range (md:max-lg, …) so
  // exactly one rule applies at any width: Tailwind doesn't reliably order
  // arbitrary px breakpoints against its rem ones, so overlapping ranges
  // could resolve the wrong way round.
  //
  // RENIS and INFRA are capitals only, so their line boxes are trimmed to
  // about cap height (leading < 1): `items-center` then centres INFRA on
  // RENIS's letters, not on the font's built-in space above and below them.
  // The tagline's bottom padding offsets its descenders (y, j) so the whole
  // mark centres optically on the menu text instead of sitting low.
  header: {
    wordmark:
      "flex-row items-center whitespace-nowrap gap-[0.4rem] md:max-lg:gap-[0.45rem] min-[1180px]:max-xl:gap-[0.45rem] xl:gap-[0.55rem]",
    renis:
      "mr-[-0.06em] font-bold leading-[0.74] tracking-[0.06em] text-[1.75rem] max-[360px]:text-[1.625rem] md:max-lg:text-[2.25rem] lg:max-[1180px]:text-[1.625rem] min-[1180px]:max-xl:text-[2.25rem] xl:text-[2.75rem]",
    // translate-y sets INFRA slightly below the middle of RENIS's letters —
    // about 3.4% of RENIS's size at every width (1.5px at 44px). The amount
    // differs per range because `items-center` lands INFRA a little
    // differently at each size (sub-pixel rounding of the trimmed line
    // boxes); each value is measured. Translate moves the letters only, so
    // the layout doesn't shift.
    // `relative top-[0.125em]` then lowers INFRA a little further, to sit in
    // the middle of RENIS as in the reference: 3px on desktop (24px INFRA),
    // scaling with INFRA's size on smaller screens. Position-only — nothing
    // around it moves.
    infra:
      "relative top-[0.125em] mr-[-0.2em] leading-[0.74] tracking-[0.2em] translate-y-[0.16em] text-[0.9375rem] max-[360px]:translate-y-[0.03em] max-[360px]:text-[0.875rem] md:max-lg:translate-y-[0.1em] md:max-lg:text-[1.25rem] lg:max-[1180px]:translate-y-[0.03em] lg:max-[1180px]:text-[0.875rem] min-[1180px]:max-xl:translate-y-[0.1em] min-[1180px]:max-xl:text-[1.25rem] xl:translate-y-[0.1em] xl:text-[1.5rem]",
    tagline:
      "mt-[0.3rem] pb-[0.1rem] font-normal text-[0.6rem] md:max-lg:pb-[0.16rem] md:max-lg:text-[0.65rem] min-[1180px]:max-xl:pb-[0.16rem] min-[1180px]:max-xl:text-[0.65rem] xl:pb-[0.21rem] xl:text-[0.75rem]",
  },
  footer: {
    wordmark: "flex-col items-center",
    renis: "mr-[-0.1em] font-medium tracking-[0.1em] text-[2.75rem] sm:text-[3.25rem]",
    infra:
      "mt-[0.4rem] mr-[-0.5em] tracking-[0.5em] text-[1.05rem] sm:mt-[0.3rem] sm:text-[1.2rem]",
    tagline: "mt-[0.55rem] text-[0.9rem] font-light sm:mt-[0.65rem] sm:text-[1rem]",
  },
};

export default function BrandLogo({
  size = "header",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span
      className={cn(
        "flex flex-col items-center text-center leading-none [font-family:var(--font-logo),Georgia,serif]",
        className,
      )}
    >
      <span className={cn("flex", s.wordmark)}>
        <span className={cn("uppercase text-[#FEB625]", s.renis)}>RENIS</span>
        <span className={cn("uppercase text-white", s.infra)}>INFRA</span>
      </span>
      <span
        className={cn(
          "block mr-[-0.04em] whitespace-nowrap tracking-[0.04em] text-white",
          s.tagline,
        )}
      >
        Luxury Lifestyle Projects
      </span>
    </span>
  );
}
