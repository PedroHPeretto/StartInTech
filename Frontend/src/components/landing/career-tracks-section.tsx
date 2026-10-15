import { SectionHeading } from './section-heading';
import { CAREER_TRACKS } from './landing-content';
import { Card, CardContent } from '@/components/ui/card';

export function CareerTracksSection() {
  return (
    <section
      id="trilhas"
      className="relative scroll-mt-16 bg-white py-20 sm:py-28"
      data-testid="career-tracks-section"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Especialidades"
          title="Escolha seu caminho em tecnologia"
          subtitle="Preparamos você com diagnósticos e roadmaps específicos para as áreas mais buscadas pelo mercado."
          align="center"
          className="mb-14"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {CAREER_TRACKS.map((track) => (
            <Card
              key={track.id}
              className="group border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-card-hover"
            >
              <CardContent className="p-0">
                <div className="flex size-12 items-center justify-center rounded-xl bg-sky-50/80 border border-sky-100 p-2.5 transition-transform duration-300 group-hover:scale-110">
                  <img
                    src={track.iconSrc}
                    alt=""
                    aria-hidden
                    className="size-full object-contain"
                  />
                </div>

                <h3 className="mt-4 font-heading text-base font-bold text-brand-midnight transition-colors group-hover:text-brand-blue">
                  {track.name}
                </h3>

                <p className="mt-1.5 text-xs font-sans text-slate-500 leading-relaxed">
                  {track.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
