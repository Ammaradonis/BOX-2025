import React from 'react';
import { ArrowRight } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode; // Safer typing for JSX elements
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
      className="card fade-in bg-white shadow-lg rounded-lg overflow-hidden"
      style={delay ? { animationDelay: `${delay}s` } : {}}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-t লg mb-4 h-48">
        <img
          src={service.image}
          alt={service.altText}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy" // Add lazy loading
          onError={(e) => {
            e.currentTarget.src = '/fallback-image.jpg'; // Fallback image
          }}
        />
        
        {/* Icon Overlay */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-3 text-2xl shadow-md">
          {service.icon}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
          {service.title}
        </h3>
        
        <p className="text-gray-600 leading-relaxed">
          {service.description}
        </p>
        
        <div className="flex items-center justify-between pt-2">
          <button
            className="btn btn-ghost group-hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
            onClick={() => onNavigate(service.page)}
            aria-label={`Learn more about ${service.title}`}
          >
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