import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, User, DollarSign, CheckCircle } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// TypeScript interfaces for type safety
interface ScheduleSlot {
  id: string;
  day: string;
  time: string;
  className: string;
  trainerName: string;
  duration: number;
  spotsAvailable: number;
  classLevel?: string;
}

interface ClassData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  level?: string;
}

interface User {
  access_token?: string;
}

interface BookingModalProps {
  classData: ClassData;
  user: User;
  onClose: () => void;
}

export function BookingModal({ classData, user, onClose }: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Fetch schedule with cleanup
  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/schedule`, {
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
      },
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        const filteredSchedule = data.schedule?.filter(
          (slot: ScheduleSlot) =>
            slot.spotsAvailable > 0 && (classData.level ? slot.classLevel === classData.level : true)
        ) || [];
        setSchedule(filteredSchedule);
        if (filteredSchedule.length > 0) {
          setSelectedDate(filteredSchedule[0].day);
          setSelectedTime(filteredSchedule[0].time);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Schedule fetch error:', err);
        setError('Failed to load schedule. Try again later.');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [classData.level, publicAnonKey]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user.access_token) {
      setError('Please log in to book a class.');
      return;
    }

    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time.');
      return;
    }

    const selectedSlot = schedule.find(
      (slot) => slot.day === selectedDate && slot.time === selectedTime
    );

    if (!selectedSlot) {
      setError('Selected time slot is no longer available.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/bookings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.access_token}`,
          },
          body: JSON.stringify({
            scheduleId: selectedSlot.id,
            classType: classData.name || classData.level,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = {
          401: 'Authentication failed. Please log in again.',
          429: 'Too many requests. Try again later.',
          500: 'Server error. Please try again later.',
        }[response.status] || data.error || 'Failed to book class';
        throw new Error(errorMsg);
      }

      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err: any) {
      console.error('Booking error:', { status: err.status, message: err.message });
      setError(err.message || 'Failed to book class.');
    } finally {
      setLoading(false);
    }
  };

  const availableTimes = schedule.filter((slot) => slot.day === selectedDate);
  const selectedSlot = schedule.find(
    (slot) => slot.day === selectedDate && slot.time === selectedTime
  );

  if (success) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
      >
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-green-600 mb-4">
            <CheckCircle size={64} className="mx-auto" />
          </div>
          <h2 id="booking-modal-title" className="text-2xl font-bold text-gray-900 mb-2">
            You're Booked!
          </h2>
          <p className="text-gray-600 mb-4" id="success-message">
            Your class is confirmed. Check your email for details.
          </p>
          <p className="text-sm text-gray-500 italic">
            Now go conquer like you're facing the 49ers O-line! 🥊
          </p>
        </div>
      </div>
    );
  }

  if (!user.access_token) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
      >
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="booking-modal-title" className="text-2xl font-bold text-gray-900 mb-4">
            Please Log In
          </h2>
          <p className="text-gray-600 mb-4">
            You need to be logged in to book a class. Head to the login page to get started!
          </p>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Close
          </button>
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
          <h2 id="booking-modal-title" className="text-2xl font-bold text-gray-900">
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

        {/* Loading State */}
        {loading && !schedule.length && (
          <div className="text-center text-gray-600">Loading schedule...</div>
        )}

        {/* Empty State */}
        {!loading && schedule.length === 0 && (
          <div className="text-center text-gray-600">
            No classes available this week. Check back soon or contact us!
          </div>
        )}

        {/* Class Info */}
        {schedule.length > 0 && (
          <>
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
                  {Array.from(new Set(schedule.map((slot) => slot.day))).map((day) => (
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
                    {availableTimes.map((slot) => (
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
                          {formatInTimeZone(
                            new Date(`2000-01-01T${slot.time}`),
                            'America/Los_Angeles',
                            'h:mm aa'
                          )}
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
                      {formatInTimeZone(
                        new Date(`2000-01-01T${selectedTime}`),
                        'America/Los_Angeles',
                        'h:mm aa'
                      )}
                    </div>
                    <div>Duration: {selectedSlot.duration || 60} minutes</div>
                  </div>
                </div>
              )}

              {error && (
                <div
                  className="bg-red-50 border border-red-200 rounded-md p-3"
                  id="error-message"
                >
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !selectedDate || !selectedTime}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                aria-describedby={error ? 'error-message' : undefined}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
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
                Reserve your corner before a techie snags it! 🌉
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}