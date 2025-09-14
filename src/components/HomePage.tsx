/* HomePage.professional.tsx
   Professional, single-file, production-ready React + TypeScript HomePage
   Merges Hero, Header, Footer, Testimonials, Services, Sparring Canvas, Soundscape,
   Flash Sale, Booking, Confetti, Analytics, Fog effect, and many utility hooks.
   Based on uploaded source file(s). See original uploaded content for reference. */

import React, { useCallback, useEffect, useMemo, useRef, useState, useLayoutEffect, memo } from "react";
/* Relative imports (kept at top as requested) */
import { ImageWithFallback } from "./ImageWithFallback";
import { TestimonialCard } from "./TestimonialCard";
import { ServiceCard } from "./ServiceCard";

/* External libs (ensure these are installed in your project) */
import { Helmet } from "react-helmet-async";
import confetti from "canvas-confetti";
import { formatInTimeZone } from "date-fns-tz";
import {
  Play, Pause, ArrowRight, Calendar, Users, Trophy, Target, Smartphone, Star
} from "lucide-react";

/* ========================
   Types
   ======================== */

type ScheduleSlot = {
  id: string;
  day?: string;
  time: string; // "HH:MM:SS"
  className: string;
  trainerName: string;
  duration: number;
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
   Constants & seeded data
   ======================== */

const LS_NAMESPACE = "s3_boxing_";
const LS_KEYS = {
  TESTIMONIALS: `${LS_NAMESPACE}testimonials_v1`,
  ANALYTICS: `${LS_NAMESPACE}analytics_v1`,
  BOOKINGS: `${LS_NAMESPACE}bookings_v1`,
  SETTINGS: `${LS_NAMESPACE}settings_v1`
};

const SCHEDULE: ScheduleSlot[] = [
  { id: "s1", day: "2025-09-15", time: "09:00:00", className: "Bootcamp Blast", trainerName: "Elena", duration: 60, displaySpots: 3, surgePrice: 20 },
  { id: "s2", day: "2025-09-16", time: "18:00:00", className: "Night Ring Drills", trainerName: "Omar", duration: 75, displaySpots: 2, surgePrice: 35 },
  { id: "s3", day: "2025-09-16", time: "19:30:00", className: "Technique & Flow", trainerName: "Raul", duration: 45, displaySpots: 1 },
];

const SERVICES: Service[] = [
  { id: "group-classes", title: "Group Classes", description: "Coach-led sessions for all levels.", icon: "Users", cta: "Join a Class", page: "classes", image: "/assets/group-classes.jpg", altText: "Group boxing class" },
  { id: "personal-training", title: "Personal Training", description: "One-on-one coaching calibrated to goals.", icon: "Target", cta: "Book Session", page: "personal-training", image: "/assets/personal-training.jpg", altText: "Personal training" },
  { id: "competitive", title: "Competitive Program", description: "Fight-ready pathway & sparring.", icon: "Trophy", cta: "Learn More", page: "academy", image: "/assets/competitive.jpg", altText: "Competitive program" },
];

/* ========================
   Utilities: robust localStorage wrapper
   ======================== */

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}

function hasLocalStorage(): boolean {
  try {
    return typeof window !== "undefined" && "localStorage" in window;
  } catch {
    return false;
  }
}

