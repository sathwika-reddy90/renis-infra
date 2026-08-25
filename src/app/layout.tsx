import type { Metadata } from "next";
import {
  Playfair_Display,
  Montserrat,
  Great_Vibes,
  Inter,
  Libertinus_Sans,
} from "next/font/google";
import "./globals.css";
import Providers from "@/lib/query/Providers";
import { SITE_URL } from "@/lib/siteUrl";

// Playfair Display's lightest available weight is 400 (the family ships no
// 300), so 400–700 covers every weight the headings use.
const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const sans = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

// Script accent used by the hero promo panel ("Summer").
const script = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Header/navigation face — matches the reference site's nav typography.
const nav = Inter({
  variable: "--font-nav",
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

// Launch-band display face — matches the reference section's heading font.
const launch = Libertinus_Sans({
  variable: "--font-launch",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const TITLE = "RENIESINFRA — Luxury Residences";
const DESCRIPTION =
  "RENIESINFRA presents landmark luxury residences across Hyderabad's most sought-after addresses. Where architecture, craftsmanship and address meet.";

export const metadata: Metadata = {
  // Lets every page express OG/canonical URLs as relative paths.
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | RENIESINFRA",
  },
  description: DESCRIPTION,
  applicationName: "RENIESINFRA",
  openGraph: {
    type: "website",
    siteName: "RENIESINFRA",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

// Root layout carries fonts + query provider only; the public site and the
// admin CMS each mount their own chrome via nested layouts.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${script.variable} ${nav.variable} ${launch.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
