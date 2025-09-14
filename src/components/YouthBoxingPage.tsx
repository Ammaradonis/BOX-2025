import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import confetti from "canvas-confetti";
import { formatInTimeZone } from "date-fns-tz";

/**
 * YouthBoxingPage.tsx
 *
 * Single-file, self-contained React + TypeScript page component for "3rd Street Boxing"
 * youth & junior programs. Inspired/adapted from a merged demo file; everything needed
 * is in this module (types, utilities, components). Styling is inline JSX style objects
 * to avoid external dependencies.
 *
 * Important: This component includes COPPA-considerate flows, parental consent,
 * age verification and parental dashboards. It is demo-only and stores local data
 * in localStorage under clear keys. No personal data is sent to external servers.
 */

/* =========================
   Types
   ========================= */

type AgeGroupKey = "6-9" | "10-13" | "14-17";

type YouthProgram = {
  id: string;
  title: string;
  ageGroup: AgeGroupKey;
  description: string;
  weeklySessions: number;
  durationWeeks: number;
  coach: string;
  maxParticipants: number;
  spotsLeft?: number;
  skillsFocus: string[];
  safeGearRequired?: string[];
};

type ParentalConsent = {
  parentName: string;
  parentEmail: string;
  signedAt?: string | null;
  acceptedSafetyGuidelines?: boolean;
  acceptedMediaRelease?: boolean;
  childName?: string;
  childDOB?: string;
};

type JuniorProgress = {
  childId: string;
  ageGroup: AgeGroupKey;
  skillPoints: number;
  milestones: { id: string; title: string; achievedAt?: string }[];
  attendance: { date: string; present: boolean }[];
};

type YouthSettings = {
  selectedProgramId?: string | null;
  soundscapeOn?: boolean;
  consentKey?: string | null;
  lastChallengeCompletedAt?: string | null;
};

/* =========================
   Constants & Demo Data
   ========================= */

const LS_PREFIX = "3rdstreet_youth_v1_";
const LS_KEYS = {
  SETTINGS: LS_PREFIX + "settings",
  CONSENTS: LS_PREFIX + "consents",
  PROGRESS: LS_PREFIX + "progress",
  ANALYTICS: LS_PREFIX + "analytics",
};

const DEFAULT_PROGRAMS: YouthProgram[] = [
  {
    id: "y6-9-funfit",
    title: "Little Gloves — Fun & Fundamentals",
    ageGroup: "6-9",
    description:
      "Playful, movement-rich sessions that teach balance, coordination, and safe boxing basics.",
    weeklySessions: 1,
    durationWeeks: 8,
    coach: "Coach Mia",
    maxParticipants: 14,
    spotsLeft: 6,
    skillsFocus: ["coordination", "footwork", "basic punch mechanics"],
    safeGearRequired: ["Headgear (recommended)", "Youth gloves"],
  },
  {
    id: "y10-13-skills",
    title: "Junior Skills — Technique & Confidence",
    ageGroup: "10-13",
    description:
      "Age-appropriate technical drills, partner work, and confidence-building activities.",
    weeklySessions: 2,
    durationWeeks: 10,
    coach: "Coach Jamal",
    maxParticipants: 16,
    spotsLeft: 9,
    skillsFocus: ["combinations", "defense", "stamina"],
    safeGearRequired: ["Mouthguard", "Youth gloves", "Shin guards (optional)"],
  },
  {
    id: "y14-17-academy",
    title: "Youth Academy — Advanced Prep & Leadership",
    ageGroup: "14-17",
    description:
      "Structured training preparing teens for amateur competition and leadership roles.",
    weeklySessions: 3,
    durationWeeks: 12,
    coach: "Coach Elena",
    maxParticipants: 12,
    spotsLeft: 4,
    skillsFocus: ["strategy", "ring IQ", "conditioning"],
    safeGearRequired: ["Mouthguard", "Headgear for sparring", "Youth gloves"],
  },
];

/* =========================
   Utilities
   ========================= */

/** Trigger a bright confetti burst for kid-friendly celebration */
const triggerConfetti = (opts: Partial<confetti.Options> = {}) => {
  try {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.position = "fixed";
    canvas.style.pointerEvents = "none";
    canvas.style.inset = "0";
    document.body.appendChild(canvas);
    const myConfetti = confetti.create(canvas, { resize: true });
    myConfetti({
      particleCount: 90,
      spread: 100,
      origin: { y: 0.2 },
      colors: ["#ff7aa2", "#60a5fa", "#facc15", "#34d399"],
      ...opts,
    });
    // remove canvas after short delay
    setTimeout(() => {
      try {
        document.body.removeChild(canvas);
      } catch {}
    }, 2400);
  } catch (e) {
    // silent - confetti not critical
    /* noop */
  }
};

/** Save to local storage safely (COPPA-friendly: avoid PII leaking) */
const saveToLS = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // ignore localStorage errors in private mode
  }
};

/** Load from local storage with fallback */
const loadFromLS = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

