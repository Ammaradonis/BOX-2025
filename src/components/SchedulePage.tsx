/**
 * SchedulePage.tsx
 *
 * Standalone schedule & booking page component for "3rd Street Boxing".
 * This file is self-contained and includes all types, utilities, and UI used
 * by the schedule page. It merges features from provided snippets, hardcoding
 * all data for optimal performance and reliability. Experience the thrill of
 * professional boxing training with our meticulously curated schedule, designed
 * to push your limits and elevate your skills in the heart of San Francisco.
 * Whether you're a novice stepping into the ring for the first time or a seasoned
 * fighter honing your craft, our classes offer unparalleled intensity, expert
 * instruction, and a community of warriors committed to excellence. Book now
 * to secure your spot in sessions that blend raw power, strategic technique,
 * and mental fortitude – transforming you into a champion both inside and
 * outside the ropes.
 */

// Imports from first snippet
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
import { projectId, publicAnonKey } from "../utils/supabase/info"; // Retained but unused for hardcoding

// Imports from second snippet
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  Fragment,
} from "react";
import confetti from "canvas-confetti";
import { formatInTimeZone } from "date-fns-tz";

// Define TypeScript interfaces (merged and enhanced)
interface ClassSchedule {
  id: string;
  name: string;
  day: string; // e.g., 'Monday' or ISO date like '2025-09-15'
  time: string; // 'HH:MM:SS'
  duration: number;
  capacity: number;
  spotsAvailable: number;
  displaySpots?: number;
  surgePrice?: number; // USD surcharge
  instructor: string;
  type: 'beginner' | 'intermediate' | 'advanced' | 'youth' | 'sparring' | 'bootcamp' | 'academy' | 'technique';
  classLevel?: string;
  description: string; // Added for detailed web copy
}
interface Booking {
  id: string;
  classId: string;
  classDate: string;
  classTime: string;
  status: 'confirmed' | 'cancelled';
  slotId: string;
  created_at: string; // ISO
  receiptId?: string | null;
}
interface SchedulePageProps {
  onNavigate?: (page: string) => void;
  currentUser?: { accessToken: string } | null;
}
interface APIError extends Error {
  message: string;
  status?: number;
}
interface PaymentResult {
  id: string;
  status: "succeeded" | "failed";
  receipt: string;
}

// Error Boundary Component (from first)
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

// Query client for react-query (from first, used for consistency even with hardcoded data)
const queryClient = new QueryClient();

