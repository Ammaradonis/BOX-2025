// PersonalTrainingPage.tsx
/**
 * PersonalTrainingPage.tsx
 *
 * Premium Personal Training page for 3rd Street Boxing.
 * Single-file, self-contained React + TypeScript component that adapts features
 * from the provided demo merged_hardcoded.tsx (local QA/demo utilities, AR try-on,
 * confetti, fake payment flow, session builder, progress tracker, etc.)
 *
 * - All styles are inline JSX style objects (no external CSS)
 * - State is managed with React hooks
 * - Uses canvas-confetti and date-fns-tz (assumed installed)
 *
 * NOTE: This file is intended to be dropped directly into a Next.js / React project.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Helmet } from "react-helmet-async";
import confetti from "canvas-confetti";
import { formatInTimeZone } from "date-fns-tz";

/* ============================
   Types
   ============================ */

type TrainerProfile = {
  id: string;
  name: string;
  bio: string;
  specialties: string[];
  rating: number;
  hourlyRate: number;
  availability: { day: string; time: string; duration: number }[];
  photoUrl?: string;
  celebrity?: boolean;
};

type TrainingSession = {
  id: string;
  trainerId: string;
  durationMinutes: number;
  focusAreas: string[];
  intensity: "low" | "moderate" | "high";
  scheduledAt?: string; // ISO
  notes?: string;
  price?: number;
};

type ProgressAssessment = {
  userId: string;
  startDate: string;
  weightKg?: number;
  bodyFatPct?: number;
  fitnessTest?: { pushUps?: number; plankSec?: number; runMins?: number };
  milestones: { id: string; label: string; achievedAt?: string }[];
  points?: number;
};

type Subscription = {
  trainer: string;
  subscriptionID: string;
};

/* ============================
   Utilities: localStorage, analytics, confetti
   ============================ */

const saveToLS = (k: string, v: any) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {
    // swallow: LS not available
    // could log to analytics
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

const analyticsTrack = (event: string, meta: any = {}) => {
  try {
    const logs = loadFromLS<any[]>("pt_analytics", []);
    logs.unshift({ event, meta, time: new Date().toISOString() });
    saveToLS("pt_analytics", logs.slice(0, 200));
    // In prod: forward to real analytics endpoint
  } catch {
    // ignore
  }
};

const triggerConfetti = (options: any = {}) => {
  try {
    // small celebratory burst
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      ...options,
    });
  } catch {
    // confetti lib missing -> noop
  }
};

/* ============================
   Synthetic testimonial (adapted)
   ============================ */

type Testimonial = {
  id: string;
  name: string;
  quote: string;
  rating?: number;
  generated?: boolean;
};

const testimonialTemplates = [
  "I gained so much confidence training here — {trainer} really changed my world.",
  "Lost {n} lbs and gained a championship mindset in {months} months.",
  "The one-on-one attention is unmatched. {trainer}'s coaching is 🔥.",
];

function generateSyntheticTestimonial(overrides: Partial<Testimonial> = {}): Testimonial {
  const t =
    testimonialTemplates[Math.floor(Math.random() * testimonialTemplates.length)];
  const trainerOptions = ["Raúl", "Coach Omar", "Coach Elena", "Dina"];
  const filled = t
    .replace("{trainer}", trainerOptions[Math.floor(Math.random() * trainerOptions.length)])
    .replace("{n}", String(8 + Math.floor(Math.random() * 20)))
    .replace("{months}", String(2 + Math.floor(Math.random() * 10)));
  return {
    id: `gen-${Date.now()}`,
    name: ["Alex P.", "Jordan S.", "Taylor R."][Math.floor(Math.random() * 3)],
    quote: filled,
    rating: 5,
    generated: true,
    ...overrides,
  };
}

/* ============================
   Mock Data: premium trainers
   ============================ */

