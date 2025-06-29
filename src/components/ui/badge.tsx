import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm',
        secondary:
          'border-transparent bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:bg-gray-200',
        destructive:
          'border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm',
        outline: 'text-foreground border-gray-300 bg-white/80 backdrop-blur-sm',
        success:
          'border-transparent bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm',
        warning:
          'border-transparent bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };