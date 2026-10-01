import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CompanyLogoPlateProps {
  src?: string;
  companyName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CompanyLogoPlate({
  src,
  companyName,
  size = 'md',
  className,
}: CompanyLogoPlateProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'size-8 rounded-lg text-xs',
    md: 'size-11 rounded-xl text-sm',
    lg: 'size-14 rounded-2xl text-base',
  };

  const iconSizes = {
    sm: 16,
    md: 22,
    lg: 28,
  };

  const initials = companyName
    ? companyName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
    : 'C';

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center border border-slate-200 bg-white font-heading font-bold text-slate-700 shadow-2xs overflow-hidden select-none',
        sizeClasses[size],
        className,
      )}
      data-testid="company-logo-plate"
      title={companyName}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={companyName}
          onError={() => setImageError(true)}
          className="size-full object-contain p-1"
          data-testid="company-logo-img"
        />
      ) : initials ? (
        <span data-testid="company-initials">{initials}</span>
      ) : (
        <Building2
          size={iconSizes[size]}
          className="text-slate-400"
          data-testid="company-building-fallback"
        />
      )}
    </div>
  );
}
