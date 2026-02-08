import { ResourceCategory, RESOURCE_CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';

interface ResourceCategoryIconProps {
  category: ResourceCategory;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeClasses = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
};

export function ResourceCategoryIcon({ category, size = 'md', showLabel = false }: ResourceCategoryIconProps) {
  const config = RESOURCE_CATEGORIES.find(c => c.value === category);

  if (!config) return null;

  return (
    <span className={cn('inline-flex items-center gap-2', sizeClasses[size])}>
      <span>{config.icon}</span>
      {showLabel && <span className="text-sm font-medium">{config.label}</span>}
    </span>
  );
}
