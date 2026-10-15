import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Accordion({
  className,
  ...props
}: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn('w-full divide-y divide-slate-200/80', className)}
      {...props}
    />
  );
}

export function AccordionItem({
  className,
  ...props
}: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('py-1', className)}
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'flex flex-1 items-center justify-between py-4 text-left font-heading text-base font-semibold text-brand-midnight transition-all hover:text-brand-blue cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 rounded-lg group',
          className,
        )}
        {...props}
      >
        <span>{children}</span>
        <ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform duration-200 group-data-[open]:rotate-180 group-aria-expanded:rotate-180" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionPanel({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-panel"
      className={cn(
        'overflow-hidden text-sm text-slate-600 font-sans leading-relaxed pb-4 pt-1 transition-all',
        className,
      )}
      {...props}
    >
      {children}
    </AccordionPrimitive.Panel>
  );
}
