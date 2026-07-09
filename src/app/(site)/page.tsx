import Hero from "@/sections/Hero";
import FeaturedProjects from "@/sections/FeaturedProjects";
import WhyRenisinfra from "@/sections/WhyRenisinfra";
import Amenities from "@/sections/Amenities";
import JubileeHighlight from "@/sections/JubileeHighlight";
import GalleryPreview from "@/sections/GalleryPreview";
import Testimonials from "@/sections/Testimonials";
import AboutPreview from "@/sections/AboutPreview";
import ContactCTA from "@/sections/ContactCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProjects />
      <WhyRenisinfra />
      <Amenities />
      <JubileeHighlight />
      <GalleryPreview />
      <Testimonials />
      <AboutPreview />
      <ContactCTA />
    </>
  );
}
