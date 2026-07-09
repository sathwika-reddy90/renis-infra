// Minimal inline social glyphs (lucide removed brand icons for trademark reasons).
type IconProps = { size?: number; className?: string };

export function Instagram({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Facebook({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M14 9h3l.5-3H14V4.5c0-.9.3-1.5 1.6-1.5H17V.2C16.7.1 15.6 0 14.3 0 11.6 0 10 1.6 10 4.2V6H7v3h3v9h4V9z" />
    </svg>
  );
}

export function Linkedin({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.5 8.65 21 11 21 14.1V21h-4v-6.1c0-1.45-.03-3.3-2-3.3s-2.3 1.57-2.3 3.2V21H9z" />
    </svg>
  );
}

export function Youtube({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23 12c0-1.9-.2-3.3-.4-4-.3-1-1-1.7-2-2C19 5.5 12 5.5 12 5.5s-7 0-8.6.5c-1 .3-1.7 1-2 2-.2.7-.4 2.1-.4 4s.2 3.3.4 4c.3 1 1 1.7 2 2 1.6.5 8.6.5 8.6.5s7 0 8.6-.5c1-.3 1.7-1 2-2 .2-.7.4-2.1.4-4zM10 15.5v-7l6 3.5-6 3.5z" />
    </svg>
  );
}
