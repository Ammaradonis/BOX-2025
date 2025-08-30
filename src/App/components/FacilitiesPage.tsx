import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Users, 
  Clock, 
  Wifi, 
  Car, 
  Droplets, 
  Zap, 
  Coffee,
  MapPin,
  Calendar
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface FacilitiesPageProps {
  onBookClass: (classData: any) => void;
}

export function FacilitiesPage({ onBookClass }: FacilitiesPageProps) {
  const [occupancy, setOccupancy] = useState({ current: 0, capacity: 40, percentage: 0 });
  const [currentArea, setCurrentArea] = useState('main-floor');

  useEffect(() => {
    const fetchOccupancy = async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/occupancy`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        const data = await response.json();
        setOccupancy(data);
      } catch (error) {
        console.error('Error fetching occupancy:', error);
      }
    };

    fetchOccupancy();
    const interval = setInterval(fetchOccupancy, 30000);
    return () => clearInterval(interval);
  }, []);

  const facilityAreas = [
    {
      id: 'main-floor',
      name: 'Main Floor',
      description: 'Heart of the gym with professional boxing equipment',
      image: 'https://images.unsplash.com/photo-1575747515871-2e323827539e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBneW0lMjB0cmFpbmluZyUyMFNhbiUyMEZyYW5jaXNjb3xlbnwxfHx8fDE3NTYwOTY0NzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      altText: '5,000 sq ft gym with boxing ring, 12 heavy bags, and cardio zone',
      features: [
        '20x20 professional boxing ring',
        '12 heavy bags (various weights)',
        '8 speed bags',
        '6 double-end bags',
        'Mirror walls for form checking',
        'Bay Bridge view through windows'
      ],
      equipment: [
        'Everlast heavy bags (80-120 lbs)',
        'Title speed bags',
        'Ring timer system',
        'Professional boxing ring',
        'Floor-to-ceiling bags',
        'Maize bags for uppercuts'
      ]
    },
    {
      id: 'strength-zone',
      name: 'Strength Zone',
      description: 'Dedicated area for conditioning and strength training',
      image: 'https://images.unsplash.com/photo-1575747515871-2e323827539e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBneW0lMjB0cmFpbmluZyUyMFNhbiUyMEZyYW5jaXNjb3xlbnwxfHx8fDE3NTYwOTY0NzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      altText: 'Strength training area with kettlebells, dumbbells, and functional fitness equipment',
      features: [
        'Free weights (5-100 lbs)',
        'Kettlebells (15-70 lbs)',
        'Medicine balls',
        'Resistance bands',
        'Pull-up bars',
        'Plyometric boxes'
      ],
      equipment: [
        'Rogue dumbbells',
        'Kettlebell Kings kettlebells',
        'TRX suspension trainers',
        'Battle ropes',
        'Agility ladders',
        'Foam rollers for recovery'
      ]
    },
    {
      id: 'outdoor-space',
      name: 'Outdoor Training Area',
      description: 'Fresh air training with SF views',
      image: 'https://images.unsplash.com/photo-1568475754879-c62e646b96f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwYm9vdGNhbXAlMjBvdXRkb29yJTIwU2FuJTIwRnJhbmNpc2NvfGVufDF8fHx8MTc1NjA5NjQ3NXww&ixlib=rb-4.1.0&q=80&w=1080',
      altText: 'Outdoor turf area for conditioning with San Francisco skyline view',
      features: [
        '1,500 sq ft turf area',
        'Outdoor heavy bags',
        'Bootcamp space',
        'San Francisco skyline views',
        'Weather protection canopy',
        'Integrated sound system'
      ],
      equipment: [
        'Weatherproof heavy bags',
        'Outdoor speakers',
        'Training cones and markers',
        'Jump ropes',
        'Tire flipping area',
        'Sledgehammer and tire setup'
      ]
    }
  ];

  const amenities = [
    {
      icon: Droplets,
      title: 'Premium Showers',
      description: 'Clean, spacious showers with organic SF-made toiletries',
      details: ['Hot water always available', 'Individual stalls with locks', 'Complimentary towels', 'High-end amenities']
    },
    {
      icon: Zap,
      title: 'Locker Room',
      description: 'Secure lockers with charging stations',
      details: ['Day-use lockers included', 'Phone charging stations', 'Combination and key options', 'Bench seating area']
    },
    {
      icon: Wifi,
      title: 'Free WiFi',
      description: 'High-speed internet throughout the facility',
      details: ['Fiber optic connection', 'Password: SFBOXING2025', 'Streaming-quality speeds', 'Covers all areas']
    },
    {
      icon: Coffee,
      title: 'Hydration Station',
      description: 'Filtered water and post-workout refreshments',
      details: ['Cold filtered water', 'Electrolyte options', 'Protein shakes available', 'Local SF coffee on weekends']
    },
    {
      icon: Car,
      title: 'Parking & Transit',
      description: 'Convenient access by car or public transport',
      details: ['Street parking available', 'Bike racks at entrance', 'T-Third line nearby', '22-Fillmore bus stop']
    },
    {
      icon: Users,
      title: 'Community Space',
      description: 'Hang out and connect with fellow boxers',
      details: ['Comfortable seating area', 'Community bulletin board', 'Event planning space', 'Member meetup area']
    }
  ];

  const currentAreaData = facilityAreas.find(area => area.id === currentArea) || facilityAreas[0];

  const openGymSchedule = [
    { day: 'Monday', hours: '6:00 AM - 9:00 AM, 11:00 AM - 2:00 PM, 8:00 PM - 10:00 PM' },
    { day: 'Tuesday', hours: '6:00 AM - 9:00 AM, 11:00 AM - 2:00 PM, 8:00 PM - 10:00 PM' },
    { day: 'Wednesday', hours: '6:00 AM - 9:00 AM, 11:00 AM - 2:00 PM, 8:00 PM - 10:00 PM' },
    { day: 'Thursday', hours: '6:00 AM - 9:00 AM, 11:00 AM - 2:00 PM, 8:00 PM - 10:00 PM' },
    { day: 'Friday', hours: '6:00 AM - 9:00 AM, 11:00 AM - 2:00 PM, 8:00 PM - 10:00 PM' },
    { day: 'Saturday', hours: '8:00 AM - 12:00 PM, 3:00 PM - 8:00 PM' },
    { day: 'Sunday', hours: '9:00 AM - 1:00 PM, 4:00 PM - 8:00 PM' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Virtual Tour */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                TOUR OUR FACILITIES
              </h1>
              <p className="text-xl text-red-100 mb-8">
                5,000 sq ft of premium boxing equipment in the heart of Dogpatch. Open gym access - no appointment needed.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onBookClass({
                    id: 'open-gym',
                    name: 'Open Gym Session',
                    description: 'Train on your own schedule',
                    level: 'open-gym',
                    price: 15
                  })}
                  className="btn btn-primary text-lg px-8 py-4"
                >
                  🥊 BOOK OPEN GYM - $15
                </button>
                
                <button className="btn btn-secondary text-lg px-8 py-4">
                  <Eye className="mr-2" size={20} />
                  VIRTUAL 360° TOUR
                </button>
              </div>
            </div>
            
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
                    {occupancy.percentage > 80 ? 'Busy - but room for more!' : 'Perfect time to train'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facility Areas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore Our Training Areas
            </h2>
            <p className="text-lg text-gray-600">
              Professional-grade equipment in every corner of our facility
            </p>
          </div>

          {/* Area Selection Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-lg p-1 inline-flex">
              {facilityAreas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => setCurrentArea(area.id)}
                  className={`px-6 py-3 rounded-md font-medium transition-colors ${
                    currentArea === area.id
                      ? 'bg-red-600 text-white'
                      : 'text-gray-700 hover:text-red-600'
                  }`}
                >
                  {area.name}
                </button>
              ))}
            </div>
          </div>

          {/* Current Area Display */}
          <div className="bg-gray-50 rounded-xl p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <ImageWithFallback
                  src={currentAreaData.image}
                  alt={currentAreaData.altText}
                  className="w-full h-80 object-cover rounded-lg shadow-lg"
                />
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {currentAreaData.name}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {currentAreaData.description}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
                  <ul className="space-y-2">
                    {currentAreaData.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="bg-green-100 text-green-600 rounded-full p-1 mt-1">
                          <span className="text-xs">✓</span>
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Equipment Details</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {currentAreaData.equipment.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        <span className="text-gray-700 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Member Amenities
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need for a complete workout experience
            </p>
          </div>

          <div className="sf-grid sf-grid-3">
            {amenities.map((amenity, index) => (
              <div key={index} className="card bg-white">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-red-100 text-red-600 p-3 rounded-lg">
                    <amenity.icon size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{amenity.title}</h3>
                </div>
                
                <p className="text-gray-600 mb-4">{amenity.description}</p>
                
                <ul className="space-y-1">
                  {amenity.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="text-sm text-gray-700 flex items-start space-x-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Gym Schedule */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Schedule */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Open Gym Schedule
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-4">
                  {openGymSchedule.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-start py-2 border-b border-gray-200 last:border-b-0">
                      <div className="font-medium text-gray-900">{schedule.day}</div>
                      <div className="text-gray-600 text-sm text-right max-w-xs">{schedule.hours}</div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock size={16} className="text-blue-600" />
                    <span className="font-medium text-blue-900">Drop-in Rate</span>
                  </div>
                  <div className="text-blue-800">
                    <div>$15 per session</div>
                    <div className="text-sm">Unlimited time during open hours</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Widget */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Reserve Your Spot
              </h2>
              
              <div className="card bg-white">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-red-600 mb-2">$15</div>
                  <div className="text-gray-600">Open Gym Session</div>
                  <div className="text-sm text-gray-500">No time limit during open hours</div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">What's Included</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Access to all training areas</li>
                      <li>• Use of all gym equipment</li>
                      <li>• Locker and towel service</li>
                      <li>• Free WiFi and water</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2">What to Bring</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Boxing gloves (or rent for $3)</li>
                      <li>• Hand wraps (or buy for $8)</li>
                      <li>• Workout clothes and shoes</li>
                      <li>• Water bottle and towel</li>
                    </ul>
                  </div>
                </div>
                
                <button
                  onClick={() => onBookClass({
                    id: 'open-gym-reservation',
                    name: 'Open Gym Session',
                    description: 'Train on your own schedule with full facility access',
                    level: 'open-gym',
                    price: 15
                  })}
                  className="btn btn-primary w-full"
                >
                  <Calendar className="mr-2" size={20} />
                  RESERVE YOUR BAG SPACE
                </button>
                
                <p className="text-xs text-gray-500 mt-3 text-center">
                  No membership required • Walk-ins welcome when space available
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Directions */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Visit Us in Dogpatch
            </h2>
            <p className="text-lg text-gray-600">
              Easy to find, easy to park, hard to leave
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 text-center">
              <MapPin className="mx-auto text-red-600 mb-4" size={32} />
              <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
              <p className="text-gray-600">
                2576 3rd Street<br />
                Between 22nd & 23rd<br />
                Dogpatch, SF 94107
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center">
              <Users className="mx-auto text-red-600 mb-4" size={32} />
              <h3 className="font-semibold text-gray-900 mb-2">Public Transit</h3>
              <p className="text-gray-600">
                T-Third Line<br />
                22-Fillmore Bus<br />
                48-Quintara Bus
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center">
              <Car className="mx-auto text-red-600 mb-4" size={32} />
              <h3 className="font-semibold text-gray-900 mb-2">Parking</h3>
              <p className="text-gray-600">
                Street parking available<br />
                Bike racks at entrance<br />
                Loading zone for drop-off
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SF Flavor */}
      <section className="py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 italic">
            "More space than a SOMA loft, more energy than the Mission on a Saturday night!" 🌉
          </p>
        </div>
      </section>
    </div>
  );
}