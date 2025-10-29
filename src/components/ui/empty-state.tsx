import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  ShoppingBag, 
  Calendar, 
  Sparkles, 
  Heart, 
  TrendingUp,
  Palette,
  Shirt,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  variant?: 'default' | 'fashion' | 'elegant' | 'playful';
  icon?: 'search' | 'shopping' | 'calendar' | 'sparkles' | 'heart' | 'trending' | 'palette' | 'shirt' | 'star';
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const iconMap = {
  search: Search,
  shopping: ShoppingBag,
  calendar: Calendar,
  sparkles: Sparkles,
  heart: Heart,
  trending: TrendingUp,
  palette: Palette,
  shirt: Shirt,
  star: Star
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'default',
  icon = 'sparkles',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  children
}) => {
  const IconComponent = iconMap[icon];

  const variantStyles = {
    default: {
      container: 'bg-surface/50 backdrop-blur-sm border border-border/50',
      iconContainer: 'bg-muted',
      icon: 'text-muted-foreground',
      title: 'text-foreground',
      description: 'text-muted-foreground',
      decoration: false
    },
    fashion: {
      container: 'card-elegant relative overflow-hidden',
      iconContainer: 'bg-gradient-to-br from-primary/10 to-primary/5',
      icon: 'text-primary',
      title: 'gradient-text font-semibold',
      description: 'text-muted-foreground',
      decoration: true
    },
    elegant: {
      container: 'card-warm relative',
      iconContainer: 'bg-gradient-to-br from-accent/20 to-accent/10',
      icon: 'text-accent',
      title: 'text-foreground font-medium',
      description: 'text-muted-foreground',
      decoration: false
    },
    playful: {
      container: 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100/50 relative overflow-hidden',
      iconContainer: 'bg-gradient-to-br from-purple-100 to-pink-100',
      icon: 'text-purple-600',
      title: 'text-purple-900 font-bold',
      description: 'text-purple-700',
      decoration: true
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn(
      'rounded-2xl p-12 text-center relative',
      styles.container,
      className
    )}>
      {/* Decorative elements for fashion variant */}
      {styles.decoration && (
        <>
          <div className="absolute top-4 right-4 opacity-10">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <div className="absolute bottom-4 left-4 opacity-10">
            <Heart className="h-6 w-6 text-primary animate-bounce-subtle" />
          </div>
          <div className="absolute top-1/2 right-8 opacity-5">
            <Star className="h-12 w-12 text-primary animate-float" />
          </div>
        </>
      )}

      <div className="flex flex-col items-center space-y-6 relative z-10">
        {/* Icon */}
        <div className={cn(
          'p-6 rounded-full',
          styles.iconContainer
        )}>
          <IconComponent className={cn('h-12 w-12', styles.icon)} />
        </div>

        {/* Content */}
        <div className="space-y-3 max-w-md mx-auto">
          <h3 className={cn(
            'text-xl',
            styles.title
          )}>
            {title}
          </h3>
          
          {description && (
            <p className={cn(
              'text-sm leading-relaxed',
              styles.description
            )}>
              {description}
            </p>
          )}
        </div>

        {/* Custom children content */}
        {children && (
          <div className="w-full">
            {children}
          </div>
        )}

        {/* Actions */}
        {(actionLabel || secondaryActionLabel) && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {actionLabel && onAction && (
              <Button 
                onClick={onAction}
                className={cn(
                  'btn-fashion',
                  variant === 'playful' && 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                )}
              >
                {actionLabel}
              </Button>
            )}
            
            {secondaryActionLabel && onSecondaryAction && (
              <Button 
                variant="outline"
                onClick={onSecondaryAction}
                className="border-primary/20 text-primary hover:bg-primary/5"
              >
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Preset empty states for common scenarios
export const NoTrendsEmptyState: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => (
  <EmptyState
    variant="fashion"
    icon="trending"
    title="No Trends Available"
    description="We're currently updating our fashion trends database. Check back soon for the latest style insights!"
    actionLabel="Refresh Trends"
    onAction={onRefresh}
    secondaryActionLabel="Explore Styles"
  />
);

export const NoEventsEmptyState: React.FC<{ onConnect?: () => void }> = ({ onConnect }) => (
  <EmptyState
    variant="elegant"
    icon="calendar"
    title="No Events Scheduled"
    description="Connect your calendar to get personalised outfit recommendations for your upcoming events."
    actionLabel="Connect Calendar"
    onAction={onConnect}
  />
);

export const NoOutfitsEmptyState: React.FC<{ onCreateOutfit?: () => void }> = ({ onCreateOutfit }) => (
  <EmptyState
    variant="playful"
    icon="shirt"
    title="Your Wardrobe Awaits"
    description="Start building your digital wardrobe and get AI-powered outfit recommendations tailored just for you!"
    actionLabel="Add First Item"
    onAction={onCreateOutfit}
    secondaryActionLabel="Browse Inspiration"
  />
);

export const NoSearchResultsEmptyState: React.FC<{ searchTerm?: string; onClear?: () => void }> = ({ 
  searchTerm, 
  onClear 
}) => (
  <EmptyState
    variant="default"
    icon="search"
    title="No Results Found"
    description={searchTerm ? `We couldn't find anything matching "${searchTerm}". Try adjusting your search terms.` : "Try searching for something else."}
    actionLabel="Clear Search"
    onAction={onClear}
  />
);