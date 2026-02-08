import { RequestStatus } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Package, 
  AlertCircle,
  Search
} from 'lucide-react';

interface StatusBadgeProps {
  status: RequestStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<RequestStatus, { label: string; icon: typeof Clock; className: string }> = {
  submitted: {
    label: 'Submitted',
    icon: Clock,
    className: 'bg-muted text-muted-foreground',
  },
  'pending-verification': {
    label: 'Pending Verification',
    icon: AlertCircle,
    className: 'bg-warning/10 text-warning',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    className: 'bg-success/10 text-success',
  },
  active: {
    label: 'Active',
    icon: Search,
    className: 'bg-info/10 text-info',
  },
  matched: {
    label: 'Matched',
    icon: Package,
    className: 'bg-primary/10 text-primary',
  },
  'in-transit': {
    label: 'In Transit',
    icon: Truck,
    className: 'bg-info/10 text-info',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    className: 'bg-success/10 text-success',
  },
  closed: {
    label: 'Closed',
    icon: CheckCircle,
    className: 'bg-muted text-muted-foreground',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive',
  },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.className,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      <span>{config.label}</span>
    </span>
  );
}
