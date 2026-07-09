"use client";

import ContactForm from "@/components/ContactForm";
import { useProjects } from "@/lib/query/hooks";

// Builds the "Interested In" options from live projects, then delegates to ContactForm.
export default function EnquiryForm() {
  const { data } = useProjects();
  const interests = [...(data?.map((p) => p.title) ?? []), "General Enquiry"];
  return <ContactForm interests={interests} />;
}
