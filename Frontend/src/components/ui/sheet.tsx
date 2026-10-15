import type { HTMLAttributes } from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sheet({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

export function SheetTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

export function SheetClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />;
}

export function SheetPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

export function SheetBackdrop({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="sheet-backdrop"
      className={cn(
        'fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

export interface SheetPopupProps extends DialogPrimitive.Popup.Props {
  side?: 'left' | 'right';
}

export function SheetPopup({
  className,
  children,
  side = 'right',
  ...props
}: SheetPopupProps) {
  return (
    <SheetPortal>
      <SheetBackdrop />
      <DialogPrimitive.Popup
        data-slot="sheet-popup"
        className={cn(
          'fixed z-50 flex flex-col gap-4 bg-white p-6 shadow-2xl transition-transform duration-300 ease-in-out',
          side === 'right' &&
            'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l border-slate-200 data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full',
          side === 'left' &&
            'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r border-slate-200 data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Fechar menu"
          className="absolute right-4 top-4 rounded-sm p-1.5 text-slate-500 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
        >
          <X className="size-5" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Popup>
    </SheetPortal>
  );
}

export function SheetHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col space-y-2 text-left', className)}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        'font-heading text-lg font-bold text-brand-midnight',
        className,
      )}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-sm text-slate-500 font-sans', className)}
      {...props}
    />
  );
}
