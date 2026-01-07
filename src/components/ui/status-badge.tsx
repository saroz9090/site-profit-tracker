import { cn } from '@/lib/utils';

type StatusType = 'active' | 'completed' | 'on-hold' | 'pending' | 'partial' | 'paid' | 'labour' | 'machine' | 'project' | 'office';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  active: 'badge-success',
  completed: 'badge-info',
  'on-hold': 'badge-warning',
  pending: 'badge-warning',
  partial: 'badge-info',
  paid: 'badge-success',
  labour: 'bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full text-xs font-medium',
  machine: 'bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full text-xs font-medium',
  project: 'badge-info',
  office: 'bg-secondary text-secondary-foreground border border-border px-2 py-0.5 rounded-full text-xs font-medium',
};

const statusLabels: Record<StatusType, string> = {
  active: 'Active',
  completed: 'Completed',
  'on-hold': 'On Hold',
  pending: 'Pending',
  partial: 'Partial',
  paid: 'Paid',
  labour: 'Labour',
  machine: 'Machine',
  project: 'Project',
  office: 'Office',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusStyles[status], className)}>
      {statusLabels[status]}
    </span>
  );
}