// Hardcoded schedule data (merged and expanded with detailed descriptions)
const HARDCODED_SCHEDULE: ClassSchedule[] = [
  {
    id: "s1",
    name: "Bootcamp Blast",
    day: "Monday",
    time: "09:00:00",
    duration: 60,
    capacity: 20,
    spotsAvailable: 8,
    displaySpots: 3,
    surgePrice: 20,
    instructor: "Elena",
    type: "bootcamp",
    classLevel: "bootcamp",
    description: "Ignite your week with Bootcamp Blast, a high-octane full-body workout that combines explosive cardio, strength training, and boxing fundamentals. Perfect for those seeking to build endurance, shed pounds, and unleash their inner fighter in a supportive group environment. Elena's expert guidance ensures every punch and squat is executed with precision, maximizing your results while minimizing injury risk."
  },
  {
    id: "s2",
    name: "Night Ring Drills",
    day: "Tuesday",
    time: "18:00:00",
    duration: 75,
    capacity: 15,
    spotsAvailable: 5,
    displaySpots: 2,
    surgePrice: 35,
    instructor: "Omar",
    type: "academy",
    classLevel: "academy",
    description: "Dive deep into the art of boxing with Night Ring Drills, where you'll master footwork, defensive maneuvers, and offensive combinations under the watchful eye of Coach Omar. This session is designed for aspiring boxers looking to refine their technique, improve reaction times, and develop the strategic mindset of a true ring tactician. Experience the rush of simulated sparring in a controlled setting that builds confidence and skill."
  },
  {
    id: "s3",
    name: "Technique & Flow",
    day: "Tuesday",
    time: "19:30:00",
    duration: 45,
    capacity: 18,
    spotsAvailable: 6,
    displaySpots: 1,
    instructor: "Raul",
    type: "technique",
    classLevel: "technique",
    description: "Elevate your boxing prowess in Technique & Flow, a focused class emphasizing fluid movement, precise punching sequences, and rhythm development. Raul's decades of experience shine through as he breaks down complex combinations into achievable steps, helping you achieve seamless transitions between offense and defense. Ideal for intermediate fighters aiming to add grace and efficiency to their powerful strikes."
  },
  {
    id: "s4",
    name: "Beginner Basics",
    day: "Wednesday",
    time: "10:00:00",
    duration: 60,
    capacity: 25,
    spotsAvailable: 12,
    instructor: "Elena",
    type: "beginner",
    description: "Step into the world of boxing with Beginner Basics, where you'll learn fundamental stances, punches, and defensive techniques in a welcoming, no-pressure atmosphere. Elena's patient instruction ensures newcomers build a solid foundation while gaining confidence and fitness. This class is your gateway to the exhilarating sport of boxing, fostering discipline, coordination, and self-assurance from day one."
  },
  {
    id: "s5",
    name: "Sparring Session",
    day: "Thursday",
    time: "17:00:00",
    duration: 90,
    capacity: 10,
    spotsAvailable: 4,
    surgePrice: 25,
    instructor: "Omar",
    type: "sparring",
    description: "Test your mettle in our intense Sparring Session, a controlled environment for applying learned skills against live opponents. Under Omar's supervision, you'll practice timing, distance management, and adaptive strategies, all while prioritizing safety with proper gear and rules. This advanced class sharpens your instincts, builds resilience, and prepares you for real-world competition."
  },
  // Add more to fill a week...
  {
    id: "s6",
    name: "Youth Warriors",
    day: "Friday",
    time: "16:00:00",
    duration: 45,
    capacity: 15,
    spotsAvailable: 7,
    instructor: "Raul",
    type: "youth",
    description: "Empower the next generation in Youth Warriors, a fun yet disciplined class for young boxers aged 8-16. Raul focuses on building character, coordination, and basic boxing skills through engaging drills and games. This session instills values of respect, perseverance, and healthy competition, helping kids develop physical fitness and mental toughness in a positive setting."
  },
  {
    id: "s7",
    name: "Advanced Assault",
    day: "Saturday",
    time: "11:00:00",
    duration: 75,
    capacity: 12,
    spotsAvailable: 3,
    surgePrice: 40,
    instructor: "Elena",
    type: "advanced",
    description: "Push beyond your limits in Advanced Assault, an elite training regimen featuring complex combinations, high-intensity intervals, and strategic fight simulations. Elena's championship-level coaching refines your technique, enhances power output, and cultivates the mental edge needed for victory. Reserved for experienced boxers ready to dominate the ring."
  },
  {
    id: "s8",
    name: "Intermediate Impact",
    day: "Sunday",
    time: "14:00:00",
    duration: 60,
    capacity: 20,
    spotsAvailable: 9,
    instructor: "Omar",
    type: "intermediate",
    description: "Bridge the gap to greatness in Intermediate Impact, where you'll advance from basics to sophisticated boxing strategies. Omar's dynamic drills focus on speed, power, and tactical awareness, helping you integrate footwork with powerful strikes. This class accelerates your progress, building the confidence and skills to excel in sparring and beyond."
  },
];

// Hardcoded user bookings (for demo, persisted locally)
const HARDCODED_USER_BOOKINGS: Booking[] = []; // Start empty, manage with state

