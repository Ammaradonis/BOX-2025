import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  ArrowRight, 
  Calendar, 
  Users, 
  Trophy, 
  Target,
  Smartphone,
  Star,
  Quote
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { TestimonialCard } from './TestimonialCard';
import { ServiceCard } from './ServiceCard';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// TypeScript Interfaces
interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
  program: string;
  image: string;
}

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

interface HomePageProps {
  onNavigate: (page: string) => void;
  onBookClass: (classData: any) => void;
}

export function HomePage({ onNavigate, onBookClass }: HomePageProps) {
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/testimonials`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTestimonials(data.testimonials || []);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setError('Failed to load testimonials. Showing default reviews.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Video control
  useEffect(() => {
    if (videoRef.current) {
      videoPlaying ? videoRef.current.play() : videoRef.current.pause();
    }
  }, [videoPlaying]);

  const services: Service[] = [
    // ... (your existing services array, unchanged)
  ];

  const defaultTestimonials: Testimonial[] = [
    // ... (your existing defaultTestimonials array, unchanged)
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;

  const handleHeroBooking = () => {
    onBookClass({
      id: 'intro-special',
      name: 'FREE Intro Class',
      description: '50% off your first round - perfect for beginners',
      price: 0,
      originalPrice: 25,
      level: 'beginner'
    });
  };

  return (
    <div className="space-y-0">
      {/* Error Boundary */}
      <ErrorBoundary>
        {/* Hero Section */}
        <section 
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
          aria-label="Hero section with gym video background"
        >
          {/* Background Video */}
          <div className="absolute inset-0 z-0">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              poster="/assets/hero-poster.jpg"
              className="w-full h-full object-cover"
            >
              <source src="/assets/hero-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black/60"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 fade-in">
              WHERE SF'S TOUGHEST FIND THEIR STRENGTH
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-200 mb-8 fade-in" style={{ animationDelay: '0.2s' }}>
              Authentic Boxing. Real Community. No Frills.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in" style={{ animationDelay: '0.4s' }}>
              <button
                onClick={handleHeroBooking}
                className="btn btn-primary text-lg px-8 py-4 pulse"
                aria-label="Claim your 50% off first boxing class"
              >
                <span className="sr-only">Claim your 50% off first boxing class</span>
                🥊 CLAIM YOUR 50% OFF FIRST ROUND
              </button>
              
              <button
                onClick={() => onNavigate('schedule')}
                className="btn btn-secondary text-lg px-8 py-4"
                aria-label="View class schedule"
              >
                <Calendar className="mr-2" size={20} />
                SEE OUR SCHEDULE
              </button>
            </div>

            <div className="mt-8 fade-in" style={{ animationDelay: '0.6s' }}>
              <button
                onClick={() => onNavigate('academy')}
                className="text-gray-300 hover:text-white transition-colors inline-flex items-center"
                aria-label="Meet our boxing coaches"
              >
                Meet Our Coaches
                <ArrowRight className="ml-2" size={16} />
              </button>
            </div>
          </div>

          {/* Video Controls */}
          <button
            onClick={() => setVideoPlaying(!videoPlaying)}
            className="absolute bottom-8 right-8 z-20 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
            aria-label={videoPlaying ? 'Pause background video' : 'Play background video'}
          >
            {videoPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
        </section>

        {/* Services Grid */}
        <section 
          className="py-20 bg-white"
          aria-label="SF-tough programs and services"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                SF-TOUGH PROGRAMS
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From Dogpatch to the Presidio, we've got the right training for every San Franciscan
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onNavigate={onNavigate}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section 
          className="py-20 bg-white"
          aria-label="Customer testimonials from around San Francisco"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                HEAR IT FROM THE NEIGHBORHOOD
              </h2>
              <p className="text-xl text-gray-600">
                Real stories from real San Franciscans
              </p>
            </div>

            {isLoading ? (
              <div className="text-center">Loading testimonials...</div>
            ) : error ? (
              <div className="text-center text-red-600">{error}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayTestimonials.map((testimonial, index) => (
                  <TestimonialCard 
                    key={testimonial.id}
                    testimonial={testimonial}
                    delay={index * 0.2}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </ErrorBoundary>
    </div>
  );
}

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8 text-red-600">
          Something went wrong. Please refresh the page or contact support.
        </div>
      );
    }
    return this.props.children;
  }
}