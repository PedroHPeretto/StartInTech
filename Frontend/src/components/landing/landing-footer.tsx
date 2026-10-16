import { BrandHeader } from '@/components/brand/brand-header';
import { NAV_LINKS } from './landing-content';

export function LandingFooter() {
  return (
    <footer
      className="border-t border-slate-200/80 bg-white py-12 text-slate-600"
      data-testid="landing-footer"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        {/* Brand Info */}
        <div className="flex flex-col gap-3">
          <BrandHeader href="/" showTagline={false} />
          <p className="max-w-md text-xs font-sans text-slate-500 leading-relaxed">
            Plataforma dedicada a capacitar estudantes e iniciantes a
            conquistarem seu primeiro emprego em tecnologia por meio de análise
            ATS, roadmaps práticos e vagas com match inteligente.
          </p>
        </div>

        {/* Anchor Links */}
        <nav
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-600"
          aria-label="Links do rodapé"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-brand-blue"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="mx-auto mt-8 flex max-w-7xl flex-col items-center justify-between border-t border-slate-100 px-4 pt-6 text-[11px] text-slate-400 sm:px-6 lg:px-8 md:flex-row">
        <span>© 2026 StartInTech. Todos os direitos reservados.</span>
        <span className="mt-2 md:mt-0 font-medium">
          Acelerando seu primeiro degrau tech.
        </span>
      </div>
    </footer>
  );
}
