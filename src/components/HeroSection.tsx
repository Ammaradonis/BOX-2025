import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Play, Pause, ChevronRight, Target, Users, Trophy } from 'lucide-react';

interface HeroSectionProps {
  onNavigate?: (page: string) => void;
}

// Simple ImageWithFallback component if not exists
const ImageWithFallback = ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
  <img
    src={src}
    alt={alt}
    className={className}
    loading="lazy"
    onError={(e) => {
      e.currentTarget.src = '/fallback-image.jpg'; // Add a fallback image in your public folder
    }}
  />
);

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      text: "Shredded my pandemic 'Dolores Park bod' in 8 weeks! More energizing than Philz coffee.",
      author: "Sarah K.",
      location: "SoMa"
    },
    {
      text: "Went from shy to school champ. Coaches here are like family.",
      author: "Diego R.",
      location: "Sunset"
    },
    {
      text: "Better than any tech job I've had. This is where I actually level up.",
      author: "Marcus T.",
      location: "Mission Bay"
    }
  ];

  // Memoized navigation handler
  const handleNavigation = useCallback((page: string) => {
    if (onNavigate) {
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [onNavigate]);

  // Optimized testimonial rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      role="banner"
      aria-label="Hero section"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1575747515871-2e323827539e?crop=entropy&cs=tinysrgb&fit=max&fm=webp&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBneW0lMjB0cmFpbmluZyUyMGJheSUyMGJyaWRnZSUyMHNhbiUyMGZyYW5jaXNjb3xlbnwxfHx8fDE3NTYwOTY2MjR8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Boxers training in 3rd Street Boxing Gym with heavy bags and speed bags, Bay Bridge visible through large industrial windows"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Main Content */}
      <div className="relative z-20 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              WHERE SF'S TOUGHEST
              <br />
              <span className="text-accent">FIND THEIR STRENGTH</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Authentic Boxing. Real Community. No Frills.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 animate-pulse"
              onClick={() => handleNavigation('book-intro')}
            >
              <Target className="w-5 h-5 mr-2" />
              CLAIM YOUR 50% OFF FIRST ROUND
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-black px-6 py-4 text-lg font-medium rounded-lg transition-all duration-200"
              onClick={() => handleNavigation('schedule')}
            >
              <Users className="w-5 h-5 mr-2" />
              SEE OUR SCHEDULE
            </Button>
          </div>

          <div className="pt-4">
            <button
              onClick={() => handleNavigation('trainers')}
              className="text-white hover:text-accent transition-colors duration-200 text-lg font-medium group focus:outline-none focus:text-accent"
            >
              Meet Our Coaches
              <ChevronRight className="w-5 h-5 inline-block ml-1 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Testimonial */}
      <div className="absolute bottom-8 left-8 right-8 z-20">
        <div className="max-w-md mx-auto lg:mx-0 lg:max-w-lg">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex text-accent">
                {[...Array(5)].map((_, i) => (
                  <Trophy key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-600">5.0 Stars</span>
            </div>
            <blockquote className="text-gray-800 text-sm font-medium mb-3">
              "{testimonials[currentTestimonial].text}"
            </blockquote>
            <cite className="text-sm text-gray-600 not-italic">
              — {testimonials[currentTestimonial].author} | {testimonials[currentTestimonial].location}
            </cite>
            <div className="flex justify-center space-x-2 mt-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                    index === currentTestimonial ? 'bg-accent' : 'bg-gray-300'
                  }`}
                  aria-label={`Show testimonial from ${testimonials[index].author}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="flex flex-col items-center text-white">
          <span className="text-sm mb-2">Scroll to Explore</span>
          <div className="w-6 h-10 border-2 border-white rounded-full p-1">
            <div className="w-1 h-3 bg-white rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* SF-Themed Floating Elements */}
      <div className="absolute top-20 right-20 z-10 hidden lg:block" aria-hidden="true">
        <div className="text-white/20 text-8xl font-bold transform rotate-12 select-none pointer-events-none">
          SF
        </div>
      </div>
      <div className="absolute bottom-32 right-12 z-10 hidden lg:block" aria-hidden="true">
        <div className="text-accent/30 text-4xl font-bold transform -rotate-12 select-none pointer-events-none">
          SINCE 2005
        </div>
      </div>
    </section>
  );
}