/* useLocalStorage hook with namespacing, validation, migration callback support */
function useLocalStorage<T>(key: string, initial: T) {
  const nsKey = key;
  const [state, setState] = useState<T>(() => {
    if (!hasLocalStorage()) return initial;
    try {
      return safeParse<T>(localStorage.getItem(nsKey), initial);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    if (!hasLocalStorage()) return;
    try {
      localStorage.setItem(nsKey, JSON.stringify(state));
    } catch (e) {
      // quota exceeded or other errors: attempt fallback by clearing oldest analytics entry
      try {
        const logs = safeParse<any[]>(localStorage.getItem(LS_KEYS.ANALYTICS), []);
        if (logs.length > 200) {
          logs.splice(200);
          localStorage.setItem(LS_KEYS.ANALYTICS, JSON.stringify(logs));
          localStorage.setItem(nsKey, JSON.stringify(state));
        }
      } catch { /* final fallback: ignore */ }
    }
  }, [nsKey, state]);

  return [state, setState] as const;
}

/* ========================
   Analytics hook
   ======================== */

function useAnalytics() {
  const track = useCallback((event: string, meta: Record<string, any> = {}) => {
    try {
      const logsRaw = hasLocalStorage() ? localStorage.getItem(LS_KEYS.ANALYTICS) : null;
      const logs = safeParse<any[]>(logsRaw, []);
      logs.unshift({ event, meta, time: new Date().toISOString() });
      if (logs.length > 500) logs.splice(500);
      if (hasLocalStorage()) localStorage.setItem(LS_KEYS.ANALYTICS, JSON.stringify(logs));
      // also report to console during development
      if (process.env.NODE_ENV !== "production") console.debug("analytics:", event, meta);
    } catch {}
  }, []);
  return { track };
}

/* ========================
   Confetti hook
   ======================== */

function useConfetti() {
  return useCallback((opts?: { particleCount?: number }) => {
    try {
      const c = document.createElement("canvas");
      c.style.position = "fixed";
      c.style.left = "0";
      c.style.top = "0";
      c.style.pointerEvents = "none";
      document.body.appendChild(c);
      const instance = confetti.create(c, { resize: true });
      instance({ particleCount: opts?.particleCount ?? 120, spread: 80, origin: { y: 0.6 } });
      setTimeout(() => { try { c.remove(); } catch {} }, 2500);
    } catch {}
  }, []);
}

/* ========================
   Browser Notifications hook
   ======================== */

function useBrowserNotifications() {
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return false;
    try {
      const p = await Notification.requestPermission();
      return p === "granted";
    } catch { return false; }
  }, []);
  const notify = useCallback((title: string, options?: NotificationOptions & { delayMs?: number }) => {
    if (!("Notification" in window)) return;
    const run = () => new Notification(title, options);
    if (options?.delayMs) setTimeout(run, options.delayMs); else run();
  }, []);
  return { requestPermission, notify };
}

/* ========================
   useVideoPlayer hook
   ======================== */

function useVideoPlayer(videoRef: React.RefObject<HTMLVideoElement>) {
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (playing) el.play().catch(() => {});
    else el.pause();
  }, [playing, videoRef]);
  const toggle = useCallback(() => setPlaying(p => !p), []);
  return { playing, toggle, setPlaying };
}

/* ========================
   Testimonial rotation hook
   ======================== */

function useTestimonialRotation(list: Testimonial[], interval = 4000) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!list?.length) return;
    const t = setInterval(() => setIndex(i => (i + 1) % list.length), interval);
    return () => clearInterval(t);
  }, [list, interval]);
  return [index, setIndex] as const;
}

/* ========================
   Countdown hook
   ======================== */

function useCountdown(endAt: Date | null) {
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    if (!endAt) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [endAt]);
  const seconds = endAt ? Math.max(0, Math.floor((endAt.getTime() - now.getTime()) / 1000)) : 0;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return { seconds, minutes, secs };
}

/* ========================
   Fog effect hook
   ======================== */

function useFog(initial = false) {
  const [fog, setFog] = useState(initial);
  const toggle = useCallback(() => setFog(f => !f), []);
  return { fog, toggle, setFog };
}

/* ========================
   Soundscape hook
   ======================== */

function useSoundscape(src = "/assets/ambient-gym.mp3") {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio(src);
    audioRef.current.loop = true;
    return () => {
      try { audioRef.current?.pause(); } catch {}
      audioRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.play().catch(() => setPlaying(false));
    else audioRef.current.pause();
  }, [playing]);

  const toggle = useCallback(() => setPlaying(p => { const n = !p; return n; }), []);
  return { playing, toggle, setPlaying };
}

/* ========================
   Sparring canvas optimized hook
   ======================== */

