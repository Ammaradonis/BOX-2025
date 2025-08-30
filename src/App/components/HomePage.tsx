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

interface HomePageProps {
  onNavigate: (page: string) => void;
  onBookClass: (classData: any) => void;
}

export function HomePage({ onNavigate, onBookClass }: HomePageProps) {
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    // Fetch testimonials on component mount
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/testimonials`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => setTestimonials(data.testimonials || []))
      .catch(error => {
        console.error('Error fetching testimonials:', error);
        // Use default testimonials if fetch fails
      });
  }, []);

  const services = [
    {
      id: 'classes',
      title: 'CLASSES',
      description: 'From FiDi desk warriors to Mission artists – find your level. Beginner to pro sessions daily.',
      icon: '🚋', // Cable car emoji
      cta: 'VIEW CLASS LEVELS',
      page: 'classes',
      image: 'https://images.unsplash.com/photo-1575747515871-2e323827539e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBneW0lMjB0cmFpbmluZyUyMFNhbiUyMEZyYW5jaXNjb3xlbnwxfHx8fDE3NTYwOTY0NzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      altText: 'Diverse group in a beginner boxing class, practicing jabs with San Francisco cityscape visible through large windows'
    },
    {
      id: 'academy',
      title: 'ACADEMY',
      description: 'Compete in SF\'s amateur circuit? Our Castro-to-Chinatown champs start here.',
      icon: '🏆', // Trophy for championship
      cta: 'TRAIN TO FIGHT',
      page: 'academy',
      image: 'https://images.unsplash.com/photo-1724529808495-8b7cf64e3e3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBjb2FjaCUyMHRyYWluaW5nJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzU2MDk2NDc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      altText: 'Amateur boxer sparring under Bay Bridge mural at sunset'
    },
    {
      id: 'bootcamp',
      title: 'BOOTCAMP',
      description: 'Conquer hills steeper than California Street',
      icon: '⛰️', // Mountain for hills
      cta: 'JOIN BOOTCAMP',
      page: 'bootcamp',
      image: 'https://images.unsplash.com/photo-1568475754879-c62e646b96f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwYm9vdGNhbXAlMjBvdXRkb29yJTIwU2FuJTIwRnJhbmNpc2NvfGVufDF8fHx8MTc1NjA5NjQ3NXww&ixlib=rb-4.1.0&q=80&w=1080',
      altText: 'Group doing burpees on Potrero Hill with downtown San Francisco skyline in background'
    },
    {
      id: 'personal-training',
      title: 'PERSONAL TRAINING',
      description: '1-on-1 sessions sharper than a cable car bell',
      icon: '🎯', // Target for precision
      cta: 'BOOK COACH',
      page: 'personal-training',
      image: 'https://images.unsplash.com/photo-1724529808495-8b7cf64e3e3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBjb2FjaCUyMHRyYWluaW5nJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzU2MDk2NDc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      altText: 'Personal trainer adjusting client\'s form on heavy bag near industrial windows'
    },
    {
      id: 'youth',
      title: 'YOUTH',
      description: 'Build confidence stronger than Sutro Tower',
      icon: '👧👦', // Kids
      cta: 'ENROLL KIDS',
      page: 'youth',
      image: 'https://images.unsplash.com/photo-1617627590804-1de3424fbf04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHh5b3VuZyUyMGJveGVyJTIwdHJhaW5pbmclMjBraWRzfGVufDF8fHx8MTc1NjA5NjQ3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      altText: 'Kids practicing boxing stances with coach in front of Giants mural'
    },
    {
      id: 'facilities',
      title: 'FACILITIES',
      description: 'Open gym access - no appointment needed',
      icon: '🏢', // Building
      cta: 'TOUR GYM',
      page: 'facilities',
      image: 'https://images.unsplash.com/photo-1575747515871-2e323827539e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBneW0lMjB0cmFpbmluZyUyMFNhbiUyMEZyYW5jaXNjb3xlbnwxfHx8fDE3NTYwOTY0NzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      altText: '5,000 sq ft gym with boxing ring, 12 heavy bags, and cardio zone'
    }
  ];

  const defaultTestimonials = [
    {
      id: 'sarah-soma',
      name: 'Sarah K.',
      location: 'SoMa',
      quote: 'Shredded my pandemic \'Dolores Park bod\' in 8 weeks! More energizing than Philz coffee.',
      rating: 5,
      program: 'Bootcamp',
      image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400'
    },
    {
      id: 'diego-sunset',
      name: 'Diego R.',
      location: 'Sunset',
      quote: 'Went from shy to school champ. Coaches here are like family.',
      rating: 5,
      program: 'Youth Boxing',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
    },
    {
      id: 'alex-mission',
      name: 'Alex T.',
      location: 'Mission',
      quote: 'Best workout in the city! More intense than rushing for the last BART train.',
      rating: 5,
      program: 'Classes',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
    }
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
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        aria-label="Hero section with gym video background"
      >
        {/* Background Video/Image */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1519475966128-2b8e25f33578?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkZW4lMjBnYXRlJTIwYnJpZGdlJTIwc3Vuc2V0fGVufDF8fHx8MTc1NjA5NjQ3NXww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Boxers training in 3rd Street Boxing Gym with heavy bags and speed bags, Bay Bridge visible through large industrial windows"
            className="w-full h-full object-cover"
          />
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
              aria-label="Claim your 50% off first round offer"
            >
              🥊 CLAIM YOUR 50% OFF FIRST ROUND
            </button>
            
            <button
              onClick={() => onNavigate('schedule')}
              className="btn btn-secondary text-lg px-8 py-4"
              aria-label="See our class schedule"
            >
              <Calendar className="mr-2" size={20} />
              SEE OUR SCHEDULE
            </button>
          </div>

          <div className="mt-8 fade-in" style={{ animationDelay: '0.6s' }}>
            <button
              onClick={() => onNavigate('academy')}
              className="text-gray-300 hover:text-white transition-colors inline-flex items-center"
              aria-label="Meet our coaches"
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

          <div className="sf-grid sf-grid-3">
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

      {/* Ed Gutierrez Tribute */}
      <section 
        className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white"
        aria-label="Ed Gutierrez comeback story"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                IRON MAN STRONG: ED'S COMEBACK JOURNEY
              </h2>
              
              {/* Timeline */}
              <div className="space-y-4 mb-8">
                {[
                  { year: '2017', event: 'Stroke Changes Everything' },
                  { year: '2019', event: 'First Steps Back' },
                  { year: '2021', event: 'Return to the Gym' },
                  { year: '2023', event: 'Coaching Again' },
                  { year: '2025', event: 'Leading Classes Strong' }
                ].map((milestone, index) => (
                  <div key={milestone.year} className="flex items-center space-x-4">
                    <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {milestone.year}
                    </div>
                    <div className="text-gray-300">{milestone.event}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => window.open('https://gofundme.com/ed-gutierrez-next-round', '_blank')}
                className="btn btn-primary"
                aria-label="Support Ed's next round fundraiser"
              >
                SUPPORT ED'S NEXT ROUND
              </button>
            </div>

            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1724529808495-8b7cf64e3e3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBjb2FjaCUyMHRyYWluaW5nJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzU2MDk2NDc1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Ed Gutierrez, a Hispanic man in his 60s, coaching a young boxer in the ring, both smiling with Bay Bridge visible through gym windows"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Promo */}
      <section 
        className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100"
        aria-label="Mobile app features"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                SF'S BOXING APP – NO MUNI-LEVEL WAITS
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 text-white rounded-full p-1">
                    <span className="text-sm">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold">BOOK 24/7</div>
                    <div className="text-gray-600">Classes, Open Gym, Privates</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 text-white rounded-full p-1">
                    <span className="text-sm">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold">TRACK GAINS</div>
                    <div className="text-gray-600">Workout history, punch metrics</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 text-white rounded-full p-1">
                    <span className="text-sm">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold">SF-EXCLUSIVE REWARDS</div>
                    <div className="text-gray-600">Free sessions at Ocean Beach, local discounts</div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button className="btn btn-primary">
                  <Smartphone className="mr-2" size={20} />
                  Download iOS App
                </button>
                <button className="btn btn-secondary">
                  <Smartphone className="mr-2" size={20} />
                  Get Android App
                </button>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-block bg-black rounded-3xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=600&fit=crop"
                  alt="iPhone showing 3rd Street Boxing Gym app with class schedule and booking options"
                  className="rounded-2xl w-64 h-auto"
                />
              </div>
            </div>
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

          <div className="sf-grid sf-grid-3">
            {displayTestimonials.map((testimonial, index) => (
              <TestimonialCard 
                key={testimonial.id}
                testimonial={testimonial}
                delay={index * 0.2}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20 bg-gradient-to-r from-red-600 to-red-700 text-white"
        aria-label="Join our gym call to action"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            READY TO FIND YOUR STRENGTH?
          </h2>
          
          <p className="text-xl mb-8 text-red-100">
            Join SF's most authentic boxing community. Your first class is 50% off.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleHeroBooking}
              className="bg-white text-red-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              START YOUR JOURNEY
            </button>
            
            <button
              onClick={() => onNavigate('contact')}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-red-600 transition-colors"
            >
              VISIT THE GYM
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}