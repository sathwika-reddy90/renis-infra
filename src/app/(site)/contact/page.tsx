import type { Metadata } from "next";
import ContactPageContent from "@/components/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact",
  description: "Speak with a RENIESINFRA residence advisor and schedule your private viewing.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}