function useSparringCanvas(canvasRef: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let raf = 0;
    const DPR = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = Math.floor((canvas.clientWidth || 600) * DPR);
      canvas.height = Math.floor((canvas.clientHeight || 320) * DPR);
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });
    const ctx = canvas.getContext("2d");
    let last = performance.now();
    const draw = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width / DPR;
      const h = canvas.height / DPR;
      // background
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, w, h);
      // ring
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      ctx.strokeRect(12, 12, w - 24, h - 24);
      // fighters
      const nowMs = Date.now();
      const x1 = 100 + Math.sin(nowMs / 300) * (w * 0.12);
      const x2 = w - 100 + Math.cos(nowMs / 410) * (w * -0.12);
      ctx.beginPath(); ctx.fillStyle = "#e11"; ctx.arc(x1, h / 2, 26, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.fillStyle = "#118"; ctx.arc(x2, h / 2, 26, 0, Math.PI * 2); ctx.fill();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}

/* ========================
   Error Boundary
   ======================== */

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: any) { console.error("ErrorBoundary caught:", err); }
  render() {
    if (this.state.hasError) {
      return <div role="alert" style={{ padding: 24, textAlign: "center", color: "#b91c1c" }}>Something went wrong. Please refresh or contact support.</div>;
    }
    return this.props.children;
  }
}

/* ========================
   Lightweight local fallbacks when external components missing
   ======================== */

const FallbackImage: React.FC<{ src?: string; alt?: string; className?: string; style?: any }> = ({ src, alt }) => (
  <img src={src || "/assets/placeholder.jpg"} alt={alt || ""} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
);

const FallbackServiceCard = memo(function ({ service, onNavigate }: { service: Service; onNavigate?: (p: string) => void }) {
  const Icon: any = service.icon === "Users" ? Users : service.icon === "Target" ? Target : Trophy;
  return (
    <article role="article" aria-labelledby={`service-title-${service.id}`} style={{ background: "#fff", padding: 14, borderRadius: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ background: "#f3f4f6", padding: 8, borderRadius: 8 }}><Icon size={20} /></div>
        <h3 id={`service-title-${service.id}`} style={{ margin: 0 }}>{service.title}</h3>
      </div>
      <p style={{ color: "#374151", marginTop: 8 }}>{service.description}</p>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, alignItems: "center" }}>
        <button onClick={() => onNavigate?.(service.page || "")} style={{ padding: "8px 12px", background: "#111827", color: "#fff", borderRadius: 8 }}> {service.cta || "Learn"} </button>
        <div style={{ width: 80, height: 60, overflow: "hidden", borderRadius: 8 }}>
          <FallbackImage src={service.image} alt={service.altText} />
        </div>
      </div>
    </article>
  );
});

/* ========================
   Main HomePage component
   ======================== */

