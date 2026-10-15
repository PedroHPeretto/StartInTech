import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
}: SectionHeadingProps) {
  const isCenter = align === 'center';

  return (
    <div
      className={cn(
        'flex flex-col',
        isCenter ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow && (
        <Badge
          variant="remoto"
          className="mb-3 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-blue"
        >
          {eyebrow}
        </Badge>
      )}
      <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-brand-midnight text-balance max-w-3xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base sm:text-lg text-slate-600 font-sans leading-relaxed text-pretty max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
