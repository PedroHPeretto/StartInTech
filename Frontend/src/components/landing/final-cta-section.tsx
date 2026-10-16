import { Link } from '@tanstack/react-router';
import { ArrowRight, Sparkles } from 'lucide-react';
import loginTechImg from '@/assets/images/login-tech-img.jpg';
import { buttonVariants } from '@/components/ui/button';
import type { LandingCtaConfig } from './landing-cta';
import { cn } from '@/lib/utils';

export interface FinalCtaSectionProps {
  ctaConfig: LandingCtaConfig;
}

export function FinalCtaSection({ ctaConfig }: FinalCtaSectionProps) {
  const { primaryCta } = ctaConfig;

  return (
    <section
      className="relative overflow-hidden bg-brand-midnight py-24 sm:py-32 text-white"
      data-testid="final-cta-section"
    >
      {/* Circuit background image with blend */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25 mix-blend-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${loginTechImg})` }}
        aria-hidden
      />

      {/* Radial ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,132,199,0.35)_0%,transparent_70%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold text-sky-300 backdrop-blur-xs">
          <Sparkles className="size-3.5 text-sky-400" />
          Acelere sua entrada no mercado tech
        </div>

        <h2 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-white text-balance leading-tight">
          Pare de enviar currículos no escuro.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg font-sans text-slate-300 leading-relaxed text-pretty">
          Junte-se a quem já descobriu como os recrutadores analisam currículos
          e tenha um plano de ação claro para conquistar sua vaga.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to={primaryCta.to}
            className={cn(
              buttonVariants({ variant: 'hero', size: 'xl' }),
              'w-full sm:w-auto shadow-glow justify-center text-center',
            )}
            data-testid="final-cta-button"
          >
            <span>{primaryCta.label}</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Acesso imediato e gratuito · Sem burocracia
        </p>
      </div>
    </section>
  );
}
