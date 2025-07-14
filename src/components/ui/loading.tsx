import React from 'react';
import { Loader2, Heart, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'fashion' | 'elegant';
  className?: string;
}

interface LoadingStateProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'fashion' | 'elegant';
  icon?: 'spinner' | 'heart' | 'sparkles' | 'star';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const variantClasses = {
    default: 'text-primary',
    fashion: 'text-primary animate-pulse-glow',
    elegant: 'text-muted-foreground'
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  );
};

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Loading...',
  description,
  variant = 'default',
  icon = 'spinner',
  className
}) => {
  const IconComponent = {
    spinner: Loader2,
    heart: Heart,
    sparkles: Sparkles,
    star: Star
  }[icon];

  const variantStyles = {
    default: {
      container: 'bg-surface/50 backdrop-blur-sm border border-border/50',
      icon: 'text-primary',
      title: 'text-foreground',
      description: 'text-muted-foreground'
    },
    fashion: {
      container: 'card-elegant',
      icon: 'text-primary animate-pulse-glow',
      title: 'gradient-text font-semibold',
      description: 'text-muted-foreground'
    },
    elegant: {
      container: 'card-warm',
      icon: 'text-accent animate-bounce-subtle',
      title: 'text-foreground font-medium',
      description: 'text-muted-foreground'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn(
      'rounded-xl p-8 text-center',
      styles.container,
      className
    )}>
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <IconComponent 
            className={cn(
              'h-8 w-8',
              icon === 'spinner' ? 'animate-spin' : '',
              styles.icon
            )}
          />
          {variant === 'fashion' && (
            <div className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className={cn('text-lg', styles.title)}>
            {title}
          </h3>
          {description && (
            <p className={cn('text-sm', styles.description)}>
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const LoadingCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('card-elegant p-6 animate-pulse', className)}>
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 bg-muted rounded-full shimmer" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded-md shimmer" />
          <div className="h-3 bg-muted rounded-md w-3/4 shimmer" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded-md shimmer" />
        <div className="h-3 bg-muted rounded-md w-5/6 shimmer" />
      </div>
      <div className="flex space-x-2">
        <div className="h-8 w-20 bg-muted rounded-md shimmer" />
        <div className="h-8 w-16 bg-muted rounded-md shimmer" />
      </div>
    </div>
  </div>
);

export const LoadingGrid: React.FC<{ 
  count?: number; 
  className?: string;
}> = ({ 
  count = 6, 
  className 
}) => (
  <div className={cn(
    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    className
  )}>
    {Array.from({ length: count }).map((_, i) => (
      <LoadingCard key={i} />
    ))}
  </div>
);