// LocalStorage helpers (from second)
const saveToLS = (k: string, v: any) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {
    console.warn("saveToLS failed", e);
  }
};
const loadFromLS = <T,>(k: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

// Analytics stub (from second)
const analyticsTrack = (event: string, meta: any = {}) => {
  try {
    const logs = loadFromLS<any[]>("analytics", []);
    logs.unshift({ event, meta, time: new Date().toISOString() });
    saveToLS("analytics", logs.slice(0, 200));
  } catch {}
};

// Visual/UX helpers (from second)
const triggerConfetti = () => {
  try {
    const c = document.createElement("canvas");
    document.body.appendChild(c);
    const launcher = confetti.create(c, { resize: true });
    launcher({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => {
      try {
        document.body.removeChild(c);
      } catch {}
    }, 3500);
  } catch {}
};
const scheduleBrowserNotification = (
  title: string,
  opts: NotificationOptions & { delayMs?: number } = {}
) => {
  const delay = opts.delayMs || 0;
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    setTimeout(() => new Notification(title, opts), delay);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((p) => {
      if (p === "granted") setTimeout(() => new Notification(title, opts), delay);
    });
  }
};

// Fake payment processor (from second)
const fakePaymentProcess = async (card: {
  number: string;
  expiry: string;
  cvv: string;
}): Promise<PaymentResult> => {
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 500));
  const num = (card.number || "").replace(/\s/g, "");
  if (num.length < 12) {
    throw new Error("Card declined - invalid number");
  }
  return {
    id: `charge_${Date.now()}`,
    status: "succeeded",
    receipt: `RECEIPT-${Date.now()}`,
  };
};

// Small UI atoms (inline styled) (from second, enhanced)
const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    color: "#111827",
  } as React.CSSProperties,
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    padding: '0 16px',
  } as React.CSSProperties,
  card: {
    padding: 12,
    borderRadius: 8,
    background: "#fff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  } as React.CSSProperties,
  bookBtn: {
    marginTop: 6,
    padding: "6px 10px",
    background: "#dc2626",
    color: "#fff",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
  } as React.CSSProperties,
  muted: { color: "#6b7280", fontSize: 13 } as React.CSSProperties,
  surge: { color: "#b45309", fontSize: 13, fontWeight: 600 } as React.CSSProperties,
  gridTwoColumn: { display: "grid", gridTemplateColumns: "1fr 320px", gap: 12, padding: '0 16px' } as React.CSSProperties,
  scheduleList: { display: "grid", gap: 8 } as React.CSSProperties,
  scheduleItem: { borderBottom: "1px solid #eee", padding: "10px 0", display: "flex", justifyContent: "space-between" } as React.CSSProperties,
  rightColCompact: { textAlign: "right" } as React.CSSProperties,
  modalBackdrop: { position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", zIndex: 9999 } as React.CSSProperties,
  modalInner: { width: 420, background: "#fff", borderRadius: 8, padding: 16 } as React.CSSProperties,
};

// Format time (from second)
const formatTime = (day: string, time: string) => {
  try {
    const iso = `${day}T${time}`;
    return formatInTimeZone(new Date(iso), "America/Los_Angeles", "EEE, MMM d • h:mm aa");
  } catch {
    return `${day} ${time}`;
  }
};

// FightTicker (from second, with optimized copy)
const FightTicker: React.FC = React.memo(() => {
  const items = [
    "Unleash Your Potential: Join Our Elite Boxing Sessions Today",
    "Transform Body and Mind: Experience the Power of 3rd Street Boxing",
    "From Novice to Champion: Our Proven Training Path Awaits You",
    "Build Strength, Speed, and Strategy in Every Class",
    "Join the Ranks of SF's Top Fighters – Book Now",
  ];
  return (
    <div style={{ overflow: "hidden", whiteSpace: "nowrap", background: "#f8fafc", padding: "6px 8px", borderRadius: 6 }}>
      <div style={{ display: "inline-block", animation: "ticker 25s linear infinite" }}>{items.join(" • ")}</div>
      <style>{`@keyframes ticker { 0% { transform: translateX(100%);} 100% { transform: translateX(-100%);} }`}</style>
    </div>
  );
});
FightTicker.displayName = "FightTicker";

// FlashSaleCard (from second, with detailed copy)
const FlashSaleCard: React.FC = React.memo(() => {
  const [endsAt] = useState<Date>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    return d;
  });
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, Math.floor((endsAt.getTime() - now.getTime()) / 1000));
  const mm = Math.floor(diff / 60);
  const ss = diff % 60;
  return (
    <div style={{ padding: 12, borderRadius: 8, background: "#111827", color: "#fff" }}>
      <div style={{ fontWeight: 700 }}>Exclusive Flash Sale – Limited Time Only!</div>
      <div>Secure a Premium Training Pass at 50% off and unlock unlimited access to our world-class boxing sessions, personalized coaching plans, and exclusive member events. This is your opportunity to commit to transformation with unparalleled value.</div>
      <div style={{ fontSize: 20, marginTop: 6 }}>{mm}:{String(ss).padStart(2, "0")}</div>
    </div>
  );
});
FlashSaleCard.displayName = "FlashSaleCard";

