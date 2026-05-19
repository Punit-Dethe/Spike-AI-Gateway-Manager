import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import TunnelSection from '@/components/TunnelSection';
import ApiSection from '@/components/ApiSection';
import Install from '@/components/Install';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <TunnelSection />
        <ApiSection />
        <Install />
      </main>
      <Footer />
    </>
  );
}
