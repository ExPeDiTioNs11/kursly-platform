import type { ApplicationStatus } from '@kursly/shared';
import { Badge } from '@/components/ui/badge';

const MAP: Record<ApplicationStatus, { label: string; className: string }> = {
  PENDING: { label: 'Beklemede', className: 'bg-amber-500/10 text-amber-600' },
  ACCEPTED: { label: 'Kabul edildi', className: 'bg-emerald-500/10 text-emerald-600' },
  REJECTED: { label: 'Reddedildi', className: 'bg-destructive/10 text-destructive' },
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const s = MAP[status];
  return (
    <Badge variant="secondary" className={s.className}>
      {s.label}
    </Badge>
  );
}
