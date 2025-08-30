import React, { useState, useEffect } from 'react';
import { Clock, Users, Star, ChevronDown, Filter, Calendar } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { TestimonialCard } from './TestimonialCard';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ClassesPageProps {
  onBookClass: (classData: any) => void;
}

export function ClassesPage({ onBookClass }: ClassesPageProps) {
  const [activeTab, setActiveTab] = useState('beginner');
  const [schedule, setSchedule] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    // Fetch classes and schedule data
    Promise.all([
      fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/classes`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      }),
      fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/schedule`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      })
    ])
    .then(async ([classRes, scheduleRes]) => {
      if (classRes.ok) {
        const classData = await classRes.json();
        setClasses(classData.classes || []);
      }
      if (scheduleRes.ok) {
        const scheduleData = await scheduleRes.json();
        setSchedule(scheduleData.schedule || []);
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      // Set some default data so the page still works
      setClasses([]);
      setSchedule([]);
    });
  }, []);

  const classTiers = [
    {
      id: 'beginner',
      name: 'BEGINNER (FOG CUTTER)',
      description: 'Learn combos smoother than a cable car descent down Powell St',
      image: 'https://images.unsplash.com/photo-1575747515871-2e323827539e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBneW0lMjB0cmFpbmluZyUyMFNhbiUyMEZyYW5jaXNjb3xlbnwxfHx8fDE3NTYwOTY0NzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      altText: 'Group of beginner boxers, mixed ages and ethnicities, practicing jabs in front of large windows with San Francisco cityscape visible',
      instructor: {
        name: 'Maria "Mission" Gonzalez',
        bio: '5x NorCal Golden Gloves, teaches footwork like a Tango dancer in the Mission.',
        image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=300'
      },
      features: [
        'Perfect for first-time boxers',
        'Focus on proper form and safety',
        'Build confidence and fitness',
        'Learn basic combinations'
      ],
      sfAnalogy: 'Like learning to navigate MUNI - start slow, master the basics!'
    },
    {
      id: 'intermediate',
      name: 'INTERMEDIATE (BAY BRIDGER)',
      description: 'Bridge the gap between beginner and advanced with power combinations',
      image: 'https://images.unsplash.com/photo-1724529808495-8b7cf64e3e3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBjb2FjaCUyMHRyYWluaW5nJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzU2MDk2NDc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      altText: 'Intermediate boxers working on speed bags and heavy bag combinations with focused intensity',
      instructor: {
        name: 'Raúl "The Firewall" Mendoza',
        bio: 'Trained at King\'s Gym (Tenderloin) during the \'90s. Specialty: Surviving \'Civic Center Clinches\'.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'
      },
      features: [
        'Advanced combinations and footwork',
        'Power development training',
        'Speed and agility drills',
        'Defensive techniques'
      ],
      sfAnalogy: 'Like conquering Lombard Street - you\'ve got the basics, now master the curves!'
    },
    {
      id: 'advanced',
      name: 'ADVANCED (TWIN PEAKS CLIMBER)',
      description: 'Elite training for competitive boxers and seasoned athletes',
      image: 'https://images.unsplash.com/photo-1724529808495-8b7cf64e3e3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBjb2FjaCUyMHRyYWluaW5nJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzU2MDk2NDc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      altText: 'Advanced boxers in intense sparring session with protective gear in professional boxing ring',
      instructor: {
        name: 'Jamal "The Technician" Chen',
        bio: 'NASM Certified. Transformed 200+ SF tech workers from keyboard warriors to ring warriors.',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300'
      },
      features: [
        'Competition preparation',
        'Advanced sparring sessions',
        'Technical refinement',
        'Mental toughness training'
      ],
      sfAnalogy: 'Like scaling Twin Peaks - breathtaking views require serious commitment!'
    },
    {
      id: 'youth',
      name: 'YOUTH (FUTURE CHAMPS)',
      description: 'Building the next generation of SF champions',
      image: 'https://images.unsplash.com/photo-1617627590804-1de3424fbf04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx5b3VuZyUyMGJveGVyJTIwdHJhaW5pbmclMjBraWRzfGVufDF8fHx8MTc1NjA5NjQ3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      altText: 'Youth boxers at 3rd Street Gym learning basic stance in front of a San Francisco skyline mural',
      instructor: {
        name: 'Coach Elena "Sunset" Rodriguez',
        bio: 'Pediatric exercise specialist with 12 years coaching SF youth. Olympic training background.',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=300'
      },
      features: [
        'Ages 8-17 welcome',
        'Character building focus',
        'Anti-bullying training',
        'Fitness and fun combined'
      ],
      sfAnalogy: 'Like the cable cars - a SF tradition that builds character and resilience!'
    },
    {
      id: 'sparring',
      name: 'SPARRING (FOG CITY FIGHTS)',
      description: 'Controlled sparring sessions for experienced boxers',
      image: 'https://images.unsplash.com/photo-1724529808495-8b7cf64e3e3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBjb2FjaCUyMHRyYWluaW5nJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzU2MDk2NDc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      altText: 'Two boxers sparring in the ring with protective gear under bright gym lights',
      instructor: {
        name: 'Multiple Coaches',
        bio: 'Supervised by our team of certified trainers with safety as the top priority.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'
      },
      features: [
        'Requires instructor approval',
        'Full protective gear required',
        'Skill-matched opponents',
        'Video analysis available'
      ],
      sfAnalogy: 'Like the fog rolling in - unpredictable, challenging, but beautiful when mastered!'
    }
  ];

  const currentTier = classTiers.find(tier => tier.id === activeTab) || classTiers[0];

  const getScheduleForTier = (tierId: string) => {
    return schedule.filter((slot: any) => 
      slot.classLevel === tierId || 
      (tierId === 'youth' && slot.classId.includes('youth'))
    );
  };

  const testimonials = [
    {
      id: 'sarah-beginner',
      name: 'Sarah M.',
      location: 'SOMA',
      quote: 'Started as a complete beginner and now I\'m addicted! The community here is incredible.',
      rating: 5,
      program: 'Beginner Classes',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=300'
    },
    {
      id: 'marcus-intermediate',
      name: 'Marcus L.',
      location: 'Mission',
      quote: 'The progression from beginner to intermediate was seamless. Coaches really know their stuff!',
      rating: 5,
      program: 'Intermediate Classes',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            SF-STREET-READY TRAINING
          </h1>
          <p className="text-xl text-red-100 max-w-3xl mx-auto">
            From Fog Cutter beginners to Twin Peaks climbers - find your perfect level
          </p>
        </div>
      </section>

      {/* Class Tier Tabs */}
      <section className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            <div 
              role="tablist" 
              aria-label="Class levels"
              className="flex space-x-1 min-w-full sm:justify-center"
            >
              {classTiers.map((tier) => (
                <button
                  key={tier.id}
                  role="tab"
                  aria-selected={activeTab === tier.id}
                  aria-controls={`${tier.id}-panel`}
                  onClick={() => setActiveTab(tier.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tier.id
                      ? 'border-red-600 text-red-600 bg-red-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tier.name.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Active Tab Content */}
      <section 
        id={`${activeTab}-panel`}
        role="tabpanel"
        aria-labelledby={`${activeTab}-tab`}
        className="py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* Class Image */}
            <div className="relative">
              <ImageWithFallback
                src={currentTier.image}
                alt={currentTier.altText}
                className="w-full h-96 object-cover rounded-xl shadow-lg"
              />
              
              {/* SF Analogy Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 italic">
                  {currentTier.sfAnalogy}
                </p>
              </div>
            </div>

            {/* Class Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  {currentTier.name}
                </h2>
                <p className="text-lg text-gray-600">
                  {currentTier.description}
                </p>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  What You'll Learn
                </h3>
                <ul className="space-y-2">
                  {currentTier.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="bg-red-100 text-red-600 rounded-full p-1 mt-1">
                        <span className="text-xs">✓</span>
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructor Spotlight */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Meet Your Instructor
                </h3>
                
                <div className="flex items-start space-x-4">
                  <ImageWithFallback
                    src={currentTier.instructor.image}
                    alt={`${currentTier.instructor.name} - Boxing instructor`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {currentTier.instructor.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {currentTier.instructor.bio}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onBookClass({
                    id: `${activeTab}-class`,
                    name: currentTier.name,
                    description: currentTier.description,
                    level: activeTab,
                    price: activeTab === 'beginner' ? 0 : 25,
                    originalPrice: activeTab === 'beginner' ? 25 : undefined
                  })}
                  className="btn btn-primary flex-1"
                >
                  {activeTab === 'beginner' ? 'BOOK FREE TRIAL' : 'BOOK CLASS'}
                </button>
                
                <button className="btn btn-secondary flex-1">
                  VIEW FULL SCHEDULE
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Table */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
              {currentTier.name} Schedule
            </h2>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
                >
                  <option value="all">All Times</option>
                  <option value="morning">Morning (6AM-12PM)</option>
                  <option value="evening">Evening (5PM-9PM)</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
          </div>

          {/* Responsive Schedule */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 font-semibold text-gray-900">Day</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Time</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Instructor</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Spots Available</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Book</th>
                </tr>
              </thead>
              <tbody>
                {getScheduleForTier(activeTab).map((slot: any, index: number) => (
                  <tr key={slot.id || index} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-medium">{slot.day}</td>
                    <td className="p-4">
                      {new Date(`2000-01-01T${slot.time}`).toLocaleTimeString([], { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </td>
                    <td className="p-4">{slot.trainerName}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        slot.spotsAvailable > 5 
                          ? 'bg-green-100 text-green-800' 
                          : slot.spotsAvailable > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {slot.spotsAvailable > 0 ? `${slot.spotsAvailable} spots` : 'Full'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => onBookClass({
                          id: slot.id,
                          name: slot.className,
                          day: slot.day,
                          time: slot.time,
                          level: activeTab,
                          instructor: slot.trainerName
                        })}
                        disabled={slot.spotsAvailable === 0}
                        className="btn btn-ghost text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {slot.spotsAvailable > 0 ? 'Book' : 'Full'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            What Our Boxers Say
          </h2>
          
          <div className="sf-grid sf-grid-2">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard 
                key={testimonial.id}
                testimonial={testimonial}
                delay={index * 0.2}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}