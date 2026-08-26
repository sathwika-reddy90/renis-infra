import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import Container from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Renies Project",
  description: "A preview of upcoming RENIESINFRA developments across Hyderabad.",
};

// Demo content — these are preview placeholders, not live CMS-backed listings.
const DEMO_PROJECTS = [
  {
    id: "meridian-residences",
    status: "New Launch",
    title: "The Meridian Residences",
    location: "Kokapet, Hyderabad",
    configuration: "3 & 4 BHK",
    price: "₹2.4 Cr onwards",
  },
  {
    id: "orchid-heights",
    status: "Now Selling",
    title: "Orchid Heights",
    location: "Financial District",
    configuration: "2 & 3 BHK",
    price: "₹1.8 Cr onwards",
  },
  {
    id: "the-crestview",
    status: "Ready to Move",
    title: "The Crestview",
    location: "Gachibowli",
    configuration: "3, 4 & 5 BHK",
    price: "₹3.1 Cr onwards",
  },
  {
    id: "palm-grove-villas",
    status: "Coming Soon",
    title: "Palm Grove Villas",
    location: "Tellapur",
    configuration: "4 BHK Villas",
    price: "Price on request",
  },
  {
    id: "skyline-pavilion",
    status: "Now Selling",
    title: "Skyline Pavilion",
    location: "Kondapur",
    configuration: "2 & 3 BHK",
    price: "₹1.5 Cr onwards",
  },
  {
    id: "the-regalia",
    status: "New Launch",
    title: "The Regalia",
    location: "Jubilee Hills",
    configuration: "4 & 5 BHK",
    price: "₹4.6 Cr onwards",
  },
];

export default function RenisProjectsPage() {
  return (
    <>
      <PageHero
        variant="brand"
        eyebrow="Renies Project"
        title={
          <>
            A Preview of <span className="italic text-gold-soft">What&apos;s Next</span>
          </>
        }
        subtitle="A first look at upcoming RENIESINFRA developments across Hyderabad."
        image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Renies Project" }]}
      />

      <section className="bg-background py-section">
        <Container>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_PROJECTS.map((project) => (
              <div key={project.id} className="text-left">
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <Image
                    src="/images/placeholder-project.jpg"
                    alt={project.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <span className="absolute left-4 top-4 bg-white/90 px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.2em] text-ink backdrop-blur">
                    {project.status}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-display-3 text-ink">{project.title}</h3>
                <p className="mt-2 text-body text-muted">{project.location}</p>

                <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
                  <div>
                    <dt className="text-[0.66rem] uppercase tracking-[0.2em] text-muted">
                      Configuration
                    </dt>
                    <dd className="mt-1 font-display text-h3 text-ink">{project.configuration}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.66rem] uppercase tracking-[0.2em] text-muted">Price</dt>
                    <dd className="mt-1 font-display text-h3 text-gold">{project.price}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
