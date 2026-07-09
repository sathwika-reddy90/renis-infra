import { Instagram, Facebook, Linkedin, Youtube } from "@/components/ui/SocialIcons";
import Container from "@/components/ui/Container";
import { NAV_LINKS } from "@/config/navigation";
import { CONTACT } from "@/config/company";

const SOCIALS = [
  { icon: Instagram, href: "#" },
  { icon: Facebook, href: "#" },
  { icon: Linkedin, href: "#" },
  { icon: Youtube, href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <Container className="py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <a href="#home" className="font-display text-3xl font-semibold tracking-[0.12em]">
              RENIS<span className="text-gold">INFRA</span>
            </a>
            <p className="mt-5 max-w-sm text-[0.92rem] leading-relaxed text-white/60">
              Crafting landmark luxury residences where architecture,
              craftsmanship and address meet.
            </p>
            <div className="mt-7 flex gap-3">
              {SOCIALS.map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors duration-300 hover:border-gold hover:text-gold"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div className="md:col-span-3">
            <h4 className="text-[0.72rem] uppercase tracking-[0.24em] text-gold">Explore</h4>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[0.92rem] text-white/65 transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h4 className="text-[0.72rem] uppercase tracking-[0.24em] text-gold">Get in Touch</h4>
            <ul className="mt-5 space-y-3 text-[0.92rem] text-white/65">
              <li>{CONTACT.address}</li>
              <li>
                <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-white">
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="transition-colors hover:text-white">
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-[0.78rem] text-white/45 md:flex-row">
          <p>© {new Date().getFullYear()} RENISINFRA. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-white">Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-white">Terms of Use</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
