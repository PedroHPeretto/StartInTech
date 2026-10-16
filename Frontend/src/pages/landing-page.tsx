import { useAuth } from '@/auth/use-auth';
import { getLandingCta } from '@/components/landing/landing-cta';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { HeroSection } from '@/components/landing/hero-section';
import { PainPointsSection } from '@/components/landing/pain-points-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { CareerTracksSection } from '@/components/landing/career-tracks-section';
import { FaqSection } from '@/components/landing/faq-section';
import { FinalCtaSection } from '@/components/landing/final-cta-section';
import { LandingFooter } from '@/components/landing/landing-footer';
import { MobileStickyCta } from '@/components/landing/mobile-sticky-cta';

export function LandingPage() {
  const auth = useAuth();
  const ctaConfig = getLandingCta(auth);

  return (
    <div
      className="flex min-h-screen flex-col bg-white text-slate-800"
      data-testid="landing-page"
    >
      <LandingNavbar ctaConfig={ctaConfig} />
      <main className="flex-1">
        <HeroSection ctaConfig={ctaConfig} />
        <PainPointsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CareerTracksSection />
        <FaqSection />
        <FinalCtaSection ctaConfig={ctaConfig} />
      </main>
      <LandingFooter />
      <MobileStickyCta ctaConfig={ctaConfig} />
    </div>
  );
}
