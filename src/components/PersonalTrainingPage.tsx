// PersonalTrainingPage.tsx
// Production-ready refactor for a boxing club website (SF, CA)
// Implements: error boundaries, loading/error states, SWR caching, TS interfaces, standardized booking payload,
// accessible alt text, semantic headings, image optimization helper, DB-as-source-of-truth with local fallbacks,
// and consistent responsive layout.
//
// NOTE: Remove unused Radix UI deps from package.json separately (not in this file).
// OPTIONAL: Move packages/successStories/localTrainerFallbacks to /config files if you prefer.
// Ensure ./ImageWithFallback exists and exports `ImageWithFallback` as used below.

import React, { useMemo } from 'react';
import useSWR from 'swr';
import { Clock, DollarSign, Star, Target, Award } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// -----------------------------
// Types
// -----------------------------
export interface Trainer {
  id: string;
  name: string;
  image: string;
  specialties: string[];
  experience: string; // e.g., "8 years"
  hourlyRate: number;
  bio: string;
  achievements: string[];
  clientTypes: string; // description of who they best serve
  personality: string;
  availability: string[]; // e.g., ["Monday", "Wednesday"]
  rating: number; // 0..5
  reviewCount: number;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  sessions: number;
  savings?: number;
  description: string;
  features: string[];
  bestFor: string;
  popular?: boolean;
}

export interface SuccessStory {
  name: string;
  location: string;
  trainer: string; // Trainer name
  transformation: string;
  duration: string;
  quote: string;
  image: string;
}

export interface Booking {
  id: string;
  name: string;
  description: string;
  price: number;
  sessions?: number;
  trainer?: string;
  level: 'personal-training';
}

interface PersonalTrainingPageProps {
  onBookClass: (classData: Booking) => void;
}

