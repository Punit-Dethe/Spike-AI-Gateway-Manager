import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Explainer from '@/components/Explainer';
import Features from '@/components/Features';
import TunnelSection from '@/components/TunnelSection';
import ApiSection from '@/components/ApiSection';
import Install from '@/components/Install';
import CtaBanner from '@/components/CtaBanner';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Explainer />
        <Features />
        <TunnelSection />
        <ApiSection />
        <Install />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
