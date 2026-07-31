import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/query/Providers";
import { SITE_URL } from "@/lib/siteUrl";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const sans = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const TITLE = "RENISINFRA — Luxury Residences";
const DESCRIPTION =
  "RENISINFRA presents landmark luxury residences across Hyderabad's most sought-after addresses. Where architecture, craftsmanship and address meet.";

export const metadata: Metadata = {
  // Lets every page express OG/canonical URLs as relative paths.
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | RENISINFRA",
  },
  description: DESCRIPTION,
  applicationName: "RENISINFRA",
  openGraph: {
    type: "website",
    siteName: "RENISINFRA",
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
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
