import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Menu } from 'lucide-react';
import { BrandHeader } from '@/components/brand/brand-header';
import { Button, buttonVariants } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/avatar';
import {
  Sheet,
  SheetPopup,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { NAV_LINKS } from './landing-content';
import type { LandingCtaConfig } from './landing-cta';
import { cn } from '@/lib/utils';

export interface LandingNavbarProps {
  ctaConfig: LandingCtaConfig;
}

export function LandingNavbar({ ctaConfig }: LandingNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { navActions } = ctaConfig;

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md transition-all"
      data-testid="landing-navbar"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <BrandHeader href="/" showTagline={false} />

          {/* Desktop Navigation */}
          <nav
            className="hidden items-center gap-6 md:flex"
            aria-label="Navegação da página inicial"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-brand-blue"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {navActions.showLoginLink && (
            <Link
              to="/login"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'font-medium',
              )}
            >
              Entrar
            </Link>
          )}

          {navActions.userInitials && (
            <UserAvatar name={navActions.userInitials} size="sm" />
          )}

          <Link
            to={navActions.primaryTo}
            className={cn(
              buttonVariants({
                variant: 'hero',
                size: 'sm',
              }),
              'rounded-full px-4',
            )}
            data-testid="navbar-cta-button"
          >
            {navActions.primaryLabel}
          </Link>
        </div>

        {/* Mobile Hamburger Trigger */}
        <div className="flex md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Abrir menu de navegação"
                  data-testid="mobile-menu-trigger"
                >
                  <Menu className="size-6 text-brand-midnight" />
                </Button>
              }
            />
            <SheetPopup side="right" className="flex flex-col justify-between">
              <div>
                <SheetHeader className="mb-6">
                  <SheetTitle>
                    <BrandHeader href="/" showTagline={false} />
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-4" aria-label="Menu móvel">
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-base font-semibold text-brand-midnight transition-colors hover:text-brand-blue py-1"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
                {navActions.showLoginLink && (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'lg' }),
                      'w-full justify-center',
                    )}
                  >
                    Entrar
                  </Link>
                )}

                <Link
                  to={navActions.primaryTo}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    buttonVariants({ variant: 'hero', size: 'lg' }),
                    'w-full justify-center rounded-full',
                  )}
                  data-testid="mobile-navbar-cta"
                >
                  {navActions.primaryLabel}
                </Link>
              </div>
            </SheetPopup>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