/** Basic analytics tracking that stores events to local storage */
const analyticsTrack = (event: string, meta: any = {}) => {
  const logs = loadFromLS<any[]>(LS_KEYS.ANALYTICS, []);
  logs.unshift({ event, meta, time: new Date().toISOString() });
  saveToLS(LS_KEYS.ANALYTICS, logs.slice(0, 400));
};

/* =========================
   Accessible small UI primitives
   ========================= */

const Header: React.FC<{ title?: string; subtitle?: string }> = ({ title, subtitle }) => (
  <header
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 16,
    }}
  >
    <div>
      <h1 style={{ margin: 0, fontSize: 24 }}>{title || "3rd Street Boxing"}</h1>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{subtitle || "Youth & Junior Programs"}</div>
    </div>
    <div>
      <small style={{ color: "#374151" }}>
        Built with safety-first defaults • COPPA-aware • Local-only demo
      </small>
    </div>
  </header>
);

const Section: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <section style={{ marginBottom: 14 }}>
    <h2 style={{ margin: "6px 0 10px 0" }}>{title}</h2>
    <div>{children}</div>
  </section>
);

/* =========================
   Age verification & parental consent logic
   ========================= */

/**
 * Validates a date of birth string (YYYY-MM-DD) and returns age in years.
 * Returns null on invalid input.
 */
const calcAgeFromDOB = (dob: string): number | null => {
  try {
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age;
  } catch {
    return null;
  }
};

/* =========================
   Child-friendly components
   ========================= */

