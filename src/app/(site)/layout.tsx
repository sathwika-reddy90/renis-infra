import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ScheduleVisitProvider } from "@/components/ScheduleVisitContext";

// Public site chrome — identical to the previous root-layout arrangement.
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ScheduleVisitProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </ScheduleVisitProvider>
  );
}