// ScheduleList (from second, merged with first's card rendering)
const ScheduleList: React.FC<{
  schedule: ClassSchedule[];
  onBook: (slot: ClassSchedule) => void;
  classTypeColors: Record<ClassSchedule['type'], string>;
  isClassBooked: (classId: string, date: string) => boolean;
  selectedDate: Date;
}> = React.memo(({ schedule, onBook, classTypeColors, isClassBooked, selectedDate }) => {
  return (
    <div style={{ ...styles.card }}>
      <h3 style={{ marginTop: 0 }}>Weekly Training Arsenal</h3>
      <div style={styles.scheduleList}>
        {schedule.map((s) => {
          const dateString = selectedDate.toISOString().split('T')[0]; // Adapt to weekly view
          const isBooked = isClassBooked(s.id, dateString);
          const classTypeColor = classTypeColors[s.type] || classTypeColors.beginner;
          return (
            <div key={s.id} style={styles.scheduleItem}>
              <div style={{ maxWidth: "70%" }}>
                <div style={{ fontWeight: 700 }}>{s.name}</div>
                <div style={styles.muted}>
                  {s.instructor} • {s.duration} minutes • {s.description}
                </div>
                {s.surgePrice ? <div style={styles.surge}>Elite Surcharge: +${s.surgePrice} for Premium Intensity</div> : null}
                <Badge variant="outline" className={`text-xs ${classTypeColor}`}>
                  {s.type.charAt(0).toUpperCase() + s.type.slice(1)}
                </Badge>
              </div>
              <div style={styles.rightColCompact}>
                <div style={{ fontSize: 14 }}>{formatTime(s.day, s.time)}</div>
                <div style={styles.muted}>{s.displaySpots ?? s.spotsAvailable} elite spots remaining</div>
                {isBooked ? (
                  <div className="flex items-center text-green-600 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Secured
                  </div>
                ) : (
                  <button style={styles.bookBtn} onClick={() => onBook(s)}>
                    Secure Spot
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
ScheduleList.displayName = "ScheduleList";

// Main component (merged)
function SchedulePageComponent({ onNavigate, currentUser }: SchedulePageProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState<'all' | ClassSchedule['type']>('all');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassSchedule | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSlotForPayment, setSelectedSlotForPayment] = useState<ClassSchedule | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(() => loadFromLS<Booking[]>("bookings", HARDCODED_USER_BOOKINGS));
  const [payments, setPayments] = useState<PaymentResult[]>(() => loadFromLS<PaymentResult[]>("payments", []));
  const [schedules] = useState<ClassSchedule[]>(HARDCODED_SCHEDULE);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false); // Simulate loading if needed
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);

  // Persist to LS
  useEffect(() => {
    saveToLS("bookings", bookings);
  }, [bookings]);
  useEffect(() => {
    saveToLS("payments", payments);
  }, [payments]);

  // Analytics page load
  useEffect(() => {
    analyticsTrack("schedule_page_loaded", { count: schedules.length });
  }, [schedules]);

  // Date handling (from first)
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
    return bookings.some(booking =>
      booking.classId === classId &&
      booking.classDate.split('T')[0] === date &&
      booking.status === 'confirmed'
    );
  };

  // Booking handlers (merged)
  const bookingLockRef = useRef<Record<string, boolean>>({});
  const confirmBooking = useCallback(
    (classData: ClassSchedule, receiptId?: string | null) => {
      if (bookingLockRef.current[classData.id]) return;
      bookingLockRef.current[classData.id] = true;
      try {
        const b: Booking = {
          id: `b${Date.now()}`,
          classId: classData.id,
          classDate: selectedDate.toISOString().split('T')[0],
          classTime: classData.time,
          status: 'confirmed',
          slotId: classData.id,
          created_at: new Date().toISOString(),
          receiptId: receiptId ?? null,
        };
        setBookings((prev) => [b, ...prev].slice(0, 200));
        triggerConfetti();
        scheduleBrowserNotification("Spot Secured", {
          body: `You've locked in ${classData.name} – prepare to dominate the ring on ${formatTime(classData.day, classData.time)}. Stay sharp!`,
          delayMs: 600,
        });
        analyticsTrack("booking_confirmed", { classId: classData.id, receiptId });
        toast.success(`Elite spot secured for ${classData.name}! Gear up for an unforgettable training experience that will forge your body and sharpen your mind.`);
        setIsBookingModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
      } catch (e) {
        console.error("confirmBooking error", e);
        toast.error('Failed to secure spot. Please retry your conquest.');
      } finally {
        setTimeout(() => {
          bookingLockRef.current[classData.id] = false;
        }, 1500);
      }
    },
    [selectedDate]
  );

  const handleBookClass = (classData: ClassSchedule & { date: string }) => {
    analyticsTrack("booking_attempt", { classId: classData.id });
    const spotsLeft = classData.displaySpots ?? classData.spotsAvailable;
    if (spotsLeft <= 0) {
      toast.error("This elite session is fully claimed. Check back for openings or explore other classes to continue your journey.");
      analyticsTrack("booking_failed_full", { classId: classData.id });
      return;
    }
    if (!currentUser?.accessToken) {
      toast.error('Authenticate to claim your spot in the ring and join the ranks of champions.');
      onNavigate?.('login');
      return;
    }
    if (classData.surgePrice && classData.surgePrice > 0) {
      setSelectedSlotForPayment(classData);
      setShowPaymentModal(true);
      analyticsTrack("booking_requires_payment", { classId: classData.id, amount: classData.surgePrice });
    } else {
      setSelectedClass(classData);
      setIsBookingModalOpen(true);
    }
  };

  const bookClassMutation = useMutation({
    mutationFn: (classData: ClassSchedule & { date: string }) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(classData), 500); // Simulate
      });
    },
    onSuccess: (classData) => {
      confirmBooking(classData);
    },
    onError: (error: APIError) => {
      toast.error(error.message || 'Failed to book class. Please try again.');
    }
  });

  const handlePaymentSubmit = useCallback(
    async (card: { number: string; expiry: string; cvv: string }) => {
      if (!selectedSlotForPayment) return;
      setPaymentLoading(true);
      setPaymentError(null);
      analyticsTrack("payment_started", { slotId: selectedSlotForPayment.id });
      try {
        const res = await fakePaymentProcess(card);
        setPayments((p) => [res, ...p].slice(0, 200));
        confirmBooking(selectedSlotForPayment, res.receipt);
        setShowPaymentModal(false);
        setSelectedSlotForPayment(null);
        analyticsTrack("payment_succeeded", { slotId: selectedSlotForPayment.id, receipt: res.receipt });
      } catch (err: any) {
        const msg = err?.message || "Payment processing encountered an issue – please verify details and retry.";
        setPaymentError(msg);
        analyticsTrack("payment_failed", { slotId: selectedSlotForPayment.id, error: msg });
      } finally {
        setPaymentLoading(false);
      }
    },
    [confirmBooking, selectedSlotForPayment]
  );

  const cancelPayment = useCallback(() => {
    setShowPaymentModal(false);
    setSelectedSlotForPayment(null);
    setPaymentError(null);
    analyticsTrack("payment_cancelled", {});
  }, []);

  const bookedSlotIds = useMemo(() => new Set(bookings.map((b) => b.slotId)), [bookings]);

  const classTypeColors = {
    beginner: 'bg-blue-100 text-blue-800 border-blue-200',
    intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    advanced: 'bg-red-100 text-red-800 border-red-200',
    youth: 'bg-green-100 text-green-800 border-green-200',
    sparring: 'bg-purple-100 text-purple-800 border-purple-200',
    bootcamp: 'bg-orange-100 text-orange-800 border-orange-200',
    academy: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    technique: 'bg-teal-100 text-teal-800 border-teal-200',
  };

  const filterOptions = [
    { value: 'all', label: 'All Training Disciplines' },
    { value: 'beginner', label: 'Beginner Foundations' },
    { value: 'intermediate', label: 'Intermediate Mastery' },
    { value: 'advanced', label: 'Advanced Domination' },
    { value: 'youth', label: 'Youth Empowerment' },
    { value: 'sparring', label: 'Sparring Intensity' },
    { value: 'bootcamp', label: 'Bootcamp Explosion' },
    { value: 'academy', label: 'Academy Excellence' },
    { value: 'technique', label: 'Technique Refinement' },
  ] as const;

  // Payment form refs
  const cardNumberRef = useRef<HTMLInputElement | null>(null);
  const expRef = useRef<HTMLInputElement | null>(null);
  const cvvRef = useRef<HTMLInputElement | null>(null);

  if (isScheduleLoading || isBookingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Preparing your ultimate training lineup...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div style={styles.page}>
        {/* Hero Section (optimized copy) */}
        <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                UNLEASH THE <span className="text-accent">WARRIOR WITHIN</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                At 3rd Street Boxing, we don't just teach punches – we forge champions. Our meticulously crafted schedule offers a diverse array of classes designed to challenge your body, sharpen your mind, and ignite your spirit. From heart-pounding bootcamps that build unbreakable endurance to precision technique sessions that hone your skills to razor-sharp perfection, every class is an opportunity to transcend your limits. Join San Francisco's premier boxing community and experience training that transforms novices into contenders and contenders into legends. Book your session now and step into the ring where greatness is born.
              </p>
              {!currentUser?.accessToken && (
                <Alert className="bg-white/10 border-white/20 text-white max-w-md mx-auto">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Authenticate to reserve your place among the elite and track your path to boxing supremacy.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </section>

        {/* Schedule Controls (from first) */}
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
                  Previous Training Cycle
                </Button>
                <div className="text-center">
                  <p className="font-semibold text-lg text-gray-900">
                    Training Week Commencing {selectedDate.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      timeZone: 'America/Los_Angeles'
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedDate.getFullYear()} – Your Year of Conquest
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('next')}
                  className="flex items-center"
                >
                  Next Training Cycle
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

        {/* Weekly Schedule Grid (from first, integrated with ScheduleList) */}
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
                          {dayName} – Day of Triumph
                        </div>
                        <div className={`text-xl font-bold ${isToday ? 'text-primary' : 'text-gray-900'}`}>
                          {date.getDate()}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {dayClasses.length > 0 ? (
                        <ScheduleList
                          schedule={dayClasses}
                          onBook={(classItem) => handleBookClass({ ...classItem, date: dateString })}
                          classTypeColors={classTypeColors}
                          isClassBooked={isClassBooked}
                          selectedDate={date}
                        />
                      ) : (
                        <div className="text-center text-gray-400 py-4">
                          <p className="text-sm">Recovery day – recharge for tomorrow's battles</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Your Bookings (from first, enhanced) */}
        {currentUser?.accessToken && bookings.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                Your Conquered Territories: Upcoming Battles
              </h2>
              <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
                Review your secured sessions below. Each booking represents a step closer to boxing mastery. Remember, consistency is the key to unlocking your full potential – show up, push hard, and watch your transformation unfold.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {bookings.filter(booking => booking.status === 'confirmed').map((booking) => {
                  const classItem = schedules.find(s => s.id === booking.classId);
                  return (
                    <Card key={booking.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {classItem?.name || 'Elite Session'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Led by {classItem?.instructor} – Your Guide to Victory
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Territory Secured
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
                            {booking.classTime} – Time to Dominate
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            3rd Street Boxing Gym – Your Arena of Glory
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Booking Confirmation Modal (from first) */}
        <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-primary">
                Confirm Your Path to Greatness
              </DialogTitle>
              <DialogDescription>
                Review the details of this transformative session before securing your spot in boxing history.
              </DialogDescription>
            </DialogHeader>
            {selectedClass && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-2">
                    {selectedClass.name} – Your Next Conquest
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
                      {selectedClass.time} ({selectedClass.duration} minutes of intense evolution)
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Guided by {selectedClass.instructor} – Master of the Ring
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      3rd Street Boxing Gym - Epicenter of Champions
                    </div>
                  </div>
                  <p className="mt-4 text-sm">{selectedClass.description}</p>
                </div>
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                  <p className="text-sm text-accent-foreground">
                    <strong>New to the Fight?</strong> Enjoy 50% off your inaugural session as we welcome you to the brotherhood of boxers. Arrive prepared with water, towel, and an unbreakable will – we're about to redefine your limits.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="flex-1"
                    disabled={bookClassMutation.isLoading}
                  >
                    Reconsider
                  </Button>
                  <Button
                    onClick={() => selectedClass && bookClassMutation.mutate({ ...selectedClass, date: selectedClass.date || '' })}
                    disabled={bookClassMutation.isLoading || !selectedClass}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {bookClassMutation.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Claim Victory
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Payment Modal (from second) */}
        {showPaymentModal && selectedSlotForPayment && (
          <div style={styles.modalBackdrop}>
            <div style={styles.modalInner}>
              <h3 style={{ marginTop: 0 }}>Secure Your Elite Access</h3>
              <div style={styles.muted}>Claiming premium spot in <strong>{selectedSlotForPayment.name}</strong>. Investment: ${selectedSlotForPayment.surgePrice} for unparalleled intensity and results.</div>
              <p style={{ marginTop: 8, fontSize: 14 }}>This surcharge ensures access to our most sought-after sessions, complete with advanced equipment and personalized feedback to accelerate your progress.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPaymentError(null);
                  const form = e.target as any;
                  const card = {
                    number: form.cardnumber?.value ?? cardNumberRef.current?.value ?? "",
                    expiry: form.exp?.value ?? expRef.current?.value ?? "",
                    cvv: form.cvv?.value ?? cvvRef.current?.value ?? "",
                  };
                  void handlePaymentSubmit(card);
                }}
                style={{ marginTop: 12 }}
              >
                <div style={{ marginTop: 8 }}>
                  <input
                    name="cardnumber"
                    ref={cardNumberRef}
                    placeholder="Card Number (e.g., 4242 4242 4242 4242)"
                    style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }}
                  />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <input
                    name="exp"
                    ref={expRef}
                    placeholder="MM/YY"
                    style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }}
                  />
                  <input
                    name="cvv"
                    ref={cvvRef}
                    placeholder="CVV"
                    style={{ width: 110, padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }}
                  />
                </div>
                {paymentError && <div style={{ color: "#b91c1c", marginTop: 8 }}>{paymentError}</div>}
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button
                    type="submit"
                    disabled={paymentLoading}
                    style={{
                      padding: 8,
                      background: paymentLoading ? "#9ca3af" : "#10b981",
                      color: "#fff",
                      borderRadius: 6,
                      border: "none",
                      cursor: paymentLoading ? "default" : "pointer",
                      flex: 1,
                    }}
                  >
                    {paymentLoading ? "Securing..." : `Invest $${selectedSlotForPayment.surgePrice}`}
                  </button>
                  <button
                    type="button"
                    onClick={cancelPayment}
                    style={{
                      padding: 8,
                      borderRadius: 6,
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      cursor: "pointer",
                      flex: 1,
                    }}
                  >
                    Reconsider
                  </button>
                </div>
              </form>
              <div style={{ marginTop: 12 }}>
                <small style={styles.muted}>Your investment fuels your journey to boxing excellence.</small>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar elements (from second) */}
        <aside style={{ marginTop: 20, padding: '0 16px' }}>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={styles.card}>
              <div style={{ fontWeight: 700 }}>Why Choose 3rd Street Boxing?</div>
              <div style={styles.muted}>Immerse yourself in high-intensity coaching, a vibrant community of fighters, and authentic ring practice that builds not just physical strength but mental resilience. Our programs are crafted to deliver measurable results, from increased power and speed to strategic acumen that extends beyond the gym.</div>
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() => {
                    analyticsTrack("cta_buy_pass", {});
                    toast.info("Premium Pass: Unlock unlimited sessions and VIP perks – contact us to elevate your training.");
                  }}
                  style={{ padding: "8px 12px", background: "#111827", color: "#fff", borderRadius: 6, border: "none", cursor: "pointer" }}
                >
                  Acquire Premium Pass
                </button>
              </div>
            </div>
            <div style={styles.card}>
              <div style={{ fontWeight: 700 }}>Community Impact</div>
              <div style={{ fontSize: 28, color: "#dc2626", marginTop: 6 }}>{getSocialCount().toLocaleString()}</div>
              <div style={styles.muted}>Warriors training this week – join the movement reshaping San Francisco's fitness landscape</div>
            </div>
            <div style={styles.card}>
              <div style={{ fontWeight: 700 }}>Strategic Actions</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  onClick={() => {
                    scheduleBrowserNotification("Training Alert", { body: "Your session approaches – prepare to conquer (reminder set).", delayMs: 5000 });
                    analyticsTrack("scheduled_notification", {});
                  }}
                  style={{ padding: "8px 12px", borderRadius: 6, border: "none", background: "#06b6d4", color: "#fff", cursor: "pointer" }}
                >
                  Set Battle Reminder
                </button>
                <button
                  onClick={() => {
                    const t = generateSyntheticTestimonial();
                    toast.info(`Warrior Testimony: "${t.quote}" – ${t.name}`);
                    analyticsTrack("testimonial_generated", {});
                  }}
                  style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #eee", cursor: "pointer" }}
                >
                  Inspire with Testimony
                </button>
              </div>
            </div>
            <FlashSaleCard />
          </div>
        </aside>

        {/* Bottom CTA (from first, optimized) */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Questions on Forging Your Legacy?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Our seasoned team of boxing experts is ready to guide you through our comprehensive programs, helping you select the ideal classes to align with your fitness goals, skill level, and aspirations. Whether you're aiming for competitive glory or personal empowerment, we're here to craft your perfect training strategy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => onNavigate?.('contact')}
                className="bg-accent hover:bg-accent/90 text-black font-bold px-8 py-4"
              >
                Consult the Masters
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate?.('classes')}
                className="border-white text-white hover:bg-white hover:text-primary px-8 py-4"
              >
                Explore Training Arsenal
              </Button>
            </div>
          </div>
        </section>

        {/* Header with Ticker (from second) */}
        <header style={styles.headerRow}>
          <div>
            <h1 style={{ margin: 0 }}>3rd Street Boxing – Command Your Schedule</h1>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Claim your arena – spots are limited for those ready to rise</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 13, color: "#6b7280" }}>{bookings.length} territories claimed</div>
            <div style={{ width: 320 }}>
              <FightTicker />
            </div>
          </div>
        </header>
      </div>
    </ErrorBoundary>
  );
}

// Wrap with QueryClientProvider (from first)
export default function SchedulePage(props: SchedulePageProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SchedulePageComponent {...props} />
    </QueryClientProvider>
  );
}

// Small helpers (from second)
function generateSyntheticTestimonial() {
  const templates = [
    "Training at 3rd Street has revolutionized my fitness – {trainer}'s expertise turned me into a force to be reckoned with.",
    "Shed {n} lbs while gaining unbreakable confidence in just {months} months of dedicated sessions.",
    "The camaraderie and coaching here are unmatched. {trainer} ignites the champion in everyone.",
  ];
  const t = templates[Math.floor(Math.random() * templates.length)];
  const filled = t
    .replace("{trainer}", ["Raúl", "Omar", "Elena"][Math.floor(Math.random() * 3)])
    .replace("{n}", String(10 + Math.floor(Math.random() * 20)))
    .replace("{months}", String(3 + Math.floor(Math.random() * 9)));
  return {
    id: `gen-${Date.now()}`,
    name: ["Alex P.", "Jordan S.", "Taylor R."][Math.floor(Math.random() * 3)],
    quote: filled,
    rating: 5,
  } as { id: string; name: string; quote: string; rating: number };
}

function getSocialCount() {
  const base = 1243;
  const drift = Math.floor(Math.sin(Date.now() / (1000 * 60 * 60)) * 20);
  return base + drift + Math.floor(Math.random() * 30);
}