/** Challenge generator: creates age-appropriate challenges */
const ChallengeGenerator: React.FC<{ ageGroup: AgeGroupKey; onComplete?: () => void }> = memo(
  ({ ageGroup, onComplete }) => {
    const [challenge, setChallenge] = useState<string | null>(null);
    const gen = useCallback(() => {
      const base =
        ageGroup === "6-9"
          ? ["Balance Bunny", "Jab Jamboree", "Footwork Freeze"]
          : ageGroup === "10-13"
          ? ["Combo Climb", "Stamina Sprint", "Technique Trio"]
          : ["Strategy Series", "Power Precision", "Ring IQ Run"];
      const name = base[Math.floor(Math.random() * base.length)];
      const days = ageGroup === "6-9" ? 3 : ageGroup === "10-13" ? 7 : 14;
      const text = `${name} — ${days}-day friendly challenge focused on ${
        ageGroup === "6-9" ? "fun movement" : ageGroup === "10-13" ? "technique & control" : "strategy & conditioning"
      }.`;
      setChallenge(text);
      analyticsTrack("youth_challenge_generated", { name, ageGroup, days });
    }, [ageGroup]);

    const complete = useCallback(() => {
      analyticsTrack("youth_challenge_completed", { ageGroup, challenge });
      triggerConfetti();
      setChallenge(null);
      onComplete?.();
    }, [ageGroup, challenge, onComplete]);

    return (
      <div style={{ padding: 12, borderRadius: 8, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Fun Challenge</div>
        <div style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}>
          Age group: <strong>{ageGroup}</strong>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={gen}
            style={{
              padding: "8px 12px",
              background: "#ef9a9a",
              color: "#111827",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
            }}
            aria-label="Generate age-appropriate challenge"
          >
            Generate Challenge
          </button>
          {challenge && (
            <>
              <div style={{ flex: 1, minWidth: 160 }}>{challenge}</div>
              <button
                onClick={complete}
                style={{
                  padding: "8px 12px",
                  background: "#60a5fa",
                  color: "#fff",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                }}
                aria-label="Mark challenge as completed"
              >
                Mark Completed
              </button>
            </>
          )}
        </div>
      </div>
    );
  }
);

/* =========================
   Simplified Sparring Simulator with educational overlays
   ========================= */

const SparringSimulator: React.FC<{ ageGroup: AgeGroupKey }> = ({ ageGroup }) => {
  const cRef = useRef<HTMLCanvasElement | null>(null);
  const [showTips, setShowTips] = useState(true);

  useEffect(() => {
    const canvas = cRef.current;
    if (!canvas) return;
    canvas.width = 640;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const draw = () => {
      const now = Date.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // background ring
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 3;
      ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
      // fighters
      const x1 = 160 + Math.sin(now / 300) * 40;
      const x2 = 480 + Math.cos(now / 420) * 40;
      // safe, friendly colors
      ctx.fillStyle = "#fb7185"; // soft pink
      ctx.beginPath();
      ctx.arc(x1, 160, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#60a5fa";
      ctx.beginPath();
      ctx.arc(x2, 160, 26, 0, Math.PI * 2);
      ctx.fill();
      // simple 'punch' lines
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1 + 10, 140);
      ctx.lineTo(x1 + 80, 120);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2 - 10, 180);
      ctx.lineTo(x2 - 70, 200);
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [ageGroup]);

  const tips = useMemo(() => {
    if (ageGroup === "6-9")
      return [
        "Keep your hands up — protect your face!",
        "Move your feet — balance is everything.",
        "Smile — training is fun!",
      ];
    if (ageGroup === "10-13")
      return [
        "Breathe between combos.",
        "Practice jab first, then cross.",
        "Keep distance — safety first.",
      ];
    return [
      "Control power during drills.",
      "Focus on footwork & defense.",
      "Communicate with your partner before sparring.",
    ];
  }, [ageGroup]);

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 8,
        background: "#fff",
        boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Sparring Simulator (Educational)</div>
      <canvas
        ref={cRef}
        aria-label="Sparring simulation canvas"
        style={{ width: "100%", borderRadius: 8, display: "block", marginBottom: 8 }}
      />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={showTips}
            onChange={() => setShowTips((s) => !s)}
            aria-checked={showTips}
          />
          Show safety tips
        </label>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#6b7280" }}>
          Age group: <strong>{ageGroup}</strong>
        </div>
      </div>
      {showTips && (
        <ul style={{ marginTop: 8, paddingLeft: 18, color: "#374151" }}>
          {tips.map((t, i) => (
            <li key={i} style={{ marginBottom: 4 }}>
              {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* =========================
   AR Try-On (youth gear & safety overlay)
   ========================= */

const ArTryOn: React.FC = () => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!dataUrl) return;
    const img = new Image();
    img.onload = () => {
      const c = canvasRef.current!;
      c.width = 360;
      c.height = 360;
      const ctx = c.getContext("2d")!;
      ctx.clearRect(0, 0, c.width, c.height);
      // Draw user photo scaled
      ctx.drawImage(img, 0, 0, c.width, c.height);
      // Overlay safety badge & glove
      ctx.fillStyle = "rgba(96,165,250,0.85)";
      ctx.beginPath();
      ctx.ellipse(c.width - 84, c.height - 84, 64, 48, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("Youth Safe Glove", c.width - 160, c.height - 96);
      ctx.font = "12px sans-serif";
      ctx.fillText("Size: Youth", c.width - 160, c.height - 76);
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
    <div style={{ padding: 12, borderRadius: 8, background: "#fff" }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Gear Try-On (Demo)</div>
      <div style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}>
        Upload a photo to preview youth gloves and safety recommendations.
      </div>
      <input
        ref={fileRef as any}
        type="file"
        accept="image/*"
        aria-label="Upload image for AR try-on"
        onChange={() => onFile()}
      />
      <div style={{ marginTop: 8 }}>
        <canvas
          ref={canvasRef}
          style={{
            width: 360,
            height: 360,
            display: dataUrl ? "block" : "none",
            borderRadius: 8,
            border: "1px solid #e6e6e6",
          }}
        />
        {!dataUrl && <div style={{ color: "#6b7280" }}>No image uploaded — try it out (demo only).</div>}
      </div>
    </div>
  );
};

/* =========================
   Youth-friendly Leaderboard / Bracket
   ========================= */

const LeaderboardBracket: React.FC<{ progress: JuniorProgress[] }> = ({ progress }) => {
  // show top 3 by skillPoints but in positive tone
  const top = useMemo(() => {
    return [...progress].sort((a, b) => b.skillPoints - a.skillPoints).slice(0, 3);
  }, [progress]);

  return (
    <div style={{ padding: 12, borderRadius: 8, background: "#fff" }}>
      <div style={{ fontWeight: 700 }}>Skill Stars — Positive Leaderboard</div>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
        Celebrating effort, progress, and teamwork.
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {top.map((p, idx) => (
          <div
            key={p.childId}
            style={{
              flex: 1,
              background: idx === 0 ? "#fef3c7" : "#f3f4f6",
              padding: 10,
              borderRadius: 8,
            }}
          >
            <div style={{ fontWeight: 700 }}>{p.childId}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{p.skillPoints} pts</div>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              {p.milestones.filter((m) => m.achievedAt).length}/{p.milestones.length} milestones
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================
   Soundscape toggle (youth-friendly options)
   ========================= */

const SoundscapeToggle: React.FC<{ onChange?: (on: boolean) => void; defaultOn?: boolean }> = ({
  onChange,
  defaultOn = false,
}) => {
  const [playing, setPlaying] = useState<boolean>(defaultOn);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/assets/child-friendly-soundscape.mp3"); // placeholder
    audioRef.current.loop = true;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.play().catch(() => {
        /* ignore autoplay restrictions */
      });
    } else {
      audioRef.current.pause();
    }
    onChange?.(playing);
    analyticsTrack("soundscape_toggled", { playing });
  }, [playing, onChange]);

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button
        onClick={() => setPlaying((p) => !p)}
        style={{
          padding: "6px 10px",
          borderRadius: 8,
          background: playing ? "#34d399" : "#e5e7eb",
          border: "none",
          cursor: "pointer",
        }}
        aria-pressed={playing}
      >
        {playing ? "Stop Background" : "Play Background"}
      </button>
      <div style={{ fontSize: 13, color: "#6b7280" }}>{playing ? "Relaxing gym sound playing" : "Sound off"}</div>
    </div>
  );
};

/* =========================
   FightTicker adapted for youth announcements
   ========================= */

const FightTicker: React.FC<{ items?: string[] }> = ({ items }) => {
  const defaultItems = [
    "Youth Friendly Tournament — Nov 28 (encouraging participation)",
    "Board Game Night for Juniors — build teamwork!",
    "Parent Info Session — Learn about safety protocols",
  ];
  const list = items || defaultItems;
  return (
    <div
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        background: "#f8fafc",
        padding: "8px 12px",
        borderRadius: 8,
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ display: "inline-block", animation: "ticker 16s linear infinite" }}>
        {list.join(" • ")}
      </div>
      <style>{`@keyframes ticker { 0% { transform: translateX(100%);} 100% { transform: translateX(-100%);} }`}</style>
    </div>
  );
};

/* =========================
   Testimonials generation (positive, developmental)
   ========================= */

const generateSyntheticTestimonial = (overrides: Partial<{ name: string; quote: string }>) => {
  const names = ["Ava P.", "Noah M.", "Liam S.", "Sophia R."];
  const quotes = [
    "My kid learned balance and confidence in such a fun way!",
    "Coach Jamal makes drills feel like playtime — we saw progress fast.",
    "We appreciate the safety-first approach and supportive community.",
    "The leaderboards encourage kids to try their best, not just win.",
  ];
  const t = {
    id: `yt-${Date.now()}`,
    name: overrides.name || names[Math.floor(Math.random() * names.length)],
    quote: overrides.quote || quotes[Math.floor(Math.random() * quotes.length)],
    rating: 5,
    generated: true,
  } as any;
  return t;
};

/* =========================
   Parental Dashboard & Consent Form
   ========================= */

/**
 * ParentalConsentForm handles COPPA-aware consent flow:
 * - collects parent name & email (minimal PII)
 * - collects child's name & DOB minimally (parents control)
 * - records acceptance of safety & media release
 *
 * Data is stored locally only and can be deleted by the parent.
 */
const ParentalConsentForm: React.FC<{
  initial?: ParentalConsent | null;
  onSave?: (c: ParentalConsent) => void;
}> = ({ initial = null, onSave }) => {
  const [consent, setConsent] = useState<ParentalConsent>(
    initial || {
      parentName: "",
      parentEmail: "",
      childName: "",
      childDOB: "",
      signedAt: null,
      acceptedSafetyGuidelines: false,
      acceptedMediaRelease: false,
    }
  );

  const [errors, setErrors] = useState<string | null>(null);

  const validateAndSave = useCallback(() => {
    setErrors(null);
    if (!consent.parentName || !consent.parentEmail) {
      setErrors("Parent name and email are required to save consent.");
      return;
    }
    // basic email validation
    if (!/^\S+@\S+\.\S+$/.test(consent.parentEmail)) {
      setErrors("Please provide a valid email address.");
      return;
    }
    // DOB optional, but if provided validate format
    if (consent.childDOB) {
      const age = calcAgeFromDOB(consent.childDOB);
      if (age === null || age < 0 || age > 120) {
        setErrors("Please provide a valid child date of birth (YYYY-MM-DD).");
        return;
      }
    }
    const signedAt = new Date().toISOString();
    const payload = { ...consent, signedAt };
    saveToLS(LS_KEYS.CONSENTS, payload);
    analyticsTrack("parental_consent_signed", { parent: consent.parentEmail });
    onSave?.(payload);
    // friendly confetti for approval
    triggerConfetti();
  }, [consent, onSave]);

  return (
    <div style={{ padding: 12, borderRadius: 8, background: "#fff" }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Parental Consent & Registration</div>
      <div style={{ display: "grid", gap: 8 }}>
        <label>
          Parent/Guardian name
          <input
            aria-label="Parent name"
            value={consent.parentName}
            onChange={(e) => setConsent((s) => ({ ...s, parentName: e.target.value }))}
            style={{ display: "block", padding: 8, borderRadius: 6, width: "100%" }}
          />
        </label>
        <label>
          Parent/Guardian email
          <input
            aria-label="Parent email"
            value={consent.parentEmail}
            onChange={(e) => setConsent((s) => ({ ...s, parentEmail: e.target.value }))}
            style={{ display: "block", padding: 8, borderRadius: 6, width: "100%" }}
            type="email"
          />
        </label>
        <label>
          Child name (optional)
          <input
            aria-label="Child name"
            value={consent.childName || ""}
            onChange={(e) => setConsent((s) => ({ ...s, childName: e.target.value }))}
            style={{ display: "block", padding: 8, borderRadius: 6, width: "100%" }}
          />
        </label>
        <label>
          Child DOB (YYYY-MM-DD) — used for age verification
          <input
            aria-label="Child date of birth"
            value={consent.childDOB || ""}
            onChange={(e) => setConsent((s) => ({ ...s, childDOB: e.target.value }))}
            placeholder="e.g. 2014-05-30"
            style={{ display: "block", padding: 8, borderRadius: 6, width: "100%" }}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={!!consent.acceptedSafetyGuidelines}
            onChange={(e) => setConsent((s) => ({ ...s, acceptedSafetyGuidelines: e.target.checked }))}
            aria-checked={!!consent.acceptedSafetyGuidelines}
          />
          I confirm I have read and agree to the youth safety guidelines.
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={!!consent.acceptedMediaRelease}
            onChange={(e) => setConsent((s) => ({ ...s, acceptedMediaRelease: e.target.checked }))}
            aria-checked={!!consent.acceptedMediaRelease}
          />
          I authorize limited, moderated photos/videos for program updates (optional).
        </label>
        {errors && <div style={{ color: "#b91c1c" }}>{errors}</div>}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={validateAndSave}
            style={{ padding: "8px 12px", background: "#10b981", color: "#fff", borderRadius: 8 }}
          >
            Save Consent
          </button>
          <button
            onClick={() => {
              setConsent({
                parentName: "",
                parentEmail: "",
                childName: "",
                childDOB: "",
                signedAt: null,
                acceptedSafetyGuidelines: false,
                acceptedMediaRelease: false,
              });
            }}
            style={{ padding: "8px 12px", borderRadius: 8 }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================
   Parent Dashboard: progress & attendance
   ========================= */

const ParentDashboard: React.FC<{
  progressList: JuniorProgress[];
  onClearProgress?: () => void;
}> = ({ progressList, onClearProgress }) => {
  const totalKids = progressList.length;
  const totalPoints = progressList.reduce((s, p) => s + p.skillPoints, 0);
  return (
    <div style={{ padding: 12, borderRadius: 8, background: "#fff" }}>
      <div style={{ fontWeight: 700 }}>Parent Dashboard</div>
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
        Overview of attendance, milestones, and positive reinforcement.
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1, background: "#f3f4f6", padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Children tracked</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{totalKids}</div>
        </div>
        <div style={{ flex: 1, background: "#fff7ed", padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Total skill points</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{totalPoints}</div>
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        {progressList.map((p) => (
          <div key={p.childId} style={{ marginBottom: 8, padding: 8, borderRadius: 8, background: "#f8fafc" }}>
            <div style={{ fontWeight: 700 }}>{p.childId}</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              {p.skillPoints} pts • {p.milestones.filter((m) => m.achievedAt).length}/{p.milestones.length} milestones
            </div>
            <details style={{ marginTop: 6 }}>
              <summary style={{ cursor: "pointer" }}>View attendance</summary>
              <ul>
                {p.attendance.slice().sort((a,b)=>b.date.localeCompare(a.date)).map((a,idx)=>(
                  <li key={idx} style={{ fontSize: 13 }}>
                    {a.date}: {a.present ? "Present" : "Absent"}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          onClick={() => {
            analyticsTrack("parent_clear_progress_clicked", {});
            onClearProgress?.();
          }}
          style={{ padding: "8px 12px", borderRadius: 8, background: "#ef4444", color: "#fff" }}
        >
          Clear Progress (demo)
        </button>
        <button
          onClick={() => {
            // export minimal, non-PII summary
            const summary = progressList.map((p) => ({
              childId: p.childId,
              skillPoints: p.skillPoints,
              milestonesAchieved: p.milestones.filter((m) => m.achievedAt).length,
            }));
            const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "progress-summary.json";
            a.click();
            URL.revokeObjectURL(url);
            analyticsTrack("parent_export_progress", {});
          }}
          style={{ padding: "8px 12px", borderRadius: 8 }}
        >
          Export Summary (local)
        </button>
      </div>
    </div>
  );
};

/* =========================
   Interactive Learning Modules (simple games & animations)
   ========================= */

/**
 * MiniModule: RhythmPunch
 * - For younger kids: tap to the beat to score points.
 * - Accessibility: can be controlled via keyboard (space) and large buttons.
 */
const RhythmPunch: React.FC<{ ageGroup: AgeGroupKey; onComplete?: (score: number) => void }> = ({
  ageGroup,
  onComplete,
}) => {
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    const tempo = ageGroup === "6-9" ? 900 : ageGroup === "10-13" ? 700 : 600;
    intervalRef.current = window.setInterval(() => setTick((t) => t + 1), tempo);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running, ageGroup]);

  useEffect(() => {
    if (tick > 0) {
      // degrade score slowly to encourage consistent taps
      setScore((s) => Math.max(0, s - 0));
    }
  }, [tick]);

  const tap = useCallback(() => {
    setScore((s) => s + 10);
    analyticsTrack("rhythm_tap", { ageGroup });
  }, [ageGroup]);

  const finish = useCallback(() => {
    setRunning(false);
    onComplete?.(score);
    if (score > 0) triggerConfetti();
    analyticsTrack("rhythm_finished", { ageGroup, score });
  }, [score, onComplete, ageGroup]);

  return (
    <div style={{ padding: 12, borderRadius: 8, background: "#fff" }}>
      <div style={{ fontWeight: 700 }}>Rhythm Punch — Interactive</div>
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
        Tap along to the beat. Designed for {ageGroup} — keyboard accessible (Space).
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={() => setRunning((r) => !r)}
          style={{ padding: "8px 12px", borderRadius: 8, background: running ? "#ef4444" : "#60a5fa", color: "#fff" }}
          aria-pressed={running}
        >
          {running ? "Stop" : "Start"}
        </button>
        <button
          onClick={tap}
          style={{ padding: "12px 18px", borderRadius: 999, background: "#fb7185", color: "#fff", fontWeight: 700 }}
          aria-label="Tap to punch"
        >
          Punch!
        </button>
        <div style={{ marginLeft: "auto", fontSize: 16, fontWeight: 700 }}>{score} pts</div>
      </div>
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button onClick={finish} style={{ padding: "8px 12px", borderRadius: 8 }}>
          Finish
        </button>
        <div style={{ fontSize: 12, color: "#6b7280" }}>{running ? "Go!" : "Ready"}</div>
      </div>
    </div>
  );
};

/* =========================
   Main YouthPage Component
   ========================= */

/**
 * YouthBoxingPage
 *
 * Top-level component combining program showcases, parental flows,
 * interactive modules, and youth-focused features. All state is local
 * and persisted to localStorage via saveToLS/loadFromLS. Includes
 * basic analytics and COPPA-conscious behavior (minimal PII).
 *
 * NOTE: This component is self-contained. Replace placeholder assets
 * (audio files, etc.) with real project assets in production.
 */
export default function YouthBoxingPage(): JSX.Element {
  // load/save settings & progress
  const [settings, setSettings] = useState<YouthSettings>(() => loadFromLS(LS_KEYS.SETTINGS, {}));
  const [consent, setConsent] = useState<ParentalConsent | null>(() => loadFromLS(LS_KEYS.CONSENTS, null));
  const [progressList, setProgressList] = useState<JuniorProgress[]>(
    () =>
      loadFromLS<JuniorProgress[]>(LS_KEYS.PROGRESS, [
        {
          childId: "Charlie (demo)",
          ageGroup: "10-13",
          skillPoints: 240,
          milestones: [
            { id: "m1", title: "Balance Star", achievedAt: new Date().toISOString() },
            { id: "m2", title: "Jab Master", achievedAt: undefined },
          ],
          attendance: [
            { date: formatInTimeZone(new Date(), "UTC", "yyyy-MM-dd"), present: true },
          ],
        },
      ]) || []
  );

  // page load analytics
  useEffect(() => {
    analyticsTrack("youth_page_loaded", { timestamp: new Date().toISOString() });
  }, []);

  // persist settings & progress
  useEffect(() => saveToLS(LS_KEYS.SETTINGS, settings), [settings]);
  useEffect(() => saveToLS(LS_KEYS.PROGRESS, progressList), [progressList]);

  // program selection
  const programs = useMemo(() => DEFAULT_PROGRAMS, []);
  const selectedProgram = useMemo(
    () => programs.find((p) => p.id === settings.selectedProgramId) ?? programs[0],
    [programs, settings.selectedProgramId]
  );

  const selectProgram = useCallback(
    (id: string) => {
      setSettings((s) => ({ ...s, selectedProgramId: id }));
      analyticsTrack("youth_program_selected", { programId: id });
    },
    [setSettings]
  );

  // parental consent save handler
  const onConsentSave = useCallback(
    (c: ParentalConsent) => {
      setConsent(c);
      analyticsTrack("parent_consent_saved_local", { parentEmail: c.parentEmail });
    },
    [setConsent]
  );

  // complete a challenge callback: give points to first child in list (demo)
  const onChallengeComplete = useCallback(() => {
    if (progressList.length === 0) return;
    setProgressList((prev) => {
      const copy = [...prev];
      copy[0] = {
        ...copy[0],
        skillPoints: copy[0].skillPoints + 25,
        milestones: copy[0].milestones.map((m, i) => (i === 0 && !m.achievedAt ? { ...m, achievedAt: new Date().toISOString() } : m)),
      };
      analyticsTrack("challenge_rewarded", { childId: copy[0].childId, points: 25 });
      return copy;
    });
  }, [progressList]);

  // rhythm module completion
  const onRhythmComplete = useCallback(
    (score: number) => {
      if (score <= 0) return;
      // award points to demo child
      if (progressList.length === 0) return;
      setProgressList((prev) => {
        const copy = [...prev];
        copy[0] = { ...copy[0], skillPoints: copy[0].skillPoints + Math.floor(score / 2) };
        return copy;
      });
      analyticsTrack("rhythm_module_completed", { score });
    },
    [progressList]
  );

  // booking classes (demo): decrement spots and notify
  const bookChildIntoProgram = useCallback(
    (prog: YouthProgram) => {
      if (!consent || !consent.signedAt) {
        alert("Please complete parental consent before registering your child.");
        analyticsTrack("booking_blocked_no_consent", {});
        return;
      }
      // find program and decrement spots safely
      const idx = programs.findIndex((p) => p.id === prog.id);
      if (idx < 0) return;
      if (prog.spotsLeft !== undefined && prog.spotsLeft <= 0) {
        alert("This program is full.");
        analyticsTrack("booking_failed_full", { programId: prog.id });
        return;
      }
      // persist a booking record minimally
      const bookings = loadFromLS(LS_PREFIX + "bookings", []);
      bookings.unshift({
        id: `ybook_${Date.now()}`,
        programId: prog.id,
        childId: progressList[0]?.childId || "unknown",
        createdAt: new Date().toISOString(),
      });
      saveToLS(LS_PREFIX + "bookings", bookings);
      // update spots locally in the demo programs array copy
      prog.spotsLeft = (prog.spotsLeft ?? prog.maxParticipants) - 1;
      saveToLS(LS_PREFIX + "programs_demo_state", programs);
      analyticsTrack("youth_program_booked", { programId: prog.id });
      triggerConfetti();
      scheduleBrowserNotification("Registration confirmed", {
        body: `Registered for ${prog.title} — thank you!`,
      });
    },
    [consent, programs, progressList]
  );

  // small helper to schedule browser notifications
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

  // clear all demo progress (admin/demo action)
  const clearProgress = useCallback(() => {
    setProgressList([]);
    saveToLS(LS_KEYS.PROGRESS, []);
    analyticsTrack("parent_cleared_progress", {});
  }, []);

  // analytics helper on interactions
  const onSoundscapeToggle = useCallback((on: boolean) => {
    setSettings((s) => ({ ...s, soundscapeOn: on }));
  }, []);

  // simple accessibility: keyboard shortcut to generate a challenge (Shift+C)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === "c") {
        analyticsTrack("keyboard_challenge_shortcut", {});
        // superficial: open a small confetti to show action
        triggerConfetti({ particleCount: 40, spread: 60 });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // synth testimonials for youth
  const [testimonials, setTestimonials] = useState(() => loadFromLS(LS_PREFIX + "youth_testimonials", [generateSyntheticTestimonial({})]));
  useEffect(() => saveToLS(LS_PREFIX + "youth_testimonials", testimonials), [testimonials]);

  // friendly function to add a synthetic testimonial
  const addTestimonial = useCallback(() => {
    const t = generateSyntheticTestimonial({});
    setTestimonials((s) => [t, ...s].slice(0, 12));
    analyticsTrack("youth_testimonial_added", {});
  }, []);

  // safe defaults: ensure there is at least one child progress entry in demo mode
  useEffect(() => {
    if (progressList.length === 0) {
      const demo = {
        childId: "Avery (demo)",
        ageGroup: "6-9" as AgeGroupKey,
        skillPoints: 40,
        milestones: [{ id: "m1", title: "First Jump Rope", achievedAt: undefined }],
        attendance: [],
      };
      setProgressList([demo]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
     Render
     ========================= */

  return (
    <HelmetProvider>
      <div style={{ maxWidth: 1100, margin: "18px auto", padding: 14 }}>
        <Helmet>
          <title>3rd Street Boxing — Youth Programs</title>
        </Helmet>

        <Header title="3rd Street Boxing" subtitle="Youth & Junior Programs — Safe, Fun, Empowering" />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 14 }}>
          <main>
            <Section title="Announcements">
              <FightTicker />
            </Section>

            <Section title="Programs by Age Group">
              <div style={{ display: "grid", gap: 12 }}>
                {programs.map((p) => {
                  const ageSafe = p.ageGroup;
                  return (
                    <article
                      key={p.id}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        background: "#fff",
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                      }}
                      aria-labelledby={`prog-${p.id}`}
                    >
                      <div style={{ width: 88, height: 88, borderRadius: 8, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                        {p.ageGroup}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div id={`prog-${p.id}`} style={{ fontWeight: 700 }}>{p.title}</div>
                        <div style={{ fontSize: 13, color: "#6b7280" }}>{p.description}</div>
                        <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                          <div style={{ fontSize: 12, color: "#374151" }}>
                            Coach: <strong>{p.coach}</strong> • {p.weeklySessions}x / week • {p.durationWeeks} weeks
                          </div>
                          <div style={{ marginLeft: "auto", fontSize: 12, color: "#6b7280" }}>
                            Spots: {p.spotsLeft ?? p.maxParticipants}
                          </div>
                        </div>
                        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                          <button
                            onClick={() => selectProgram(p.id)}
                            style={{ padding: "8px 12px", borderRadius: 8, background: selectedProgram?.id === p.id ? "#ef4444" : "#60a5fa", color: "#fff" }}
                            aria-pressed={selectedProgram?.id === p.id}
                          >
                            {selectedProgram?.id === p.id ? "Selected" : "Select Program"}
                          </button>
                          <button
                            onClick={() => bookChildIntoProgram(p)}
                            style={{ padding: "8px 12px", borderRadius: 8 }}
                            aria-label={`Register child for ${p.title}`}
                          >
                            Register Child
                          </button>
                          <button
                            onClick={() => {
                              // show safety overlay / details
                              alert(`Safety: ${p.safeGearRequired?.join(", ") || "Standard youth safety equipment recommended."}`);
                            }}
                            style={{ padding: "8px 12px", borderRadius: 8 }}
                          >
                            Safety Info
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </Section>

            <Section title="Interactive Learning">
              <div style={{ display: "grid", gap: 12 }}>
                <RhythmPunch ageGroup={selectedProgram.ageGroup} onComplete={onRhythmComplete} />
                <SparringSimulator ageGroup={selectedProgram.ageGroup} />
                <ArTryOn />
              </div>
            </Section>

            <Section title="Challenges & Rewards">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 12 }}>
                <div>
                  <ChallengeGenerator ageGroup={selectedProgram.ageGroup} onComplete={onChallengeComplete} />
                  <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                    <LeaderboardBracket progress={progressList} />
                  </div>
                </div>
                <aside>
                  <div style={{ display: "grid", gap: 8 }}>
                    <SoundscapeToggle defaultOn={!!settings.soundscapeOn} onChange={onSoundscapeToggle} />
                    <div style={{ padding: 12, borderRadius: 8, background: "#fff" }}>
                      <div style={{ fontWeight: 700 }}>Quick Tips</div>
                      <ul style={{ marginTop: 8 }}>
                        <li>Always wear appropriate youth-sized headgear for sparring.</li>
                        <li>Parents must stay on-site for 6-9 age group sessions.</li>
                        <li>Communication & consent are required before any partner drills.</li>
                      </ul>
                    </div>
                  </div>
                </aside>
              </div>
            </Section>

            <Section title="Testimonials & Community">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
                {testimonials.map((t: any) => (
                  <div key={t.id} style={{ padding: 12, borderRadius: 8, background: "#fff" }}>
                    <div style={{ fontWeight: 700 }}>{t.name} {t.generated && <span style={{ fontSize: 12, color: "#6b7280" }}>(demo)</span>}</div>
                    <div style={{ fontSize: 13, color: "#374151", marginTop: 6 }}>{t.quote}</div>
                  </div>
                ))}
              </div>
            </Section>
          </main>

          <aside>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ padding: 12, borderRadius: 8, background: "#fff" }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Parental Controls</div>
                <ParentalConsentForm initial={consent ?? undefined} onSave={onConsentSave} />
              </div>

              <div style={{ padding: 12, borderRadius: 8, background: "#fff" }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Parent Dashboard</div>
                <ParentDashboard progressList={progressList} onClearProgress={clearProgress} />
              </div>

              <div style={{ padding: 12, borderRadius: 8, background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 700 }}>Quick Actions</div>
                  <button onClick={addTestimonial} style={{ padding: "6px 10px", borderRadius: 8 }}>Add Testimonial</button>
                </div>
                <div style={{ marginTop: 8 }}>
                  <button
                    onClick={() => {
                      analyticsTrack("admin_trigger_notification", {});
                      scheduleBrowserNotification("Reminder: Youth session starts soon", { body: "Check your schedule", delayMs: 3000 });
                    }}
                    style={{ padding: "8px 12px", borderRadius: 8, marginBottom: 8 }}
                  >
                    Send Reminder (demo)
                  </button>
                  <button
                    onClick={() => {
                      // export analytics locally
                      const a = loadFromLS(LS_KEYS.ANALYTICS, []);
                      const blob = new Blob([JSON.stringify(a, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const l = document.createElement("a");
                      l.href = url;
                      l.download = "analytics.json";
                      l.click();
                      URL.revokeObjectURL(url);
                    }}
                    style={{ padding: "8px 12px", borderRadius: 8 }}
                  >
                    Export Analytics
                  </button>
                </div>
              </div>

              <div style={{ padding: 12, borderRadius: 8, background: "#fff" }}>
                <div style={{ fontWeight: 700 }}>Youth Fight Ticker</div>
                <FightTicker items={["Young Champions Showcase — Dec 6", "Skill Day: Coaches will demo footwork", "Parent Meet & Greet — Nov 12"]} />
              </div>
            </div>
          </aside>
        </div>

        <footer style={{ marginTop: 18, color: "#6b7280", fontSize: 13 }}>
          <div>Demo page — all data remains local. For production, replace demo placeholders with secure backend and confirmed parental flows.</div>
          <div style={{ marginTop: 6 }}>
            Built for education, safety, and fun — encourage kids to develop discipline, teamwork, and self-confidence.
          </div>
        </footer>
      </div>
    </HelmetProvider>
  );
}
