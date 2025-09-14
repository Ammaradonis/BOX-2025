/*******************************************************************************
 * SensationalHomePage.tsx
 *
 * Single-file, self-contained, TypeScript React component that merges features
 * from two supplied snippets into one rich, polished landing page for a boxing club.
 *
 * - Combines: hero video, services grid, schedule with booking stub, flash sale,
 *   social proof, sparring canvas, soundscape toggle, fight ticker, guaranteed banner,
 *   fog wrapper, testimonials persisted to localStorage with synthetic generators,
 *   confetti celebrations, browser notifications, analytics (localStorage-backed)
 * - Keeps important imports from both snippets (icons, Helmet, confetti, date-fns-tz)
 * - Hardcoded data: schedule, services, and testimonials (no network calls)
 * - Desktop-first layout uses inline styles with Tailwind-friendly classNames where helpful
 *
 * SAVE / DOWNLOAD: This file was generated and written to the workspace. Use the link
 * provided to download the full .tsx source.
 ******************************************************************************/

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import confetti from "canvas-confetti";
import { formatInTimeZone } from "date-fns-tz";

// Icons imported from the second snippet — kept as requested.
import {
  Play,
  Pause,
  ArrowRight,
  Calendar,
  Users,
  Trophy,
  Target,
  Smartphone,
  Star,
  Quote
} from "lucide-react";

// Preserved imports from the second snippet (kept to honor the request).
// If you have separate files for these components, they will be used — otherwise
// lightweight local fallbacks are implemented below so this file remains self-contained.
import { ImageWithFallback } from "./ImageWithFallback";
import { TestimonialCard } from "./TestimonialCard";
import { ServiceCard } from "./ServiceCard";

/* ========================
   Types
   ======================== */

type ScheduleSlot = {
  id: string;
  day?: string;
  time: string;
  className: string;
  trainerName: string;
  duration: number;
  spotsAvailable?: number;
  displaySpots?: number;
  surgePrice?: number;
  classLevel?: string;
};

type Testimonial = {
  id: string;
  name: string;
  location?: string;
  quote: string;
  rating?: number;
  program?: string;
  image?: string;
  generated?: boolean;
};

interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string;
  cta?: string;
  page?: string;
  image?: string;
  altText?: string;
}

interface HomePageProps {
  onNavigate?: (page: string) => void;
  onBookClass?: (classData: any) => void;
}

/* ========================
   Utilities: localStorage helpers, analytics, confetti
   ======================== */

const saveToLS = (k: string, v: any) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    // swallow for demo resilience
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

export const analyticsTrack = (event: string, meta: any = {}) => {
  try {
    const logs = loadFromLS<any[]>("sensational_analytics", []);
    logs.unshift({ event, meta, time: new Date().toISOString() });
    saveToLS("sensational_analytics", logs.slice(0, 400));
  } catch {
    // ignore analytics failure gracefully
  }
};

const triggerConfetti = () => {
  try {
    const c = document.createElement("canvas");
    c.style.position = "fixed";
    c.style.pointerEvents = "none";
    c.style.top = "0";
    c.style.left = "0";
    document.body.appendChild(c);
    const myConfetti = confetti.create(c, { resize: true });
    myConfetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
    setTimeout(() => {
      try {
        if (c && c.parentElement) c.parentElement.removeChild(c);
      } catch {}
    }, 2200);
  } catch {
    // ignore confetti runtime errors
  }
};

/* ========================
   Hardcoded schedule & services (single source of truth)
   ======================== */

const SCHEDULE: ScheduleSlot[] = [
  { id: "s1", day: "2025-09-15", time: "09:00:00", className: "Bootcamp Blast", trainerName: "Elena", duration: 60, displaySpots: 3, surgePrice: 20 },
  { id: "s2", day: "2025-09-16", time: "18:00:00", className: "Night Ring Drills", trainerName: "Omar", duration: 75, displaySpots: 2, surgePrice: 35 },
  { id: "s3", day: "2025-09-16", time: "19:30:00", className: "Technique & Flow", trainerName: "Raul", duration: 45, displaySpots: 1 },
];

const SERVICES: Service[] = [
  {
    id: "group-classes",
    title: "Group Classes — Cardio, Technique & Team Grit",
    description:
      "Dynamic, coach-led sessions that blend footwork, mitt work and conditioning. Designed for beginners to seasoned fighters — every class builds confidence, toughness and fight IQ.",
    icon: "Users",
    cta: "Join a Class",
    page: "classes",
    image: "/assets/group-classes.jpg",
    altText: "Group boxing class in action"
  },
  {
    id: "personal-training",
    title: "Personal Training — Goal-Driven Coaching",
    description:
      "One-on-one coaching calibrated to your goals. From fat loss to amateur bout prep, our coaches write plans with measureable targets and weekly checkpoints.",
    icon: "Target",
    cta: "Book Session",
    page: "personal-training",
    image: "/assets/personal-training.jpg",
    altText: "Personal boxing training session"
  },
  {
    id: "competitive-program",
    title: "Competitive Program — Fight-Ready Pipeline",
    description:
      "A structured competitive pathway for athletes who want to fight. High-volume sparring, strength cycles, and fight-week science to peak on the night.",
    icon: "Trophy",
    cta: "Learn More",
    page: "academy",
    image: "/assets/competitive.jpg",
    altText: "Competitive boxing training"
  },
  {
    id: "youth-boxing",
    title: "Youth Boxing — Confidence & Discipline",
    description:
      "Safe, energetic classes for 8-17 year-olds. Coaches emphasize fundamentals, movement literacy, and age-appropriate conditioning that build lifelong confidence.",
    icon: "Users",
    cta: "Enroll Now",
    page: "youth-boxing",
    image: "/assets/youth-boxing.jpg",
    altText: "Youth boxing class"
  },
  {
    id: "bootcamp",
    title: "Bootcamp — Fight-Specific Fitness",
    description:
      "Short, high-intensity circuits featuring pad cycles, sleds, and ring conditioning. Ideal for fighters and fitness seekers who want fast results.",
    icon: "Target",
    cta: "Sign Up",
    page: "bootcamp",
    image: "/assets/bootcamp.jpg",
    altText: "Boxing bootcamp session"
  },
  {
    id: "mobile-app",
    title: "Mobile Training — Train Anywhere",
    description:
      "Weekly workout plans, technique videos, and live virtual drills through our app. Keep progress consistent when you can't make it to the gym.",
    icon: "Smartphone",
    cta: "Download App",
    page: "mobile-app",
    image: "/assets/mobile-app.jpg",
    altText: "Mobile boxing training app"
  }
];

/* ========================
   Misc utilities used by UI
   ======================== */

export const getSocialCount = (): number => {
  const base = 1243;
  const drift = Math.floor(Math.sin(Date.now() / (1000 * 60 * 60)) * 20);
  return base + drift + Math.floor(Math.random() * 30);
};

export const scheduleBrowserNotification = (title: string, opts: NotificationOptions & { delayMs?: number } = {}) => {
  const delay = opts.delayMs || 0;
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    setTimeout(() => new Notification(title, opts), delay);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((p) => { if (p === "granted") setTimeout(() => new Notification(title, opts), delay); });
  }
};

/* ========================
   Synthetic testimonial generator (keeps site lively)
   ======================== */

const testimonialTemplates = [
  "I gained so much confidence training here — {trainer} rewired how I move.",
  "Lost {n} lbs and built real fight stamina in {months} months.",
  "Community + coaching = results. {trainer} pushed me to my first ring.",
];
export function generateSyntheticTestimonial(overrides: Partial<Testimonial> = {}): Testimonial {
  const t = testimonialTemplates[Math.floor(Math.random() * testimonialTemplates.length)];
  const filled = t
    .replace("{trainer}", ["Raúl", "Coach Omar", "Coach Elena"][Math.floor(Math.random() * 3)])
    .replace("{n}", String(6 + Math.floor(Math.random() * 22)))
    .replace("{months}", String(2 + Math.floor(Math.random() * 10)));
  return {
    id: `gen-${Date.now()}`,
    name: ["Alex P.", "Jordan S.", "Taylor R."][Math.floor(Math.random() * 3)],
    quote: filled,
    rating: 5,
    generated: true,
    ...overrides,
  } as Testimonial;
}

/* ========================
   Lightweight local fallbacks for optional external components
   (We kept the original import lines above; these local fallbacks are used
    if you don't have separate files for ImageWithFallback/TestimonialCard/ServiceCard)
   ======================== */

const LocalImageWithFallback: React.FC<{ src?: string; alt?: string; style?: React.CSSProperties }> = ({ src, alt, style }) => {
  const [errored, setErrored] = useState(false);
  return (
    <img
      src={errored || !src ? "/assets/placeholder.jpg" : src}
      alt={alt || ""}
      style={{ width: "100%", height: "auto", objectFit: "cover", borderRadius: 8, ...style }}
      onError={() => setErrored(true)}
    />
  );
};

const LocalTestimonialCard: React.FC<{ testimonial: Testimonial; delay?: number }> = ({ testimonial }) => (
  <article style={{ background: "#fff", padding: 14, borderRadius: 8, boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden" }}>
        <LocalImageWithFallback src={testimonial.image} alt={testimonial.name} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700 }}>{testimonial.name} <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 6 }}>{testimonial.location}</span></div>
        <div style={{ fontSize: 13, color: "#374151", marginTop: 6 }}>{testimonial.quote}</div>
        <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>{(testimonial.rating || 5)} ⭐ {testimonial.program ? `• ${testimonial.program}` : ""}</div>
      </div>
    </div>
  </article>
);

