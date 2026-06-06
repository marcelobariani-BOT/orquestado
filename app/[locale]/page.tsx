import NavBar from '@/components/ui/NavBar';
import HeroSection from '@/components/sections/HeroSection';
import ControlRoomScene from '@/components/sections/ControlRoomScene';
import GallerySection from '@/components/sections/GallerySection';
import FinalCTA from '@/components/sections/FinalCTA';

export default function HomePage() {
  return (
    <main className="relative">
      <NavBar />
      <HeroSection />
      <ControlRoomScene />
      <GallerySection />
      <FinalCTA />
    </main>
  );
}
