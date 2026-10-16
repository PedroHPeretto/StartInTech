import { Link } from '@tanstack/react-router';
import { ArrowRight, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { ProductMockup } from './product-mockup';
import type { LandingCtaConfig } from './landing-cta';
import { cn } from '@/lib/utils';

export interface HeroSectionProps {
  ctaConfig: LandingCtaConfig;
}

export function HeroSection({ ctaConfig }: HeroSectionProps) {
  const { eyebrow, primaryCta, secondaryCta } = ctaConfig;

  return (
    <section
      className="relative overflow-hidden bg-white pt-10 pb-20 md:pt-16 md:pb-28 lg:pt-20 lg:pb-32"
      data-testid="hero-section"
    >
      {/* Background Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
        aria-hidden
      />

      {/* Ambient background blur blobs */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-96 rounded-full bg-brand-blue/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-40 right-10 size-80 rounded-full bg-brand-emerald/15 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column: Headlines & CTAs */}
          <div className="flex flex-col items-start text-left">
            <Badge
              variant="remoto"
              className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold text-brand-blue shadow-xs"
              data-testid="hero-eyebrow"
            >
              {eyebrow}
            </Badge>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-midnight leading-[1.1] text-balance">
              Seu primeiro emprego em{' '}
              <span className="text-gradient-brand">tech</span> começa aqui.
            </h1>

            <p className="mt-5 text-lg sm:text-xl font-sans text-slate-600 leading-relaxed text-pretty max-w-xl">
              Analise seu currículo como um recrutador, descubra o que falta e
              receba um roadmap e vagas feitas para você.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link
                to={primaryCta.to}
                className={cn(
                  buttonVariants({ variant: 'hero', size: 'xl' }),
                  'group justify-center text-center shadow-glow w-full sm:w-auto',
                )}
                data-testid="hero-primary-cta"
              >
                <span>{primaryCta.label}</span>
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <a
                href={secondaryCta.href}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'xl' }),
                  'justify-center text-center w-full sm:w-auto bg-white/80 border-slate-300/80 hover:bg-slate-50',
                )}
                data-testid="hero-secondary-cta"
              >
                {secondaryCta.label}
              </a>
            </div>

            {/* Microcopy features */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-brand-emerald" />
                Gratuito
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-brand-emerald" />
                Sem cartão de crédito
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-brand-emerald" />
                Login com Google
              </span>
            </div>
          </div>

          {/* Right Column: Visual Product Mockup */}
          <div className="w-full">
            <ProductMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
