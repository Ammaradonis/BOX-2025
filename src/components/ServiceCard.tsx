import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  cta: string;
  page: string;
  image: string;
  altText: string;
}

interface ServiceCardProps {
  service: Service;
  onNavigate: (page: string) => void;
  delay?: number;
}

export function ServiceCard({ service, onNavigate, delay = 0 }: ServiceCardProps) {
  return (
    <div 
      className="card group cursor-pointer fade-in"
      style={{ animationDelay: `${delay}s` }}
      onClick={() => onNavigate(service.page)}
      role="button"
      tabIndex={0}
      aria-label={`Learn more about ${service.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate(service.page);
        }
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-lg mb-4 h-48">
        <ImageWithFallback
          src={service.image}
          alt={service.altText}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Icon Overlay */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-3 text-2xl shadow-md">
          {service.icon}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
          {service.title}
        </h3>
        
        <p className="text-gray-600 leading-relaxed">
          {service.description}
        </p>
        
        <div className="flex items-center justify-between pt-2">
          <button className="btn btn-ghost group-hover:text-red-600 transition-colors">
            {service.cta}
            <ArrowRight 
              size={16} 
              className="ml-2 group-hover:translate-x-1 transition-transform" 
            />
          </button>
        </div>
      </div>
    </div>
  );
}