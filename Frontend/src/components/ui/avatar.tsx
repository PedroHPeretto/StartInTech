import { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UserAvatarProps {
  src?: string;
  name: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy';
  className?: string;
}

export function UserAvatar({
  src,
  name,
  alt,
  size = 'md',
  status,
  className,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-12 text-base',
    xl: 'size-16 text-xl',
  };

  const statusSizeClasses = {
    sm: 'size-2.5',
    md: 'size-3',
    lg: 'size-3.5',
    xl: 'size-4',
  };

  const statusColorClasses = {
    online: 'bg-emerald-500 ring-white',
    offline: 'bg-slate-400 ring-white',
    busy: 'bg-amber-500 ring-white',
  };

  const initials = name
    ? name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join('')
    : '';

  return (
    <div
      className={cn('relative inline-flex shrink-0 select-none', className)}
      data-testid="user-avatar-container"
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-sky-100 font-heading font-semibold text-sky-800 overflow-hidden ring-2 ring-white shadow-2xs',
          sizeClasses[size],
        )}
        data-testid="user-avatar"
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt ?? name}
            onError={() => setImageError(true)}
            className="size-full object-cover"
            data-testid="user-avatar-img"
          />
        ) : initials ? (
          <span data-testid="user-avatar-initials">{initials}</span>
        ) : (
          <User className="size-1/2 text-sky-700" />
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2',
            statusSizeClasses[size],
            statusColorClasses[status],
          )}
          aria-label={`Status: ${status}`}
          data-testid="user-avatar-status"
        />
      )}
    </div>
  );
}