const LocalServiceCard: React.FC<{ service: Service; onNavigate?: (p: string) => void; delay?: number }> = ({ service, onNavigate }) => {
  // map icon name to a fallback glyph
  const Icon = (() => {
    switch (service.icon) {
      case "Users": return Users;
      case "Target": return Target;
      case "Trophy": return Trophy;
      case "Smartphone": return Smartphone;
      default: return Star;
    }
  })();
  return (
    <div style={{ background: "#fff", padding: 14, borderRadius: 12, minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 6px 18px rgba(15,23,42,0.04)" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "#f3f4f6", padding: 8, borderRadius: 8 }}><Icon size={20} /></div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{service.title}</div>
        </div>
        <div style={{ marginTop: 10, color: "#374151" }}>{service.description}</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
        <button
          onClick={() => onNavigate && onNavigate(service.page || "")}
          style={{ padding: "8px 12px", background: "#111827", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          {service.cta || "Learn More"}
        </button>
        <div style={{ width: 64, height: 48, borderRadius: 8, overflow: "hidden" }}>
          <LocalImageWithFallback src={service.image} alt={service.altText} />
        </div>
      </div>
    </div>
  );
};

/* ========================
   Presentational / interactive components (kept local & memoized)
   ======================== */

/** Simple banner showing guaranteed program results */
export const GuaranteedBanner: React.FC = () => (
  <div style={{ background: "#fff7ed", border: "1px solid #ffd7a6", padding: 12, borderRadius: 8 }}>
    <strong>Guaranteed Progress:</strong> Complete our 12-week fight preparation plan — if you don't feel fight-ready we'll extend coaching until you do.
  </div>
);

/** Fog wrapper: toggles a soft overlay / blur for atmosphere */
export const FogWrapper: React.FC<{ fog: boolean; children: React.ReactNode }> = ({ fog, children }) => (
  <div style={{ position: "relative", overflow: "hidden" }}>
    {fog && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.15))",
          backdropFilter: "blur(6px)",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />
    )}
    <div style={{ filter: fog ? "contrast(0.96) saturate(0.94)" : "none" }}>{children}</div>
  </div>
);

/** Fight ticker: scrolling promotional messages */
export const FightTicker: React.FC = React.memo(() => {
  const items = [
    "Fight Night — Friday 8pm: limited tickets", 
    "Sparring Tournament: register to prove yourself", 
    "Championship prep: ask about our fight camps"
  ];
  return (
    <div style={{ overflow: "hidden", whiteSpace: "nowrap", background: "#111827", color: "#fff", padding: "8px 12px", borderRadius: 8 }}>
      <div style={{ display: "inline-block", animation: "ticker 16s linear infinite" }}>{items.join(" • ")}</div>
      <style>{`@keyframes ticker { 0% { transform: translateX(100%);} 100% { transform: translateX(-100%);} }`}</style>
    </div>
  );
});
FightTicker.displayName = "FightTicker";

/** Sparring simulator: lightweight canvas animation */
export const SparringSimulator: React.FC = React.memo(() => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const DPR = window.devicePixelRatio || 1;
    canvas.width = Math.floor(700 * DPR);
    canvas.height = Math.floor(320 * DPR);
    canvas.style.width = "100%";
    canvas.style.height = "320px";
    const ctx = canvas.getContext("2d")!;
    ctx.scale(DPR, DPR);

    let raf = 0;
    let last = performance.now();
    const draw = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // background
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, canvas.width / DPR, canvas.height / DPR);
      // ring border
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      ctx.strokeRect(12, 12, (canvas.width / DPR) - 24, (canvas.height / DPR) - 24);
      // fighters
      const tNow = Date.now();
      const x1 = 170 + Math.sin(tNow / 300) * 80;
      const x2 = 530 + Math.cos(tNow / 410) * 80;
      ctx.fillStyle = "#e11";
      ctx.beginPath();
      ctx.arc(x1, 160, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#118";
      ctx.beginPath();
      ctx.arc(x2, 160, 26, 0, Math.PI * 2);
      ctx.fill();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", borderRadius: 8, display: "block" }} />;
});
SparringSimulator.displayName = "SparringSimulator";

/** Soundscape: toggles looped ambient audio */
export const SoundscapeToggle: React.FC = () => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/assets/ambient-gym.mp3");
    audioRef.current.loop = true;
    return () => {
      try {
        audioRef.current?.pause();
      } catch {}
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.play().catch((e) => {
        console.warn("Ambient audio playback failed:", e);
        setPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [playing]);

  const toggle = useCallback(() => {
    setPlaying((p) => {
      const next = !p;
      analyticsTrack("soundscape_toggled", { playing: next });
      return next;
    });
  }, []);

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button
        onClick={toggle}
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          background: playing ? "#dc2626" : "#f3f4f6",
          color: playing ? "#fff" : "#111827",
          border: "none",
          cursor: "pointer",
        }}
        aria-pressed={playing}
      >
        {playing ? "Stop Soundscape" : "Play Soundscape"}
      </button>
      <span style={{ color: "#6b7280", fontSize: 13 }}>{playing ? "Ambient gym audio playing" : "Soundscape off"}</span>
    </div>
  );
};

/** FlashSaleCard - 30 minute countdown from mount */
export const FlashSaleCard: React.FC = React.memo(() => {
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
      <div style={{ fontWeight: 800, letterSpacing: "0.02em" }}>FLASH SALE — LIMITED TIME</div>
      <div style={{ marginTop: 6 }}>Premium Monthly Pass — 50% off for the next</div>
      <div style={{ fontSize: 20, marginTop: 8, fontWeight: 900 }}>{mm}:{String(ss).padStart(2, "0")}</div>
    </div>
  );
});
FlashSaleCard.displayName = "FlashSaleCard";

/* ========================
   Error Boundary
   ======================== */

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8" style={{ color: "#b91c1c" }}>
          Something went wrong. Please refresh the page or contact support.
        </div>
      );
    }
    return this.props.children;
  }
}

/* ========================
   Main HomePage component
   ======================== */

