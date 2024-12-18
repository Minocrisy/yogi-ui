import * as React from 'react';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    children,
    variant = 'default',
    padding = 'md',
    className = '',
    ...props
  }, ref) => {
    const baseClasses = 'rounded-lg bg-white';

    const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
      default: 'bg-white',
      bordered: 'border border-gray-200',
      elevated: 'shadow-lg',
    };

    const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    const classes = twMerge(
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      className
    );

    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Sub-components for better organization
export interface CardHeaderProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  // Extend with commonly used HTML div props
  id?: string;
  role?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({
    title,
    description,
    action,
    children,
    className = '',
    ...props
  }, ref) => {
    const classes = twMerge(
      'flex flex-col space-y-1.5',
      className
    );

    return (
      <div ref={ref} className={classes} {...props}>
        {children || (
          <>
            <div className="flex items-center justify-between">
              {title && (
                <h3 className="text-lg font-semibold leading-none tracking-tight">
                  {title}
                </h3>
              )}
              {action && <div>{action}</div>}
            </div>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </>
        )}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', ...props }, ref) => {
    const classes = twMerge('pt-0', className);
    return <div ref={ref} className={classes} {...props} />;
  }
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', ...props }, ref) => {
    const classes = twMerge(
      'flex items-center pt-4',
      className
    );
    return <div ref={ref} className={classes} {...props} />;
  }
);

CardFooter.displayName = 'CardFooter';
