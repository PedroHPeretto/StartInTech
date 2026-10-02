import {
  BarChart3,
  Brain,
  Briefcase,
  ClipboardCheck,
  Code2,
  Kanban,
  Palette,
  ServerCog,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

const CAREER_TRACK_ICONS: Record<string, LucideIcon> = {
  'software-development': Code2,
  'data-analysis': BarChart3,
  'data-science': Brain,
  'ui-ux-design': Palette,
  devops: ServerCog,
  'product-management': Kanban,
  'quality-assurance': ClipboardCheck,
  cybersecurity: ShieldCheck,
};

export function CareerTrackIcon({ slug }: { slug: string }) {
  const Icon = CAREER_TRACK_ICONS[slug] ?? Briefcase;
  return <Icon size={24} aria-hidden />;
}