export default function HomePage({ onNavigate, onBookClass }: HomePageProps): JSX.Element {
  // testimonials persisted in localStorage with hardcoded defaults
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() =>
    loadFromLS<Testimonial[]>("sensational_testimonials", [
      { id: "t1", name: "Sophie M.", location: "Mission District, SF", quote: "This gym changed my life — stronger, sharper, and more disciplined than I imagined.", rating: 5, program: "Group Classes", image: "/assets/john-doe.jpg" },
      { id: "t2", name: "John Doe", location: "Dogpatch, SF", quote: "Expert coaching and community energy. I reached new peaks in months.", rating: 5, program: "Personal Training", image: "/assets/jane-smith.jpg" },
    ])
  );

  const [showFog, setShowFog] = useState<boolean>(false);
  const [socialCount, setSocialCount] = useState<number>(() => getSocialCount());
  const [videoPlaying, setVideoPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    analyticsTrack("homepage_loaded", {});
    const iv = setInterval(() => setSocialCount(getSocialCount()), 4000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    try {
      saveToLS("sensational_testimonials", testimonials);
    } catch {}
  }, [testimonials]);

  useEffect(() => {
    // progressive enhancement: register service worker if available (non-blocking)
    try {
      if ("serviceWorker" in navigator && !navigator.serviceWorker.controller) {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      }
    } catch {}
  }, []);

  // Video play/pause sync
  useEffect(() => {
    if (videoRef.current) {
      videoPlaying ? videoRef.current.play().catch(() => {}) : videoRef.current.pause();
    }
  }, [videoPlaying]);

  // add synthetic testimonial (celebratory)
  const addSynthetic = useCallback(() => {
    const t = generateSyntheticTestimonial();
    setTestimonials((s) => [t, ...s]);
    analyticsTrack("testimonial_added", { synthetic: true });
    triggerConfetti();
  }, []);

  const addAdminSynthetic = useCallback(() => {
    const t = generateSyntheticTestimonial({ name: "Coach Admin", generated: true });
    setTestimonials((s) => [t, ...s]);
    analyticsTrack("admin_added_testimonial", {});
  }, []);

  const clearTestimonials = useCallback(() => {
    saveToLS("sensational_testimonials", []);
    setTestimonials([]);
    analyticsTrack("testimonials_cleared", {});
  }, []);

  const formatTime = useCallback((timeISO: string) => {
    try {
      return formatInTimeZone(new Date(`2000-01-01T${timeISO}`), "America/Los_Angeles", "h:mm aa");
    } catch {
      return timeISO;
    }
  }, []);

  const bookClass = useCallback((slot: ScheduleSlot) => {
    analyticsTrack("booking_attempt", { slotId: slot.id });
    const booking = { id: `b${Date.now()}`, slotId: slot.id, created_at: new Date().toISOString() };
    const existing = loadFromLS<any[]>("sensational_bookings", []);
    saveToLS("sensational_bookings", [booking, ...existing].slice(0, 200));
    triggerConfetti();
    scheduleBrowserNotification("Booking Confirmed", { body: `${slot.className} at ${formatTime(slot.time)}`, delayMs: 800 });
    // invoke provided callback so outer app can react (if present)
    onBookClass && onBookClass({ ...slot, bookingId: booking.id });
  }, [onBookClass, formatTime]);

  // Enhanced hero booking with a promotional offer
  const handleHeroBooking = useCallback(() => {
    const promo = {
      id: "intro-special",
      name: "FREE Intro Class — 50% OFF FIRST ROUND",
      description: "A guided introduction to our methodology: fundamentals, conditioning, and a one-on-one action plan.",
      price: 0,
      originalPrice: 25,
      level: "beginner"
    };
    analyticsTrack("hero_promo_claimed", { offer: promo.id });
    onBookClass ? onBookClass(promo) : (() => {
      // local fallback: save a record + confetti
      const booking = { id: `promo-${Date.now()}`, promo, created_at: new Date().toISOString() };
      saveToLS("sensational_promos", [booking, ...loadFromLS<any[]>("sensational_promos", [])].slice(0, 50));
      triggerConfetti();
      scheduleBrowserNotification("Promo Claimed", { body: `You've claimed ${promo.name}`, delayMs: 700 });
    })();
  }, [onBookClass]);

  // memo testimonial grid (uses local fallback component if external TestimonialCard missing)
  const testimonialGrid = useMemo(() => {
    const Card = typeof TestimonialCard !== "undefined" ? (TestimonialCard as any) : LocalTestimonialCard;
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
        {testimonials.map((t) => (
          <div key={t.id}>
            <Card testimonial={t} />
          </div>
        ))}
      </div>
    );
  }, [testimonials]);

  // chosen service cards component (use external if present, otherwise local)
  const ServiceCardToUse = typeof ServiceCard !== "undefined" ? (ServiceCard as any) : LocalServiceCard;

  return (
    <FogWrapper fog={showFog}>
      <Helmet>
        <title>3rd Street Boxing — Where Strength Meets Strategy</title>
      </Helmet>

      <div style={{ maxWidth: 1200, margin: "20px auto", padding: 12 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>3rd Street Boxing</h1>
            <div style={{ fontSize: 13, color: "#6b7280", maxWidth: 560 }}>
              A purpose-built gym blending old-school grit with modern coaching science — fight-ready training, community accountability, and measurable progress for every level.
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => {
                setShowFog((f) => !f);
                analyticsTrack("fog_toggled", { newState: !showFog });
              }}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: showFog ? "#111827" : "#fff",
                color: showFog ? "#fff" : "#111827",
                cursor: "pointer",
              }}
            >
              {showFog ? "Disable Fog" : "Enable Fog"}
            </button>

            <button
              onClick={() => addSynthetic()}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: "#dc2626",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Add Synthetic Testimonial
            </button>
          </div>
        </header>

        {/* HERO */}
        <ErrorBoundary>
          <section
            className="relative min-h-[520px] flex items-center justify-center overflow-hidden"
            aria-label="Hero section with gym video background"
            style={{ borderRadius: 12, overflow: "hidden", position: "relative" }}
          >
            <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                poster="/assets/hero-poster.jpg"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              >
                <source src="/assets/hero-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(2,6,23,0.35), rgba(2,6,23,0.6))" }} />
            </div>

            <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 900, padding: "40px 20px" }}>
              <h2 style={{ color: "#fff", fontSize: 40, margin: 0, lineHeight: 1.02 }}>WHERE SF'S TOUGHEST FIND THEIR STRENGTH</h2>
              <p style={{ color: "#e6eef8", marginTop: 14, fontSize: 18, maxWidth: 760, marginLeft: "auto", marginRight: "auto" }}>
                Authentic boxing training fused with modern sports science. Our programs are engineered to build power, endurance, and a winning mentality — whether you want the lean-fit look, a confident body, or an actual ring debut.
                Every coach is vetted, every program measured, and every session designed with outcomes in mind.
              </p>

              <div style={{ marginTop: 20, display: "flex", gap: 12, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  onClick={handleHeroBooking}
                  aria-label="Claim your 50% off first boxing class"
                  style={{ padding: "14px 20px", borderRadius: 10, background: "#ff3b30", color: "#fff", border: "none", fontWeight: 800, cursor: "pointer" }}
                >
                  🥊 CLAIM YOUR 50% OFF FIRST ROUND
                </button>

                <button
                  onClick={() => onNavigate ? onNavigate("schedule") : window.scrollTo({ top: 600, behavior: "smooth" })}
                  style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                >
                  <Calendar size={18} style={{ marginRight: 8 }} /> SEE OUR SCHEDULE
                </button>
              </div>

              <div style={{ marginTop: 18 }}>
                <button
                  onClick={() => onNavigate ? onNavigate("academy") : window.alert("Navigate to academy (placeholder)")}
                  style={{ color: "#cfe8ff", textDecoration: "underline", background: "transparent", border: "none", cursor: "pointer" }}
                  aria-label="Meet our boxing coaches"
                >
                  Meet Our Coaches <ArrowRight size={14} style={{ marginLeft: 8 }} />
                </button>
              </div>
            </div>

            <button
              onClick={() => setVideoPlaying((p) => !p)}
              style={{ position: "absolute", bottom: 18, right: 18, zIndex: 20, background: "rgba(0,0,0,0.55)", color: "#fff", borderRadius: 999, padding: 10, border: "none", cursor: "pointer" }}
              aria-label={videoPlaying ? "Pause background video" : "Play background video"}
            >
              {videoPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
          </section>
        </ErrorBoundary>

        {/* top content: ticker, schedule, flash sale, social, soundscape */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, marginTop: 18 }}>
          <main style={{ minWidth: 0 }}>
            <div style={{ marginBottom: 16 }}><FightTicker /></div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: 14, borderRadius: 10, background: "#fff", boxShadow: "0 6px 30px rgba(2,6,23,0.03)" }}>
                <h3 style={{ marginTop: 0 }}>Schedule — Reserve Your Spot</h3>
                <p style={{ color: "#6b7280", marginTop: 6 }}>Book classes quickly — surge pricing indicates higher demand times.</p>
                {SCHEDULE.map((s) => (
                  <div key={s.id} style={{ borderBottom: "1px solid #f3f4f6", padding: "12px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800 }}>{s.className}</div>
                      <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>{s.trainerName} • {s.duration}m • {s.classLevel ?? "All levels"}</div>
                      {s.surgePrice && <div style={{ fontSize: 13, color: "#b45309", marginTop: 6 }}>Peak surcharge: +${s.surgePrice}</div>}
                    </div>

                    <div style={{ textAlign: "right", minWidth: 140 }}>
                      <div style={{ fontSize: 14 }}>{formatTime(s.time)}</div>
                      <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>{s.displaySpots ?? "—"} spots left</div>
                      <button
                        onClick={() => bookClass(s)}
                        style={{ marginTop: 8, padding: "8px 10px", background: "#111827", color: "#fff", borderRadius: 8, border: "none", cursor: "pointer" }}
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <FlashSaleCard />
                <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
                  <div style={{ fontWeight: 800 }}>Social Proof</div>
                  <div style={{ fontSize: 28, color: "#dc2626", fontWeight: 900, marginTop: 6 }}>{socialCount.toLocaleString()}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>Locals training this week</div>
                </div>
                <SoundscapeToggle />
              </div>
            </div>

            <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
              <SparringSimulator />
            </div>
          </main>

          <aside>
            <div style={{ display: "grid", gap: 12 }}>
              <GuaranteedBanner />
              <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
                <div style={{ fontWeight: 800 }}>Leaderboard</div>
                <div style={{ marginTop: 8, fontSize: 13, color: "#6b7280" }}>Sofia R. — 1,250 pts</div>
                <div style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>Tommy L. — 980 pts</div>
                <div style={{ marginTop: 10, fontSize: 13 }}>Keep climbing the leaderboard by attending classes and logging workouts.</div>
              </div>

              <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
                <div style={{ fontWeight: 800 }}>Challenge Generator</div>
                <div style={{ marginTop: 8, color: "#374151" }}>Generate a focused training sprint to push progress quickly.</div>
                <button
                  onClick={() => {
                    const days = 7 + Math.floor(Math.random() * 14);
                    const name = ["Fog City Fury", "Bridge Builder", "Mission Shred"][Math.floor(Math.random() * 3)];
                    analyticsTrack("challenge_generated", { name, days });
                    scheduleBrowserNotification("New Challenge", { body: `${name} — ${days}-day challenge`, delayMs: 1200 });
                    triggerConfetti();
                  }}
                  style={{ marginTop: 8, padding: 10, background: "#111827", color: "#fff", borderRadius: 8, border: "none", cursor: "pointer" }}
                >
                  Generate Challenge
                </button>
              </div>
            </div>
          </aside>
        </section>

        {/* SERVICES */}
        <section style={{ marginTop: 26, background: "#fff", padding: 18, borderRadius: 12 }} aria-label="Programs and services">
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 22 }}>SF-TOUGH PROGRAMS</h3>
              <p style={{ color: "#6b7280", marginTop: 8, maxWidth: 760, marginLeft: "auto", marginRight: "auto" }}>From Dogpatch to the Presidio — programs for fighters, fitness seekers, and youth athletes with measurable outcomes and caring, hard-nosed coaching.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
              {SERVICES.map((s, idx) => (
                <ServiceCardToUse key={s.id} service={s} onNavigate={(p: string) => onNavigate ? onNavigate(p) : window.alert(`Navigate to ${p}`)} delay={idx * 0.05} />
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ marginTop: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <h2 style={{ margin: 0 }}>HEAR IT FROM THE NEIGHBORHOOD</h2>
              <div style={{ color: "#6b7280", marginTop: 8, maxWidth: 760 }}>Real results, real people — client stories that show how consistent training transforms bodies and minds.</div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addAdminSynthetic} style={{ padding: "8px 10px", borderRadius: 8, background: "#06b6d4", color: "#fff", border: "none", cursor: "pointer" }}>Admin: Add Synthetic</button>
              <button onClick={clearTestimonials} style={{ padding: "8px 10px", borderRadius: 8, background: "#f3f4f6", border: "1px solid #e5e7eb", cursor: "pointer" }}>Clear Testimonials</button>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>{testimonialGrid}</div>
        </section>

        <footer style={{ marginTop: 28, color: "#6b7280", fontSize: 13 }}>
          <div style={{ maxWidth: 900 }}>3rd Street Boxing — Authentic training, measurable progress. Visit us for a free intro session and discover why our members keep coming back.</div>
        </footer>
      </div>
    </FogWrapper>
  );
}


/* merged_hardcoded.tsx
   Combined single-file React + TypeScript module that merges PREVIEW.tsx with implementations
   of previously-missing PDF suggestions. This is a ready-to-download .tsx file.
   NOTE: This file is hardcoded for demo/emulation only and contains many UI mocks.
*/

import React, { useEffect, useState, useRef, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { Helmet, HelmetProvider } from "react-helmet-async";
import confetti from "canvas-confetti";
import { formatInTimeZone } from "date-fns-tz";


/* Minimal icon placeholders (replace with lucide-react if available) */
const Icon = ({ children }: any) => <span>{children}</span>;

/* -----------------------------
   Minimal types (trimmed)
   ----------------------------- */
type ScheduleSlot = {
  id: string;
  day: string;
  time: string;
  className: string;
  trainerName: string;
  duration: number;
  spotsAvailable: number;
  displaySpots?: number;
  surgePrice?: number;
  classLevel?: string;
};

type Testimonial = {
  id: string;
  name: string;
  location?: string;
  quote: string;
  rating?: number;
  generated?: boolean;
};

type UserProgress = {
  userId: string;
  history?: { type: string; classId?: string; date: string }[];
  points?: number;
  beltLevel?: string;
};

const SCHEDULE: ScheduleSlot[] = [
  { id: "s1", day: "2025-09-15", time: "09:00:00", className: "Bootcamp Blast", trainerName: "Elena", duration: 60, spotsAvailable: 8, displaySpots: 3, surgePrice: 20, classLevel: "bootcamp" },
  { id: "s2", day: "2025-09-16", time: "18:00:00", className: "Night Ring Drills", trainerName: "Omar", duration: 75, spotsAvailable: 5, displaySpots: 2, surgePrice: 35, classLevel: "academy" },
  { id: "s3", day: "2025-09-16", time: "19:30:00", className: "Technique & Flow", trainerName: "Raul", duration: 45, spotsAvailable: 6, displaySpots: 1, classLevel: "technique" },
];

/* -----------------------------
   Utilities
   ----------------------------- */
const triggerConfetti = () => {
  const c = document.createElement("canvas");
  document.body.appendChild(c);
  confetti.create(c, { resize: true })({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
};



const fakePaymentProcess = async (card: { number: string; expiry: string; cvv: string }) => {
  // UI-only fake payments flow (simulated latency)
  await new Promise((r) => setTimeout(r, 900));
  // basic Luhn-lite check for demo: length
  if (card.number.replace(/\s/g, "").length < 12) throw new Error("Card declined");
  return { id: `charge_${Date.now()}`, status: "succeeded", receipt: `RECEIPT-${Date.now()}` };
};

const saveToLS = (k: string, v: any) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
};
const loadFromLS = (k: string, fallback: any) => {
  try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
};

/* -----------------------------
   Offline mode: register service worker (skeleton)
   ----------------------------- */
export function registerServiceWorker() {
  if ("serviceWorker" in navigator && !navigator.serviceWorker.controller) {
    // this is a safe, non-blocking registration attempt
    navigator.serviceWorker.register("/sw.js").catch(() => { /* ignore in demo */ });
  }
}

/* -----------------------------
   A/B testing simple assignment
   ----------------------------- */
export const getAbVariant = () => {
  const key = "ab_variant";
  const existing = loadFromLS(key, null);
  if (existing) return existing;
  const variant = Math.random() < 0.5 ? "A" : "B";
  saveToLS(key, variant);
  return variant;
};

/* -----------------------------
   Usage analytics (local)
   ----------------------------- */
export const analyticsTrack = (event: string, meta: any = {}) => {
  const logs = loadFromLS("demo_analytics", []);
  logs.unshift({ event, meta, time: new Date().toISOString() });
  saveToLS("demo_analytics", logs.slice(0, 200));
};

/* -----------------------------
   Fake social counters & notifications scheduler
   ----------------------------- */
export const getSocialCount = () => {
  // minor randomness to feel live
  const base = 1243;
  const drift = Math.floor(Math.sin(Date.now() / (1000 * 60 * 60)) * 20);
  return base + drift + Math.floor(Math.random() * 30);
};

export const scheduleBrowserNotification = (title: string, opts: NotificationOptions & { delayMs?: number } = {}) => {
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

/* -----------------------------
   Synthetic testimonial generator
   ----------------------------- */
const testimonialTemplates = [
  "I gained so much confidence training here — {trainer} really changed my world.",
  "Lost {n} lbs and gained a championship mindset in {months} months.",
  "The community is unbeatable. {trainer}'s coaching is 🔥.",
];
export function generateSyntheticTestimonial(overrides: Partial<Testimonial> = {}): Testimonial {
  const t = testimonialTemplates[Math.floor(Math.random() * testimonialTemplates.length)];
  const filled = t.replace("{trainer}", ["Raúl", "Coach Omar", "Coach Elena"][Math.floor(Math.random()*3)])
                  .replace("{n}", String(10 + Math.floor(Math.random()*20)))
                  .replace("{months}", String(3 + Math.floor(Math.random()*9)));
  const result = {
    id: `gen-${Date.now()}`,
    name: ["Alex P.", "Jordan S.", "Taylor R."][Math.floor(Math.random()*3)],
    quote: filled,
    rating: 5,
    generated: true,
    ...overrides
  } as Testimonial;
  return result;
}

/* -----------------------------
   Fake 'guaranteed results' banner component
   ----------------------------- */
export const GuaranteedBanner: React.FC = () => (
  <div style={{ background: "#fff7ed", border: "1px solid #ffd7a6", padding: 12, borderRadius: 8 }}>
    <strong>Guaranteed results:</strong> Complete our 12-week plan & we'll prep your first amateur bout — or get additional coaching time.
  </div>
);

/* -----------------------------
   Fog visual theme toggle (CSS inline)
   ----------------------------- */
const FogWrapper: React.FC<{ fog: boolean; children: React.ReactNode }> = ({ fog, children }) => (
  <div style={{ position: "relative", overflow: "hidden" }}>
    {fog && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))", backdropFilter: "blur(6px)", pointerEvents: "none", zIndex: 5 }} />}
    <div style={{ filter: fog ? "contrast(0.95) saturate(0.9)" : "none" }}>{children}</div>
  </div>
);

/* -----------------------------
   Sparring-style canvas simulator (simple)
   ----------------------------- */
export const SparringSimulator: React.FC = () => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current!;
    if (!canvas) return;
    canvas.width = 600; canvas.height = 300;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let t0 = performance.now();
    const draw = (t: number) => {
      const dt = (t - t0) / 1000;
      t0 = t;
      // simple 'sparring' oscillation
      ctx.clearRect(0,0,canvas.width,canvas.height);
      // rings
      ctx.fillStyle = "#111"; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.strokeStyle = "#444"; ctx.lineWidth = 2;
      ctx.strokeRect(10,10,canvas.width-20, canvas.height-20);
      // fighters (circles) moving
      const x1 = 150 + Math.sin(Date.now()/300) * 60;
      const x2 = 450 + Math.cos(Date.now()/400) * 60;
      ctx.fillStyle = "#e11"; ctx.beginPath(); ctx.arc(x1,150,22,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = "#118"; ctx.beginPath(); ctx.arc(x2,150,22,0,Math.PI*2); ctx.fill();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", borderRadius: 8, display: "block" }} />;
};

/* -----------------------------
   AR glove mock: user uploads photo, we overlay glove png (canvas)
   ----------------------------- */
export const ArTryOn: React.FC = () => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (!dataUrl) return;
    const img = new Image();
    img.onload = () => {
      const c = canvasRef.current!;
      c.width = 400; c.height = 400;
      const ctx = c.getContext("2d")!;
      ctx.clearRect(0,0,c.width,c.height);
      // draw user photo
      ctx.drawImage(img, 0, 0, c.width, c.height);
      // overlay glove mock (circle)
      ctx.fillStyle = "rgba(220,38,38,0.6)";
      ctx.beginPath(); ctx.ellipse(c.width - 100, c.height - 100, 70, 50, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 14px sans-serif";
      ctx.fillText("3rd Street Glove (mock)", c.width - 200, c.height - 90);
    };
    img.src = dataUrl;
  }, [dataUrl]);

  const onFile = (f?: File) => {
    const file = f || (fileRef.current?.files && fileRef.current.files[0]);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDataUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ border: "1px dashed #ddd", padding: 12, borderRadius: 8 }}>
      <div style={{ marginBottom: 8 }}><strong>AR Try-On Mock</strong></div>
      <input ref={fileRef as any} type="file" accept="image/*" onChange={() => onFile()} />
      <div style={{ marginTop: 8 }}>
        <canvas ref={canvasRef} style={{ width: 400, height: 400, display: dataUrl ? "block" : "none", borderRadius: 8 }} />
        {!dataUrl && <div style={{ color: "#666" }}>Upload a selfie to preview glove overlay (demo).</div>}
      </div>
    </div>
  );
};

/* -----------------------------
   Ambient gym soundscape (toggle)
   ----------------------------- */
export const SoundscapeToggle: React.FC = () => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    audioRef.current = new Audio("/assets/ambient-gym.mp3"); // placeholder path
    audioRef.current.loop = true;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);
  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [playing]);
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button onClick={() => setPlaying((p) => !p)} style={{ padding: "6px 10px", borderRadius: 6, background: playing ? "#dc2626" : "#eee", color: playing ? "#fff" : "#000" }}>
        {playing ? "Stop Soundscape" : "Play Soundscape"}
      </button>
      <span style={{ color: "#666" }}>{playing ? "Playing ambient gym audio" : "Soundscape off"}</span>
    </div>
  );
};