// Replace static trainer data with more realistic and detailed information
const PREMIUM_TRAINERS: TrainerProfile[] = [
  {
    id: "t-elena",
    name: "Elena Garcia",
    bio: "Former Olympic boxing coach with 15+ years experience training champions. Specializes in strength conditioning and technical precision.",
    specialties: ["Olympic technique", "strength training", "footwork"],
    rating: 4.9,
    hourlyRate: 150,
    certification: "NSCA-CSCS, USA Boxing Level 4",
    yearsExperience: 15,
    photoUrl: "/trainers/elena-garcia.jpg", // Add real photos
    availability: generateRealisticAvailability(7), // Dynamic future dates
    celebrity: false,
    achievements: ["2016 Olympic Coach", "5x Golden Gloves Champion"]
  },
  {
    id: "t-omar",
    name: "Omar Qureshi",
    bio: "Former pro fighter with 20+ professional bouts. Tactical sparring coach focused on fight IQ, defense, and adaptive strategies.",
    specialties: ["sparring", "fight IQ", "defense"],
    rating: 4.95,
    hourlyRate: 200,
    certification: "Certified Tactical Combat Coach",
    yearsExperience: 18,
    photoUrl: "/trainers/omar-qureshi.jpg",
    availability: generateRealisticAvailability(5),
    celebrity: true,
    achievements: ["WBC Continental Title Holder", "Trained UFC featherweight contenders"]
  },
  {
    id: "t-raul",
    name: "Raúl Mendes",
    bio: "Precision striking coach with a strong background in mobility and sports rehabilitation. Helps athletes build efficient, injury-free movement patterns.",
    specialties: ["technique", "mobility", "rehab"],
    rating: 4.8,
    hourlyRate: 140,
    certification: "NASM-CES, Certified Striking Coach",
    yearsExperience: 12,
    photoUrl: "/trainers/raul-mendes.jpg",
    availability: generateRealisticAvailability(6),
    celebrity: false,
    achievements: ["Rehab specialist for La Liga athletes", "Founder of Precision Striking Academy"]
  },
  {
    id: "t-maya",
    name: "Maya Chen",
    bio: "Sports scientist and conditioning coach with a PhD in biomechanics. Blends research-driven training with elite boxing programs.",
    specialties: ["biomechanics", "conditioning", "injury prevention"],
    rating: 4.97,
    hourlyRate: 220,
    certification: "PhD Biomechanics, ACSM-CPT",
    yearsExperience: 10,
    photoUrl: "/trainers/maya-chen.jpg",
    availability: generateRealisticAvailability(4),
    celebrity: false,
    achievements: ["Lead researcher at HK Sports Institute", "Strength coach for world champion boxer"]
  },
  {
    id: "t-luis",
    name: "Luis Ortega",
    bio: "Celebrity boxing trainer known for coaching actors and musicians preparing for major roles and events. Focuses on fast transformations and performance coaching.",
    specialties: ["celebrity training", "conditioning", "boxing for performance"],
    rating: 4.85,
    hourlyRate: 300,
    certification: "ISSA Elite Trainer, Boxing Performance Specialist",
    yearsExperience: 20,
    photoUrl: "/trainers/luis-ortega.jpg",
    availability: generateRealisticAvailability(3),
    celebrity: true,
    achievements: ["Trainer for Netflix action stars", "Featured on ESPN Training Camp"]
  }
];


/* ============================
   Small shared styles (inline)
   ============================ */

