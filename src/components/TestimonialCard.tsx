import React from 'react';
import { Star, Quote } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

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
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div 
      className="card bg-white shadow-lg hover:shadow-xl transition-all duration-300 fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Header with Photo and Info */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative">
          <ImageWithFallback
            src={testimonial.image || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face`}
            alt={`${testimonial.name} from ${testimonial.location}`}
            className="w-16 h-16 rounded-full object-cover"
          />
          
          {/* SF Location Badge */}
          <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">
            SF
          </div>
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
          <p className="text-sm text-gray-600">{testimonial.location}</p>
          <div className="flex items-center space-x-1 mt-1">
            {renderStars(testimonial.rating)}
          </div>
        </div>
      </div>

      {/* Quote */}
      <div className="relative">
        <Quote className="absolute -top-2 -left-2 text-red-200" size={24} />
        <blockquote className="text-gray-700 leading-relaxed italic pl-6">
          "{testimonial.quote}"
        </blockquote>
      </div>

      {/* Program Badge */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <span className="inline-block bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-medium">
          {testimonial.program}
        </span>
      </div>
    </div>
  );
}