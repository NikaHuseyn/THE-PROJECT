import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  showFallback?: boolean;
  fallbackComponent?: React.ReactNode;
}

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackSrc,
  showFallback = true,
  fallbackComponent,
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (hasError) {
    if (fallbackSrc && fallbackSrc !== src) {
      return (
        <SafeImage
          src={fallbackSrc}
          alt={alt}
          className={className}
          showFallback={showFallback}
          fallbackComponent={fallbackComponent}
          {...props}
        />
      );
    }

    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    if (showFallback) {
      return (
        <div className={`flex items-center justify-center bg-muted ${className}`}>
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      );
    }

    return null;
  }

  return (
    <>
      {isLoading && (
        <div className={`flex items-center justify-center bg-muted ${className}`}>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </>
  );
};

export default SafeImage;