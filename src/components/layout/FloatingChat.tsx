import { CONTACT } from "@/config/company";

/**
 * Floating chat bubble pinned to the bottom-right of every public page.
 * Opens a WhatsApp conversation with the site's contact number.
 */
export default function FloatingChat() {
  const waHref = `https://wa.me/${CONTACT.phone.replace(/\D/g, "")}`;

  return (
    <a
      href={waHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-[60] flex h-16 w-16 items-center justify-center rounded-full bg-[#c9a878] shadow-[0_6px_24px_rgba(11,23,48,0.28)] transition-colors duration-[var(--duration-base)] hover:bg-[#b8975f]"
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3C6.9 3 3 6.5 3 10.8c0 2.3 1.1 4.3 2.9 5.7-.1.9-.5 2.3-1.6 3.4 0 0 2.6-.2 4.5-1.5.7.2 1.4.3 2.2.3 5.1 0 9-3.5 9-7.9C21 6.5 17.1 3 12 3Z"
          fill="#ffffff"
        />
        <circle cx="8.4" cy="10.9" r="1.1" fill="#c9a878" />
        <circle cx="12" cy="10.9" r="1.1" fill="#c9a878" />
        <circle cx="15.6" cy="10.9" r="1.1" fill="#c9a878" />
      </svg>
    </a>
  );
}
