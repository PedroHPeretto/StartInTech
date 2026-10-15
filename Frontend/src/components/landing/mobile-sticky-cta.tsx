import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import type { LandingCtaConfig } from './landing-cta';
import { cn } from '@/lib/utils';

export interface MobileStickyCtaProps {
  ctaConfig: LandingCtaConfig;
}

export function MobileStickyCta({ ctaConfig }: MobileStickyCtaProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { primaryCta } = ctaConfig;

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down 280px (past the initial hero button)
      if (window.scrollY > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t border-slate-200 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md transition-all duration-300 md:hidden animate-in slide-in-from-bottom"
      data-testid="mobile-sticky-cta"
    >
      <div className="flex flex-col">
        <span className="font-heading text-xs font-bold text-brand-midnight">
          StartInTech
        </span>
        <span className="text-[11px] text-slate-500">100% gratuito</span>
      </div>

      <Link
        to={primaryCta.to}
        className={cn(
          buttonVariants({ variant: 'hero', size: 'sm' }),
          'rounded-full px-4 font-semibold text-xs gap-1.5',
        )}
      >
        <span>{primaryCta.label}</span>
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
