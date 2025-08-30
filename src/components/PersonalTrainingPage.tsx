import React, { useState, useEffect } from 'react';
import { Clock, DollarSign, Star, Target, Calendar, User, Award } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface PersonalTrainingPageProps {
  onBookClass: (classData: any) => void;
}

export function PersonalTrainingPage({ onBookClass }: PersonalTrainingPageProps) {
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState('');

  useEffect(() => {
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/trainers`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    })
    .then(res => res.json())
    .then(data => {
      setTrainers(data.trainers || []);
      if (data.trainers?.length > 0) {
        setSelectedTrainer(data.trainers[0].id);
      }
    })
    .catch(console.error);
  }, []);

  const packages = [
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
        'Goal setting consultation'
      ],
      bestFor: 'First-timers and goal assessment'
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
        'Flexible scheduling'
      ],
      bestFor: 'Building habits and seeing progress',
      popular: true
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
        '2 months of workout tracking'
      ],
      bestFor: 'Serious transformation goals'
    }
  ];

  const trainerProfiles = [
    {
      id: 'maria-gonzalez',
      name: 'Maria "Mission" Gonzalez',
      image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400',
      specialties: ['Beginner Training', 'Footwork', 'Technique'],
      experience: '8 years',
      hourlyRate: 85,
      bio: '5x NorCal Golden Gloves champion who teaches footwork like a Tango dancer in the Mission. Specializes in building confidence for first-time boxers.',
      achievements: [
        'NorCal Golden Gloves Champion (5x)',
        'USA Boxing Certified Trainer',
        'Trained 150+ beginners to intermediate level'
      ],
      clientTypes: 'Beginners, women returning to fitness, technique refinement',
      personality: 'Patient, encouraging, detail-oriented',
      availability: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      rating: 4.9,
      reviewCount: 87
    },
    {
      id: 'raul-mendoza',
      name: 'Raúl "The Firewall" Mendoza',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      specialties: ['Defense', 'Sparring', 'Competition Prep'],
      experience: '15 years',
      hourlyRate: 95,
      bio: 'Trained at King\'s Gym during the \'90s. Master of defensive techniques and preparing fighters for competition.',
      achievements: [
        '12-3 Amateur, 8-2 Professional record',
        'Former SF Boxing Commission member',
        'Coached 15 amateur champions'
      ],
      clientTypes: 'Intermediate to advanced, competition prep, defensive training',
      personality: 'Intense, strategic, results-focused',
      availability: ['Tuesday', 'Thursday', 'Saturday', 'Sunday'],
      rating: 4.8,
      reviewCount: 92
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
        'Undefeated California amateur circuit 2018-2020'
      ],
      clientTypes: 'Tech professionals, data-driven fitness, strength building',
      personality: 'Analytical, motivating, tech-savvy',
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      rating: 4.9,
      reviewCount: 104
    }
  ];

  const currentTrainer = trainerProfiles.find(t => t.id === selectedTrainer) || trainerProfiles[0];

  const successStories = [
    {
      name: 'David K.',
      location: 'SOMA',
      trainer: 'Jamal Chen',
      transformation: 'Lost 25lbs, gained confidence for first amateur fight',
      duration: '6 months',
      quote: 'Jamal turned my lunch break workouts into a complete lifestyle change.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'
    },
    {
      name: 'Lisa M.',
      location: 'Marina',
      trainer: 'Maria Gonzalez',
      transformation: 'From couch to competing in local boxing league',
      duration: '8 months',
      quote: 'Maria made boxing accessible and fun. Now I can\'t imagine life without it!',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=300'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            PERSONAL TRAINING
          </h1>
          <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
            1-on-1 sessions sharper than a cable car bell. Get personalized attention from SF's best boxing coaches.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onBookClass({
                id: 'pt-consultation',
                name: 'Free Consultation',
                description: 'Meet your trainer and plan your goals',
                level: 'personal-training',
                price: 0,
                originalPrice: 85
              })}
              className="btn btn-primary text-lg px-8 py-4"
            >
              🎯 FREE CONSULTATION
            </button>
            
            <button className="btn btn-secondary text-lg px-8 py-4">
              MEET OUR TRAINERS
            </button>
          </div>
        </div>
      </section>

      {/* Training Packages */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Training Package
            </h2>
            <p className="text-lg text-gray-600">
              Flexible options to fit your schedule and budget
            </p>
          </div>

          <div className="sf-grid sf-grid-3">
            {packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className={`card relative ${pkg.popular ? 'ring-2 ring-red-500' : ''}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    ${pkg.price}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    ${(pkg.price / pkg.sessions).toFixed(0)} per session
                  </div>
                  {pkg.savings > 0 && (
                    <div className="text-sm text-green-600 font-medium">
                      Save ${pkg.savings}!
                    </div>
                  )}
                  <p className="text-gray-600 mt-3">{pkg.description}</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="bg-green-100 text-green-600 rounded-full p-1 mt-1">
                        <span className="text-xs">✓</span>
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="bg-gray-50 rounded-lg p-3 mb-6">
                  <div className="text-xs font-medium text-gray-500 mb-1">BEST FOR</div>
                  <div className="text-sm text-gray-900">{pkg.bestFor}</div>
                </div>
                
                <button
                  onClick={() => onBookClass({
                    id: `pt-${pkg.id}`,
                    name: `Personal Training - ${pkg.name}`,
                    description: pkg.description,
                    level: 'personal-training',
                    price: pkg.price,
                    sessions: pkg.sessions
                  })}
                  className={`btn w-full ${pkg.popular ? 'btn-primary' : 'btn-secondary'}`}
                >
                  GET STARTED
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trainer Showcase */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Your Potential Trainers
            </h2>
            <p className="text-lg text-gray-600">
              Each trainer brings unique expertise and personality
            </p>
          </div>

          {/* Trainer Selection */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 inline-flex shadow-sm">
              {trainerProfiles.map((trainer) => (
                <button
                  key={trainer.id}
                  onClick={() => setSelectedTrainer(trainer.id)}
                  className={`px-6 py-3 rounded-md font-medium transition-colors ${
                    selectedTrainer === trainer.id
                      ? 'bg-red-600 text-white'
                      : 'text-gray-700 hover:text-red-600'
                  }`}
                >
                  {trainer.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Current Trainer Profile */}
          {currentTrainer && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <ImageWithFallback
                    src={currentTrainer.image}
                    alt={`${currentTrainer.name} - Personal boxing trainer`}
                    className="w-full h-80 object-cover rounded-lg mb-6"
                  />
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Contact Info</h4>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center space-x-2 mb-1">
                          <DollarSign size={14} />
                          <span>${currentTrainer.hourlyRate}/session</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Star size={14} className="text-yellow-500" />
                          <span>{currentTrainer.rating} ({currentTrainer.reviewCount} reviews)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock size={14} />
                          <span>{currentTrainer.experience} experience</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Availability</h4>
                      <div className="flex flex-wrap gap-1">
                        {currentTrainer.availability.map((day) => (
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
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentTrainer.name}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {currentTrainer.bio}
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Specialties</h4>
                      <div className="space-y-2">
                        {currentTrainer.specialties.map((specialty) => (
                          <div key={specialty} className="flex items-center space-x-2">
                            <Target size={16} className="text-red-600" />
                            <span className="text-gray-700">{specialty}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Training Style</h4>
                      <div className="text-gray-700 text-sm space-y-1">
                        <div><strong>Personality:</strong> {currentTrainer.personality}</div>
                        <div><strong>Best for:</strong> {currentTrainer.clientTypes}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Achievements & Credentials</h4>
                    <ul className="space-y-2">
                      {currentTrainer.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Award size={16} className="text-yellow-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={() => onBookClass({
                        id: `pt-${currentTrainer.id}`,
                        name: `Personal Training with ${currentTrainer.name}`,
                        description: 'One-on-one boxing training session',
                        level: 'personal-training',
                        price: currentTrainer.hourlyRate,
                        trainer: currentTrainer.name
                      })}
                      className="btn btn-primary flex-1"
                    >
                      BOOK WITH {currentTrainer.name.split(' ')[0].toUpperCase()}
                    </button>
                    
                    <button className="btn btn-secondary flex-1">
                      VIEW SCHEDULE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-gray-600">
              Real transformations from our personal training clients
            </p>
          </div>

          <div className="sf-grid sf-grid-2">
            {successStories.map((story, index) => (
              <div key={index} className="card bg-white">
                <div className="flex items-start space-x-4 mb-4">
                  <ImageWithFallback
                    src={story.image}
                    alt={`${story.name} from ${story.location} - personal training success story`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{story.name}</h4>
                    <p className="text-sm text-gray-600">{story.location}</p>
                    <p className="text-sm text-red-600">Trainer: {story.trainer}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-xs text-green-600 mb-1 font-medium">TRANSFORMATION</div>
                    <div className="text-sm text-green-700">{story.transformation}</div>
                    <div className="text-xs text-green-600 mt-1">Duration: {story.duration}</div>
                  </div>
                  
                  <blockquote className="text-gray-700 italic">
                    "{story.quote}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready for Your Personal Boxing Journey?
          </h2>
          
          <p className="text-xl text-red-100 mb-8">
            Start with a free consultation to find your perfect trainer match
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onBookClass({
                id: 'pt-consultation',
                name: 'Free Consultation',
                description: 'Meet your trainer and plan your goals',
                level: 'personal-training',
                price: 0
              })}
              className="bg-white text-red-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              SCHEDULE FREE CONSULTATION
            </button>
            
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-red-600 transition-colors">
              CALL (415) 550-8269
            </button>
          </div>
          
          <p className="text-sm text-red-100 mt-6 italic">
            "1-on-1 sessions sharper than a cable car bell!" 🌉
          </p>
        </div>
      </section>
    </div>
  );
}