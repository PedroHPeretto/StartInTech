import type { ResumeHistoryItemDto } from '@startintech/shared';
import { FilterPills } from '@/components/ui/filter-pills';
import { buildHistoryPillLabel } from '@/resumes/resume-history-label';

export interface ResumeAnalysisHistorySelectorProps {
  items: ResumeHistoryItemDto[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ResumeAnalysisHistorySelector({
  items,
  selectedId,
  onSelect,
}: ResumeAnalysisHistorySelectorProps) {
  if (items.length === 0) {
    return null;
  }

  const options = items.map((item, index) => ({
    id: item.id,
    label: buildHistoryPillLabel(item, items[index + 1]),
  }));

  return (
    <div
      className="space-y-2"
      data-testid="resume-history-selector"
      aria-label="Histórico de versões do currículo"
    >
      <p className="font-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Versões analisadas
      </p>
      <FilterPills
        options={options}
        selected={selectedId}
        onChange={(selected) => {
          const id = Array.isArray(selected) ? selected[0] : selected;
          if (id) {
            onSelect(id);
          }
        }}
      />
    </div>
  );
}
