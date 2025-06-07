import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';
import { forwardRef, ElementType } from 'react';

const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
      h2: 'scroll-m-20 text-3xl font-semibold tracking-tight',
      h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
      h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
      p: 'leading-7 [&:not(:first-child)]:mt-6',
      blockquote: 'mt-6 border-l-2 border-gray-300 pl-6 italic',
      list: 'my-6 ml-6 list-disc [&>li]:mt-2',
      lead: 'text-xl text-gray-700',
      large: 'text-lg font-semibold',
      small: 'text-sm font-medium leading-none',
      muted: 'text-sm text-gray-500',
    },
    textColor: {
      default: 'text-gray-900',
      primary: 'text-primary-600',
      muted: 'text-gray-500',
      white: 'text-white',
    },
  },
  defaultVariants: {
    variant: 'p',
    textColor: 'default',
  },
});

type TypographyVariant = NonNullable<VariantProps<typeof typographyVariants>['variant']>;
type TypographyColor = NonNullable<VariantProps<typeof typographyVariants>['textColor']>;

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  textColor?: TypographyColor;
  as?: ElementType;
}

const getElementType = (variant?: TypographyVariant, as?: ElementType): ElementType => {
  if (as) return as;
  if (variant?.startsWith('h')) return variant as ElementType;
  return 'p';
};

const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, textColor, as, ...props }, ref) => {
    const Element = getElementType(variant, as);
    
    return (
      <Element
        className={cn(typographyVariants({ variant, textColor, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Typography.displayName = 'Typography';

export { Typography, typographyVariants }; 