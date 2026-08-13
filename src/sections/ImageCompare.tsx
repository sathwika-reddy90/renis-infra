import Container from "@/components/ui/Container";
import CompareSlider from "@/components/ui/CompareSlider";

/**
 * Temporary wiring so CompareSlider actually renders somewhere and can be
 * profiled for real, instead of being reasoned about in the abstract.
 * Placement/images are placeholders — swap freely once perf work is done.
 */
export default function ImageCompare() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        {/* <CompareSlider
          before={{
            src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
            alt: "Before",
          }}
          after={{
            src: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=80",
            alt: "After",
          }}
          className="aspect-[16/9] w-full rounded-md"
        /> */}
      </Container>
    </section>
  );
}
