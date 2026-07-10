import type { Metadata } from "next";
import ContactPageContent from "@/components/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact — RENISINFRA",
  description: "Speak with a RENISINFRA residence advisor and schedule your private viewing.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}
