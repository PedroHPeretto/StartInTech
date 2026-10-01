import { useRef, type InputHTMLAttributes, type KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchBarProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value = '',
  onChange,
  onSearch,
  onClear,
  placeholder = 'Buscar por cargo, tecnologia ou empresa...',
  className,
  disabled,
  ...props
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(value);
    } else if (e.key === 'Escape') {
      handleClear();
    }
  };

  const handleClear = () => {
    onChange?.('');
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        'group relative flex w-full items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-slate-800 shadow-2xs transition-all focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20',
        disabled && 'cursor-not-allowed opacity-60 bg-slate-50',
        className,
      )}
      data-testid="search-bar-container"
    >
      <Search
        className="size-4 shrink-0 text-slate-400 transition-colors group-focus-within:text-brand-blue"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-transparent px-3 text-sm font-sans placeholder:text-slate-400 outline-none disabled:cursor-not-allowed"
        data-testid="search-bar-input"
        {...props}
      />
      {value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex size-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
          aria-label="Limpar busca"
          data-testid="search-bar-clear-btn"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
