import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  Clock, 
  Users, 
  MapPin, 
  Star, 
  ChevronRight, 
  Calendar,
  Target,
  Trophy,
  Zap,
  Heart,
  Sword
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ClassesPageProps {
  onNavigate?: (page: string) => void;
  currentUser?: any;
}

export default function ClassesPage({ onNavigate, currentUser }: ClassesPageProps) {
  const [activeTab, setActiveTab] = useState('beginner');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClassData();
  }, []);

  const fetchClassData = async () => {
    try {
      const [schedulesResponse, trainersResponse] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/schedule`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/trainers`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (schedulesResponse.ok) {
        const schedulesData = await schedulesResponse.json();
        setSchedules(schedulesData.schedules || []);
      }

      if (trainersResponse.ok) {
        const trainersData = await trainersResponse.json();
        setTrainers(trainersData.trainers || []);
      }
    } catch (error) {
      console.error('Error fetching class data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const classTypes = [
    {
      id: 'beginner',
      name: 'Beginner (Fog Cutter)',
      icon: <Target className="w-6 h-6" />,
      description: 'Perfect for newcomers to boxing. Learn the fundamentals in a supportive environment.',
      color: 'bg-blue-500',
      sfAnalogy: 'Learn combos smoother than a cable car descent down Powell St.',
      image: 'https://images.unsplash.com/photo-1575747515871-2e323827539e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwYm94aW5nJTIwY2xhc3MlMjBzYW4lMjBmcmFuY2lzY298ZW58MXx8fHwxNzU2MDk2NjY0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      imageAlt: 'Group of beginner boxers, mixed ages and ethnicities, practicing jabs in front of large windows with San Francisco cityscape visible'
    },
    {
      id: 'intermediate',
      name: 'Intermediate (Bay Bridger)',
      icon: <Trophy className="w-6 h-6" />,
      description: 'For those comfortable with basics. Focus on combinations and conditioning.',
      color: 'bg-yellow-500',
      sfAnalogy: 'Master combinations like the perfect Embarcadero-to-Fisherman\'s Wharf route.',
      image: 'https://images.unsplash.com/photo-1620123082249-6ac67a25804f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBhY2FkZW15JTIwdHJhaW5pbmclMjBmaWdodGVyfGVufDF8fHx8MTc1NjA5NjY2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      imageAlt: 'Intermediate boxers working on combination techniques with focused intensity'
    },
    {
      id: 'advanced',
      name: 'Advanced (Twin Peaks Climber)',
      icon: <Zap className="w-6 h-6" />,
      description: 'Elite training for experienced boxers. Prepare for competition.',
      color: 'bg-red-500',
      sfAnalogy: 'Train harder than climbing Twin Peaks on a foggy morning.',
      image: 'https://images.unsplash.com/photo-1620123083473-16ec15498174?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbCUyMGJveGluZyUyMHRyYWluZXIlMjBvbmUlMjBvbiUyMG9uZXxlbnwxfHx8fDE3NTYwOTY2NzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      imageAlt: 'Advanced boxer training with intense focus and perfect technique'
    },
    {
      id: 'youth',
      name: 'Youth (Future Champs)',
      icon: <Heart className="w-6 h-6" />,
      description: 'Boxing for kids ages 6-17. Focus on fun, respect, and growth.',
      color: 'bg-green-500',
      sfAnalogy: 'Building champions stronger than the foundations of the Golden Gate Bridge.',
      image: 'https://images.unsplash.com/photo-1620123569521-7a77a5c6ea87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx5b3V0aCUyMGtpZHMlMjBib3hpbmclMjB0cmFpbmluZyUyMGNoaWxkcmVufGVufDF8fHx8MTc1NjA5NjY3N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      imageAlt: 'Youth boxers at 3rd Street Gym learning basic stance in front of a San Francisco mural'
    },
    {
      id: 'sparring',
      name: 'Sparring (Fog City Fights)',
      icon: <Sword className="w-6 h-6" />,
      description: 'Controlled sparring for advanced boxers. Protective gear required.',
      color: 'bg-purple-500',
      sfAnalogy: 'Test your skills in the ring like navigating rush hour on the Bay Bridge.',
      image: 'https://images.unsplash.com/photo-1710746904729-f3ad9f682bb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBib3hpbmclMjBneW0lMjBmYWNpbGl0aWVzJTIwZXF1aXBtZW50fGVufDF8fHx8MTc1NjA5NjY4MHww&ixlib=rb-4.1.0&q=80&w=1080',
      imageAlt: 'Boxing ring with sparring session in progress, safety equipment visible'
    }
  ];

  const currentClassType = classTypes.find(type => type.id === activeTab);
  const classSchedules = schedules.filter(schedule => schedule.type === activeTab);

  const handleBookClass = (classData: any) => {
    if (!currentUser) {
      alert('Please sign in first to book a class');
      return;
    }
    
    // Navigate to booking with pre-selected class
    onNavigate?.('schedule');
  };

  const testimonials = [
    {
      name: 'Sarah K.',
      location: 'SoMa',
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
      quote: 'Shredded my pandemic "Dolores Park bod" in 8 weeks! More energizing than Philz coffee.',
      class: 'Beginner'
    },
    {
      name: 'Marcus T.',
      location: 'Mission Bay',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      quote: 'Better than any tech job I\'ve had. This is where I actually level up.',
      class: 'Intermediate'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading class schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              SF-STREET-READY <span className="text-accent">TRAINING</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              From FiDi desk warriors to Mission artists – find your perfect boxing level
            </p>
            <Button
              size="lg"
              onClick={() => handleBookClass({})}
              className="bg-accent hover:bg-accent/90 text-black font-bold px-8 py-4"
            >
              Book Your First Class (50% Off!)
            </Button>
          </div>
        </div>
      </section>

      {/* Class Tabs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-5 mb-8 min-w-max">
                {classTypes.map((type) => (
                  <TabsTrigger
                    key={type.id}
                    value={type.id}
                    className="flex items-center space-x-2 px-4 py-3"
                  >
                    {type.icon}
                    <span className="hidden sm:inline">{type.name}</span>
                    <span className="sm:hidden">{type.name.split('(')[0].trim()}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {classTypes.map((type) => (
              <TabsContent key={type.id} value={type.id} className="space-y-8">
                {/* Class Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`p-3 rounded-full ${type.color} text-white`}>
                          {type.icon}
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">{type.name}</h2>
                      </div>
                      
                      <p className="text-lg text-gray-600 mb-4">{type.description}</p>
                      
                      <div className="bg-accent/10 border-l-4 border-accent p-4 rounded-r-lg">
                        <p className="text-accent font-medium italic">
                          "{type.sfAnalogy}"
                        </p>
                      </div>
                    </div>

                    {/* Class Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <Clock className="w-5 h-5 text-primary mb-2" />
                        <p className="font-medium text-gray-900">Duration</p>
                        <p className="text-sm text-gray-600">
                          {type.id === 'youth' ? '45 minutes' : 
                           type.id === 'sparring' ? '90 minutes' : '60 minutes'}
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <Users className="w-5 h-5 text-primary mb-2" />
                        <p className="font-medium text-gray-900">Class Size</p>
                        <p className="text-sm text-gray-600">
                          {type.id === 'youth' ? '8-10 students' : 
                           type.id === 'sparring' ? '6-8 fighters' : '10-15 students'}
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <Target className="w-5 h-5 text-primary mb-2" />
                        <p className="font-medium text-gray-900">Focus</p>
                        <p className="text-sm text-gray-600">
                          {type.id === 'beginner' ? 'Fundamentals' :
                           type.id === 'intermediate' ? 'Combinations' :
                           type.id === 'advanced' ? 'Competition' :
                           type.id === 'youth' ? 'Fun & Growth' : 'Live Practice'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="relative rounded-lg overflow-hidden shadow-lg">
                      <ImageWithFallback
                        src={type.image}
                        alt={type.imageAlt}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20" />
                    </div>
                  </div>
                </div>

                {/* Schedule Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="bg-primary text-white px-6 py-4">
                    <h3 className="text-xl font-bold">Weekly Schedule</h3>
                  </div>
                  
                  {classSchedules.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Day & Time
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Instructor
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Location
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {classSchedules.map((schedule) => (
                            <tr key={schedule.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <p className="font-medium text-gray-900">{schedule.day}</p>
                                  <p className="text-sm text-gray-500">{schedule.time}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <p className="font-medium text-gray-900">{schedule.instructor}</p>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                                  <span className="text-sm text-gray-600">Main Gym</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Button
                                  size="sm"
                                  onClick={() => handleBookClass(schedule)}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  Book Class
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <p className="text-gray-500">No classes scheduled for this level yet.</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Call (415) 550-8260 to inquire about upcoming sessions.
                      </p>
                    </div>
                  )}
                </div>

                {/* Instructor Spotlight */}
                {trainers.length > 0 && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Meet Your Instructors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {trainers.slice(0, 2).map((trainer) => (
                        <div key={trainer.id} className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {trainer.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900">{trainer.name}</h4>
                            <p className="text-secondary font-medium text-sm mb-2">{trainer.specialty}</p>
                            <p className="text-gray-600 text-sm">{trainer.bio}</p>
                            <div className="flex items-center mt-2">
                              <div className="flex text-accent">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500 ml-2">
                                {trainer.experience} experience
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What SF Fighters Say
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.location}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {testimonial.class}
                    </Badge>
                  </div>
                  <blockquote className="text-gray-700 italic">
                    "{testimonial.quote}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Boxing Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of San Franciscans who've transformed their lives through boxing
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => handleBookClass({})}
              className="bg-accent hover:bg-accent/90 text-black font-bold px-8 py-4"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Your 50% Off Intro Class
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onNavigate?.('schedule')}
              className="border-white text-white hover:bg-white hover:text-primary px-8 py-4"
            >
              View Full Schedule
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}