import Link from 'next/link';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ButtonProps } from '@/types/component.types';

// Built on the same Base UI primitive + CVA pattern as every other
// components/ui/* primitive, but keeping our own pill/gradient brand system
// rather than shadcn's generic default look — migrating the architecture,
// not the visual identity we already designed.
const buttonVariants = cva(
  'inline-flex items-center justify-center min-h-[44px] min-w-[44px] font-bold tracking-tight rounded-full transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-rest hover:shadow-hover',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400',
        secondary:
          'bg-accent-500 dark:bg-accent-500 text-white hover:bg-accent-600 dark:hover:bg-accent-600 focus-visible:ring-accent-500 dark:focus-visible:ring-accent-400',
        outline:
          'border-2 border-primary-600 dark:border-primary-400 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 bg-white dark:bg-gray-800 shadow-none hover:shadow-none',
      },
      size: {
        sm: 'px-6 py-2.5 text-sm',
        md: 'px-7 py-3 text-base',
        lg: 'px-9 py-4 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  className = '',
  type = 'button',
  disabled = false,
  icon,
  iconPosition = 'left',
  title,
}) => {
  const classes = cn(buttonVariants({ variant, size }), 'gap-2', className);

  const content = icon ? (
    <>
      {iconPosition === 'left' && (
        <span className="inline-flex shrink-0 [&>svg]:w-[1.15em] [&>svg]:h-[1.15em]">{icon}</span>
      )}
      {children}
      {iconPosition === 'right' && (
        <span className="inline-flex shrink-0 [&>svg]:w-[1.15em] [&>svg]:h-[1.15em]">{icon}</span>
      )}
    </>
  ) : (
    children
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled} title={title}>
        {content}
      </Link>
    );
  }

  return (
    <ButtonPrimitive type={type} onClick={onClick} disabled={disabled} className={classes} title={title}>
      {content}
    </ButtonPrimitive>
  );
};

export default Button;
