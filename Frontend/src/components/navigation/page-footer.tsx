import { BrandHeader } from '@/components/brand/brand-header';
import { cn } from '@/lib/utils';

export interface FooterLink {
  label: string;
  href: string;
}

export interface PageFooterProps {
  links?: FooterLink[];
  className?: string;
}

const defaultLinks: FooterLink[] = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Vagas', href: '#vagas' },
  { label: 'Trilhas de Carreira', href: '#trilhas' },
  { label: 'Termos de Uso', href: '#termos' },
  { label: 'Privacidade', href: '#privacidade' },
];

export function PageFooter({
  links = defaultLinks,
  className,
}: PageFooterProps) {
  return (
    <footer
      className={cn(
        'w-full border-t border-slate-200 bg-white py-8 px-6 md:px-12 select-none',
        className,
      )}
      data-testid="page-footer"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Brand & Purpose */}
        <div className="flex flex-col gap-2">
          <BrandHeader variant="compact" showTagline={false} />
          <p className="max-w-md text-xs font-sans text-slate-500">
            Acompanhe seu perfil, vagas compatíveis e recomendações inteligentes
            para impulsionar sua carreira em TI.
          </p>
        </div>

        {/* Navigation Links */}
        <nav
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-600"
          aria-label="Links do rodapé"
          data-testid="footer-links"
        >
          {links.map((link) => (
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

      <div className="mx-auto mt-6 flex max-w-7xl flex-col items-center justify-between border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400 md:flex-row">
        <span>© 2026 StartInTech. Todos os direitos reservados.</span>
        <span className="mt-2 md:mt-0 font-medium">
          Desenvolvido com foco no seu primeiro degrau tech.
        </span>
      </div>
    </footer>
  );
}
