import { useState } from 'react';
import { Bookmark, MapPin } from 'lucide-react';
import { CompanyLogoPlate } from '@/components/ui/company-logo-plate';
import { Badge, WorkModeBadge, type WorkModeType } from '@/components/ui/badge';
import { MatchScore } from '@/components/metrics/match-score';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface JobCardProps {
  id: string;
  title: string;
  company: string;
  logoUrl?: string;
  location?: string;
  workMode?: WorkModeType;
  skills?: string[];
  matchScore?: number;
  isBookmarked?: boolean;
  onBookmarkToggle?: (id: string, next: boolean) => void;
  onViewDetails?: (id: string) => void;
  className?: string;
}

export function JobCard({
  id,
  title,
  company,
  logoUrl,
  location = 'São Paulo, SP',
  workMode = 'REMOTE',
  skills = [],
  matchScore,
  isBookmarked = false,
  onBookmarkToggle,
  onViewDetails,
  className,
}: JobCardProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !bookmarked;
    setBookmarked(next);
    onBookmarkToggle?.(id, next);
  };

  return (
    <div
      onClick={() => onViewDetails?.(id)}
      className={cn(
        'group flex w-full flex-col justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:border-brand-blue/40 hover:shadow-xs cursor-pointer select-none md:flex-row md:items-center',
        className,
      )}
      data-testid="job-card"
    >
      {/* Left: Company Logo & Job Metadata */}
      <div className="flex items-start gap-4">
        <CompanyLogoPlate
          src={logoUrl}
          companyName={company}
          size="md"
          className="group-hover:border-brand-blue/30 transition-colors"
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              className="text-base font-bold font-sans text-brand-midnight group-hover:text-brand-blue transition-colors"
              data-testid="job-card-title"
            >
              {title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span
              className="font-semibold text-slate-700"
              data-testid="job-card-company"
            >
              {company}
            </span>
            <span className="size-1 rounded-full bg-slate-300" />
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-slate-400" />
              <span>{location}</span>
            </div>
            <span className="size-1 rounded-full bg-slate-300" />
            <WorkModeBadge mode={workMode} />
          </div>

          {/* Skill Tag Chips */}
          {skills.length > 0 && (
            <div
              className="mt-1 flex flex-wrap items-center gap-1.5"
              data-testid="job-card-skills"
            >
              {skills.map((skill) => (
                <Badge key={skill} variant="default" size="sm">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Match Score & Action Buttons */}
      <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 md:border-0 md:pt-0 shrink-0">
        {matchScore !== undefined && (
          <div data-testid="job-card-match">
            <MatchScore score={matchScore} variant="badge" />
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBookmark}
            aria-label={bookmarked ? 'Remover dos salvos' : 'Salvar vaga'}
            className={cn(
              'inline-flex size-9 items-center justify-center rounded-xl border transition-colors outline-none cursor-pointer',
              bookmarked
                ? 'border-brand-blue bg-sky-50 text-brand-blue'
                : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-700',
            )}
            data-testid="job-card-bookmark-btn"
          >
            <Bookmark
              size={17}
              className={cn(bookmarked && 'fill-brand-blue')}
            />
          </button>

          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(id);
            }}
            className="text-xs font-semibold"
            data-testid="job-card-details-btn"
          >
            Ver Vaga
          </Button>
        </div>
      </div>
    </div>
  );
}
