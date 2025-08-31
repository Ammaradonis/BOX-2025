import React, { lazy, Suspense } from 'react';
import { Star, Quote } from 'lucide-react';
import PropTypes from 'prop-types';

// Lazy load ImageWithFallback for better performance
const ImageWithFallback = lazy(() => import('./figma/ImageWithFallback'));

interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
  program: string;
  image?: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  delay?: number;
}

export function TestimonialCard({ testimonial, delay = 0 }: TestimonialCardProps) {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={`${testimonial.id}-star-${index}`}
        size={16}
        className={
          index < fullStars
            ? 'text-yellow-400 fill-current'
            : index === fullStars && hasHalfStar
              ? 'text-yellow-400 fill-current [clip-path:polygon(0_0,50%_0,50%_100%,0_100%)]'
              : 'text-gray-300'
        }
        aria-hidden="true"
      />
    ));
  };

  return (
    <article
      key={testimonial.id}
      className="card bg-white shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
      role="region"
      aria-labelledby={`${testimonial.id}-name`}
    >
      <div className="flex items-center space-x-4 mb-4 p-4">
        <Suspense fallback={<div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />}>
          <div className="relative">
            <ImageWithFallback
              src={testimonial.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'}
              alt={`Portrait of ${testimonial.name} from ${testimonial.location}`}
              className="w-16 h-16 rounded-full object-cover"
              loading="lazy"
            />
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">
              {testimonial.location.split(',')[0].trim() || 'SF'}
            </div>
          </div>
        </Suspense>

        <div className="flex-1">
          <h4 id={`${testimonial.id}-name`} className="font-semibold text-gray-900">
            {testimonial.name}
          </h4>
          <p className="text-sm text-gray-600">{testimonial.location}</p>
          <div className="flex items-center space-x-1 mt-1" role="img" aria-label={`Rated ${testimonial.rating} out of 5 stars`}>
            {renderStars(testimonial.rating)}
          </div>
        </div>
      </div>

      <div className="relative px-4 pb-4">
        <Quote className="absolute -top-2 -left-2 text-red-200" size={24} aria-hidden="true" />
        <blockquote className="text-gray-700 leading-relaxed pl-6">
          {testimonial.quote}
        </blockquote>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 px-4 pb-4">
        <span className="inline-block bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-medium">
          {testimonial.program}
        </span>
      </div>
    </article>
  );
}

TestimonialCard.propTypes = {
  testimonial: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    quote: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    program: PropTypes.string.isRequired,
    image: PropTypes.string,
  }).isRequired,
  delay: PropTypes.number,
};