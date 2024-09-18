import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const spinnerVariants = cva('flex-col items-center justify-center', {
  variants: {
    show: {
      true: 'flex',
      false: 'hidden',
    },
  },
  defaultVariants: {
    show: true,
  },
});

const loaderVariants = cva('animate-spin text-primary', {
  variants: {
    size: {
      small: 'size-6',
      medium: 'size-8',
      large: 'size-12',
    },
  },
  defaultVariants: {
    size: 'medium',
  },
});

export function Spinner({ size = 'medium', show = true, children = null, className = '' }) {
  return (
    <span className={spinnerVariants({ show })}>
      <Loader2 className={cn(loaderVariants({ size }), className)} />
      {children}
    </span>
  );
}

// Add prop-types validation
Spinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),  // Validates size prop to be one of three values
  show: PropTypes.bool,                                 // Validates show as a boolean
  children: PropTypes.node,                             // children should be a React node (can be text, element, or component)
  className: PropTypes.string,                          // className should be a string
};