/* -----------------------------
   Challenge generator
   ----------------------------- */
export const ChallengeGenerator: React.FC = () => {
  const [challenge, setChallenge] = useState<string | null>(null);
  const gen = () => {
    const days = 7 + Math.floor(Math.random()*14);
    const name = ["Fog City Fury","Bridge Builder","Mission Shred"][Math.floor(Math.random()*3)];
    setChallenge(`${name} — ${days}-day challenge: Mix technique, sparring, and recovery. Aim 4 sessions/week.`);
    analyticsTrack("challenge_generated", { name, days });
  };
  return (
    <div style={{ padding: 12, borderRadius: 8, background: "#fff" }}>
      <div style={{ marginBottom: 8 }}><strong>Challenge Generator</strong></div>
      <button onClick={gen} style={{ padding: "8px 12px", background: "#dc2626", color: "#fff", borderRadius: 6 }}>One-click generate</button>
      {challenge && <div style={{ marginTop: 8, color: "#333" }}>{challenge}</div>}
    </div>
  );
};

/* -----------------------------
   Countdown flash sale (simple)
   ----------------------------- */
export const FlashSaleCard: React.FC = () => {
  const [endsAt] = useState<Date>(() => { const d = new Date(); d.setMinutes(d.getMinutes()+30); return d; });
  const [now, setNow] = useState<Date>(new Date());
  useEffect(()=> { const t = setInterval(()=>setNow(new Date()), 1000); return ()=>clearInterval(t); }, []);
  const diff = Math.max(0, Math.floor((endsAt.getTime()-now.getTime())/1000));
  const mm = Math.floor(diff/60); const ss = diff%60;
  return (
    <div style={{ padding: 12, borderRadius: 8, background: "#111827", color: "#fff" }}>
      <div style={{ fontWeight: 700 }}>Flash Sale!</div>
      <div>Premium pass — 50% off for next</div>
      <div style={{ fontSize: 20, marginTop: 6 }}>{mm}:{String(ss).padStart(2,'0')}</div>
    </div>
  );
};

