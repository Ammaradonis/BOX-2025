import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, DollarSign, CheckCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface BookingModalProps {
  classData: any;
  user: any;
  onClose: () => void;
}

export function BookingModal({ classData, user, onClose }: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    // Fetch available schedule
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/schedule`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    })
    .then(res => res.json())
    .then(data => {
      const filteredSchedule = data.schedule?.filter((slot: any) => 
        slot.spotsAvailable > 0 && 
        (classData.level ? slot.classLevel === classData.level : true)
      ) || [];
      setSchedule(filteredSchedule);
      
      // Set default selections if available
      if (filteredSchedule.length > 0) {
        setSelectedDate(filteredSchedule[0].day);
        setSelectedTime(filteredSchedule[0].time);
      }
    })
    .catch(console.error);
  }, [classData]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedSlot = schedule.find((slot: any) => 
        slot.day === selectedDate && slot.time === selectedTime
      );

      if (!selectedSlot) {
        throw new Error('Selected time slot not found');
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token || publicAnonKey}`
        },
        body: JSON.stringify({
          scheduleId: selectedSlot.id,
          classType: classData.name || classData.level
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to book class');
      }

      setSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to book class');
    } finally {
      setLoading(false);
    }
  };

  const availableTimes = schedule.filter((slot: any) => slot.day === selectedDate);
  const selectedSlot = schedule.find((slot: any) => 
    slot.day === selectedDate && slot.time === selectedTime
  );

  if (success) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-green-600 mb-4">
            <CheckCircle size={64} className="mx-auto" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            You're Booked!
          </h2>
          
          <p className="text-gray-600 mb-4">
            Your class is confirmed. Check your email for details.
          </p>
          
          <p className="text-sm text-gray-500 italic">
            Now go conquer like you're facing the 49ers O-line! 🥊
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 
            id="booking-modal-title"
            className="text-2xl font-bold text-gray-900"
          >
            Book Your Class
          </h2>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close booking modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Class Info */}
        <div className="bg-red-50 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-red-900 mb-2">{classData.name}</h3>
          <p className="text-red-700 text-sm mb-3">{classData.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <DollarSign size={16} className="text-red-600" />
              <span>
                {classData.price === 0 ? (
                  <span className="font-bold text-green-600">FREE</span>
                ) : (
                  <span>
                    ${classData.price}
                    {classData.originalPrice && (
                      <span className="line-through text-gray-500 ml-2">
                        ${classData.originalPrice}
                      </span>
                    )}
                  </span>
                )}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <User size={16} className="text-red-600" />
              <span className="capitalize">{classData.level || 'All Levels'}</span>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleBooking} className="space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Calendar size={16} className="inline mr-2" />
              Select Day
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Array.from(new Set(schedule.map((slot: any) => slot.day))).map((day: string) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    selectedDate === day
                      ? 'border-red-600 bg-red-50 text-red-900'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Clock size={16} className="inline mr-2" />
                Select Time
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableTimes.map((slot: any) => (
                  <button
                    key={`${slot.day}-${slot.time}`}
                    type="button"
                    onClick={() => setSelectedTime(slot.time)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedTime === slot.time
                        ? 'border-red-600 bg-red-50 text-red-900'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="font-medium">
                      {new Date(`2000-01-01T${slot.time}`).toLocaleTimeString([], { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </div>
                    <div className="text-xs text-gray-600">
                      {slot.spotsAvailable} spots left
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Class Summary */}
          {selectedSlot && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Class: {selectedSlot.className}</div>
                <div>Instructor: {selectedSlot.trainerName}</div>
                <div>
                  Time: {selectedDate} at{' '}
                  {new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString([], { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </div>
                <div>Duration: {selectedSlot.duration || 60} minutes</div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedDate || !selectedTime}
            className="btn btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Booking Class...</span>
              </div>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </form>

        {/* SF Flavor Text */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 italic">
            Reserve your corner (before a techie snags it)! 🌉
          </p>
        </div>
      </div>
    </div>
  );
}