// -----------------------------
// Helpers
// -----------------------------
const fetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${publicAnonKey}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch trainers: ${res.status} ${res.statusText} ${text}`);
  }
  return res.json();
};

// Ensure Unsplash (or other remote) images are optimized.
// Adds sensible defaults for format/fit/quality and allows overriding size via `w` param in src.
const optimizeImg = (src: string, width = 800, height?: number) => {
  try {
    const url = new URL(src);
    // only add params to remote images (Unsplash, etc.)
    if (url.hostname.includes('unsplash.com') || url.hostname.includes('images.unsplash.com')) {
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('q', '80');
      url.searchParams.set('w', String(width));
      if (height) url.searchParams.set('h', String(height));
      return url.toString();
    }
    return src;
  } catch {
    return src;
  }
};

// -----------------------------
// Local fallback data (can be moved to /config/*)
// -----------------------------
const packagesFallback: Package[] = [
  {
    id: 'single',
    name: 'Single Session',
    price: 85,
    sessions: 1,
    savings: 0,
    description: 'Perfect for trying personal training',
    features: [
      '60-minute one-on-one session',
      'Personalized workout plan',
      'Form correction and technique',
      'Goal setting consultation',
    ],
    bestFor: 'First-timers and goal assessment',
  },
  {
    id: 'five-pack',
    name: '5-Session Pack',
    price: 400,
    sessions: 5,
    savings: 25,
    description: 'Build consistency and see results',
    features: [
      'Everything in single session',
      'Progressive training plan',
      'Nutrition guidance basics',
      'Workout tracking and analysis',
      'Flexible scheduling',
    ],
    bestFor: 'Building habits and seeing progress',
    popular: true,
  },
  {
    id: 'ten-pack',
    name: '10-Session Pack',
    price: 750,
    sessions: 10,
    savings: 100,
    description: 'Serious commitment, serious results',
    features: [
      'Everything in 5-session pack',
      'Custom meal planning',
      'Video analysis of technique',
      'Supplement recommendations',
      'Priority booking access',
      '2 months of workout tracking',
    ],
    bestFor: 'Serious transformation goals',
  },
];

const successStoriesFallback: SuccessStory[] = [
  {
    name: 'David K.',
    location: 'SOMA',
    trainer: 'Jamal Chen',
    transformation: 'Lost 25lbs, gained confidence for first amateur fight',
    duration: '6 months',
    quote: 'Jamal turned my lunch break workouts into a complete lifestyle change.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
  },
  {
    name: 'Lisa M.',
    location: 'Marina',
    trainer: 'Maria Gonzalez',
    transformation: 'From couch to competing in local boxing league',
    duration: '8 months',
    quote: "Maria made boxing accessible and fun. Now I can't imagine life without it!",
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=300',
  },
];

// Trainers are DB source-of-truth. These are **fallbacks** used if fetch fails.
const trainerFallbacks: Trainer[] = [
  {
    id: 'maria-gonzalez',
    name: 'Maria "Mission" Gonzalez',
    image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400',
    specialties: ['Beginner Training', 'Footwork', 'Technique'],
    experience: '8 years',
    hourlyRate: 85,
    bio: "5x NorCal Golden Gloves champion who teaches footwork like a Tango dancer in the Mission. Specializes in building confidence for first-time boxers.",
    achievements: [
      'NorCal Golden Gloves Champion (5x)',
      'USA Boxing Certified Trainer',
      'Trained 150+ beginners to intermediate level',
    ],
    clientTypes: 'Beginners, women returning to fitness, technique refinement',
    personality: 'Patient, encouraging, detail-oriented',
    availability: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    rating: 4.9,
    reviewCount: 87,
  },
  {
    id: 'raul-mendoza',
    name: 'Raúl "The Firewall" Mendoza',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    specialties: ['Defense', 'Sparring', 'Competition Prep'],
    experience: '15 years',
    hourlyRate: 95,
    bio: "Trained at King's Gym during the '90s. Master of defensive techniques and preparing fighters for competition.",
    achievements: [
      '12-3 Amateur, 8-2 Professional record',
      'Former SF Boxing Commission member',
      'Coached 15 amateur champions',
    ],
    clientTypes: 'Intermediate to advanced, competition prep, defensive training',
    personality: 'Intense, strategic, results-focused',
    availability: ['Tuesday', 'Thursday', 'Saturday', 'Sunday'],
    rating: 4.8,
    reviewCount: 92,
  },
  {
    id: 'jamal-chen',
    name: 'Jamal "The Technician" Chen',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    specialties: ['Technical Boxing', 'Strength Training', 'Form Correction'],
    experience: '10 years',
    hourlyRate: 90,
    bio: 'NASM Certified with a Sports Science degree. Transformed 200+ SF tech workers using data-driven training methods.',
    achievements: [
      'NASM Certified Personal Trainer',
      'Sports Science Degree, UCSF',
      'Undefeated California amateur circuit 2018-2020',
    ],
    clientTypes: 'Tech professionals, data-driven fitness, strength building',
    personality: 'Analytical, motivating, tech-savvy',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    rating: 4.9,
    reviewCount: 104,
  },
];

// -----------------------------
// Error Boundary
// -----------------------------
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    // Log to your monitoring service here
    console.error('PersonalTrainingPage crashed:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-[40vh] grid place-items-center p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
              <p className="text-gray-600">Please refresh the page or try again later.</p>
            </div>
          </div>
        )
      );
    }
    return this.props.children as React.ReactElement;
  }
}

// -----------------------------
// Main Component
// -----------------------------
export function PersonalTrainingPage({ onBookClass }: PersonalTrainingPageProps) {
  // SWR for trainers from Supabase: DB is the source of truth
  const { data, error, isLoading } = useSWR<{ trainers?: Trainer[] }>(
    `https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/trainers`,
    fetcher,
    {
      // show something immediately if we have local fallbacks
      fallbackData: { trainers: trainerFallbacks },
      revalidateOnFocus: true,
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  const trainers: Trainer[] = useMemo(
    () => data?.trainers && data.trainers.length > 0 ? data.trainers : trainerFallbacks,
    [data]
  );

  const currentTrainer: Trainer | null = useMemo(() => {
    // Prefer the first item, but allow a "featured" trainer strategy if your API returns it.
    return trainers.length > 0 ? trainers[0] : null;
  }, [trainers]);

  const [selectedTrainerId, setSelectedTrainerId] = React.useState<string | null>(currentTrainer?.id || null);

  React.useEffect(() => {
    if (currentTrainer?.id && !selectedTrainerId) {
      setSelectedTrainerId(currentTrainer.id);
    }
  }, [currentTrainer, selectedTrainerId]);

  const selectedTrainer = useMemo(
    () => trainers.find((t) => t.id === selectedTrainerId) || trainers[0],
    [selectedTrainerId, trainers]
  );

  const handleBook = (payload: Booking) => {
    onBookClass(payload);
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-[40vh] grid place-items-center p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">We’re having trouble loading this page</h2>
            <p className="text-gray-600">Please try again shortly. If the issue persists, contact the gym.</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">Personal Training</h1>
            <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
              1-on-1 sessions sharper than a cable car bell. Get personalized attention from SF&apos;s best boxing coaches.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() =>
                  handleBook({
                    id: 'pt-consultation',
                    name: 'Free Consultation',
                    description: 'Meet your trainer and plan your goals',
                    level: 'personal-training',
                    price: 0,
                  })
                }
                className="btn btn-primary text-lg px-8 py-4"
                aria-label="Schedule a free personal training consultation"
              >
                🎯 Free Consultation
              </button>

              <a href="#trainers" className="btn btn-secondary text-lg px-8 py-4" aria-label="Jump to trainer list">
                Meet Our Trainers
              </a>
            </div>
          </div>
        </section>

        {/* Training Packages */}
        <section className="py-16 bg-white" aria-labelledby="packages-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="packages-heading" className="text-3xl font-bold text-gray-900 mb-4">
                Choose Your Training Package
              </h2>
              <p className="text-lg text-gray-600">Flexible options to fit your schedule and budget</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {packagesFallback.map((pkg) => (
                <article
                  key={pkg.id}
                  className={`card relative ${pkg.popular ? 'ring-2 ring-red-500' : ''}`}
                  aria-label={`${pkg.name} package`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                    <div className="text-3xl font-bold text-red-600 mb-2">${pkg.price}</div>
                    <div className="text-sm text-gray-500 mb-2">
                      ${(pkg.price / Math.max(1, pkg.sessions)).toFixed(0)} per session
                    </div>
                    {pkg.savings && pkg.savings > 0 && (
                      <div className="text-sm text-green-600 font-medium">Save ${pkg.savings}!</div>
                    )}
                    <p className="text-gray-600 mt-3">{pkg.description}</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="bg-green-100 text-green-600 rounded-full p-1 mt-1" aria-hidden="true">
                          <span className="text-xs">✓</span>
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="bg-gray-50 rounded-lg p-3 mb-6">
                    <div className="text-xs font-medium text-gray-500 mb-1">Best For</div>
                    <div className="text-sm text-gray-900">{pkg.bestFor}</div>
                  </div>

                  <button
                    onClick={() =>
                      handleBook({
                        id: `pt-${pkg.id}`,
                        name: `Personal Training - ${pkg.name}`,
                        description: pkg.description,
                        level: 'personal-training',
                        price: pkg.price,
                        sessions: pkg.sessions,
                      })
                    }
                    className={`btn w-full ${pkg.popular ? 'btn-primary' : 'btn-secondary'}`}
                    aria-label={`Get started with ${pkg.name}`}
                  >
                    Get Started
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Trainer Showcase */}
        <section id="trainers" className="py-16 bg-gray-50" aria-labelledby="trainers-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="trainers-heading" className="text-3xl font-bold text-gray-900 mb-4">
                Meet Your Potential Trainers
              </h2>
              <p className="text-lg text-gray-600">Each trainer brings unique expertise and personality</p>
            </div>

            {/* Loading & Error states */}
            {isLoading && (
              <div className="grid place-items-center py-10">
                <div role="status" aria-live="polite" className="text-gray-700">
                  Loading trainers…
                </div>
              </div>
            )}
            {error && (
              <div className="max-w-2xl mx-auto mb-8">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                  We couldn&apos;t load the latest trainer list. Showing local info instead.
                </div>
              </div>
            )}

            {/* Trainer Selection */}
            <div className="flex justify-center mb-8 overflow-x-auto">
              <div className="bg-white rounded-lg p-1 inline-flex shadow-sm">
                {trainers.map((trainer) => (
                  <button
                    key={trainer.id}
                    onClick={() => setSelectedTrainerId(trainer.id)}
                    className={`px-6 py-3 rounded-md font-medium transition-colors whitespace-nowrap ${
                      selectedTrainerId === trainer.id ? 'bg-red-600 text-white' : 'text-gray-700 hover:text-red-600'
                    }`}
                    aria-pressed={selectedTrainerId === trainer.id}
                    aria-label={`Show profile for ${trainer.name}`}
                  >
                    {trainer.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Trainer Profile */}
            {selectedTrainer && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <ImageWithFallback
                      src={optimizeImg(selectedTrainer.image, 1200, 800)}
                      alt={`${selectedTrainer.name} — personal boxing trainer in San Francisco demonstrating technique`}
                      className="w-full h-80 object-cover rounded-lg mb-6"
                      loading="lazy"
                    />

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Contact & Details</h3>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center space-x-2 mb-1">
                            <DollarSign size={14} aria-hidden="true" />
                            <span>${selectedTrainer.hourlyRate}/session</span>
                          </div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Star size={14} className="text-yellow-500" aria-hidden="true" />
                            <span>
                              {selectedTrainer.rating} ({selectedTrainer.reviewCount} reviews)
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock size={14} aria-hidden="true" />
                            <span>{selectedTrainer.experience} experience</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Availability</h3>
                        <div className="flex flex-wrap gap-1">
                          {selectedTrainer.availability.map((day) => (
                            <span key={day} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedTrainer.name}</h3>
                      <p className="text-gray-600 text-lg leading-relaxed">{selectedTrainer.bio}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Specialties</h3>
                        <div className="space-y-2">
                          {selectedTrainer.specialties.map((specialty) => (
                            <div key={specialty} className="flex items-center space-x-2">
                              <Target size={16} className="text-red-600" aria-hidden="true" />
                              <span className="text-gray-700">{specialty}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Training Style</h3>
                        <div className="text-gray-700 text-sm space-y-1">
                          <div>
                            <strong>Personality:</strong> {selectedTrainer.personality}
                          </div>
                          <div>
                            <strong>Best for:</strong> {selectedTrainer.clientTypes}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Achievements & Credentials</h3>
                      <ul className="space-y-2">
                        {selectedTrainer.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Award size={16} className="text-yellow-500 mt-1 flex-shrink-0" aria-hidden="true" />
                            <span className="text-gray-700 text-sm">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button
                        onClick={() =>
                          handleBook({
                            id: `pt-${selectedTrainer.id}`,
                            name: `Personal Training with ${selectedTrainer.name}`,
                            description: 'One-on-one boxing training session',
                            level: 'personal-training',
                            price: selectedTrainer.hourlyRate,
                            trainer: selectedTrainer.name,
                          })
                        }
                        className="btn btn-primary flex-1"
                        aria-label={`Book a training session with ${selectedTrainer.name}`}
                      >
                        Book with {selectedTrainer.name.split(' ')[0]}
                      </button>

                      <a
                        className="btn btn-secondary flex-1 text-center"
                        href="#schedule"
                        aria-label={`View ${selectedTrainer.name}'s schedule`}
                      >
                        View Schedule
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-16 bg-white" aria-labelledby="stories-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="stories-heading" className="text-3xl font-bold text-gray-900 mb-4">
                Success Stories
              </h2>
              <p className="text-lg text-gray-600">Real transformations from our personal training clients</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {successStoriesFallback.map((story, index) => (
                <article key={index} className="card bg-white" aria-label={`Success story from ${story.name}`}>
                  <div className="flex items-start space-x-4 mb-4">
                    <ImageWithFallback
                      src={optimizeImg(story.image, 200, 200)}
                      alt={`${story.name} from ${story.location} after training with ${story.trainer}`}
                      className="w-16 h-16 rounded-full object-cover"
                      loading="lazy"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{story.name}</h3>
                      <p className="text-sm text-gray-600">{story.location}</p>
                      <p className="text-sm text-red-600">Trainer: {story.trainer}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-xs text-green-600 mb-1 font-medium">Transformation</div>
                      <div className="text-sm text-green-700">{story.transformation}</div>
                      <div className="text-xs text-green-600 mt-1">Duration: {story.duration}</div>
                    </div>

                    <blockquote className="text-gray-700 italic">“{story.quote}”</blockquote>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-red-600 text-white" aria-labelledby="cta-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="cta-heading" className="text-3xl font-bold mb-6">
              Ready for Your Personal Boxing Journey?
            </h2>

            <p className="text-xl text-red-100 mb-8">
              Start with a free consultation to find your perfect trainer match
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() =>
                  handleBook({
                    id: 'pt-consultation',
                    name: 'Free Consultation',
                    description: 'Meet your trainer and plan your goals',
                    level: 'personal-training',
                    price: 0,
                  })
                }
                className="bg-white text-red-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                aria-label="Schedule a free consultation"
              >
                Schedule Free Consultation
              </button>

              <a
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-red-600 transition-colors"
                href="tel:+14155508269"
                aria-label="Call the boxing club at (415) 550-8269"
              >
                Call (415) 550-8269
              </a>
            </div>

            <p className="text-sm text-red-100 mt-6 italic">“1-on-1 sessions sharper than a cable car bell!” 🌉</p>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
}
