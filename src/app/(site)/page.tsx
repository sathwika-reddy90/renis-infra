import LandingHero from "@/sections/LandingHero";
import LaunchHighlight from "@/sections/LaunchHighlight";
import Hero from "@/sections/Hero";
import FeaturedProjects from "@/sections/FeaturedProjects";
import ProjectShowcase from "@/sections/ProjectShowcase";
import WhyRenisinfra from "@/sections/WhyRenisinfra";
import Founder from "@/sections/Founder";
import NewsEvents from "@/sections/NewsEvents";
import Testimonials from "@/sections/Testimonials";
import ContactCTA from "@/sections/ContactCTA";
import FAQ from "@/sections/FAQ";

export default function Home() {
  return (
    <>
      <LandingHero />
      <LaunchHighlight />
      <Hero />
      <FeaturedProjects />
      <ProjectShowcase />
      <WhyRenisinfra />
      <Founder />
      <NewsEvents />
      <Testimonials />
      <ContactCTA />
      <FAQ />
    </>
  );
}
