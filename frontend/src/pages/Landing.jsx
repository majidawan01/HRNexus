import { MotionConfig } from 'framer-motion';
import LandingNav from '../components/landing/LandingNav';
import Hero from '../components/landing/Hero';
import FeatureGrid from '../components/landing/FeatureGrid';
import Pricing from '../components/landing/Pricing';
import Faq from '../components/landing/Faq';
import Footer from '../components/landing/Footer';

export default function Landing() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-bg">
        <LandingNav />
        <main>
          <Hero />
          <FeatureGrid />
          <Pricing />
          <Faq />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
