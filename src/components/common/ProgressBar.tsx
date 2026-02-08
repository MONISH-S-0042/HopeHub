import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({ 
  current, 
  total, 
  showLabel = true, 
  size = 'md',
  className 
}: ProgressBarProps) {
  const percentage = Math.min((current / total) * 100, 100);
  
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', heightClasses[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            percentage === 100 
              ? 'bg-success' 
              : percentage >= 50 
                ? 'bg-primary' 
                : 'bg-warning'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{current} / {total} fulfilled</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}