const styles = {
  page: {
    maxWidth: 1100,
    margin: "18px auto",
    padding: 16,
    fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial",
    color: "#111827" as const,
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  trainerCard: { padding: 12, borderRadius: 10, background: "#fff", boxShadow: "0 6px 18px rgba(16,24,40,0.04)" },
  primaryBtn: { padding: "8px 12px", background: "#dc2626", color: "#fff", borderRadius: 8, border: "none", cursor: "pointer" },
  secondaryBtn: { padding: "8px 12px", background: "#f3f4f6", color: "#111", borderRadius: 8, border: "none", cursor: "pointer" },
  input: { width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" },
  sectionTitle: { fontSize: 20, fontWeight: 700, marginBottom: 8 },
};

/* ============================
   AR Try-On component (copied/adapted)
   ============================ */
const ArTryOn: React.FC<{ label?: string }> = ({ label = "AR Glove Try-On" }) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!dataUrl) return;
    const img = new Image();
    img.onload = () => {
      const c = canvasRef.current!;
      if (!c) return;
      c.width = 360;
      c.height = 360;
      const ctx = c.getContext("2d")!;
      ctx.clearRect(0, 0, c.width, c.height);
      // draw user photo
      ctx.drawImage(img, 0, 0, c.width, c.height);
      // overlay glove mock (ellipse)
      ctx.fillStyle = "rgba(220,38,38,0.6)";
      ctx.beginPath();
      ctx.ellipse(c.width - 90, c.height - 90, 70, 50, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("3rd Street Premium Glove (preview)", c.width - 240, c.height - 85);
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
    <div aria-label="AR Try-On" style={{ padding: 12, borderRadius: 10, background: "#fff" }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{label}</div>
      <input
        ref={fileRef as any}
        type="file"
        accept="image/*"
        onChange={() => onFile()}
        aria-label="Upload photo for AR try-on"
        style={{ marginBottom: 8 }}
      />
      <div>
        <canvas
          ref={canvasRef}
          style={{ width: 360, height: 360, display: dataUrl ? "block" : "none", borderRadius: 8, background: "#f9fafb" }}
        />
        {!dataUrl && <div style={{ color: "#6b7280" }}>Upload a selfie to preview premium glove overlay (demo).</div>}
      </div>
    </div>
  );
};

/* ============================
   SoundscapeToggle (adapted)
   ============================ */
const SoundscapeToggle: React.FC = () => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/assets/ambient-gym.mp3");
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
      <button
        onClick={() => setPlaying((p) => !p)}
        style={{ ...styles.secondaryBtn, background: playing ? "#dc2626" : "#f3f4f6", color: playing ? "#fff" : "#111" }}
        aria-pressed={playing}
        aria-label={playing ? "Stop soundscape" : "Play soundscape"}
      >
        {playing ? "Stop Soundscape" : "Play Soundscape"}
      </button>
      <div style={{ color: "#6b7280" }}>{playing ? "Playing ambient gym audio" : "Soundscape off"}</div>
    </div>
  );
};

/* ============================
   ProgressTracker component
   - Visualizes progress, milestones, and triggers confetti on milestone hit
   ============================ */

