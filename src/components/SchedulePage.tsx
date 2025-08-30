import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Filter, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface SchedulePageProps {
  onBookClass: (classData: any) => void;
}

export function SchedulePage({ onBookClass }: SchedulePageProps) {
  const [schedule, setSchedule] = useState([]);
  const [occupancy, setOccupancy] = useState({ current: 0, capacity: 40, percentage: 0 });
  const [selectedDay, setSelectedDay] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scheduleRes, occupancyRes] = await Promise.all([
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/schedule`, {
            headers: { 
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/occupancy`, {
            headers: { 
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        if (scheduleRes.ok) {
          const scheduleData = await scheduleRes.json();
          setSchedule(scheduleData.schedule || []);
        }

        if (occupancyRes.ok) {
          const occupancyData = await occupancyRes.json();
          setOccupancy(occupancyData);
        }
      } catch (error) {
        console.error('Error fetching schedule data:', error);
        // Set some default schedule data so page still works
        setSchedule([
          {
            id: 'default-1',
            className: 'Beginner Boxing',
            day: 'Monday',
            time: '18:00',
            trainerName: 'Maria Gonzalez',
            classLevel: 'beginner',
            spotsAvailable: 12,
            maxCapacity: 20
          },
          {
            id: 'default-2', 
            className: 'Intermediate Boxing',
            day: 'Wednesday',
            time: '19:00',
            trainerName: 'Raúl Mendoza',
            classLevel: 'intermediate',
            spotsAvailable: 8,
            maxCapacity: 15
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Update occupancy every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const levels = ['All', 'beginner', 'intermediate', 'advanced', 'youth', 'sparring'];

  const filteredSchedule = schedule.filter((slot: any) => {
    if (selectedDay !== 'All' && slot.day !== selectedDay) return false;
    if (selectedLevel !== 'All' && slot.classLevel !== selectedLevel) return false;
    return true;
  });

  const groupedSchedule = days.reduce((acc, day) => {
    acc[day] = filteredSchedule
      .filter((slot: any) => slot.day === day)
      .sort((a: any, b: any) => a.time.localeCompare(b.time));
    return acc;
  }, {} as Record<string, any[]>);

  const getTimeSlotColor = (spotsAvailable: number, maxCapacity: number) => {
    const fillPercentage = ((maxCapacity - spotsAvailable) / maxCapacity) * 100;
    
    if (fillPercentage >= 90) return 'bg-red-100 border-red-300 text-red-800';
    if (fillPercentage >= 70) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-green-100 border-green-300 text-green-800';
  };

  const formatTime = (time24: string) => {
    return new Date(`2000-01-01T${time24}`).toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Live Occupancy */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                CLASS SCHEDULE
              </h1>
              <p className="text-xl text-red-100 mb-8">
                Book your spot in SF's premier boxing training. Real-time availability.
              </p>
            </div>
            
            {/* Live Gym Occupancy */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <MapPin className="mr-2" size={20} />
                  Live Gym Status
                </h3>
                <span className="text-sm text-red-100">
                  Updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Current Occupancy</span>
                  <span className="font-bold">{occupancy.current}/{occupancy.capacity}</span>
                </div>
                
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      occupancy.percentage > 80 ? 'bg-yellow-400' : 'bg-green-400'
                    }`}
                    style={{ width: `${occupancy.percentage}%` }}
                  ></div>
                </div>
                
                <div className="text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    occupancy.percentage > 80 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {occupancy.percentage > 80 ? 'Busy' : 'Great time to visit'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {/* Day Filter */}
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-gray-500" />
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
                >
                  <option value="All">All Days</option>
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-500" />
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
                >
                  <option value="All">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="youth">Youth</option>
                  <option value="sparring">Sparring</option>
                </select>
              </div>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentWeek(currentWeek - 1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Previous week"
              >
                <ChevronLeft size={20} />
              </button>
              
              <span className="text-sm font-medium text-gray-700">
                Week of {new Date(Date.now() + currentWeek * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
              
              <button
                onClick={() => setCurrentWeek(currentWeek + 1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Next week"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Mobile Schedule (Card View) */}
          <div className="lg:hidden space-y-6">
            {days.map(day => {
              const daySchedule = groupedSchedule[day];
              if (!daySchedule.length) return null;
              
              return (
                <div key={day} className="bg-white rounded-lg shadow-sm">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">{day}</h3>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {daySchedule.map((slot: any, index: number) => (
                      <div 
                        key={index}
                        className={`border-2 rounded-lg p-4 ${getTimeSlotColor(slot.spotsAvailable, slot.maxCapacity)}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{slot.className}</h4>
                            <p className="text-sm opacity-80">{slot.trainerName}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatTime(slot.time)}</div>
                            <div className="text-xs">{slot.duration || 60} min</div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">
                            {slot.spotsAvailable} spots available
                          </span>
                          
                          <button
                            onClick={() => onBookClass({
                              id: slot.id,
                              name: slot.className,
                              day: slot.day,
                              time: slot.time,
                              instructor: slot.trainerName,
                              level: slot.classLevel
                            })}
                            disabled={slot.spotsAvailable === 0}
                            className="btn btn-ghost text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {slot.spotsAvailable > 0 ? 'Book' : 'Full'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Schedule (Grid View) */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="grid grid-cols-8 gap-0">
                {/* Time Column Header */}
                <div className="bg-gray-50 p-4 border-b border-gray-200 font-semibold text-gray-900">
                  Time
                </div>
                
                {/* Day Headers */}
                {days.map(day => (
                  <div key={day} className="bg-gray-50 p-4 border-b border-gray-200 font-semibold text-gray-900 text-center">
                    {day}
                  </div>
                ))}
                
                {/* Time Slots */}
                {Array.from({ length: 16 }, (_, i) => {
                  const hour = 5 + i; // Start at 5 AM
                  const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                  
                  return (
                    <React.Fragment key={timeSlot}>
                      {/* Time Label */}
                      <div className="p-4 border-b border-gray-200 text-sm text-gray-600 font-medium">
                        {formatTime(timeSlot)}
                      </div>
                      
                      {/* Day Columns */}
                      {days.map(day => {
                        const daySchedule = groupedSchedule[day];
                        const classAtTime = daySchedule.find((slot: any) => 
                          slot.time.startsWith(timeSlot.substring(0, 2))
                        );
                        
                        return (
                          <div key={`${day}-${timeSlot}`} className="p-2 border-b border-gray-200 min-h-[60px]">
                            {classAtTime && (
                              <div 
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                                  getTimeSlotColor(classAtTime.spotsAvailable, classAtTime.maxCapacity)
                                }`}
                                onClick={() => onBookClass({
                                  id: classAtTime.id,
                                  name: classAtTime.className,
                                  day: classAtTime.day,
                                  time: classAtTime.time,
                                  instructor: classAtTime.trainerName,
                                  level: classAtTime.classLevel
                                })}
                              >
                                <div className="text-sm font-semibold truncate" title={classAtTime.className}>
                                  {classAtTime.className}
                                </div>
                                <div className="text-xs opacity-80 truncate" title={classAtTime.trainerName}>
                                  {classAtTime.trainerName}
                                </div>
                                <div className="text-xs mt-1">
                                  {classAtTime.spotsAvailable} spots
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legend */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
              <span>Filling Up</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
              <span>Nearly Full</span>
            </div>
          </div>
        </div>
      </section>

      {/* SF Flavor */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 italic">
            "Book faster than a BART ride during rush hour - spots fill up quick in the city!" 🌉
          </p>
        </div>
      </section>
    </div>
  );
}