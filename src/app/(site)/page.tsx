import LandingHero from "@/sections/LandingHero";
import LaunchHighlight from "@/sections/LaunchHighlight";
import Hero from "@/sections/Hero";
import ImageCompare from "@/sections/ImageCompare";
import WhyRenisinfra from "@/sections/WhyRenisinfra";
import Founder from "@/sections/Founder";
import AwardsRecognition from "@/sections/AwardsRecognition";
import Testimonials from "@/sections/Testimonials";
import ContactCTA from "@/sections/ContactCTA";
import FAQ from "@/sections/FAQ";

export default function Home() {
  return (
    <>
      <LandingHero />
      {/*
        Everything below rides up over the hero, which is painted on a fixed
        layer beneath it. The opaque background and the raised stacking context
        are what make that curtain reveal work — drop either and the hero shows
        through the rest of the page.
      */}
      <div className="relative z-10 bg-background">
        <LaunchHighlight />
        {/* ProjectShowcase carries its own section heading, so the former
            standalone FeaturedProjects heading band is no longer needed. */}
        <Hero />
        <ImageCompare />
        <WhyRenisinfra />
        {/* Founder + Reviews share the same grey band and read as one
            continuous leadership section — reduced bottom rhythm here pairs
            with Testimonials' reduced top rhythm. */}
        <Founder rhythmClassName="pt-16 pb-8 md:pt-24 md:pb-8" />
        <Testimonials />
        <AwardsRecognition />
        <ContactCTA />
        <FAQ />
      </div>
    </>
  );
}
