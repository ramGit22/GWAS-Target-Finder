import React from 'react';
import { cn } from '@/lib/utils';
import { Pill } from 'lucide-react';

interface DrugTargetBadgeProps {
  isDrugTarget: boolean;
  className?: string;
}

export function DrugTargetBadge({ isDrugTarget, className }: DrugTargetBadgeProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium',
        isDrugTarget 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800',
        className
      )}
    >
      {isDrugTarget && <Pill className="h-3.5 w-3.5" />}
      {isDrugTarget ? 'Drug Target' : 'Not a Drug Target'}
    </div>
  );
}
