import React, { useState, useEffect, useRef } from "react";

export interface ImageWithFallbackProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Primary image source */
  src: string;
  /** Accessible description */
  alt: string;
  /** Optional fallback if primary fails */
  fallbackSrc?: string;
  /** Extra classes for outer wrapper */
  wrapperClassName?: string;
  /** Extra classes for <img> element */
  imgClassName?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSrc = "/placeholder-image.jpg",
  wrapperClassName = "",
  imgClassName = "",
  className = "",
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setImgSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
    setIsLoading(false);
  };

  return (
    <div className={`relative ${wrapperClassName}`}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center rounded-xl">
          <div className="text-gray-400 text-xs">Loading...</div>
        </div>
      )}

      {/* Error UI */}
      {hasError ? (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-xl text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">🥊</div>
            <div className="text-sm">Image unavailable</div>
          </div>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={imgSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          className={`${imgClassName} ${className} ${
            isLoading ? "opacity-0" : "opacity-100"
          } transition-opacity duration-300`}
          {...props}
        />
      )}
    </div>
  );
};

export default ImageWithFallback;
