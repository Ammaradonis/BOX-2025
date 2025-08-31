import React from 'react';
import { Shield, Users, Clock, Calendar, Star, Heart, Award } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

// Define interface for class data
interface ClassData {
  id: string;
  name: string;
  description: string;
  level: string;
  ageRange?: string;
  price: number;
  originalPrice?: number;
}

// Define component props
interface YouthBoxingPageProps {
  onBookClass: (classData: ClassData) => void;
}

export function YouthBoxingPage({ onBookClass }: YouthBoxingPageProps) {
  const ageGroups = [
    {
      id: 'little-warriors',
      name: 'Little Warriors',
      ageRange: '6-9 years',
      focus: 'Fun, movement, and basic coordination',
      schedule: 'Saturday 10:00 AM',
      duration: 45,
      maxSize: 8,
      description: 'Introduction to boxing through games and play',
      skills: [
        'Basic stance and movement',
        'Simple punch motions',
        'Coordination games',
        'Following instructions',
        'Teamwork and sharing',
      ],
      image:
        'https://images.unsplash.com/photo-1617627590804-1de3424fbf04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx5b3VuZyUyMGJveGVyJTIwdHJhaW5pbmclMjBraWRzfGVufDF8fHx8MTc1NjA5NjQ3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'young-boxers',
      name: 'Young Boxers',
      ageRange: '10-13 years',
      focus: 'Skill development and character building',
      schedule: 'Mon/Wed/Fri 4:00 PM',
      duration: 60,
      maxSize: 12,
      description: 'Structured boxing training with emphasis on respect and discipline',
      skills: [
        'Proper boxing fundamentals',
        'Pad work and combinations',
        'Fitness and conditioning',
        'Self-discipline and respect',
        'Goal setting and achievement',
      ],
      image:
        'https://images.unsplash.com/photo-1617627590804-1de3424fbf04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx5b3VuZyUyMGJveGVyJTIwdHJhaW5pbmclMjBraWRzfGVufDF8fHx8MTc1NjA5NjQ3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'teen-champions',
      name: 'Teen Champions',
      ageRange: '14-17 years',
      focus: 'Advanced training and competition preparation',
      schedule: 'Tue/Thu 5:00 PM, Sat 2:00 PM',
      duration: 75,
      maxSize: 15,
      description: 'Serious boxing training for teens interested in competition',
      skills: [
        'Advanced boxing techniques',
        'Sparring preparation',
        'Competition training',
        'Leadership development',
        'Mental toughness',
      ],
      image:
        'https://images.unsplash.com/photo-1617627590804-1de3424fbf04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx5b3VuZyUyMGJveGVyJTIwdHJhaW5pbmclMjBraWRzfGVufDF8fHx8MTc1NjA5NjQ3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  const safetyFeatures = [
    {
      icon: Shield,
      title: 'Certified Coaches',
      description: 'All youth coaches are CPR certified and background checked',
    },
    {
      icon: Users,
      title: 'Small Class Sizes',
      description: 'Maximum 15 kids per class for personalized attention',
    },
    {
      icon: Heart,
      title: 'Character First',
      description: 'Focus on respect, discipline, and personal growth',
    },
    {
      icon: Award,
      title: 'Anti-Bullying',
      description: 'Building confidence to stand up against bullying',
    },
  ];

  const youthCoach = {
    name: 'Coach Elena "Sunset" Rodriguez',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=400',
    bio: 'Pediatric exercise specialist with 12 years coaching SF youth. Olympic training background with a passion for developing young athletes.',
    certifications: [
      'USA Boxing Youth Certified',
      'CPR/First Aid Certified',
      'Pediatric Exercise Specialist',
      'Olympic Training Center Graduate',
    ],
    philosophy:
      'Every child is a champion waiting to be discovered. Boxing teaches them confidence, respect, and resilience that lasts a lifetime.',
  };

  const parentTestimonials = [
    {
      parentName: 'Lisa M.',
      childName: 'Mateo (age 12)',
      location: 'Mission District',
      quote:
        "More than fitness – he's learned respect and focus. His grades improved and he's more confident at school.",
      program: 'Young Boxers',
      duration: '8 months',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=300',
    },
    {
      parentName: 'Marcus L.',
      childName: 'Zoe (age 15)',
      location: 'Castro',
      quote:
        'The anti-bullying focus really helped. She stands taller and speaks up for herself and others now.',
      program: 'Teen Champions',
      duration: '1 year',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
    },
  ];

  const programs = [
    {
      title: 'After School Program',
      description: 'Safe, supervised training right after school',
      time: '3:30 PM - 5:00 PM',
      days: 'Monday through Friday',
      includes: ['Homework help', 'Healthy snacks', 'Boxing training', 'Character development'],
    },
    {
      title: 'Weekend Warriors',
      description: 'Fun family-friendly sessions',
      time: '10:00 AM - 12:00 PM',
      days: 'Saturdays',
      includes: ['Family participation welcome', 'Games and competitions', 'Skills challenges', 'Community building'],
    },
    {
      title: 'Competition Team',
      description: 'For serious young athletes',
      time: 'By invitation',
      days: 'Multiple sessions',
      includes: ['Advanced training', 'Tournament preparation', 'Travel team opportunities', 'Scholarship possibilities'],
    },
  ];

  return (
    <div className="min-h-screen bg-sf-gray">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-sf-blue to-sf-purple text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">YOUTH BOXING</h1>
              <p className="text-lg sm:text-xl text-blue-100 mb-8">
                Build confidence stronger than Sutro Tower. Character development through boxing for ages 6-17.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() =>
                    onBookClass({
                      id: 'youth-trial',
                      name: 'Free Youth Trial Class',
                      description: 'Try any youth program for free',
                      level: 'youth',
                      price: 0,
                      originalPrice: 20,
                    })
                  }
                  className="btn btn-primary text-base sm:text-lg"
                >
                  👦👧 FREE TRIAL CLASS
                </button>
                <button className="btn btn-secondary text-base sm:text-lg">
                  PARENT INFO MEETING
                </button>
              </div>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1617627590804-1de3424fbf04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx5b3VuZyUyMGJveGVyJTIwdHJhaW5pbmclMjBraWRzfGVufDF8fHx8MTc1NjA5NjQ3Nnww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Youth boxers at 3rd Street Gym learning basic stance in front of a San Francisco skyline mural"
                className="rounded-xl shadow-2xl w-full"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4">
                <p className="text-gray-900 font-medium text-center text-sm sm:text-base">
                  "Like the cable cars - a SF tradition that builds character and resilience!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety First */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Safety & Character First
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Your child's safety and development are our top priorities
            </p>
          </div>
          <div className="sf-grid sf-grid-4">
            {safetyFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 text-sf-blue p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <feature.icon size={32} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Age Groups */}
      <section className="py-12 sm:py-16 bg-sf-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Programs by Age Group
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Age-appropriate training that grows with your child
            </p>
          </div>
          <div className="space-y-8">
            {ageGroups.map((group) => (
              <div key={group.id} className="card overflow-hidden">
                <div className="grid lg:grid-cols-3 gap-0">
                  <div className="lg:col-span-1">
                    <ImageWithFallback
                      src={group.image}
                      alt={`${group.name} - youth boxing program for ages ${group.ageRange}`}
                      className="w-full h-64 lg:h-full object-cover"
                    />
                  </div>
                  <div className="lg:col-span-2 p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                          {group.name}
                        </h3>
                        <p className="text-base sm:text-lg text-sf-blue font-medium">
                          {group.ageRange}
                        </p>
                      </div>
                      <div className="mt-4 lg:mt-0 text-left lg:text-right">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center space-x-2 mb-1">
                            <Calendar size={14} />
                            <span>{group.schedule}</span>
                          </div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Clock size={14} />
                            <span>{group.duration} minutes</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users size={14} />
                            <span>Max {group.maxSize} kids</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{group.description}</p>
                    <p className="text-gray-800 font-medium mb-4">Focus: {group.focus}</p>
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">What They'll Learn</h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {group.skills.map((skill, skillIndex) => (
                          <div key={skillIndex} className="flex items-start space-x-2">
                            <div className="bg-green-100 text-green-600 rounded-full p-1 mt-1">
                              <span className="text-xs">✓</span>
                            </div>
                            <span className="text-gray-700 text-sm">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() =>
                          onBookClass({
                            id: `youth-${group.id}`,
                            name: group.name,
                            description: group.description,
                            level: 'youth',
                            ageRange: group.ageRange,
                            price: 20,
                          })
                        }
                        className="btn btn-primary flex-1"
                      >
                        ENROLL IN {group.name.toUpperCase()}
                      </button>
                      <button className="btn btn-secondary flex-1">FREE TRIAL CLASS</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Youth Coach */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Meet Your Youth Coach
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Specialized training in youth development and boxing
            </p>
          </div>
          <div className="card">
            <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 items-center">
              <div className="text-center">
                <ImageWithFallback
                  src={youthCoach.image}
                  alt={`${youthCoach.name} - Youth boxing coach`}
                  className="w-48 h-48 rounded-full object-cover mx-auto mb-4"
                />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  {youthCoach.name}
                </h3>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                  {youthCoach.bio}
                </p>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Certifications & Training
                  </h4>
                  <ul className="space-y-2">
                    {youthCoach.certifications.map((cert, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Star size={16} className="text-yellow-500" />
                        <span className="text-gray-700">{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-sf-blue mb-2">Coaching Philosophy</h4>
                  <p className="text-blue-800 italic">"{youthCoach.philosophy}"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Overview */}
      <section className="py-12 sm:py-16 bg-sf-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Additional Programs
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Flexible options to fit your family's schedule
            </p>
          </div>
          <div className="sf-grid sf-grid-3">
            {programs.map((program, index) => (
              <div key={index} className="card">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                  {program.title}
                </h3>
                <p className="text-gray-600 mb-4">{program.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <Clock size={14} />
                    <span>{program.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <Calendar size={14} />
                    <span>{program.days}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Includes:</h4>
                  <ul className="space-y-1">
                    {program.includes.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="text-sm text-gray-600 flex items-start space-x-2"
                      >
                        <span className="text-green-600">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Parent Testimonials */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              What Parents Are Saying
            </h2>
            <p className="text-base sm:text-lg text-gray-600">Real feedback from SF families</p>
          </div>
          <div className="sf-grid sf-grid-2">
            {parentTestimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex items-start space-x-4 mb-4">
                  <ImageWithFallback
                    src={testimonial.image}
                    alt={`${testimonial.parentName} and ${testimonial.childName} - youth boxing family`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.parentName} & {testimonial.childName}
                    </h4>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="bg-blue-100 text-sf-blue text-xs px-2 py-1 rounded-full">
                        {testimonial.program}
                      </span>
                      <span className="text-xs text-gray-500">{testimonial.duration}</span>
                    </div>
                  </div>
                </div>
                <blockquote className="text-gray-700 italic">"{testimonial.quote}"</blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 sm:py-16 bg-sf-blue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Give Your Child the Gift of Confidence
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-8">
            Start with a free trial class and see the difference youth boxing can make
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() =>
                onBookClass({
                  id: 'youth-trial',
                  name: 'Free Youth Trial Class',
                  description: 'Try any youth program for free',
                  level: 'youth',
                  price: 0,
                })
              }
              className="btn btn-primary"
            >
              SCHEDULE FREE TRIAL
            </button>
            <button className="btn btn-secondary">PARENT INFO MEETING</button>
          </div>
          <p className="text-sm text-blue-100 mt-6 italic">
            "Building confidence stronger than Sutro Tower!" 🌉
          </p>
        </div>
      </section>
    </div>
  );
}