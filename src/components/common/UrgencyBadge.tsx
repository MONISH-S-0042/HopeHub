import { UrgencyLevel } from '@/types';
import { cn } from '@/lib/utils';

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const urgencyConfig = {
  critical: {
    label: 'Critical',
    icon: '🔴',
    className: 'bg-critical/10 text-critical border-critical/20',
  },
  high: {
    label: 'High',
    icon: '🟠',
    className: 'bg-high-urgency/10 text-high-urgency border-high-urgency/20',
  },
  medium: {
    label: 'Medium',
    icon: '🟡',
    className: 'bg-medium-urgency/10 text-medium-urgency border-medium-urgency/20',
  },
  low: {
    label: 'Low',
    icon: '🟢',
    className: 'bg-low-urgency/10 text-low-urgency border-low-urgency/20',
  },
};

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-1',
  lg: 'text-base px-3 py-1.5',
};

export function UrgencyBadge({ urgency, size = 'md', showLabel = true }: UrgencyBadgeProps) {
  const config = urgencyConfig[urgency];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium border',
        config.className,
        sizeClasses[size]
      )}
    >
      <span>{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
