import { Footer } from "@/components/Footer";
import { FavoritesProvider } from "@/components/FavoritesProvider";
import { Navbar } from "@/components/Navbar";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <FavoritesProvider>
      <Navbar />
      {children}
      <WhatsAppButton />
      <Footer />
    </FavoritesProvider>
  );
}