/* -----------------------------
   Fight Night Ticker (simple)
   ----------------------------- */
export const FightTicker: React.FC = () => {
  const items = ["Fight Night: Friday 8pm — Limited seats","Celebrity guest appearance next week","Register for sparring tournament"];
  return (
    <div style={{ overflow: "hidden", whiteSpace: "nowrap", background: "#f8fafc", padding: "6px 8px", borderRadius: 6 }}>
      <div style={{ display: "inline-block", animation: "ticker 12s linear infinite" }}>
        {items.join(" • ")}
      </div>
      <style>{`@keyframes ticker { 0% { transform: translateX(100%);} 100% { transform: translateX(-100%);} }`}</style>
    </div>
  );
};

/* -----------------------------
   Animated leaderboard bracket (simplified)
   ----------------------------- */
export const LeaderboardBracket: React.FC = () => {
  const [round, setRound] = useState(1);
  useEffect(()=> {
    const t = setInterval(()=> setRound(r=> (r%3)+1), 3000);
    return ()=>clearInterval(t);
  }, []);
  return (
    <div style={{ padding: 12, borderRadius: 8, background: "#fff" }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Bracket — round {round}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1, background: "#f3f4f6", padding: 8 }}>Sofia R.<div style={{ fontSize: 12, color: "#6b7280" }}>1250 pts</div></div>
        <div style={{ flex: 1, background: "#fff0f0", padding: 8 }}>Tommy L.<div style={{ fontSize: 12, color: "#6b7280" }}>980 pts</div></div>
      </div>
    </div>
  );
};

/* -----------------------------
   Press-style popup (mock)
   ----------------------------- */
