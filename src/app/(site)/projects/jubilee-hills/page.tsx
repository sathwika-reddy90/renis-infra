import type { Metadata } from "next";
import JubileeHillsContent from "@/components/JubileeHillsContent";

export const metadata: Metadata = {
  title: "The Aureate, Jubilee Hills — RENISINFRA",
  description:
    "The Aureate — a limited collection of 4 & 5 BHK sky residences in the heart of Jubilee Hills, Hyderabad.",
};

export default function JubileeHillsPage() {
  return <JubileeHillsContent />;
}
