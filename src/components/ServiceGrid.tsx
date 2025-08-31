import React, { memo } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChevronRight, Users, Trophy, Zap, Target, Heart, Dumbbell } from 'lucide-react';

// Error Boundary Component
class ServiceGridErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8 text-red-600">
          <p>Something went wrong displaying our services. Please try again later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface ServiceGridProps {
  onNavigate?: (page: string) => void;
}

const services = [
  {
    id: 'classes',
    title: 'CLASSES',
    subtitle: 'From FiDi desk warriors to Mission artists – find your level.',
    description: 'Beginner to pro sessions daily. Cable car-smooth progression through our SF-tough training levels.',
    image: 'https://images.unsplash.com/photo-1575747515871-2e323827539e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // TODO: Host locally or via CDN for production
    imageAlt: 'Mixed-age class throwing jabs before Dolores Park backdrop',
    icon: <Users className="w-8 h-8" />,
    cta: 'View Class Levels',
    sfIcon: (
      <svg width="64" height="64" viewBox="0 0 64 64" className="w-16 h-16" aria-hidden="true">
        <rect x="8" y="32" width="48" height="20" rx="4" fill="#D92229" stroke="#FDB515" strokeWidth="2" />
        <circle cx="16" cy="56" r="4" fill="#5D6D7E" />
        <circle cx="48" cy="56" r="4" fill="#5D6D7E" />
        <rect x="12" y="24" width="8" height="8" rx="4" fill="#FDB515" />
        <rect x="44" y="24" width="8" height="8" rx="4" fill="#FDB515" />
        <line x1="20" y1="20" x2="44" y2="20" stroke="#5D6D7E" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'academy',
    title: 'ACADEMY',
    subtitle: 'Compete in SF’s amateur circuit? Our Castro-to-Chinatown champs start here.',
    description: 'Professional-level training for serious fighters. Transform from street-smart to ring-ready.',
    image: 'https://images.unsplash.com/photo-1620123082249-6ac67a25804f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // TODO: Host locally or via CDN for production
    imageAlt: 'Amateur boxer sparring under Bay Bridge mural at sunset',
    icon: <Trophy className="w-8 h-8" />,
    cta: 'Train to Fight',
    sfIcon: (
      <svg width="64" height="64" viewBox="0 0 64 64" className="w-16 h-16" aria-hidden="true">
        <path d="M8 40 L20 20 L32 40 L44 20 L56 40" stroke="#D92229" strokeWidth="4" fill="none" />
        <rect x="19" y="20" width="2" height="25" fill="#D92229" />
        <rect x="43" y="20" width="2" height="25" fill="#D92229" />
        <ellipse cx="32" cy="50" rx="16" ry="6" fill="#FDB515" stroke="#000" strokeWidth="1" />
        <circle cx="32" cy="50" r="4" fill="#D92229" />
      </svg>
    ),
  },
  {
    id: 'bootcamp',
    title: 'BOOTCAMP',
    subtitle: 'Conquer hills steeper than California Street.',
    description: 'High-intensity outdoor sessions with Golden Gate views. Sweat with the fog, not against it.',
    image: 'https://images.unsplash.com/photo-1697070920184-1cd719f8e17b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // TODO: Host locally or via CDN for production
    imageAlt: 'Group doing burpees on Potrero Hill with downtown skyline',
    icon: <Zap className="w-8 h-8" />,
    cta: 'Join Bootcamp',
    sfIcon: (
      <svg width="64" height="64" viewBox="0 0 64 64" className="w-16 h-16" aria-hidden="true">
        <path d="M4 50 L12 30 L20 45 L28 25 L36 40 L44 20 L52 35 L60 50" stroke="#5D6D7E" strokeWidth="3" fill="none" />
        <path d="M32 15 L28 25 L36 25 Z" fill="#D92229" />
        <path d="M30 10 L26 20 L34 20 Z" fill="#FDB515" />
        <path d="M34 8 L30 18 L38 18 Z" fill="#D92229" />
      </svg>
    ),
  },
  {
    id: 'personal-training',
    title: 'PERSONAL TRAINING',
    subtitle: '1-on-1 sessions sharper than a cable car bell.',
    description: 'Personalized coaching that transforms tech workers into warriors faster than BART on weekends.',
    image: 'https://images.unsplash.com/photo-1620123083473-16ec15498174?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // TODO: Host locally or via CDN for production
    imageAlt: 'Personal training session with trainer adjusting client’s form on heavy bag near industrial windows',
    icon: <Target className="w-8 h-8" />,
    cta: 'Book Coach',
    sfIcon: (
      <svg width="64" height="64" viewBox="0 0 64 64" className="w-16 h-16" aria-hidden="true">
        <path d="M32 8 L20 48 L44 48 Z" fill="#5D6D7E" stroke="#D92229" strokeWidth="2" />
        <rect x="30" y="4" width="4" height="8" fill="#FDB515" />
        <rect x="12" y="52" width="40" height="4" fill="#5D6D7E" />
        <rect x="20" y="55" width="6" height="2" fill="#D92229" />
        <rect x="38" y="55" width="6" height="2" fill="#D92229" />
        <rect x="26" y="54" width="12" height="4" fill="#FDB515" />
      </svg>
    ),
  },
  {
    id: 'youth',
    title: 'YOUTH',
    subtitle: 'Build confidence stronger than Sutro Tower.',
    description: 'Ages 6-17. More character-building than a Muni commute, more fun than Giants games.',
    image: 'https://images.unsplash.com/photo-1620123569521-7a77a5c6ea87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // TODO: Host locally or via CDN for production
    imageAlt: 'Kids practicing stances with coach in front of Giants mural',
    icon: <Heart className="w-8 h-8" />,
    cta: 'Enroll Kids',
    sfIcon: (
      <svg width="64" height="64" viewBox="0 0 64 64" className="w-16 h-16" aria-hidden="true">
        <rect x="8" y="20" width="12" height="30" fill="#FDB515" />
        <rect x="20" y="15" width="12" height="35" fill="#D92229" />
        <rect x="32" y="18" width="12" height="32" fill="#5D6D7E" />
        <rect x="44" y="22" width="12" height="28" fill="#FDB515" />
        <polygon points="14,20 14,12 20,16" fill="#D92229" />
        <polygon points="26,15 26,7 32,11" fill="#5D6D7E" />
        <polygon points="38,18 38,10 44,14" fill="#FDB515" />
        <polygon points="50,22 50,14 56,18" fill="#D92229" />
        <ellipse cx="16" cy="10" rx="3" ry="2" fill="#FDB515" />
        <ellipse cx="48" cy="12" rx="3" ry="2" fill="#FDB515" />
      </svg>
    ),
  },
  {
    id: 'facilities',
    title: 'FACILITIES',
    subtitle: 'Open gym access - no appointment needed.',
    description: '5,000 sq ft of SF-tough equipment. Ring, 12 heavy bags, cardio zone with Bay views.',
    image: 'https://images.unsplash.com/photo-1710746904729-f3ad9f682bb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // TODO: Host locally or via CDN for production
    imageAlt: '5,000 sq ft gym with ring, 12 heavy bags, cardio zone',
    icon: <Dumbbell className="w-8 h-8" />,
    cta: 'Tour Gym',
    sfIcon: (
      <svg width="64" height="64" viewBox="0 0 64 64" className="w-16 h-16" aria-hidden="true">
        <path d="M8 32 L16 24 L24 32 L32 24 L40 32 L48 24 L56 32" stroke="#5D6D7E" strokeWidth="3" fill="none" />
        <rect x="14" y="24" width="2" height="16" fill="#5D6D7E" />
        <rect x="30" y="24" width="2" height="16" fill="#5D6D7E" />
        <rect x="46" y="24" width="2" height="16" fill="#5D6D7E" />
        <circle cx="20" cy="45" r="4" fill="#D92229" />
        <circle cx="32" cy="45" r="4" fill="#FDB515" />
        <circle cx="44" cy="45" r="4" fill="#D92229" />
        <rect x="28" y="38" width="8" height="2" fill="#5D6D7E" />
      </svg>
    ),
  },
];

export const ServiceGrid: React.FC<ServiceGridProps> = memo(({ onNavigate }) => {
  const handleNavigation = (id: string) => {
    onNavigate?.(id);
  };

  return (
    <ServiceGridErrorBoundary>
      <section className="py-16 bg-gray-50" role="region" aria-label="Boxing club services and programs">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              SF-TOUGH <span className="text-primary">PROGRAMS</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From Foggy Bottom beginners to Twin Peaks champions, we’ve got a program that fits your SF lifestyle.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card
                key={service.id}
                className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white border-0 shadow-lg overflow-hidden"
                role="article"
                aria-labelledby={`service-title-${service.id}`}
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={service.image}
                    alt={service.imageAlt}
                    loading="lazy" // Lazy loading for performance
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    fallbackSrc="/images/fallback-boxing.jpg" // Ensure ImageWithFallback uses a local fallback
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3">
                    {service.sfIcon}
                  </div>
                  <div className="absolute bottom-4 left-4 text-white" aria-hidden="true">
                    {service.icon}
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3
                        id={`service-title-${service.id}`}
                        className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-200"
                      >
                        {service.title}
                      </h3>
                      <p className="text-secondary font-medium mb-2">{service.subtitle}</p>
                      <p className="text-gray-600 leading-relaxed">{service.description}</p>
                    </div>
                    <Button
                      onClick={() => handleNavigation(service.id)}
                      className="w-full bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200 group-hover:scale-105"
                      aria-label={`Navigate to ${service.title} details`}
                    >
                      {service.cta}
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto border-t-4 border-accent">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Find Your Program?</h3>
              <p className="text-gray-600 mb-6">
                Not sure which program fits your SF lifestyle? Our team will help you find your perfect match.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => handleNavigation('contact')}
                  className="bg-primary hover:bg-primary/90 text-white"
                  aria-label="Get personalized program recommendations"
                >
                  Get Program Recommendations
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleNavigation('schedule')}
                  className="border-secondary text-secondary hover:bg-secondary hover:text-white"
                  aria-label="View the full schedule of classes and programs"
                >
                  View Full Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ServiceGridErrorBoundary>
  );
});

ServiceGrid.displayName = 'ServiceGrid';