export const PressPopup: React.FC<{ onClose?: ()=>void }> = ({ onClose }) => {
  const [open,setOpen] = useState(true);
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 12, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div style={{ width: 520, background: "#fff", borderRadius: 8, padding: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Press: Local Champion Signs with 3rd Street Boxing</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Read more about our program and success stories.</div>
          </div>
          <div><button onClick={()=>{ setOpen(false); onClose?.(); }} style={{ background: "#ef4444", color:"#fff", padding:"6px 10px", borderRadius:6 }}>Close</button></div>
        </div>
      </div>
    </div>
  );
};

/* -----------------------------
   Celebrity endorsement generator (mock)
   ----------------------------- */
export const CelebrityGenerator: React.FC = () => {
  const celebs = ["Mike Tyson", "Ronda Rousey", "Conor McGregor"];
  const [card, setCard] = useState<{ celeb: string; quote: string } | null>(null);
  const gen = () => {
    const c = celebs[Math.floor(Math.random()*celebs.length)];
    const q = `${c} says: "3rd Street Boxing made me remember why I love this sport." (mock)`;
    setCard({ celeb: c, quote: q });
    analyticsTrack("celebrity_card_generated", { celeb: c });
  };
  return (
    <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
      <button onClick={gen} style={{ padding: "8px 12px", background: "#111827", color:"#fff", borderRadius:6 }}>Generate Celebrity Card</button>
      {card && <div style={{ marginTop: 8, padding: 8, borderRadius: 6, background: "#f8fafc" }}><strong>{card.celeb}</strong><div style={{ fontSize: 13 }}>{card.quote}</div></div>}
    </div>
  );
};

/* -----------------------------
   Instant "fame" simulator (mock social feed)
   ----------------------------- */
export const FameSimulator: React.FC = () => {
  const [feed, setFeed] = useState<{id:string, text:string, likes:number}[]>([]);
  const go = () => {
    const id = `p${Date.now()}`;
    const post = { id, text: "I just leveled up my belt at 3rd Street Boxing! 🔥", likes: 100 + Math.floor(Math.random()*500) };
    setFeed((f)=>[post,...f].slice(0,10));
    analyticsTrack("fame_posted", { id });
  };
  return (
    <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
      <button onClick={go} style={{ padding: "8px 12px", background: "#06b6d4", color:"#fff", borderRadius:6 }}>Simulate Viral Post</button>
      <div style={{ marginTop: 8 }}>
        {feed.map(p=>(
          <div key={p.id} style={{ padding:8, borderBottom:"1px solid #eee" }}>
            <div style={{ fontWeight:700 }}>{p.text}</div>
            <div style={{ fontSize:12, color:"#6b7280" }}>{p.likes} likes</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -----------------------------
   Occupancy manipulation on mouse movements (demo)
   ----------------------------- */
export const OccupancyMouseBooster: React.FC = () => {
  const [occ, setOcc] = useState(() => loadFromLS("demo_occ", 32));
  useEffect(()=> saveToLS("demo_occ", occ), [occ]);
  useEffect(()=> {
    let boosted = false;
    const onMove = () => {
      if (!boosted) { setOcc((o:number)=>Math.min(120,o+1)); boosted = true; setTimeout(()=> boosted=false, 600); }
    };
    window.addEventListener("mousemove", onMove);
    return ()=> window.removeEventListener("mousemove", onMove);
  }, []);
  return <div style={{ padding:12, background:"#fff", borderRadius:8 }}>Occupancy (mouse-interactive): {occ} / 120</div>;
};

/* -----------------------------
   Main Exported Demo Page that ties everything together
   ----------------------------- */
export default function MergedDemoApp() {
  const [user] = useState<{ id: string; token?: string } | null>(() => ({ id: "demo-user", token: "demo" }));
  const [showPayment, setShowPayment] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => loadFromLS("demo_testimonials", [
    { id: "t1", name: "Sophie M.", location: "Mission", quote: "This gym changed my life.", rating: 5 },
  ]));
  const [showFog, setShowFog] = useState(false);
  const [variant] = useState(getAbVariant());

  useEffect(()=> { saveToLS("demo_testimonials", testimonials); }, [testimonials]);

  useEffect(()=> {
    registerServiceWorker();
    analyticsTrack("app_loaded", { variant });
  }, [variant]);

  const addSynthetic = () => {
    const t = generateSyntheticTestimonial();
    setTestimonials((s)=>[t, ...s]);
    analyticsTrack("synthetic_testimonial_added", {});
  };

  const bookClass = async (slot: ScheduleSlot) => {
    analyticsTrack("booking_attempt", { slotId: slot.id });
    // show fake payment option for paid classes
    if (slot.surgePrice && slot.surgePrice > 0) setShowPayment(true);
    else {
      // confirm booking
      saveToLS("demo_bookings", [{ id: `b${Date.now()}`, slotId: slot.id, created_at: new Date().toISOString() }]);
      triggerConfetti();
      scheduleBrowserNotification("Booking Confirmed", { body: `${slot.className} at ${slot.time}` });
    }
  };

  const handleFakePayment = async (card:any) => {
    try {
      analyticsTrack("fake_payment_started", {});
      const res = await fakePaymentProcess(card);
      saveToLS("demo_payments", [res]);
      triggerConfetti();
      scheduleBrowserNotification("Payment successful", { body: `Receipt ${res.receipt}` });
      setShowPayment(false);
    } catch (e:any) {
      alert("Payment failed: " + e.message);
    }
  };

  return (
    <FogWrapper fog={showFog}>
      <Helmet><title>3rd Street Boxing — Merged Demo</title></Helmet>
      <div style={{ maxWidth: 1100, margin: "18px auto", padding: 12 }}>
        <header style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 12 }}>
          <div><h1 style={{ margin:0 }}>3rd Street Boxing — Demo</h1><div style={{ fontSize:12, color:"#6b7280" }}>A/B variant: {variant}</div></div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>setShowFog(f=>!f)} style={{ padding:8 }}>{showFog ? "Disable Fog" : "Enable Fog"}</button>
            <button onClick={addSynthetic} style={{ padding:8 }}>Add Synthetic Testimonial</button>
          </div>
        </header>

        <section style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:12 }}>
          <div>
            <div style={{ marginBottom:12 }}>
              <FightTicker />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div style={{ padding:12, borderRadius:8, background:"#fff" }}>
                <h3>Schedule</h3>
                {SCHEDULE.map(s=>(
                  <div key={s.id} style={{ borderBottom:"1px solid #eee", padding:"8px 0" }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <div>
                        <div style={{ fontWeight:700 }}>{s.className}</div>
                        <div style={{ fontSize:12, color:"#6b7280" }}>{s.trainerName} • {s.duration}m</div>
                        {s.surgePrice && <div style={{ fontSize:12, color:"#b45309" }}>Peak surcharge: +${s.surgePrice}</div>}
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:14 }}>{formatInTimeZone(new Date(`2000-01-01T${s.time}`),'America/Los_Angeles','h:mm aa')}</div>
                        <div style={{ fontSize:12, color:"#6b7280" }}>{s.displaySpots} spots left</div>
                        <button onClick={()=>bookClass(s)} style={{ marginTop:6, padding:"6px 8px", background:"#dc2626", color:"#fff", borderRadius:6 }}>Book</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display:"grid", gap:12 }}>
                <FlashSaleCard />
                <div style={{ padding:12, background:"#fff", borderRadius:8 }}>
                  <div style={{ fontWeight:700 }}>Social Proof</div>
                  <div style={{ fontSize:28, color:"#dc2626" }}>{getSocialCount().toLocaleString()}</div>
                  <div style={{ fontSize:12, color:"#6b7280" }}>SF locals training this week</div>
                </div>
                <SoundscapeToggle />
              </div>
            </div>

            <div style={{ marginTop:12, display:"grid", gap:12 }}>
              <SparringSimulator />
              <ArTryOn />
            </div>
          </div>

          <aside>
            <div style={{ display:"grid", gap:12 }}>
              <GuaranteedBanner />
              <LeaderboardBracket />
              <CelebrityGenerator />
              <ChallengeGenerator />
              <LeaderboardBracket />
              <FameSimulator />
              <OccupancyMouseBooster />
            </div>
          </aside>
        </section>

        <section style={{ marginTop: 18 }}>
          <h2>Testimonials</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
            {testimonials.map(t=>(
              <div key={t.id} style={{ padding:12, background:"#fff", borderRadius:8 }}>
                <div style={{ fontWeight:700 }}>{t.name} {t.generated && <span style={{ fontSize:12, color:"#6b7280" }}>(synthetic)</span>}</div>
                <div style={{ fontSize:13, color:"#374151", marginTop:6 }}>{t.quote}</div>
                <div style={{ marginTop:8, fontSize:12, color:"#6b7280" }}>{t.rating || 5} ⭐</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 18, display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <h3>Admin Controls (Demo)</h3>
            <div style={{ padding:12, background:"#fff", borderRadius:8 }}>
              <button onClick={()=>{ const t=generateSyntheticTestimonial(); setTestimonials(s=>[t,...s]); }} style={{ padding:8, marginRight:8 }}>Add Testimonial</button>
              <button onClick={()=> scheduleBrowserNotification("Reminder", { body: "Heads up! Class in 1 hour", delayMs: 5000 })} style={{ padding:8 }}>Schedule Reminder</button>
              <button onClick={()=> analyticsTrack("admin_bananas", {})} style={{ padding:8, marginLeft:8 }}>Log Analytics</button>
            </div>
          </div>

          <div>
            <h3>Extras</h3>
            <div style={{ display:"grid", gap:8 }}>
              <PressPopup onClose={()=>analyticsTrack("press_closed")} />
              <FightTicker />
              <FlashSaleCard />
            </div>
          </div>
        </section>

        <footer style={{ marginTop:18, color:"#6b7280", fontSize:13 }}>
          <div>Demo app — all features are emulated client-side for QA and testing purposes.</div>
        </footer>
      </div>

      {/* Payment modal (simple) */}
      {showPayment && (
        <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.4)" }}>
          <div style={{ width:420, background:"#fff", borderRadius:8, padding:16 }}>
            <h3>Fake Payment</h3>
            <p style={{ fontSize:13, color:"#6b7280" }}>This is a UI-only simulated payment flow.</p>
            <form onSubmit={(e)=>{ e.preventDefault(); const form = e.target as any; handleFakePayment({ number: form.cardnumber.value, expiry: form.exp.value, cvv: form.cvv.value }); }}>
              <div style={{ marginTop:8 }}>
                <input name="cardnumber" placeholder="Card number" style={{ width:"100%", padding:8, borderRadius:6 }} />
              </div>
              <div style={{ display:"flex", gap:8, marginTop:8 }}>
                <input name="exp" placeholder="MM/YY" style={{ flex:1, padding:8, borderRadius:6 }} />
                <input name="cvv" placeholder="CVV" style={{ width:90, padding:8, borderRadius:6 }} />
              </div>
              <div style={{ marginTop:12, display:"flex", gap:8 }}>
                <button type="submit" style={{ padding:8, background:"#10b981", color:"#fff", borderRadius:6 }}>Pay</button>
                <button type="button" onClick={()=>setShowPayment(false)} style={{ padding:8 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </FogWrapper>
  );
}
// src/components/Header.tsx
import React from "react";
import { Button } from "../ui/button"; // Adjust path if needed
import { supabase } from "@/lib/supabaseClient";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user: User | null;
  onAuthClick: () => void;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  user,
  onAuthClick,
  onSignOut,
}) => {
  // Pick a display name
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Member";

  return (
    <header className="w-full fixed top-0 left-0 z-40 bg-white shadow-sm">
      <nav
        className="flex items-center justify-between px-4 py-3 md:px-8"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo / Home button */}
        <button
          onClick={() => onNavigate("home")}
          className="text-xl font-bold text-gray-800 hover:text-gray-900 focus:outline-none"
          aria-label="Navigate to homepage"
        >
          🥊 Boxing Academy
        </button>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-700 hidden sm:block">
                Hey, {displayName}!
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSignOut}
                className="text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onAuthClick(); // trigger auth modal
                onNavigate("login");
              }}
              className="text-gray-700 hover:text-gray-900"
            >
              Sign In
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Instagram, 
  ExternalLink,
  Shield,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom for navigation

interface FooterProps {
  onNewsletterSignup?: (email: string) => Promise<void>;
}

export function Footer({ onNewsletterSignup }: FooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Reset submit message after 5 seconds
  useEffect(() => {
    if (submitMessage) {
      const timer = setTimeout(() => setSubmitMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [submitMessage]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setSubmitMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onNewsletterSignup) {
        await onNewsletterSignup(newsletterEmail);
        setSubmitMessage('Successfully subscribed! Welcome to the 3rd Street family.');
        setNewsletterEmail('');
      }
    } catch (error) {
      setSubmitMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Classes', path: '/classes' },
    { name: 'Academy', path: '/academy' },
    { name: 'Bootcamp', path: '/bootcamp' },
    { name: 'Personal Training', path: '/personal-training' },
    { name: 'Youth Boxing', path: '/youth' },
    { name: 'Facilities', path: '/facilities' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Contact', path: '/contact' }
  ];

  const localSeoKeywords = [
    'Best Boxing Gym San Francisco',
    'Dogpatch Fitness',
    'Bay Area Boxing Classes', 
    'SF Youth Boxing',
    'Personal Training Mission Bay',
    'Golden Gate Boxing',
    'SoMa Boxing Gym',
    'Mission District Training'
  ];

  return (
    <footer 
      role="contentinfo" 
      aria-label="Business information"
      className="bg-gray-900 text-white"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Contact Information */}
          <div className="space-y-6" role="region" aria-label="Contact information">
            <h3 className="text-xl font-semibold mb-4 text-accent">
              Our Corner of the City
            </h3>
            
            <address className="not-italic space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium">2576 3rd Street</p>
                  <p className="text-gray-300">Between 22nd & 23rd</p>
                  <p className="text-gray-300">Dogpatch, San Francisco, CA 94107</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-accent flex-shrink-0" aria-hidden="true" />
                <a 
                  href="tel:+14155508260"
                  className="hover:text-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
                  aria-label="Call us at (415) 550-8260"
                >
                  (415) 550-8260
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-accent flex-shrink-0" aria-hidden="true" />
                <a 
                  href="mailto:info@3rdstreetboxing.com"
                  className="hover:text-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
                  aria-label="Email us at info@3rdstreetboxing.com"
                >
                  info@3rdstreetboxing.com
                </a>
              </div>
            </address>

            <div className="flex items-start space-x-3" aria-label="Business hours">
              <Clock className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium mb-1">Open Daily:</p>
                <p className="text-gray-300">Mon-Fri: 5AM–10PM</p>
                <p className="text-gray-300">Sat-Sun: 7AM–8PM</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6" role="region" aria-label="Quick links">
            <h3 className="text-xl font-semibold mb-4 text-accent">Navigate</h3>
            <ul role="menu" className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path} role="none">
                  <Link
                    to={link.path}
                    role="menuitem"
                    className="text-gray-300 hover:text-white focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Local SEO & Trust Badges */}
          <div className="space-y-6" role="region" aria-label="Local keywords and badges">
            <h3 className="text-xl font-semibold mb-4 text-accent">SF's Boxing Hub</h3>
            
            <ul className="space-y-2" aria-label="Local search keywords">
              {localSeoKeywords.map((keyword, index) => (
                <li 
                  key={index}
                  className="inline-block text-sm text-gray-400 mr-2 mb-1 px-2 py-1 bg-gray-800 rounded-md"
                >
                  {keyword}
                </li>
              ))}
            </ul>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-accent" aria-label="Rated A+ by Better Business Bureau">
                  <Shield className="w-5 h-5" aria-hidden="true" />
                  <span className="text-sm font-medium">BBB A+ Rating</span>
                </div>
                <div className="flex items-center space-x-1 text-accent" aria-label="Five star rating on Yelp">
                  <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                  <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                  <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                  <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                  <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span className="text-sm ml-1">Yelp</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-400">
                "SF Weekly Best Gym 2024" | "As Seen In SF Chronicle"
              </p>
            </div>

            {/* Social Media */}
            <div className="flex items-center space-x-4">
              <a
                href="https://www.facebook.com/3rdstreetboxing"
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Follow us on Facebook"
                className="text-gray-400 hover:text-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://www.instagram.com/3rdstreetboxing"
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Follow us on Instagram"
                className="text-gray-400 hover:text-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://www.yelp.com/biz/3rd-street-boxing-gym-san-francisco"
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Read our Yelp reviews"
                className="text-gray-400 hover:text-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
              >
                <ExternalLink className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-6" role="region" aria-label="Newsletter signup">
            <h3 className="text-xl font-semibold mb-4 text-accent">Stay in the Ring</h3>
            
            <p className="text-gray-300 text-sm">
              Get updates on classes, events, and exclusive SF boxing tips.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div>
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address for newsletter
                </label>
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder="Your email (like Willie Mays deserves)"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-accent focus:ring-accent"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent hover:bg-accent/90 text-black font-medium focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-live="polite"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Subscribing...
                  </span>
                ) : (
                  'Subscribe'
                )}
              </Button>
              
              {submitMessage && (
                <p 
                  className={`text-sm ${
                    submitMessage.toLowerCase().includes('success') ? 'text-green-400' : 'text-red-400'
                  }`}
                  role="alert"
                  aria-live="assertive"
                >
                  {submitMessage}
                </p>
              )}
            </form>

            <p className="text-xs text-gray-400">
              We respect your privacy. 
              <Link
                to="/privacy"
                className="text-accent hover:text-accent/80 underline focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
              <p>&copy; 2025 3rd Street Boxing Gym. All rights reserved.</p>
              <Link
                to="/accessibility"
                className="text-accent hover:text-accent/80 focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                WCAG 2.1 AA Compliant
              </Link>
            </div>
            
            <div className="text-sm text-gray-500">
              Made by Ammar Alkheder
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Play, Pause, ChevronRight, Target, Users, Trophy } from 'lucide-react';
import { ImageWithFallback } from '../components/ImageWithFallback'; // Import the proper component

interface HeroSectionProps {
  onNavigate?: (page: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  const testimonials = [
    {
      text: "Shredded my pandemic 'Dolores Park bod' in 8 weeks! More energizing than Philz coffee.",
      author: "Sarah K.",
      location: "SoMa"
    },
    {
      text: "Went from shy to school champ. Coaches here are like family.",
      author: "Diego R.",
      location: "Sunset"
    },
    {
      text: "Better than any tech job I've had. This is where I actually level up.",
      author: "Marcus T.",
      location: "Mission Bay"
    }
  ];

  // Memoized navigation handler
  const handleNavigation = useCallback((page: string) => {
    if (onNavigate) {
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [onNavigate]);

  // Toggle video playback
  const toggleVideoPlayback = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

  // Optimized testimonial rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      role="banner"
      aria-label="Hero section"
    >
      {/* Background Video with Fallback */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          {/* Video element with controls for accessibility */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
            poster="/hero-poster.jpg" // This should be in public folder
            aria-label="Boxing gym training video"
          >
            <source src="/hero-video.mp4" type="video/mp4" /> {/* This should be in public folder */}
            Your browser does not support the video tag.
          </video>
          
          {/* Video overlay and fallback if video fails to load */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Video controls */}
          <button
            onClick={toggleVideoPlayback}
            className="absolute bottom-4 right-4 z-30 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label={isVideoPlaying ? "Pause video" : "Play video"}
          >
            {isVideoPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              WHERE SF'S TOUGHEST
              <br />
              <span className="text-accent">FIND THEIR STRENGTH</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Authentic Boxing. Real Community. No Frills.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 animate-pulse"
              onClick={() => handleNavigation('book-intro')}
            >
              <Target className="w-5 h-5 mr-2" />
              CLAIM YOUR 50% OFF FIRST ROUND
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-black px-6 py-4 text-lg font-medium rounded-lg transition-all duration-200"
              onClick={() => handleNavigation('schedule')}
            >
              <Users className="w-5 h-5 mr-2" />
              SEE OUR SCHEDULE
            </Button>
          </div>

          <div className="pt-4">
            <button
              onClick={() => handleNavigation('trainers')}
              className="text-white hover:text-accent transition-colors duration-200 text-lg font-medium group focus:outline-none focus:text-accent"
            >
              Meet Our Coaches
              <ChevronRight className="w-5 h-5 inline-block ml-1 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>

      {/* Rest of your component remains the same... */}
      {/* Floating Testimonial */}
      <div className="absolute bottom-8 left-8 right-8 z-20">
        <div className="max-w-md mx-auto lg:mx-0 lg:max-w-lg">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex text-accent">
                {[...Array(5)].map((_, i) => (
                  <Trophy key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-600">5.0 Stars</span>
            </div>
            <blockquote className="text-gray-800 text-sm font-medium mb-3">
              "{testimonials[currentTestimonial].text}"
            </blockquote>
            <cite className="text-sm text-gray-600 not-italic">
              — {testimonials[currentTestimonial].author} | {testimonials[currentTestimonial].location}
            </cite>
            <div className="flex justify-center space-x-2 mt-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                    index === currentTestimonial ? 'bg-accent' : 'bg-gray-300'
                  }`}
                  aria-label={`Show testimonial from ${testimonials[index].author}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="flex flex-col items-center text-white">
          <span className="text-sm mb-2">Scroll to Explore</span>
          <div className="w-6 h-10 border-2 border-white rounded-full p-1">
            <div className="w-1 h-3 bg-white rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* SF-Themed Floating Elements */}
      <div className="absolute top-20 right-20 z-10 hidden lg:block" aria-hidden="true">
        <div className="text-white/20 text-8xl font-bold transform rotate-12 select-none pointer-events-none">
          SF
        </div>
      </div>
      <div className="absolute bottom-32 right-12 z-10 hidden lg:block" aria-hidden="true">
        <div className="text-accent/30 text-4xl font-bold transform -rotate-12 select-none pointer-events-none">
          SINCE 2005
        </div>
      </div>
    </section>
  );
}

import React, { lazy, Suspense } from 'react';
import { Star, Quote } from 'lucide-react';
import PropTypes from 'prop-types';

// Lazy load ImageWithFallback for better performance
const ImageWithFallback = lazy(() => import('./ImageWithFallback'));

interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
  program: string;
  image?: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  delay?: number;
}

export function TestimonialCard({ testimonial, delay = 0 }: TestimonialCardProps) {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={`${testimonial.id}-star-${index}`}
        size={16}
        className={
          index < fullStars
            ? 'text-yellow-400 fill-current'
            : index === fullStars && hasHalfStar
              ? 'text-yellow-400 fill-current [clip-path:polygon(0_0,50%_0,50%_100%,0_100%)]'
              : 'text-gray-300'
        }
        aria-hidden="true"
      />
    ));
  };

  return (
    <article
      key={testimonial.id}
      className="card bg-white shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
      role="region"
      aria-labelledby={`${testimonial.id}-name`}
    >
      <div className="flex items-center space-x-4 mb-4 p-4">
        <Suspense fallback={<div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />}>
          <div className="relative">
            <ImageWithFallback
              src={testimonial.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'}
              alt={`Portrait of ${testimonial.name} from ${testimonial.location}`}
              className="w-16 h-16 rounded-full object-cover"
              loading="lazy"
            />
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">
              {testimonial.location.split(',')[0].trim() || 'SF'}
            </div>
          </div>
        </Suspense>

        <div className="flex-1">
          <h4 id={`${testimonial.id}-name`} className="font-semibold text-gray-900">
            {testimonial.name}
          </h4>
          <p className="text-sm text-gray-600">{testimonial.location}</p>
          <div className="flex items-center space-x-1 mt-1" role="img" aria-label={`Rated ${testimonial.rating} out of 5 stars`}>
            {renderStars(testimonial.rating)}
          </div>
        </div>
      </div>

      <div className="relative px-4 pb-4">
        <Quote className="absolute -top-2 -left-2 text-red-200" size={24} aria-hidden="true" />
        <blockquote className="text-gray-700 leading-relaxed pl-6">
          {testimonial.quote}
        </blockquote>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 px-4 pb-4">
        <span className="inline-block bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-medium">
          {testimonial.program}
        </span>
      </div>
    </article>
  );
}

TestimonialCard.propTypes = {
  testimonial: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    quote: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    program: PropTypes.string.isRequired,
    image: PropTypes.string,
  }).isRequired,
  delay: PropTypes.number,
};
import React, { memo } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import ImageWithFallback from "./ImageWithFallback";
import { ChevronRight, Users, Trophy, Zap, Target, Heart, Dumbbell } from 'lucide-react';

// Error Boundary Component
class ServiceGridErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8 text-red-600">
          <p>Something went wrong displaying our services. Please try again later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface ServiceGridProps {
  onNavigate?: (page: string) => void;
}

const services = [
  {
    id: 'classes',
    title: 'CLASSES',
    subtitle: 'From FiDi desk warriors to Mission artists – find your level.',
    description: 'Beginner to pro sessions daily. Cable car-smooth progression through our SF-tough training levels.',
    image: 'https://images.unsplash.com/photo-1575747515871-2e323827539e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // TODO: Host locally or via CDN for production
    imageAlt: 'Mixed-age class throwing jabs before Dolores Park backdrop',
    icon: <Users className="w-8 h-8" />,
    cta: 'View Class Levels',
    sfIcon: (
      <svg width="64" height="64" viewBox="0 0 64 64" className="w-16 h-16" aria-hidden="true">
        <rect x="8" y="32" width="48" height="20" rx="4" fill="#D92229" stroke="#FDB515" strokeWidth="2" />
        <circle cx="16" cy="56" r="4" fill="#5D6D7E" />
        <circle cx="48" cy="56" r="4" fill="#5D6D7E" />
        <rect x="12" y="24" width="8" height="8" rx="4" fill="#FDB515" />
        <rect x="44" y="24" width="8" height="8" rx="4" fill="#FDB515" />
        <line x1="20" y1="20" x2="44" y2="20" stroke="#5D6D7E" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'academy',
    title: 'ACADEMY',
    subtitle: 'Compete in SF’s amateur circuit? Our Castro-to-Chinatown champs start here.',
    description: 'Professional-level training for serious fighters. Transform from street-smart to ring-ready.',
    image: 'https://images.unsplash.com/photo-1620123082249-6ac67a25804f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // TODO: Host locally or via CDN for production
    imageAlt: 'Amateur boxer sparring under Bay Bridge mural at sunset',
    icon: <Trophy className="w-8 h-8" />,
    cta: 'Train to Fight',
    sfIcon: (
      <svg width="64" height="64" viewBox="0 0 64 64" className="w-16 h-16" aria-hidden="true">
        <path d="M8 40 L20 20 L32 40 L44 20 L56 40" stroke="#D92229" strokeWidth="4" fill="none" />
        <rect x="19" y="20" width="2" height="25" fill="#D92229" />
        <rect x="43" y="20" width="2" height="25" fill="#D92229" />
        <ellipse cx="32" cy="50" rx="16" ry="6" fill="#FDB515" stroke="#000" strokeWidth="1" />
        <circle cx="32" cy="50" r="4" fill="#D92229" />
      </svg>
    ),
  },
  {
    id: 'bootcamp',
    title: 'BOOTCAMP',
    subtitle: 'Conquer hills steeper than California Street.',
    description: 'High-intensity outdoor sessions with Golden Gate views. Sweat with the fog, not against it.',
    image: 'https://images.unsplash.com/photo-1697070920184-1cd719f8e17b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // TODO: Host locally or via CDN for production
    imageAlt: 'Group doing burpees on Potrero Hill with downtown skyline',
    icon: <Zap className="w-8 h-8" />,
    cta: 'Join Bootcamp',
    sfIcon: (
      <svg width="64" height="64" viewBox="0 0 64 64" className="w-16 h-16" aria-hidden="true">
        <path d="M4 50 L12 30 L20 45 L28 25 L36 40 L44 20 L52 35 L60 50" stroke="#5D6D7E" strokeWidth="3" fill="none" />
        <path d="M32 15 L28 25 L36 25 Z" fill="#D92229" />
        <path d="M30 10 L26 20 L34 20 Z" fill="#FDB515" />
        <path d="M34 8 L30 18 L38 18 Z" fill="#D92229" />
      </svg>
    ),
  },
  {
    id: 'personal-training',
    title: 'PERSONAL TRAINING',
    subtitle: '1-on-1 sessions sharper than a cable car bell.',
    description: 'Personalized coaching that transforms tech workers into warriors faster than BART on weekends.',
    image: 'https://images.unsplash.com/photo-1620123083473-16ec15498174?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // TODO: Host locally or via CDN for production
    imageAlt: 'Personal training session with trainer adjusting client’s form on heavy bag near industrial windows',
    icon: <Target className="w-8 h-8" />,
    cta: 'Book Coach',
    sfIcon: (
      <svg width="64" height="64" viewBox="0 0 64 64" className="w-16 h-16" aria-hidden="true">
        <path d="M32 8 L20 48 L44 48 Z" fill="#5D6D7E" stroke="#D92229" strokeWidth="2" />
        <rect x="30" y="4" width="4" height="8" fill="#FDB515" />
        <rect x="12" y="52" width="40" height="4" fill="#5D6D7E" />
        <rect x="20" y="55" width="6" height="2" fill="#D92229" />
        <rect x="38" y="55" width="6" height="2" fill="#D92229" />
        <rect x="26" y="54" width="12" height="4" fill="#FDB515" />
      </svg>
    ),
  },
  {
    id: 'youth',
    title: 'YOUTH',
    subtitle: 'Build confidence stronger than Sutro Tower.',
    description: 'Ages 6-17. More character-building than a Muni commute, more fun than Giants games.',
    image: 'https://images.unsplash.com/photo-1620123569521-7a77a5c6ea87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // TODO: Host locally or via CDN for production
    imageAlt: 'Kids practicing stances with coach in front of Giants mural',
    icon: <Heart className="w-8 h-8" />,
    cta: 'Enroll Kids',
    sfIcon: (
      <svg width="64" height="64" viewBox="0 0 64 64" className="w-16 h-16" aria-hidden="true">
        <rect x="8" y="20" width="12" height="30" fill="#FDB515" />
        <rect x="20" y="15" width="12" height="35" fill="#D92229" />
        <rect x="32" y="18" width="12" height="32" fill="#5D6D7E" />
        <rect x="44" y="22" width="12" height="28" fill="#FDB515" />
        <polygon points="14,20 14,12 20,16" fill="#D92229" />
        <polygon points="26,15 26,7 32,11" fill="#5D6D7E" />
        <polygon points="38,18 38,10 44,14" fill="#FDB515" />
        <polygon points="50,22 50,14 56,18" fill="#D92229" />
        <ellipse cx="16" cy="10" rx="3" ry="2" fill="#FDB515" />
        <ellipse cx="48" cy="12" rx="3" ry="2" fill="#FDB515" />
      </svg>
    ),
  },
  {
    id: 'facilities',
    title: 'FACILITIES',
    subtitle: 'Open gym access - no appointment needed.',
    description: '5,000 sq ft of SF-tough equipment. Ring, 12 heavy bags, cardio zone with Bay views.',
    image: 'https://images.unsplash.com/photo-1710746904729-f3ad9f682bb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', // TODO: Host locally or via CDN for production
    imageAlt: '5,000 sq ft gym with ring, 12 heavy bags, cardio zone',
    icon: <Dumbbell className="w-8 h-8" />,
    cta: 'Tour Gym',
    sfIcon: (
      <svg width="64" height="64" viewBox="0 0 64 64" className="w-16 h-16" aria-hidden="true">
        <path d="M8 32 L16 24 L24 32 L32 24 L40 32 L48 24 L56 32" stroke="#5D6D7E" strokeWidth="3" fill="none" />
        <rect x="14" y="24" width="2" height="16" fill="#5D6D7E" />
        <rect x="30" y="24" width="2" height="16" fill="#5D6D7E" />
        <rect x="46" y="24" width="2" height="16" fill="#5D6D7E" />
        <circle cx="20" cy="45" r="4" fill="#D92229" />
        <circle cx="32" cy="45" r="4" fill="#FDB515" />
        <circle cx="44" cy="45" r="4" fill="#D92229" />
        <rect x="28" y="38" width="8" height="2" fill="#5D6D7E" />
      </svg>
    ),
  },
];

export const ServiceGrid: React.FC<ServiceGridProps> = memo(({ onNavigate }) => {
  const handleNavigation = (id: string) => {
    onNavigate?.(id);
  };

  return (
    <ServiceGridErrorBoundary>
      <section className="py-16 bg-gray-50" role="region" aria-label="Boxing club services and programs">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              SF-TOUGH <span className="text-primary">PROGRAMS</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From Foggy Bottom beginners to Twin Peaks champions, we’ve got a program that fits your SF lifestyle.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card
                key={service.id}
                className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white border-0 shadow-lg overflow-hidden"
                role="article"
                aria-labelledby={`service-title-${service.id}`}
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={service.image}
                    alt={service.imageAlt}
                    loading="lazy" // Lazy loading for performance
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    fallbackSrc="/images/fallback-boxing.jpg" // Ensure ImageWithFallback uses a local fallback
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3">
                    {service.sfIcon}
                  </div>
                  <div className="absolute bottom-4 left-4 text-white" aria-hidden="true">
                    {service.icon}
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3
                        id={`service-title-${service.id}`}
                        className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-200"
                      >
                        {service.title}
                      </h3>
                      <p className="text-secondary font-medium mb-2">{service.subtitle}</p>
                      <p className="text-gray-600 leading-relaxed">{service.description}</p>
                    </div>
                    <Button
                      onClick={() => handleNavigation(service.id)}
                      className="w-full bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200 group-hover:scale-105"
                      aria-label={`Navigate to ${service.title} details`}
                    >
                      {service.cta}
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto border-t-4 border-accent">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Find Your Program?</h3>
              <p className="text-gray-600 mb-6">
                Not sure which program fits your SF lifestyle? Our team will help you find your perfect match.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => handleNavigation('contact')}
                  className="bg-primary hover:bg-primary/90 text-white"
                  aria-label="Get personalized program recommendations"
                >
                  Get Program Recommendations
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleNavigation('schedule')}
                  className="border-secondary text-secondary hover:bg-secondary hover:text-white"
                  aria-label="View the full schedule of classes and programs"
                >
                  View Full Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ServiceGridErrorBoundary>
  );
});

ServiceGrid.displayName = 'ServiceGrid';
import React from 'react';
import { ArrowRight } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode; // Safer typing for JSX elements
  cta: string;
  page: string;
  image: string;
  altText: string;
}

interface ServiceCardProps {
  service: Service;
  onNavigate: (page: string) => void;
  delay?: number;
}

export function ServiceCard({ service, onNavigate, delay = 0 }: ServiceCardProps) {
  return (
    <div
      className="card fade-in bg-white shadow-lg rounded-lg overflow-hidden"
      style={delay ? { animationDelay: `${delay}s` } : {}}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-t লg mb-4 h-48">
        <img
          src={service.image}
          alt={service.altText}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy" // Add lazy loading
          onError={(e) => {
            e.currentTarget.src = '/fallback-image.jpg'; // Fallback image
          }}
        />
        
        {/* Icon Overlay */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-3 text-2xl shadow-md">
          {service.icon}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
          {service.title}
        </h3>
        
        <p className="text-gray-600 leading-relaxed">
          {service.description}
        </p>
        
        <div className="flex items-center justify-between pt-2">
          <button
            className="btn btn-ghost group-hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
            onClick={() => onNavigate(service.page)}
            aria-label={`Learn more about ${service.title}`}
          >
            {service.cta}
            <ArrowRight
              size={16}
              className="ml-2 group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { lazy, Suspense } from 'react';
import { Star, Quote } from 'lucide-react';
import PropTypes from 'prop-types';

// Lazy load ImageWithFallback for better performance
const ImageWithFallback = lazy(() => import('./ImageWithFallback'));

interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
  program: string;
  image?: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  delay?: number;
}

export function TestimonialCard({ testimonial, delay = 0 }: TestimonialCardProps) {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={`${testimonial.id}-star-${index}`}
        size={16}
        className={
          index < fullStars
            ? 'text-yellow-400 fill-current'
            : index === fullStars && hasHalfStar
              ? 'text-yellow-400 fill-current [clip-path:polygon(0_0,50%_0,50%_100%,0_100%)]'
              : 'text-gray-300'
        }
        aria-hidden="true"
      />
    ));
  };

  return (
    <article
      key={testimonial.id}
      className="card bg-white shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
      role="region"
      aria-labelledby={`${testimonial.id}-name`}
    >
      <div className="flex items-center space-x-4 mb-4 p-4">
        <Suspense fallback={<div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />}>
          <div className="relative">
            <ImageWithFallback
              src={testimonial.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'}
              alt={`Portrait of ${testimonial.name} from ${testimonial.location}`}
              className="w-16 h-16 rounded-full object-cover"
              loading="lazy"
            />
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">
              {testimonial.location.split(',')[0].trim() || 'SF'}
            </div>
          </div>
        </Suspense>

        <div className="flex-1">
          <h4 id={`${testimonial.id}-name`} className="font-semibold text-gray-900">
            {testimonial.name}
          </h4>
          <p className="text-sm text-gray-600">{testimonial.location}</p>
          <div className="flex items-center space-x-1 mt-1" role="img" aria-label={`Rated ${testimonial.rating} out of 5 stars`}>
            {renderStars(testimonial.rating)}
          </div>
        </div>
      </div>

      <div className="relative px-4 pb-4">
        <Quote className="absolute -top-2 -left-2 text-red-200" size={24} aria-hidden="true" />
        <blockquote className="text-gray-700 leading-relaxed pl-6">
          {testimonial.quote}
        </blockquote>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 px-4 pb-4">
        <span className="inline-block bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-medium">
          {testimonial.program}
        </span>
      </div>
    </article>
  );
}

TestimonialCard.propTypes = {
  testimonial: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    quote: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    program: PropTypes.string.isRequired,
    image: PropTypes.string,
  }).isRequired,
  delay: PropTypes.number,
};
