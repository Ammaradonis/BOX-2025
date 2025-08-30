import React, { useState } from 'react';
import { Calendar, MapPin, Target, TrendingUp, Users, Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BootcampPageProps {
  onBookClass: (classData: any) => void;
}

export function BootcampPage({ onBookClass }: BootcampPageProps) {
  const [selectedBootcamp, setSelectedBootcamp] = useState('sea-cliff');

  const bootcamps = [
    {
      id: 'sea-cliff',
      name: 'Sea Cliff Smasher',
      tagline: 'Ocean Views, Epic Workouts',
      schedule: 'Saturday 9:00 AM',
      location: 'Outdoor - Ocean-facing',
      image: 'https://images.unsplash.com/photo-1568475754879-c62e646b96f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwYm9vdGNhbXAlMjBvdXRkb29yJTIwU2FuJTIwRnJhbmNpc2NvfGVufDF8fHx8MTc1NjA5NjQ3NXww&ixlib=rb-4.1.0&q=80&w=1080',
      altText: 'Bootcamp participants doing bag work outdoors with Sea Cliff backdrop and Golden Gate Bridge view',
      description: 'Saturday 9AM – Ocean-facing heavy bag drills. Workout with a view of the Golden Gate.',
      intensity: 'High',
      duration: 90,
      maxParticipants: 15,
      features: [
        'Oceanfront training location',
        'Heavy bag and mitt work',
        'Cardio circuits with SF views',
        'Fresh air and natural Vitamin D',
        'Photography spots post-workout'
      ],
      workout: [
        '15-min dynamic warmup with ocean breeze',
        '30-min heavy bag rotations (3-min rounds)',
        '20-min circuit training (burpees, mountain climbers, planks)',
        '15-min mitt work with partners',
        '10-min cooldown and stretching'
      ],
      price: 35
    },
    {
      id: 'mission',
      name: 'Mission Mayhem',
      tagline: 'Spicy Workouts for the Streets',
      schedule: 'Tuesday & Thursday 6:30 PM',
      location: 'Outdoor - Mission District',
      image: 'https://images.unsplash.com/photo-1568475754879-c62e646b96f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwYm9vdGNhbXAlMjBvdXRkb29yJTIwU2FuJTIwRnJhbmNpc2NvfGVufDF8fHx8MTc1NjA5NjQ3NXww&ixlib=rb-4.1.0&q=80&w=1080',
      altText: 'High-intensity partner circuits in a park with Mission Dolores in background',
      description: 'Tuesday/Thursday 6:30PM – Partner drills that burn like hot salsa.',
      intensity: 'Extreme',
      duration: 75,
      maxParticipants: 20,
      features: [
        'Partner-based training',
        'High-intensity interval training',
        'Mission District street workout vibe',
        'Evening schedule for working professionals',
        'Community building focus'
      ],
      workout: [
        '10-min explosive warmup',
        '25-min partner pad work (rapid fire rounds)',
        '20-min HIIT circuits (partner challenges)',
        '15-min strength training (bodyweight)',
        '5-min recovery and fist bumps'
      ],
      price: 30
    }
  ];

  const currentBootcamp = bootcamps.find(b => b.id === selectedBootcamp) || bootcamps[0];

  const progressionStages = [
    {
      stage: 'Week 1-2',
      title: 'Post-Holiday "Ghirardelli Gut"',
      description: 'Building that base fitness back up',
      focus: 'Foundation building, form learning, endurance base'
    },
    {
      stage: 'Week 3-4',
      title: 'Finding Your Rhythm',
      description: 'Like learning MUNI routes - it takes practice',
      focus: 'Consistency building, technique refinement, strength gains'
    },
    {
      stage: 'Week 5-6',
      title: '"Alcatraz Abs"',
      description: 'Transformation complete - SF strong!',
      focus: 'Peak conditioning, advanced combinations, competition ready'
    }
  ];

  const testimonials = [
    {
      name: 'Jennifer L.',
      location: 'Marina District',
      bootcamp: 'Sea Cliff Smasher',
      beforeAfter: {
        before: 'Stressed tech manager, 0 workouts/week',
        after: '6-week graduate, 4 workouts/week, 15lbs lost'
      },
      quote: 'Better than any meditation app! The ocean breeze and endorphins are unbeatable.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=300'
    },
    {
      name: 'Carlos M.',
      location: 'Mission',
      bootcamp: 'Mission Mayhem',
      beforeAfter: {
        before: 'Restaurant worker, irregular schedule stress',
        after: 'Bootcamp addict, gained 10lbs muscle, better sleep'
      },
      quote: 'The Mission energy is real! This bootcamp matches the neighborhood\'s intensity.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'
    }
  ];

  const specialChallenge = {
    name: 'Bay to Bag Challenge',
    description: 'Complete our 6-week bootcamp program and earn entry to this epic SF challenge',
    details: [
      '5K run from Crissy Field to the gym',
      '10-round heavy bag blast upon arrival',
      'Finisher medal and photo with Golden Gate Bridge',
      'Free entry for bootcamp graduates',
      'Quarterly event with prizes for fastest times'
    ],
    nextEvent: 'March 15, 2025 - Spring Equinox Challenge'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            BREAK A SWEAT, NOT YOUR COMMUTE
          </h1>
          <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
            High-intensity boxing bootcamps in SF's most scenic locations. No boring gym walls - just pure outdoor boxing energy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onBookClass({
                id: 'bootcamp-trial',
                name: 'Bootcamp Trial Class',
                description: 'Try any bootcamp for free',
                level: 'bootcamp',
                price: 0,
                originalPrice: 35
              })}
              className="btn btn-primary text-lg px-8 py-4"
            >
              🔥 FREE TRIAL CLASS
            </button>
            
            <button className="btn btn-secondary text-lg px-8 py-4">
              VIEW BOOTCAMP LOCATIONS
            </button>
          </div>
        </div>
      </section>

      {/* Bootcamp Selection */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your SF Bootcamp Adventure
            </h2>
            <p className="text-lg text-gray-600">
              Two unique locations, two different vibes, same incredible results
            </p>
          </div>

          {/* Bootcamp Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-lg p-1 inline-flex">
              {bootcamps.map((bootcamp) => (
                <button
                  key={bootcamp.id}
                  onClick={() => setSelectedBootcamp(bootcamp.id)}
                  className={`px-6 py-3 rounded-md font-medium transition-colors ${
                    selectedBootcamp === bootcamp.id
                      ? 'bg-red-600 text-white'
                      : 'text-gray-700 hover:text-red-600'
                  }`}
                >
                  {bootcamp.name}
                </button>
              ))}
            </div>
          </div>

          {/* Current Bootcamp Details */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="relative">
              <ImageWithFallback
                src={currentBootcamp.image}
                alt={currentBootcamp.altText}
                className="w-full h-96 object-cover rounded-xl shadow-lg"
              />
              
              {/* Location Badge */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-red-600" />
                  <span className="font-medium text-gray-900">{currentBootcamp.location}</span>
                </div>
              </div>
              
              {/* Intensity Badge */}
              <div className="absolute top-4 right-4 bg-red-600 text-white rounded-lg p-3">
                <div className="text-sm font-bold">{currentBootcamp.intensity} INTENSITY</div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentBootcamp.name}
                </h3>
                <p className="text-lg text-red-600 font-medium mb-4">
                  {currentBootcamp.tagline}
                </p>
                <p className="text-gray-600 text-lg">
                  {currentBootcamp.description}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock size={16} className="text-red-600" />
                    <span className="font-medium">Duration</span>
                  </div>
                  <div className="text-gray-900">{currentBootcamp.duration} minutes</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users size={16} className="text-red-600" />
                    <span className="font-medium">Group Size</span>
                  </div>
                  <div className="text-gray-900">Max {currentBootcamp.maxParticipants}</div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">What Makes This Special</h4>
                <ul className="space-y-2">
                  {currentBootcamp.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="bg-green-100 text-green-600 rounded-full p-1 mt-1">
                        <span className="text-xs">✓</span>
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Workout Breakdown */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Typical Workout</h4>
                <div className="space-y-2">
                  {currentBootcamp.workout.map((segment, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="bg-red-100 text-red-600 rounded-full p-1 mt-1 text-xs font-bold min-w-[24px] h-6 flex items-center justify-center">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 text-sm">{segment}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onBookClass({
                    id: `bootcamp-${currentBootcamp.id}`,
                    name: currentBootcamp.name,
                    description: currentBootcamp.description,
                    level: 'bootcamp',
                    price: currentBootcamp.price,
                    location: currentBootcamp.location
                  })}
                  className="btn btn-primary flex-1"
                >
                  BOOK {currentBootcamp.name.toUpperCase()} - ${currentBootcamp.price}
                </button>
                
                <button className="btn btn-secondary flex-1">
                  VIEW SCHEDULE
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progression Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your 6-Week Transformation
            </h2>
            <p className="text-lg text-gray-600">
              From Ghirardelli gut to Alcatraz abs - here's your journey
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-red-200 hidden md:block"></div>
            
            <div className="space-y-8">
              {progressionStages.map((stage, index) => (
                <div key={index} className="relative">
                  <div className="hidden md:flex absolute left-6 w-5 h-5 bg-red-600 rounded-full items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  
                  <div className="md:ml-16 bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                        {stage.stage}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900">{stage.title}</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{stage.description}</p>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-sm font-medium text-gray-900">Focus: </span>
                      <span className="text-sm text-gray-700">{stage.focus}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bay to Bag Challenge */}
      <section className="py-16 bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                🏃‍♀️ {specialChallenge.name}
              </h2>
              <p className="text-xl text-red-100 mb-6">
                {specialChallenge.description}
              </p>
              
              <ul className="space-y-3 mb-8">
                {specialChallenge.details.map((detail, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="bg-white/20 rounded-full p-1 mt-1">
                      <span className="text-xs">⭐</span>
                    </div>
                    <span className="text-red-100">{detail}</span>
                  </li>
                ))}
              </ul>
              
              <div className="bg-white/10 rounded-lg p-4 mb-6">
                <span className="text-yellow-300 font-medium">Next Event: </span>
                <span className="text-white">{specialChallenge.nextEvent}</span>
              </div>
              
              <button className="btn bg-white text-red-600 hover:bg-gray-100">
                SIGN UP FOR CHALLENGE
              </button>
            </div>
            
            <div className="text-center">
              <div className="bg-white/10 rounded-xl p-8">
                <div className="text-6xl mb-4">🌉</div>
                <h3 className="text-xl font-bold mb-4">Epic SF Challenge</h3>
                <p className="text-red-100">
                  Run from Crissy Field to our gym, then crush 10 rounds on the bags. 
                  Because only in San Francisco do you get views this good with your workout!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Real SF Transformations
            </h2>
            <p className="text-lg text-gray-600">
              Before and after stories from our bootcamp graduates
            </p>
          </div>

          <div className="sf-grid sf-grid-2">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card bg-white">
                <div className="flex items-start space-x-4 mb-4">
                  <ImageWithFallback
                    src={testimonial.image}
                    alt={`${testimonial.name} from ${testimonial.location} - bootcamp graduate`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                    <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mt-1">
                      {testimonial.bootcamp}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">BEFORE</div>
                    <div className="text-sm text-gray-700">{testimonial.beforeAfter.before}</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-xs text-green-600 mb-1">AFTER</div>
                    <div className="text-sm text-green-700">{testimonial.beforeAfter.after}</div>
                  </div>
                  
                  <blockquote className="text-gray-700 italic">
                    "{testimonial.quote}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}