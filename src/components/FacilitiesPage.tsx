import React, { useState, useEffect, Component, useCallback } from 'react';
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

// Error Boundary Component
class FacilityErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg text-center">
          <p>Something went wrong loading the facilities data.</p>
          <p className="text-sm mt-2">Please try refreshing the page or contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function FacilitiesPage({ onBookClass }) {
  const [occupancy, setOccupancy] = useState({ current: 0, capacity: 40, percentage: 0 });
  const [currentArea, setCurrentArea] = useState('main-floor');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOccupancy = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/occupancy`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch occupancy data');
      }
      const data = await response.json();
      setOccupancy(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching occupancy:', error);
      setError('Failed to load live gym status. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOccupancy();
    const interval = setInterval(fetchOccupancy, 30000);
    return () => clearInterval(interval);
  }, [fetchOccupancy]);

  const facilityAreas = [
    {
      id: 'main-floor',
      name: 'Main Floor',
      description: 'Heart of the gym with professional boxing equipment',
      images: {
        small: 'https://images.unsplash.com/photo-1575747515871-2e323827539e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBneW0lMjB0cmFpbmluZyUyMFNhbiUyMEZyYW5jaXNjb3xlbnwxfHx8fDE3NTYwOTY0NzR8MA&ixlib=rb-4.1.0&q=80&w=480',
        medium: 'https://images.unsplash.com/photo-1575747515871-2e323827539e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBneW0lMjB0cmFpbmluZyUyMFNhbiUyMEZyYW5jaXNjb3xlbnwxfHx8fDE3NTYwOTY0NzR8MA&ixlib=rb-4.1.0&q=80&w=768',
        large: 'https://images.unsplash.com/photo-1575747515871-2e323827539e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjBneW0lMjB0cmFpbmluZyUyMFNhbiUyMEZyYW5jaXNjb3xlbnwxfHx8fDE3NTYwOTY0NzR8MA&ixlib=rb-4.1.0&q=80&w=1080'
      },
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
    // ... (other facility areas with similar image objects)
  ];

  // ... (amenities and openGymSchedule remain the same)

  const currentAreaData = facilityAreas.find(area => area.id === currentArea) || facilityAreas[0];

  return (
    <FacilityErrorBoundary>
      <div className="min-h-screen bg-gray-50">
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
                    aria-label="Book open gym session for $15"
                  >
                    🥊 BOOK OPEN GYM - $15
                  </button>
                  <button 
                    className="btn btn-secondary text-lg px-8 py-4"
                    aria-label="Take a virtual 360 degree tour of the facility"
                  >
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
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                    <span className="text-sm text-red-100 mt-2 block">Loading gym status...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-4 bg-red-100/20 rounded-lg">
                    <p className="text-red-100">Live Status Unavailable</p>
                    <p className="text-sm text-red-200 mt-1">{error}</p>
                  </div>
                ) : (
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
                        role="progressbar"
                        aria-valuenow={occupancy.percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
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
                )}
              </div>
            </div>
          </div>
        </section>

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
            <div className="flex justify-center mb-8">
              <nav className="bg-gray-100 rounded-lg p-1 inline-flex" role="tablist">
                {facilityAreas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => setCurrentArea(area.id)}
                    className={`px-6 py-3 rounded-md font-medium transition-colors ${
                      currentArea === area.id
                        ? 'bg-red-600 text-white'
                        : 'text-gray-700 hover:text-red-600'
                    }`}
                    role="tab"
                    aria-selected={currentArea === area.id}
                    aria-controls={`panel-${area.id}`}
                  >
                    {area.name}
                  </button>
                ))}
              </nav>
            </div>
            <div className="bg-gray-50 rounded-xl p-8" id={`panel-${currentArea}`} role="tabpanel">
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <picture>
                    <source srcSet={currentAreaData.images.small} media="(max-width: 640px)" />
                    <source srcSet={currentAreaData.images.medium} media="(max-width: 1024px)" />
                    <source srcSet={currentAreaData.images.large} />
                    <ImageWithFallback
                      src={currentAreaData.images.large}
                      alt={currentAreaData.altText}
                      className="w-full h-80 object-cover rounded-lg shadow-lg"
                      loading="lazy"
                    />
                  </picture>
                </div>
                {/* ... rest of the section remains the same ... */}
              </div>
            </div>
          </div>
        </section>

        {/* ... rest of the component remains the same, with added ARIA attributes ... */}
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
            <div className="sf-grid sf-grid-3" role="list">
              {amenities.map((amenity, index) => (
                <div key={index} className="card bg-white" role="listitem">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-red-100 text-red-600 p-3 rounded-lg">
                      <amenity.icon size={24} aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{amenity.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{amenity.description}</p>
                  <ul className="space-y-1" role="list">
                    {amenity.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="text-sm text-gray-700 flex items-start space-x-2" role="listitem">
                        <span className="text-red-600 mt-1" aria-hidden="true">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ... rest of the component with similar ARIA enhancements ... */}
      </div>
    </FacilityErrorBoundary>
  );
}