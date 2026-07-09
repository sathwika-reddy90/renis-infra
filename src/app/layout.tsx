import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/query/Providers";

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

export const metadata: Metadata = {
  title: "RENISINFRA — Luxury Residences",
  description:
    "RENISINFRA crafts landmark luxury residences in Jubilee Hills and beyond. Where architecture, craftsmanship and address meet.",
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
      <body className="min-h-full flex flex-col bg-background text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
