import React, { useState } from 'react';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// Define TypeScript interfaces
interface ClassSchedule {
  id: string;
  name: string;
  day: string;
  time: string;
  duration?: number;
  capacity: number;
  instructor: string;
  type: 'beginner' | 'intermediate' | 'advanced' | 'youth' | 'sparring' | 'bootcamp';
}

interface Booking {
  id: string;
  classId: string;
  classDate: string;
  classTime: string;
  status: 'confirmed' | 'cancelled';
}

interface SchedulePageProps {
  onNavigate?: (page: string) => void;
  currentUser?: { accessToken: string } | null;
}

interface APIError extends Error {
  message: string;
  status?: number;
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
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Something went wrong. Please try refreshing the page or contact support.
          </AlertDescription>
        </Alert>
      );
    }
    return this.props.children;
  }
}

// Query client for react-query
const queryClient = new QueryClient();

// Main component
function SchedulePageComponent({ onNavigate, currentUser }: SchedulePageProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState<'all' | ClassSchedule['type']>('all');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassSchedule | null>(null);

  // API fetch functions with proper error handling
  const fetchScheduleData = async (): Promise<ClassSchedule[]> => {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/schedule`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = new Error('Failed to fetch schedule') as APIError;
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    return data.schedules || [];
  };

  const fetchUserBookings = async (): Promise<Booking[]> => {
    if (!currentUser?.accessToken) {
      return [];
    }

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/my-bookings`, {
      headers: {
        'Authorization': `Bearer ${currentUser.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = new Error('Failed to fetch bookings') as APIError;
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    return data.bookings || [];
  };

  const bookClass = async (classData: ClassSchedule & { date: string }) => {
    if (!currentUser?.accessToken || !classData) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/book-class`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentUser.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        classId: classData.id,
        classDate: classData.date,
        classTime: classData.time,
        classType: classData.type
      })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Booking failed');
    }

    return response.json();
  };

  // React Query hooks
  const { data: schedules = [], isLoading: isScheduleLoading, error: scheduleError } = useQuery({
    queryKey: ['schedules'],
    queryFn: fetchScheduleData,
    onError: (error: APIError) => {
      toast.error(error.message || 'Failed to load schedule. Please try again later.');
    }
  });

  const { data: userBookings = [], isLoading: isBookingsLoading } = useQuery({
    queryKey: ['bookings', currentUser?.accessToken],
    queryFn: fetchUserBookings,
    enabled: !!currentUser?.accessToken,
    onError: (error: APIError) => {
      toast.error(error.message || 'Failed to load bookings. Please try again later.');
    }
  });

  const bookClassMutation = useMutation({
    mutationFn: bookClass,
    onSuccess: () => {
      toast.success(`Successfully booked ${selectedClass?.name}! See you in the ring.`);
      setIsBookingModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error: APIError) => {
      toast.error(error.message || 'Failed to book class. Please try again.');
    }
  });

  // Date handling with timezone consideration
  const getWeekDays = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setHours(0, 0, 0, 0);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }
    return weekDays;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    newDate.setHours(0, 0, 0, 0);
    setSelectedDate(newDate);
  };

  const getDayOfWeek = (dayName: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(dayName);
  };

  const getClassesForDay = (dayName: string) => {
    return selectedFilter === 'all'
      ? schedules.filter(schedule => schedule.day === dayName)
      : schedules.filter(schedule => schedule.day === dayName && schedule.type === selectedFilter);
  };

  const isClassBooked = (classId: string, date: string) => {
    return userBookings.some(booking => 
      booking.classId === classId && 
      booking.classDate.split('T')[0] === date &&
      booking.status === 'confirmed'
    );
  };

  const handleBookClass = (classData: ClassSchedule & { date: string }) => {
    if (!currentUser?.accessToken) {
      toast.error('Please sign in first to book a class');
      onNavigate?.('login');
      return;
    }

    setSelectedClass(classData);
    setIsBookingModalOpen(true);
  };

  const classTypeColors = {
    beginner: 'bg-blue-100 text-blue-800 border-blue-200',
    intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    advanced: 'bg-red-100 text-red-800 border-red-200',
    youth: 'bg-green-100 text-green-800 border-green-200',
    sparring: 'bg-purple-100 text-purple-800 border-purple-200',
    bootcamp: 'bg-orange-100 text-orange-800 border-orange-200'
  };

  const filterOptions = [
    { value: 'all', label: 'All Classes' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'youth', label: 'Youth' },
    { value: 'sparring', label: 'Sparring' },
    { value: 'bootcamp', label: 'Bootcamp' }
  ] as const;

  if (isScheduleLoading || isBookingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                CLASS <span className="text-accent">SCHEDULE</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Book your spot in SF's toughest training sessions
              </p>
              {!currentUser?.accessToken && (
                <Alert className="bg-white/10 border-white/20 text-white max-w-md mx-auto">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Sign in to book classes and track your progress
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </section>

        {/* Schedule Controls */}
        <section className="py-8 bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('prev')}
                  className="flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous Week
                </Button>
                
                <div className="text-center">
                  <p className="font-semibold text-lg text-gray-900">
                    Week of {selectedDate.toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric',
                      timeZone: 'America/Los_Angeles'
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedDate.getFullYear()}
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('next')}
                  className="flex items-center"
                >
                  Next Week
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value as typeof selectedFilter)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {filterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Weekly Schedule Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
              {getWeekDays().map((date, index) => {
                const dayName = date.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  timeZone: 'America/Los_Angeles'
                });
                const dayClasses = getClassesForDay(dayName);
                const isToday = date.toDateString() === new Date().toDateString();
                const dateString = date.toISOString().split('T')[0];

                return (
                  <Card key={index} className={`${isToday ? 'ring-2 ring-primary' : ''}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-center">
                        <div className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-gray-500'}`}>
                          {dayName}
                        </div>
                        <div className={`text-xl font-bold ${isToday ? 'text-primary' : 'text-gray-900'}`}>
                          {date.getDate()}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {dayClasses.length > 0 ? (
                        dayClasses.map((classItem) => {
                          const isBooked = isClassBooked(classItem.id, dateString);
                          const classTypeColor = classTypeColors[classItem.type] || classTypeColors.beginner;
                          
                          return (
                            <div
                              key={classItem.id}
                              className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm leading-tight">
                                    {classItem.name}
                                  </h4>
                                  <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {classItem.time}
                                  </div>
                                  <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <Users className="w-3 h-3 mr-1" />
                                    {classItem.capacity} spots
                                  </div>
                                </div>
                                
                                <Badge variant="outline" className={`text-xs ${classTypeColor}`}>
                                  {classItem.type}
                                </Badge>
                              </div>
                              
                              <div className="text-xs text-gray-600 mb-3">
                                {classItem.instructor}
                              </div>
                              
                              {isBooked ? (
                                <div className="flex items-center text-green-600 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Booked
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleBookClass({ ...classItem, date: dateString })}
                                  className="w-full text-xs py-1 h-7"
                                  disabled={!currentUser?.accessToken}
                                >
                                  {currentUser?.accessToken ? 'Book Class' : 'Sign In to Book'}
                                </Button>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center text-gray-400 py-4">
                          <p className="text-sm">No classes today</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Your Bookings */}
        {currentUser?.accessToken && userBookings.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                Your Upcoming Classes
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {userBookings.filter(booking => booking.status === 'confirmed').map((booking) => (
                  <Card key={booking.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {schedules.find(s => s.id === booking.classId)?.name || 'Class'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {schedules.find(s => s.id === booking.classId)?.instructor}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Confirmed
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(booking.classDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            timeZone: 'America/Los_Angeles'
                          })}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {booking.classTime}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          3rd Street Boxing Gym
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Booking Confirmation Modal */}
        <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-primary">
                Confirm Class Booking
              </DialogTitle>
              <DialogDescription>
                Review your class details before confirming
              </DialogDescription>
            </DialogHeader>

            {selectedClass && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-2">
                    {selectedClass.name}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {selectedClass.date ? new Date(selectedClass.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'America/Los_Angeles'
                      }) : 'Date not specified'}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {selectedClass.time} ({selectedClass.duration || 60} minutes)
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {selectedClass.instructor}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      3rd Street Boxing Gym - Main Floor
                    </div>
                  </div>
                </div>

                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                  <p className="text-sm text-accent-foreground">
                    <strong>First time?</strong> This class is 50% off for new members! 
                    Don't forget to bring water and a towel.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="flex-1"
                    disabled={bookClassMutation.isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => selectedClass && bookClassMutation.mutate({ ...selectedClass, date: selectedClass.date })}
                    disabled={bookClassMutation.isLoading || !selectedClass}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {bookClassMutation.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Booking
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Bottom CTA */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Questions About Classes?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Our team is here to help you find the perfect class for your goals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => onNavigate?.('contact')}
                className="bg-accent hover:bg-accent/90 text-black font-bold px-8 py-4"
              >
                Contact Our Team
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate?.('classes')}
                className="border-white text-white hover:bg-white hover:text-primary px-8 py-4"
              >
                Learn About Classes
              </Button>
            </div>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
}

// Wrap with QueryClientProvider
export default function SchedulePage(props: SchedulePageProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SchedulePageComponent {...props} />
    </QueryClientProvider>
  );
}