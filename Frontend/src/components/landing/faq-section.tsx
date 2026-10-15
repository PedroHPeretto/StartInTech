import { SectionHeading } from './section-heading';
import { FAQ_ITEMS } from './landing-content';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from '@/components/ui/accordion';

export function FaqSection() {
  return (
    <section
      id="faq"
      className="relative scroll-mt-16 bg-slate-50/70 py-20 sm:py-28 border-y border-slate-200/60"
      data-testid="faq-section"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Dúvidas comuns"
          title="Perguntas frequentes"
          subtitle="Tudo o que você precisa saber sobre como a StartInTech funciona na prática."
          align="center"
          className="mb-14"
        />

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <Accordion defaultValue={['item-1']}>
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionPanel>{item.answer}</AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