export default function HomePage({ onNavigate, onBookClass }: HomePageProps): JSX.Element {
  const { track } = useAnalytics();
  const confettiFn = useConfetti();
  const { requestPermission, notify } = useBrowserNotifications();
  const [testimonials, setTestimonials] = useLocalStorage<Testimonial[]>(LS_KEYS.TESTIMONIALS, [
    { id: "t1", name: "Sophie M.", location: "Mission District", quote: "This gym changed my life.", rating: 5, image: "/assets/john-doe.jpg" },
    { id: "t2", name: "John D.", location: "Dogpatch", quote: "Expert coaching and community energy.", rating: 5, image: "/assets/jane-smith.jpg" },
  ]);
  const [settings, setSettings] = useLocalStorage(LS_KEYS.SETTINGS, { fog: false, soundscape: false });
  const fogState = useFog(settings.fog);
  useEffect(() => setSettings(s => ({ ...s, fog: fogState.fog })), [fogState.fog]); // persist fog

  const [socialCount, setSocialCount] = useState<number>(() => 1243 + Math.floor(Math.random() * 120));
  useEffect(() => { const id = setInterval(() => setSocialCount(prev => prev + Math.floor(Math.random() * 3)), 4000); return () => clearInterval(id); }, []);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { playing: videoPlaying, toggle: toggleVideo } = useVideoPlayer(videoRef);

  const { playing: soundPlaying, toggle: toggleSound } = useSoundscape();

  const [bookings, setBookings] = useLocalStorage<any[]>(LS_KEYS.BOOKINGS, []);
  const bookClass = useCallback((slot: ScheduleSlot) => {
    track("booking_attempt", { slotId: slot.id });
    const booking = { id: `b_${Date.now()}`, slotId: slot.id, created_at: new Date().toISOString() };
    setBookings(prev => [booking, ...prev].slice(0, 200));
    confettiFn({ particleCount: 160 });
    notify("Booking Confirmed", { body: `${slot.className} at ${slot.time}` });
    onBookClass && onBookClass({ ...slot, bookingId: booking.id });
  }, [setBookings, onBookClass, track, confettiFn, notify]);

  // Testimonials management
  const addSynthetic = useCallback(() => {
    const t: Testimonial = {
      id: `gen-${Date.now()}`,
      name: ["Alex P.","Jordan S.","Taylor R."][Math.floor(Math.random()*3)],
      quote: ["I gained so much confidence training here.","Lost 10 lbs and built real stamina.","Community + coaching = results."][Math.floor(Math.random()*3)],
      rating: 5,
      generated: true
    };
    setTestimonials(prev => [t, ...prev].slice(0, 200));
    track("testimonial_added", { synthetic: true });
    confettiFn({});
  }, [setTestimonials, track, confettiFn]);

  const clearTestimonials = useCallback(() => {
    setTestimonials([]);
    track("testimonials_cleared");
  }, [setTestimonials, track]);

  // testimonial rotation
  const [testimonialIndex] = useTestimonialRotation(testimonials, 5000);

  // Flash sale
  const saleEnds = useMemo(() => { const d = new Date(); d.setMinutes(d.getMinutes() + 30); return d; }, []);
  const countdown = useCountdown(saleEnds);

  // sparring canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useSparringCanvas(canvasRef);

  // Accessibility: reduced motion
  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Navigation
  const handleNavigate = useCallback((page: string) => {
    track("navigate", { page });
    if (onNavigate) onNavigate(page);
    else if (page === "schedule") {
      const el = document.querySelector("[aria-label='Schedule']");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [onNavigate, track]);

  // Request notification permission on mount for better UX (non-intrusive)
  useEffect(() => {
    requestPermission().then((granted) => {
      if (granted) track("notifications_granted");
    });
  }, [requestPermission, track]);

  // Analytics: page load
  useEffect(() => { track("homepage_loaded", {}); }, [track]);

  // Service card provider fallback
  const ServiceCardToUse = typeof ServiceCard !== "undefined" ? (ServiceCard as any) : FallbackServiceCard;
  const TestimonialCardToUse = typeof TestimonialCard !== "undefined" ? (TestimonialCard as any) : null;

  return (
    <ErrorBoundary>
      <Helmet><title>3rd Street Boxing — Where Strength Meets Strategy</title></Helmet>

      <div style={{ maxWidth: 1200, margin: "20px auto", padding: 12 }}>
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>3rd Street Boxing</h1>
            <div style={{ fontSize: 13, color: "#6b7280", maxWidth: 560 }}>
              Authentic boxing training fused with modern sports science.
            </div>
          </div>

          <nav aria-label="Primary navigation" style={{ display: "flex", gap: 8 }}>
            <button onClick={() => handleNavigate("home")} aria-label="Home" style={{ background: "transparent", border: "none", cursor: "pointer" }}>Home</button>
            <button onClick={() => handleNavigate("schedule")} aria-label="Schedule" style={{ background: "transparent", border: "none", cursor: "pointer" }}>Schedule</button>
            <button onClick={() => handleNavigate("academy")} aria-label="Academy" style={{ background: "transparent", border: "none", cursor: "pointer" }}>Academy</button>
            <button onClick={() => fogState.toggle()} aria-pressed={fogState.fog} style={{ padding: "8px 10px", borderRadius: 8 }}>{fogState.fog ? "Disable Fog" : "Enable Fog"}</button>
          </nav>
        </header>

        {/* Hero */}
        <section aria-label="Hero" style={{ position: "relative", minHeight: 420, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <video ref={videoRef} autoPlay loop muted playsInline poster="/assets/hero-poster.jpg" style={{ width: "100%", height: "100%", objectFit: "cover" }}>
              <source src="/assets/hero-video.mp4" type="video/mp4" />
            </video>
            <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(2,6,23,0.35), rgba(2,6,23,0.6))" }} />
          </div>

          <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "40px 20px", color: "#fff" }}>
            <h2 style={{ fontSize: 36, margin: 0, lineHeight: 1.05 }}>WHERE SF'S TOUGHEST FIND THEIR STRENGTH</h2>
            <p style={{ marginTop: 12, maxWidth: 760, marginLeft: "auto", marginRight: "auto" }}>Programs engineered to build power, endurance and fight IQ.</p>

            <div style={{ marginTop: 18, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => { handleNavigate("book-intro"); track("hero_claim_click"); }} style={{ padding: "12px 18px", borderRadius: 10, background: "#ff3b30", color: "#fff", border: "none", fontWeight: 800 }}>🥊 CLAIM 50% OFF FIRST ROUND</button>
              <button onClick={() => handleNavigate("schedule")} style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" }}><Calendar size={16} style={{ marginRight: 8 }} /> SEE SCHEDULE</button>
            </div>
          </div>

          <button onClick={() => toggleVideo()} aria-label={videoPlaying ? "Pause video" : "Play video"} style={{ position: "absolute", bottom: 18, right: 18, zIndex: 20, background: "rgba(0,0,0,0.55)", color: "#fff", borderRadius: 999, padding: 10, border: "none" }}>
            {videoPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
        </section>

        {/* Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, marginTop: 18 }}>
          <main>
            <div style={{ marginBottom: 16 }}>
              {/* Fight ticker */}
              <div style={{ overflow: "hidden", whiteSpace: "nowrap", background: "#111827", color: "#fff", padding: "8px 12px", borderRadius: 8 }}>
                <div style={{ display: "inline-block", animation: "ticker 16s linear infinite" }}>Fight Night — Friday 8pm • Sparring Tournament registration open • Championship prep starting soon</div>
                <style>{`@keyframes ticker{0%{transform:translateX(100%);}100%{transform:translateX(-100%);}}`}</style>
              </div>
            </div>

            <section aria-label="Schedule" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: 14, borderRadius: 10, background: "#fff" }}>
                <h3 style={{ marginTop: 0 }}>Schedule — Reserve Your Spot</h3>
                <p style={{ color: "#6b7280" }}>Book classes quickly — surge pricing indicates high demand.</p>
                {SCHEDULE.map(s => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f3f4f6", padding: "12px 0" }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{s.className}</div>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>{s.trainerName} • {s.duration}m • {s.classLevel ?? "All levels"}</div>
                      {s.surgePrice && <div style={{ color: "#b45309", marginTop: 6 }}>Peak surcharge: +${s.surgePrice}</div>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div>{formatInTimeZone(new Date(`2000-01-01T${s.time}`), "America/Los_Angeles", "h:mm aa")}</div>
                      <div style={{ color: "#6b7280", marginTop: 6 }}>{s.displaySpots ?? "—"} spots left</div>
                      <button onClick={() => bookClass(s)} style={{ marginTop: 8, padding: "8px 10px", background: "#111827", color: "#fff", borderRadius: 8, border: "none" }}>Book</button>
                    </div>
                  </div>
                ))}
              </div>

              <aside aria-label="Utilities" style={{ display: "grid", gap: 12 }}>
                <div style={{ padding: 12, borderRadius: 8, background: "#111827", color: "#fff" }}>
                  <div style={{ fontWeight: 800 }}>FLASH SALE — LIMITED TIME</div>
                  <div style={{ marginTop: 6 }}>Premium Monthly Pass — 50% off</div>
                  <div style={{ fontSize: 20, marginTop: 8, fontWeight: 900 }}>{countdown.minutes}:{String(countdown.secs).padStart(2,"0")}</div>
                </div>

                <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
                  <div style={{ fontWeight: 800 }}>Social Proof</div>
                  <div style={{ fontSize: 28, color: "#dc2626", fontWeight: 900, marginTop: 6 }}>{socialCount.toLocaleString()}</div>
                  <div style={{ color: "#6b7280", marginTop: 8 }}>Locals training this week</div>
                </div>

                <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
                  <div style={{ fontWeight: 800 }}>Ambient Soundscape</div>
                  <div style={{ marginTop: 8 }}><button onClick={() => toggleSound()} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: soundPlaying ? "#dc2626" : "#f3f4f6", color: soundPlaying ? "#fff" : "#111827" }}>{soundPlaying ? "Stop" : "Play"}</button></div>
                </div>
              </aside>
            </section>

            <section aria-label="Sparring simulator" style={{ marginTop: 16 }}>
              <h3 style={{ marginBottom: 8 }}>Sparring Simulator</h3>
              <canvas ref={canvasRef} style={{ width: "100%", height: 320, borderRadius: 8 }} aria-label="Sparring simulator canvas" />
            </section>
          </main>

          <aside>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
                <div style={{ fontWeight: 800 }}>Guaranteed Progress</div>
                <div style={{ marginTop: 8, color: "#374151" }}>Complete our 12-week plan — we'll extend coaching until you're fight-ready.</div>
              </div>

              <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
                <div style={{ fontWeight: 800 }}>Challenge Generator</div>
                <div style={{ marginTop: 8, color: "#374151" }}>Generate a focused training sprint.</div>
                <button onClick={() => { const days = 7 + Math.floor(Math.random()*14); const name = ["Fog City Fury","Bridge Builder","Mission Shred"][Math.floor(Math.random()*3)]; track("challenge_generated", { name, days }); notify("New Challenge", { body: `${name} — ${days}-day challenge`, delayMs: 1200 }); confettiFn({}); }} style={{ marginTop: 8, padding: 10, background: "#111827", color: "#fff", borderRadius: 8 }}>Generate Challenge</button>
              </div>
            </div>
          </aside>
        </div>

        {/* Services */}
        <section aria-label="Programs" style={{ marginTop: 26, background: "#fff", padding: 18, borderRadius: 12 }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 22 }}>SF-TOUGH PROGRAMS</h3>
            <p style={{ color: "#6b7280", marginTop: 8 }}>Programs for fighters, fitness seekers, and youth athletes.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
            {SERVICES.map(s => <ServiceCardToUse key={s.id} service={s} onNavigate={(p: string) => handleNavigate(p)} />)}
          </div>
        </section>

        {/* Testimonials */}
        <section aria-label="Testimonials" style={{ marginTop: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ margin: 0 }}>HEAR IT FROM THE NEIGHBORHOOD</h2>
              <div style={{ color: "#6b7280", marginTop: 8 }}>Client stories that show transformation.</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addSynthetic} style={{ padding: "8px 10px", borderRadius: 8, background: "#06b6d4", color: "#fff" }}>Add Synthetic</button>
              <button onClick={clearTestimonials} style={{ padding: "8px 10px", borderRadius: 8, background: "#f3f4f6" }}>Clear</button>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
              {testimonials.map((t, i) => {
                if (TestimonialCardToUse) return <TestimonialCardToUse key={t.id} testimonial={t} />;
                return (
                  <article key={t.id} style={{ background: "#fff", padding: 14, borderRadius: 8 }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden" }}><FallbackImage src={t.image} alt={t.name} /></div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{t.name}</div>
                        <div style={{ color: "#374151", marginTop: 6 }}>{t.quote}</div>
                        <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>{(t.rating || 5)} ⭐ {t.program ? `• ${t.program}` : ""}</div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <footer style={{ marginTop: 28, color: "#6b7280", fontSize: 13 }}>
          <div>3rd Street Boxing — Authentic training, measurable progress. © 2025</div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