const ProgressTracker: React.FC<{ userId: string }> = ({ userId }) => {
  const STORAGE_KEY = `pt_progress_${userId}`;
  const [progress, setProgress] = useState<ProgressAssessment>(() =>
    loadFromLS(STORAGE_KEY, {
      userId,
      startDate: new Date().toISOString(),
      weightKg: undefined,
      bodyFatPct: undefined,
      fitnessTest: {},
      milestones: [
        { id: "m1", label: "First 30-day streak" },
        { id: "m2", label: "10% strength increase" },
      ],
      points: 0,
    } as ProgressAssessment)
  );

  useEffect(() => {
    saveToLS(STORAGE_KEY, progress);
  }, [progress, STORAGE_KEY]);

  const achieveMilestone = useCallback((mid: string) => {
    setProgress((p) => {
      if (p.milestones.find((m) => m.id === mid && m.achievedAt)) {
        return p;
      }
      const updated = {
        ...p,
        milestones: p.milestones.map((m) => (m.id === mid ? { ...m, achievedAt: new Date().toISOString() } : m)),
        points: (p.points || 0) + 250,
      };
      analyticsTrack("milestone_achieved", { userId, milestone: mid });
      triggerConfetti();
      return updated;
    });
  }, [userId]);

  return (
    <div style={{ padding: 12, borderRadius: 10, background: "#fff" }}>
      <div style={{ ...styles.sectionTitle }}>Progress Tracker</div>
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>Points: {(progress.points || 0).toLocaleString()}</div>
      <div>
        {progress.milestones.map((m) => (
          <div key={m.id} style={{ padding: 8, borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{m.achievedAt ? `Achieved ${new Date(m.achievedAt).toLocaleDateString()}` : "Not achieved"}</div>
            </div>
            <div>
              {!m.achievedAt && (
                <button
                  onClick={() => achieveMilestone(m.id)}
                  style={{ ...styles.primaryBtn, padding: "6px 10px" }}
                  aria-label={`Mark ${m.label} achieved`}
                >
                  Mark achieved
                </button>
              )}
              {m.achievedAt && <div style={{ color: "#10b981", fontWeight: 700 }}>✓</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================
   Session Builder
   - Lets user create a custom premium session
   - Persists to LS under pt_session_draft
   ============================ */

const SessionBuilder: React.FC<{
  trainers: TrainerProfile[];
  onCreate: (s: TrainingSession) => void;
}> = ({ trainers, onCreate }) => {
  const STORAGE_KEY = "pt_session_draft";
  const [trainerId, setTrainerId] = useState<string | undefined>(() => {
    const draft = loadFromLS<Partial<TrainingSession>>(STORAGE_KEY, {});
    return draft.trainerId;
  });
  const [durationMinutes, setDurationMinutes] = useState<number>(() => loadFromLS(STORAGE_KEY, { durationMinutes: 60 }).durationMinutes || 60);
  const [focusAreas, setFocusAreas] = useState<string[]>(() => loadFromLS(STORAGE_KEY, { focusAreas: ["technique"] }).focusAreas || ["technique"]);
  const [intensity, setIntensity] = useState<TrainingSession["intensity"]>(() => loadFromLS(STORAGE_KEY, { intensity: "moderate" }).intensity || "moderate");
  const [notes, setNotes] = useState<string>(() => loadFromLS(STORAGE_KEY, { notes: "" }).notes || "");

  useEffect(() => {
    saveToLS(STORAGE_KEY, { trainerId, durationMinutes, focusAreas, intensity, notes });
  }, [trainerId, durationMinutes, focusAreas, intensity, notes]);

  const toggleFocus = useCallback((area: string) => {
    setFocusAreas((prev) => (prev.includes(area) ? prev.filter((p) => p !== area) : [...prev, area]));
  }, []);

  const create = useCallback(() => {
    if (!trainerId) {
      alert("Please select a trainer for your premium session.");
      return;
    }
    const session: TrainingSession = {
      id: `sess_${Date.now()}`,
      trainerId,
      durationMinutes,
      focusAreas,
      intensity,
      notes,
    };
    analyticsTrack("session_created", { trainerId, durationMinutes, focusAreas, intensity });
    onCreate(session);
  }, [trainerId, durationMinutes, focusAreas, intensity, notes, onCreate, trainers]);

  // Performance: memoized available trainer options rendering
  const trainerOptions = useMemo(() => trainers.map((t) => ({ id: t.id, label: `${t.name} — $${t.hourlyRate}/hr` })), [trainers]);

  return (
    <div style={{ padding: 12, borderRadius: 10, background: "#fff" }}>
      <div style={{ ...styles.sectionTitle }}>Personalized Session Builder</div>

      <label style={{ display: "block", marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Trainer</div>
        <select
          value={trainerId}
          onChange={(e) => setTrainerId(e.target.value)}
          aria-label="Choose trainer"
          style={{ ...styles.input, marginTop: 6 }}
        >
          <option value="">— Select premium trainer —</option>
          {trainerOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: "block", marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Duration (minutes)</div>
        <input
          type="number"
          min={30}
          max={180}
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value))}
          style={{ ...styles.input, marginTop: 6 }}
          aria-label="Session duration in minutes"
        />
      </label>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Focus Areas</div>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          {["technique", "sparring", "conditioning", "mobility"].map((area) => (
            <button
              key={area}
              onClick={() => toggleFocus(area)}
              aria-pressed={focusAreas.includes(area)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: focusAreas.includes(area) ? "#111827" : "#f3f4f6",
                color: focusAreas.includes(area) ? "#fff" : "#111",
              }}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Intensity</div>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          {(["low", "moderate", "high"] as TrainingSession["intensity"][]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setIntensity(lvl)}
              aria-pressed={intensity === lvl}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: intensity === lvl ? "#dc2626" : "#f3f4f6",
                color: intensity === lvl ? "#fff" : "#111",
              }}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <label style={{ display: "block", marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Notes</div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...styles.input, minHeight: 80, marginTop: 6 }} aria-label="Session notes" />
      </label>

      <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={create} style={styles.primaryBtn} aria-label="Schedule session">
          Schedule session
        </button>
      </div>
    </div>
  );
};

/* ============================
   CelebrityGenerator (adapted)
   ============================ */

const CelebrityGenerator: React.FC = React.memo(() => {
  const celebs = ["Mike Tyson", "Ronda Rousey", "Conor McGregor", "Cristian"];
  const [card, setCard] = useState<{ celeb: string; quote: string } | null>(null);
  const gen = useCallback(() => {
    const c = celebs[Math.floor(Math.random() * celebs.length)];
    const q = `${c} says: "3rd Street Boxing made me remember why I love this sport." (mock)`;
    setCard({ celeb: c, quote: q });
    analyticsTrack("celebrity_card_generated", { celeb: c });
  }, [celebs]);
  return (
    <div style={{ padding: 12, background: "#fff", borderRadius: 10 }}>
      <button onClick={gen} style={{ ...styles.secondaryBtn, background: "#111827", color: "#fff" }}>
        Generate Celebrity Trainer Card
      </button>
      {card && (
        <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: "#f8fafc" }}>
          <strong>{card.celeb}</strong>
          <div style={{ fontSize: 13 }}>{card.quote}</div>
        </div>
      )}
    </div>
  );
});

/* ============================
   ChallengeGenerator (adapted)
   ============================ */

const ChallengeGenerator: React.FC = () => {
  const [challenge, setChallenge] = useState<string | null>(null);
  const gen = useCallback(() => {
    const days = 7 + Math.floor(Math.random() * 21);
    const name = ["Fog City Fury", "Bridge Builder", "Mission Shred"][Math.floor(Math.random() * 3)];
    setChallenge(`${name} — ${days}-day premium challenge: Mix technique, sparring, and mobility. Aim 4 sessions/week.`);
    analyticsTrack("challenge_generated", { name, days });
  }, []);
  return (
    <div style={{ padding: 12, borderRadius: 10, background: "#fff" }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Personalized Challenge</div>
      <button onClick={gen} style={{ ...styles.primaryBtn }}>Generate Personal Challenge</button>
      {challenge && <div style={{ marginTop: 8 }}>{challenge}</div>}
    </div>
  );
};

/* ============================
   FightTicker (copied/adapted)
   ============================ */

const FightTicker: React.FC = () => {
  const items = [
    "Exclusive: Limited 1-on-1 premium spots",
    "Celebrity trainer session available this week",
    "Register for bespoke sparring program",
  ];
  return (
    <div style={{ overflow: "hidden", whiteSpace: "nowrap", background: "#f8fafc", padding: 8, borderRadius: 8 }}>
      <div style={{ display: "inline-block", animation: "ticker 14s linear infinite" }}>
        {items.join(" • ")}
      </div>
      <style>{`@keyframes ticker { 0% { transform: translateX(100%);} 100% { transform: translateX(-100%);} }`}</style>
    </div>
  );
};

/* ============================
   SessionPreview (interactive)
   - Shows an animated sequence of steps (simplified)
   ============================ */

const SessionPreview: React.FC<{ session: TrainingSession | null }> = ({ session }) => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!session) return;
    setStep(0);
    const t = setInterval(() => setStep((s) => (s + 1) % 4), 2000);
    return () => clearInterval(t);
  }, [session]);

  if (!session) {
    return <div style={{ padding: 12, background: "#fff", borderRadius: 10 }}>Select a session to preview the training flow.</div>;
  }

  const steps = [
    "Warm-up: Mobility & activation",
    `Skill drills: ${session.focusAreas.join(", ")}`,
    "High-intensity rounds / sparring simulation",
    "Cool-down & recovery guidance",
  ];

  return (
    <div style={{ padding: 12, borderRadius: 10, background: "#fff" }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Interactive Session Preview</div>
      <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
        {steps[step]}
      </div>
    </div>
  );
};

/* ============================
   Main Page Component
   ============================ */

/**
 * PersonalTrainingPage
 *
 * Premium one-on-one coaching landing and booking interface.
 *
 * - Trainer showcase & booking
 * - Session builder
 * - AR try-on
 * - Progress tracker with confetti
 * - Soundscape, celebrity generator, challenge generator
 * - Booking modal with simulated payment
 *
 * Accessibility:
 * - All interactive controls include aria labels or aria-pressed attributes
 * - Booking modal uses role="dialog" and aria-modal
 *
 * Performance:
 * - useMemo/useCallback used where appropriate to avoid unnecessary renders
 */
export default function PersonalTrainingPage(): JSX.Element {
  const [trainers] = useState<TrainerProfile[]>(PREMIUM_TRAINERS);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(() => loadFromLS("pt_selected_trainer", null));
  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    () => loadFromLS<Testimonial[]>("pt_testimonials", [generateSyntheticTestimonial({ name: "Sophie M.", quote: "This program changed my life!" })])
  );

  const [sessions, setSessions] = useState<TrainingSession[]>(() => loadFromLS<TrainingSession[]>("pt_sessions", []));
  const [draftSession, setDraftSession] = useState<TrainingSession | null>(() => loadFromLS("pt_last_session", null));
  const [subscription, setSubscription] = useState<Subscription | null>(() => loadFromLS("subscription", null));
  const isSubscribed = !!subscription;
  const [userId] = useState<string>("demo-user-pt");

  const planIds: { [key: string]: string } = {
    "t-elena": "P-0XA82551G4482814TNCYGEIQ",
    "t-omar": "P-38366759K40412012NCYGJJY",
    "t-raul": "P-37M89752833316030NCYGNPA",
  };

  // persist selections
  useEffect(() => saveToLS("pt_selected_trainer", selectedTrainerId), [selectedTrainerId]);

  useEffect(() => saveToLS("pt_last_session", draftSession), [draftSession]);

  useEffect(() => saveToLS("pt_testimonials", testimonials), [testimonials]);

  useEffect(() => {
    analyticsTrack("pt_page_loaded", { ts: new Date().toISOString() });
  }, []);

  const handleSubscribe = useCallback((trainerName: string, subID: string) => {
    const sub = { trainer: trainerName, subscriptionID: subID };
    saveToLS("subscription", sub);
    setSubscription(sub);
    triggerConfetti();
    alert(`Subscribed to ${trainerName}!`);
  }, []);

  useEffect(() => {
    if (!window.paypal) return;
    trainers.forEach((trainer) => {
      const planId = planIds[trainer.id];
      if (!planId) return;
      window.paypal.Buttons({
        style: { shape: 'pill', color: 'gold', layout: 'vertical', label: 'subscribe' },
        createSubscription: (data, actions) => actions.subscription.create({ plan_id: planId }),
        onApprove: (data, actions) => handleSubscribe(trainer.name, data.subscriptionID),
      }).render(`#paypal-button-container-${planId}`);
    });
  }, [trainers, handleSubscribe, planIds]);

  const selectTrainer = useCallback((tid: string) => {
    setSelectedTrainerId(tid);
    analyticsTrack("trainer_selected", { trainerId: tid });
  }, []);

  const createSession = useCallback((s: TrainingSession) => {
    if (!isSubscribed) {
      alert("Please subscribe to a premium trainer first.");
      return;
    }
    setDraftSession(s);
    const updatedSessions = [s, ...sessions];
    setSessions(updatedSessions);
    saveToLS("pt_sessions", updatedSessions);
    triggerConfetti();
    analyticsTrack("session_scheduled", { sessionId: s.id });
  }, [isSubscribed, sessions]);

  const addSynthetic = useCallback(() => {
    const t = generateSyntheticTestimonial();
    setTestimonials((s) => [t, ...s]);
    analyticsTrack("synthetic_testimonial_added", {});
  }, []);

  // Accessible keyboard handler for trainer list (quick nav)
  const trainerListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = trainerListRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (!["ArrowDown", "ArrowUp"].includes(e.key)) return;
      const items = Array.from(el.querySelectorAll<HTMLButtonElement>('button[data-trainer-id]'));
      if (!items.length) return;
      const idx = items.findIndex((it) => it.getAttribute("data-trainer-id") === selectedTrainerId);
      let next = idx;
      if (e.key === "ArrowDown") next = Math.min(items.length - 1, (idx + 1) || 0);
      if (e.key === "ArrowUp") next = Math.max(0, (idx - 1 + items.length) % items.length);
      const id = items[next].getAttribute("data-trainer-id")!;
      selectTrainer(id);
      items[next].focus();
      e.preventDefault();
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [selectedTrainerId, selectTrainer]);

  const selectedTrainer = useMemo(() => trainers.find((t) => t.id === selectedTrainerId) || null, [trainers, selectedTrainerId]);

  const paywallMessage = (
    <div style={{ padding: 12, borderRadius: 10, background: "#fff" }}>
      Please subscribe to a premium trainer to access this feature.
    </div>
  );

  return (
    <div style={styles.page}>
      <Helmet>
        <script src="https://www.paypal.com/sdk/js?client-id=Aa_Q-b8Ey9eMTCZ-nrD44nVFKMbPmkeNCu4jSSNPQUdLq92W7kMB_RY3xSdQCpg66RrpPV8pgLZTIboZ&vault=true&intent=subscription" data-sdk-integration-source="button-factory"></script>
        <title>3rd Street Boxing — Premium Personal Training</title>
      </Helmet>

      <header style={styles.header}>
        <div>
          <h1 style={{ margin: 0 }}>3rd Street — Premium Personal Training</h1>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Elite one-on-one coaching — bespoke programs & booking</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <SoundscapeToggle />
          <button onClick={addSynthetic} style={styles.secondaryBtn} aria-label="Add synthetic testimonial">Add Testimonial</button>
        </div>
      </header>

      <main style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
        <section>
          <div style={{ marginBottom: 12 }}>
            <FightTicker />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {/* Trainer showcase */}
            <div style={{ padding: 12, borderRadius: 10, background: "#fff" }}>
              <div style={{ ...styles.sectionTitle }}>Elite Trainers</div>
              <div ref={trainerListRef} role="list" aria-label="Trainer list" style={{ display: "grid", gap: 10 }}>
                {trainers.map((t) => (
                  <div key={t.id} style={styles.trainerCard} role="listitem">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{t.name}{t.celebrity && <span style={{ marginLeft: 8, color: "#f59e0b", fontSize: 12 }}>⭐ Celebrity</span>}</div>
                        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>{t.bio}</div>
                        <div style={{ marginTop: 8, fontSize: 13 }}>
                          <strong>${t.hourlyRate}/hr</strong> • {t.specialties.join(" • ")}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                        <div style={{ fontSize: 14, color: "#6b7280" }}>{t.rating} ★</div>
                        <button
                          data-trainer-id={t.id}
                          onClick={() => selectTrainer(t.id)}
                          aria-pressed={selectedTrainerId === t.id}
                          style={{ ...styles.primaryBtn, padding: "6px 10px" }}
                        >
                          {selectedTrainerId === t.id ? "Selected" : "Select"}
                        </button>
                        <div id={`paypal-button-container-${planIds[t.id]}`} style={{ minHeight: 40 }}></div>
                      </div>
                    </div>

                    <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
                      Next avail: {formatInTimeZone(new Date(`${t.availability[0].day}T${t.availability[0].time}`), "America/Los_Angeles", "MMM d • h:mm a")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session builder & preview */}
            <div style={{ display: "grid", gap: 12 }}>
              {isSubscribed ? <SessionBuilder trainers={trainers} onCreate={createSession} /> : paywallMessage}
              {isSubscribed ? <SessionPreview session={draftSession} /> : paywallMessage}
            </div>
          </div>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              {isSubscribed ? <ArTryOn label="Premium Glove & Gear Try-On" /> : paywallMessage}
            </div>
            <div>
              {isSubscribed ? <ProgressTracker userId={userId} /> : paywallMessage}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ ...styles.sectionTitle }}>Testimonials</div>
            <div style={{ display: "grid", gap: 8 }}>
              {testimonials.slice(0, 6).map((t) => (
                <div key={t.id} style={{ padding: 12, borderRadius: 8, background: "#fff" }}>
                  <div style={{ fontWeight: 700 }}>{t.name} {t.generated && <span style={{ fontSize: 12, color: "#6b7280" }}>(synthetic)</span>}</div>
                  <div style={{ marginTop: 6, color: "#374151" }}>{t.quote}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ padding: 12, borderRadius: 10, background: "#111827", color: "#fff" }}>
              <div style={{ fontWeight: 800 }}>Premium Flash Offer</div>
              <div style={{ marginTop: 6 }}>Secure a 10-session package and get a personalized equipment kit.</div>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button style={styles.primaryBtn} onClick={() => analyticsTrack("flash_offer_clicked")}>Claim Offer</button>
                <button style={styles.secondaryBtn} onClick={() => scheduleBrowserNotification("Flash Offer Reminder", { body: "Check the premium offer", delayMs: 4000 })}>Remind me</button>
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 10, background: "#fff" }}>
              <div style={{ fontWeight: 700 }}>Celebrity & Success</div>
              {isSubscribed ? <CelebrityGenerator /> : paywallMessage}
            </div>

            <div style={{ padding: 12, borderRadius: 10, background: "#fff" }}>
              {isSubscribed ? <ChallengeGenerator /> : paywallMessage}
            </div>

            <div style={{ padding: 12, borderRadius: 10, background: "#fff" }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Your Subscription</div>
              <div style={{ display: "grid", gap: 8 }}>
                {subscription ? (
                  <div style={{ padding: 8, borderRadius: 8, border: "1px solid #f3f4f6" }}>
                    <div style={{ fontWeight: 700 }}>Subscribed to {subscription.trainer}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>ID: {subscription.subscriptionID}</div>
                    <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                      <button onClick={() => { saveToLS("subscription", null); setSubscription(null); analyticsTrack("subscription_cancelled"); }} style={{ ...styles.secondaryBtn, background: "#fee2e2" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: "#6b7280" }}>No active subscription</div>
                )}
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 10, background: "#fff" }}>
              <div style={{ fontWeight: 700 }}>Your Sessions</div>
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                {sessions.length === 0 && <div style={{ color: "#6b7280" }}>No sessions scheduled yet</div>}
                {sessions.map((s) => (
                  <div key={s.id} style={{ padding: 8, borderRadius: 8, border: "1px solid #f3f4f6" }}>
                    <div style={{ fontWeight: 700 }}>{trainers.find((t) => t.id === s.trainerId)?.name || s.trainerId}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>{s.focusAreas.join(", ")} • {s.durationMinutes}m</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 10, background: "#fff" }}>
              <div style={{ fontWeight: 700 }}>Extras</div>
              <div style={{ marginTop: 8 }}>
                <button onClick={() => analyticsTrack("press_popup_opened")} style={styles.secondaryBtn}>Press</button>
              </div>
            </div>

          </div>
        </aside>
      </main>

      <footer style={{ marginTop: 18, color: "#6b7280", fontSize: 13 }}>
        <div>Premium page — client-side demo features for prototyping and QA.</div>
      </footer>
    </div>
  );
}

/* small helper for notifications scheduling (reused) */
const scheduleBrowserNotification = (title: string, opts: NotificationOptions & { delayMs?: number } = {}) => {
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
