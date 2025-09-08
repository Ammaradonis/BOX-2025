import React, { Component, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Trophy, Target, Calendar, Users, Star, DollarSign } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

// TypeScript interfaces
interface ClassBookingData {
  id: string;
  name: string;
  description: string;
  level: string;
  price: number;
  membership?: string;
}

interface Phase {
  id: string;
  phase: string;
  duration: string;
  title: string;
  icon: string;
  description: string;
  drills: string[];
  goals: string;
}

interface Coach {
  id: string;
  name: string;
  title: string;
  image: string;
  bio: string;
  specialties: string[];
  experience: string;
  record: string;
  achievements: string[];
}

interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
}

interface Graduate {
  name: string;
  achievement: string;
  image: string;
  quote: string;
}

interface AcademyPageProps {
  onBookClass: (classData: ClassBookingData) => void;
}

// Error Boundary Component
class AcademyPageErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600">Please try refreshing the page or contact support.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Enhanced ImageWithFallback Component
interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, alt, className }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" aria-hidden="true" />
      )}
      <img
        src={hasError ? '/fallback-image.png' : src}
        alt={alt}
        className={`object-cover ${hasError ? 'opacity-50' : ''}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        loading="lazy"
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-600">
          Image failed to load
        </div>
      )}
    </div>
  );
};

export function AcademyPage({ onBookClass }: AcademyPageProps) {
  const phases: Phase[] = [
    {
      id: 'foundations',
      phase: 'Phase 1',
      duration: '1-3 months',
      title: 'FOUNDATIONS',
      icon: '🌉',
      description: 'Build your boxing base stronger than Golden Gate Bridge foundations',
      drills: [
        'Cable Car Footwork Drills - Master movement like SF\'s iconic transit',
        'Embarcadero Endurance Runs - Waterfront cardio building',
        'Basic Boxing Stance & Guard - Your defensive Alcatraz',
        'Fundamental Punches - Jab, Cross, Hook, Uppercut'
      ],
      goals: 'Master fundamentals, build cardiovascular base, learn gym culture'
    },
    {
      id: 'pressure-testing',
      phase: 'Phase 2', 
      duration: '4-6 months',
      title: 'PRESSURE TESTING',
      icon: '🌫️',
      description: 'Like SF fog rolling in - unpredictable and challenging',
      drills: [
        'Monthly "Fog City Fights" sparring sessions',
        'Defensive shell work - Protection like Sutro Tower',
        'Advanced combinations under pressure',
        'Ring movement and corner work'
      ],
      goals: 'Controlled sparring introduction, pressure response, competition readiness'
    },
    {
      id: 'competition-ready',
      phase: 'Phase 3',
      duration: '6+ months', 
      title: 'COMPETITION READY',
      icon: '🏆',
      description: 'Elite level training for SF\'s boxing circuit',
      drills: [
        'Amateur tournament preparation',
        'Advanced sparring with various styles',
        'Mental game and strategy development',
        'Peak physical conditioning'
      ],
      goals: 'Competition entry, advanced technique mastery, championship preparation'
    }
  ];

  const coaches: Coach[] = [
    {
      id: 'raul-mendoza',
      name: 'Raúl "The Firewall" Mendoza',
      title: 'Head Academy Coach',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      bio: 'Trained at King\'s Gym (Tenderloin) during the \'90s. Specialty: Surviving \'Civic Center Clinches\'.',
      specialties: ['Defense', 'Sparring', 'Competition Prep'],
      experience: '15 years',
      record: '12-3 Amateur, 8-2 Professional',
      achievements: [
        'NorCal Golden Gloves Champion 1994',
        'Trained 15 amateur champions',
        'Former SF Boxing Commission member'
      ]
    },
    {
      id: 'jamal-chen',
      name: 'Jamal "The Technician" Chen',
      title: 'Technical Development Coach',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      bio: 'NASM Certified. Transformed 200+ SF tech workers from keyboard warriors to ring warriors.',
      specialties: ['Technical Boxing', 'Form Analysis', 'Strength Training'],
      experience: '10 years',
      record: '18-4 Amateur',
      achievements: [
        'USA Boxing Certified Coach',
        'Sports Science Degree, UCSF',
        'Undefeated in California circuit 2018-2020'
      ]
    }
  ];

  const pricingTiers: PricingTier[] = [
    {
      id: 'fog-belt',
      name: 'FOG BELT',
      price: 199,
      period: '/month',
      description: 'Group Academy sessions',
      features: [
        'All group Academy classes',
        'Basic technique development',
        'Fitness and conditioning',
        'Academy community access',
        'Progress tracking'
      ],
      cta: 'START FOG BELT',
      popular: false
    },
    {
      id: 'golden-gate-belt',
      name: 'GOLDEN GATE BELT',
      price: 349,
      period: '/month',
      description: 'Academy + Personal Training',
      features: [
        'Everything in Fog Belt',
        '2 private sessions/month',
        'Advanced sparring access',
        'Competition preparation',
        'Video analysis sessions',
        'Nutrition guidance'
      ],
      cta: 'CHOOSE GOLDEN GATE',
      popular: true
    },
    {
      id: 'bart-pass',
      name: 'BART PASS',
      price: 499,
      period: '/month',
      description: 'Unlimited Academy Access',
      features: [
        'Everything in Golden Gate Belt',
        'Unlimited private sessions',
        'Competition entry fees covered',
        'Custom training plans',
        'Recovery and injury prevention',
        'Equipment provided'
      ],
      cta: 'GO UNLIMITED',
      popular: false
    }
  ];

  const graduates: Graduate[] = [
    {
      name: 'Sofia "Lightning" Rodriguez',
      achievement: '2024 NorCal Golden Gloves Champion',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=300',
      quote: 'From Mission District mom to regional champion in 18 months!'
    },
    {
      name: 'Tommy "TechKO" Liu',
      achievement: '2023 USA Boxing National Qualifier',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      quote: 'Went from coding bugs to fighting in the ring!'
    }
  ];

  return (
    <AcademyPageErrorBoundary>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <Helmet>
          <title>3rd Street Boxing Academy - San Francisco's Premier Boxing Training</title>
          <meta name="description" content="Join 3rd Street Boxing Academy in San Francisco for elite boxing training. From fundamentals to championship preparation, our coaches guide you to success." />
          <meta name="keywords" content="boxing academy, San Francisco boxing, boxing training, boxing classes, championship training" />
          <meta name="robots" content="index,follow" />
          <meta property="og:title" content="3rd Street Boxing Academy - San Francisco" />
          <meta property="og:description" content="Elite boxing training in San Francisco. Join our academy to become a champion." />
          <meta property="og:image" content="/og-image.jpg" />
          <meta property="og:url" content="https://www.3rdstreetboxing.com/academy" />
        </Helmet>

        <div className="min-h-screen bg-gray-50">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-r from-red-900 to-red-700 text-white py-16 sm:py-24">
            <div className="absolute inset-0 bg-black/20"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
                FORGE SF'S NEXT CHAMPIONS
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-red-100 mb-8 max-w-3xl mx-auto">
                From Castro to Chinatown, our champions start here. Elite training for serious competitors.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => onBookClass({
                    id: 'academy-trial',
                    name: 'Academy Trial Session',
                    description: 'Experience our championship training program',
                    level: 'academy',
                    price: 45
                  })}
                  className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                  aria-label="Book a trial session for the boxing academy"
                >
                  🏆 BOOK TRIAL SESSION
                </button>
                
                <button 
                  className="btn btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                  aria-label="Learn more about our champions"
                >
                  MEET OUR CHAMPIONS
                </button>
              </div>
            </div>
          </section>

          {/* Program Structure */}
          <section className="py-12 sm:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  YOUR PATH TO CHAMPIONSHIP
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                  Structured progression from fundamentals to elite competition level
                </p>
              </div>

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-red-200 hidden sm:block"></div>
                
                <div className="space-y-8 sm:space-y-12">
                  {phases.map((phase, index) => (
                    <div key={phase.id} className="relative">
                      {/* Timeline Icon */}
                      <div className="hidden sm:flex absolute left-6 w-5 h-5 bg-red-600 rounded-full items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      
                      <div className="sm:ml-16 bg-white rounded-xl shadow-lg p-6 sm:p-8">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
                          <div className="lg:w-1/3 mb-6 lg:mb-0">
                            <div className="flex items-center space-x-3 mb-4">
                              <span className="text-2xl sm:text-3xl">{phase.icon}</span>
                              <div>
                                <div className="text-sm text-red-600 font-medium">{phase.phase}</div>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{phase.title}</h3>
                                <div className="text-sm text-gray-500">{phase.duration}</div>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 mb-4 text-sm sm:text-base">{phase.description}</p>
                            
                            <div className="bg-red-50 rounded-lg p-4">
                              <h4 className="font-semibold text-red-900 mb-2">Phase Goals</h4>
                              <p className="text-sm text-red-700">{phase.goals}</p>
                            </div>
                          </div>
                          
                          <div className="lg:w-2/3">
                            <h4 className="font-semibold text-gray-900 mb-4">Training Focus</h4>
                            <ul className="space-y-3">
                              {phase.drills.map((drill, drillIndex) => (
                                <li key={drillIndex} className="flex items-start space-x-3">
                                  <div className="bg-red-100 text-red-600 rounded-full p-1 mt-1 flex-shrink-0">
                                    <Target size={12} />
                                  </div>
                                  <span className="text-gray-700 text-sm sm:text-base">{drill}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Coach Roster */}
          <section className="py-12 sm:py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  ELITE COACHING STAFF
                </h2>
                <p className="text-lg sm:text-xl text-gray-600">
                  Learn from champions who've been in the ring
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {coaches.map((coach) => (
                  <div key={coach.id} className="card bg-white">
                    <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                      <ImageWithFallback
                        src={coach.image}
                        alt={`${coach.name} - Academy coach at 3rd Street Boxing`}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                      />
                      
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{coach.name}</h3>
                        <p className="text-red-600 font-medium mb-2">{coach.title}</p>
                        <p className="text-gray-600 text-sm sm:text-base mb-4">{coach.bio}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-900">Experience:</span>
                            <div className="text-gray-600">{coach.experience}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Record:</span>
                            <div className="text-gray-600">{coach.record}</div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="font-medium text-gray-900 mb-2">Specialties:</div>
                          <div className="flex flex-wrap gap-2">
                            {coach.specialties.map((specialty) => (
                              <span key={specialty} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Achievements:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {coach.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <Trophy size={12} className="text-yellow-500 flex-shrink-0" />
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Tiers */}
          <section className="py-12 sm:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  CHOOSE YOUR CHAMPIONSHIP PATH
                </h2>
                <p className="text-lg sm:text-xl text-gray-600">
                  Flexible training options for every commitment level
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {pricingTiers.map((tier) => (
                  <div 
                    key={tier.id} 
                    className={`card relative ${tier.popular ? 'ring-2 ring-red-500' : ''}`}
                    role="region"
                    aria-label={`${tier.name} pricing tier`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                      <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">
                        ${tier.price}<span className="text-base sm:text-lg text-gray-500">{tier.period}</span>
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base">{tier.description}</p>
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="bg-green-100 text-green-600 rounded-full p-1 mt-1">
                            <span className="text-xs">✓</span>
                          </div>
                          <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => onBookClass({
                        id: `academy-${tier.id}`,
                        name: `Academy ${tier.name}`,
                        description: tier.description,
                        level: 'academy',
                        price: tier.price,
                        membership: tier.name
                      })}
                      className={`btn w-full ${tier.popular ? 'btn-primary' : 'btn-secondary'}`}
                      aria-label={`Select ${tier.name} membership plan`}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Academy Graduates */}
          <section className="py-12 sm:py-20 bg-red-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                  OUR CHAMPIONS
                </h2>
                <p className="text-lg sm:text-xl text-red-100">
                  Academy graduates making SF proud in the ring
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {graduates.map((graduate, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                      <ImageWithFallback
                        src={graduate.image}
                        alt={`${graduate.name} - Academy graduate`}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                      />
                      
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold">{graduate.name}</h3>
                        <p className="text-yellow-300 font-medium mb-2">{graduate.achievement}</p>
                        <blockquote className="text-red-100 italic text-sm sm:text-base">
                          "{graduate.quote}"
                        </blockquote>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </Suspense>
    </AcademyPageErrorBoundary>
  );
}