import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageWithFallback } from './ImageWithFallback';
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
import { projectId, publicAnonKey } from "../../utils/supabase/info.tsx";

// TypeScript interfaces
interface Schedule {
  id: string;
  day: string;
  time: string;
  instructor: string;
  type: string;
}

interface Trainer {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  experience: string;
}

interface ClassType {
  id: string;
  name: string;
  icon: JSX.Element;
  description: string;
  color: string;
  sfAnalogy: string;
  image: string;
  imageAlt: string;
}

interface ClassesPageProps {
  onNavigate?: (page: string) => void;
  currentUser?: any;
}

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 rounded"></div>
      ))}
    </div>
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>
);

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Card className="max-w-md w-full">
      <CardContent className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <Button onClick={resetErrorBoundary}>Try Again</Button>
      </CardContent>
    </Card>
  </div>
);

// Lazy-loaded components
const LazyImageWithFallback = lazy(() => import('../figma/ImageWithFallback'));

export default function ClassesPage({ onNavigate, currentUser }: ClassesPageProps) {
  const [activeTab, setActiveTab] = useState('beginner');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const classTypes: ClassType[] = [
    // ... (your existing classTypes array remains unchanged)
  ];

  const fetchClassData = async (retryCount = 3, delay = 1000): Promise<void> => {
    try {
      const [schedulesResponse, trainersResponse] = await Promise.all([
        fetchWithRetry(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/schedule`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }, retryCount, delay),
        fetchWithRetry(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/trainers`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }, retryCount, delay)
      ]);

      if (!schedulesResponse.ok || !trainersResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const schedulesData = await schedulesResponse.json();
      const trainersData = await trainersResponse.json();
      
      setSchedules(schedulesData.schedules || []);
      setTrainers(trainersData.trainers || []);
    } catch (err) {
      setError('Failed to load class data. Please try again later.');
      console.error('Error fetching class data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWithRetry = async (
    url: string,
    options: RequestInit,
    retries: number,
    delay: number
  ): Promise<Response> => {
    try {
      const response = await fetch(url, options);
      if (!response.ok && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      return response;
    } catch (err) {
      if (retries === 0) throw err;
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
  };

  useEffect(() => {
    fetchClassData();
  }, []);

  const currentClassType = classTypes.find(type => type.id === activeTab);
  const classSchedules = schedules.filter(schedule => schedule.type === activeTab);

  const handleBookClass = (classData: any) => {
    if (!currentUser) {
      alert('Please sign in first to book a class');
      return;
    }
    onNavigate?.('schedule');
  };

  const testimonials = [
    // ... (your existing testimonials array remains unchanged)
  ];

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        setIsLoading(true);
        setError(null);
        fetchClassData();
      }}
    >
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
            {error && (
              <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <TabsList 
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-8 min-w-max"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}
                >
                  {classTypes.map((type) => (
                    <TabsTrigger
                      key={type.id}
                      value={type.id}
                      className="flex items-center space-x-2 px-4 py-3 text-sm md:text-base whitespace-nowrap"
                    >
                      {type.icon}
                      <span className="truncate">{type.name.split('(')[0].trim()}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {classTypes.map((type) => (
                <TabsContent key={type.id} value={type.id} className="space-y-8">
                  {isLoading ? (
                    <SkeletonLoader />
                  ) : (
                    <>
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
                          <Suspense fallback={<div className="h-64 bg-gray-200 rounded animate-pulse"></div>}>
                            <LazyImageWithFallback
                              src={type.image}
                              alt={type.imageAlt}
                              className="w-full h-64 object-cover"
                              loading="lazy"
                            />
                          </Suspense>
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
                    </>
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
    </ErrorBoundary>
  );
}