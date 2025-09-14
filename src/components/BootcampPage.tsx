import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import confetti from "canvas-confetti";
import { formatInTimeZone } from "date-fns-tz";

/**
 * BootcampPage.tsx
 * Single-file, self-contained React + TypeScript component for the "3rd Street Boxing" Bootcamp page.
 *
 * - Everything needed (types, utilities, components) is defined inside this module.
 * - Styling uses inline JSX style objects only.
 * - State is persisted to localStorage via saveToLS / loadFromLS helpers.
 *
 * This file is adapted from the provided merged_hardcoded demo and extended to be
 * bootcamp-specific: stronger visuals, intensity controls, bootcamp challenges, and
 * specialized interactive components.
 */

/* ============================
   Types
   ============================ */

/** Represents a single bootcamp challenge */
type BootcampChallenge = {
  id: string;
  title: string;
  lengthDays: number;
  focus: "conditioning" | "sparring" | "hypertrophy" | "transformation";
  description: string;
  createdAt: string;
  tag?: "bootcamp" | "fight-ready" | "transformation";
};

/** Intensity metric snapshot */
type IntensityMetric = {
  timestamp: string;
  level: number; // 0..100
  source?: "manual" | "mouse" | "simulator";
};

/** User progress tracking for the bootcamp */
type ProgressTracking = {
  userId: string;
  challengesCompleted: string[]; // challenge ids
  totalSessions: number;
  lastActive?: string;
  points: number;
  belt?: "white" | "blue" | "red" | "black";
};

/* ============================
   Utilities: localStorage wrappers, analytics, confetti
   ============================ */

const LS_SAFE = <T,>(k: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const saveToLS = (k: string, v: any) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    // silent
  }
};
const loadFromLS = <T,>(k: string, fallback: T): T => LS_SAFE<T>(k, fallback);

const triggerConfetti = () => {
  try {
    const c = document.createElement("canvas");
    document.body.appendChild(c);
    confetti.create(c, { resize: true })({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.6 },
    });
    // allow cleanup after a short time
    setTimeout(() => {
      if (c && c.parentNode) c.parentNode.removeChild(c);
    }, 3500);
  } catch {
    // ignore confetti errors
  }
};

const analyticsTrack = (event: string, meta: any = {}) => {
  try {
    const logs = loadFromLS<any[]>("bootcamp_analytics", []);
    logs.unshift({ event, meta, time: new Date().toISOString() });
    saveToLS("bootcamp_analytics", logs.slice(0, 300));
  } catch {
    // ignore
  }
};

/* ============================
   Synthetic testimonial generator (bootcamp-focused)
   ============================ */

type Testimonial = {
  id: string;
  name: string;
  quote: string;
  rating?: number;
  generated?: boolean;
  tag?: "bootcamp" | "class" | "member";
};

const bootcampTemplates = [
  "Completed the {name} — lost {n} lbs and felt fight-ready in {months} months.",
  "{trainer} pushed me beyond my limit. Bootcamp changed my endurance and mindset.",
  "I transformed in {months} months: speed, stamina, and confidence — all thanks to the bootcamp.",
];

function generateSyntheticTestimonial(overrides: Partial<Testimonial> = {}): Testimonial {
  const template = bootcampTemplates[Math.floor(Math.random() * bootcampTemplates.length)];
  const trainer = ["Elena", "Omar", "Raul"][Math.floor(Math.random() * 3)];
  const filled = template
    .replace("{trainer}", trainer)
    .replace("{name}", ["30-Day Transformation", "Fight Ready Bootcamp", "Warrior Circuit"][Math.floor(Math.random() * 3)])
    .replace("{n}", String(8 + Math.floor(Math.random() * 17)))
    .replace("{months}", String(1 + Math.floor(Math.random() * 6)));
  return {
    id: `bt-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
    name: ["Alex P.", "Jordan S.", "Taylor R."][Math.floor(Math.random() * 3)],
    quote: filled,
    rating: 5,
    generated: true,
    tag: "bootcamp",
    ...overrides,
  };
}

/* ============================
   Visual / style tokens (inline)
   ============================ */

const colors = {
  bg: "#0b0b0b",
  panel: "#0f1724",
  intense: "#dc2626", // red-600
  accent: "#06b6d4",
  muted: "#94a3b8",
  white: "#ffffff",
};

const containerStyle: React.CSSProperties = {
  maxWidth: 1100,
  margin: "20px auto",
  padding: 14,
  color: colors.white,
  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  background: `linear-gradient(180deg, ${colors.bg}, #071025)`,
  borderRadius: 10,
  boxShadow: "0 12px 40px rgba(2,6,23,0.6)",
};

/* ============================
   ChallengeGenerator (bootcamp)
   ============================ */

/**
 * Produces a high-intensity bootcamp challenge and persists to localStorage under "demo_bootcamp_challenges".
 */
const CHALLENGE_KEY = "demo_bootcamp_challenges";

const BootcampChallengeGenerator: React.FC = () => {
  const [last, setLast] = useState<BootcampChallenge | null>(() =>
    loadFromLS<BootcampChallenge | null>(CHALLENGE_KEY, null)
  );
  const generate = useCallback(() => {
    const lengths = [14, 21, 28, 30, 42];
    const focus: BootcampChallenge["focus"][] = ["conditioning", "sparring", "hypertrophy", "transformation"];
    const names = ["Fight Ready Bootcamp", "30-Day Transformation", "Warrior Circuit", "Bout Prep"];
    const title = names[Math.floor(Math.random() * names.length)];
    const lengthDays = lengths[Math.floor(Math.random() * lengths.length)];
    const f = focus[Math.floor(Math.random() * focus.length)];
    const challenge: BootcampChallenge = {
      id: `bc-${Date.now()}`,
      title,
      lengthDays,
      focus: f,
      description: `${title}: ${lengthDays}-day high-intensity program focused on ${f}. Expect interval conditioning, heavy bag circuits, and sparring drills.`,
      createdAt: new Date().toISOString(),
      tag: f === "transformation" ? "transformation" : "bootcamp",
    };
    try {
      const existing = loadFromLS<BootcampChallenge[]>(CHALLENGE_KEY, []);
      existing.unshift(challenge);
      saveToLS(CHALLENGE_KEY, existing.slice(0, 20));
      setLast(challenge);
      analyticsTrack("bootcamp_challenge_generated", { id: challenge.id, title: challenge.title });
      triggerConfetti();
    } catch {
      // ignore storage issues
    }
  }, []);

  const clearAll = useCallback(() => {
    saveToLS(CHALLENGE_KEY, []);
    setLast(null);
    analyticsTrack("bootcamp_challenges_cleared");
  }, []);

  return (
    <div style={{ padding: 14, borderRadius: 8, background: colors.panel }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Bootcamp Challenge Generator</div>
          <div style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>High-intensity programs designed to transform you.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={generate}
            style={{ background: colors.intense, color: colors.white, padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer" }}
          >
            Generate
          </button>
          <button
            onClick={clearAll}
            style={{ background: "#1f2937", color: colors.muted, padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer" }}
          >
            Clear
          </button>
        </div>
      </div>

      {last ? (
        <div style={{ marginTop: 12, padding: 12, background: "#071220", borderRadius: 8 }}>
          <div style={{ fontWeight: 700 }}>{last.title} <span style={{ fontSize: 13, color: colors.muted }}>• {last.lengthDays} days</span></div>
          <div style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>{last.description}</div>
          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => {
                // mark user as enrolled for demo into challenge
                const prog = loadFromLS<ProgressTracking[]>("demo_bootcamp_progress", []);
                prog.unshift({
                  userId: "demo-user",
                  challengesCompleted: [],
                  totalSessions: 0,
                  lastActive: new Date().toISOString(),
                  points: 0,
                });
                saveToLS("demo_bootcamp_progress", prog.slice(0, 50));
                analyticsTrack("bootcamp_challenge_enrolled", { challengeId: last.id });
                triggerConfetti();
              }}
              style={{ background: colors.accent, color: "#000", padding: "8px 12px", borderRadius: 8, border: "none" }}
            >
              Enroll (Demo)
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 12, color: colors.muted }}>No recent challenge generated — create one to start.</div>
      )}
    </div>
  );
};

/* ============================
   IntensityMeter
   - Visual bar + circular indicator that responds to mouse movements and programmatic updates.
   - Persists snapshots to localStorage key "demo_bootcamp_intensity".
   ============================ */

const INTENSITY_KEY = "demo_bootcamp_intensity";

const IntensityMeter: React.FC<{ initial?: number }> = React.memo(({ initial = 18 }) => {
  const saved = loadFromLS<IntensityMetric[]>(INTENSITY_KEY, []);
  const [level, setLevel] = useState<number>(() => (saved.length ? saved[0].level : initial));
  const [history, setHistory] = useState<IntensityMetric[]>(() => saved as IntensityMetric[]);

  // react to mouse move to temporarily boost intensity (simulates effort)
  useEffect(() => {
    let lastBoostAt = 0;
    const onMove = (ev: MouseEvent) => {
      const now = Date.now();
      if (now - lastBoostAt < 80) return;
      lastBoostAt = now;
      setLevel((l) => {
        const nl = Math.min(100, l + Math.random() * 8 + 3);
        const snapshot: IntensityMetric = { timestamp: new Date().toISOString(), level: Math.round(nl), source: "mouse" };
        const h = [snapshot, ...history].slice(0, 200);
        setHistory(h);
        saveToLS(INTENSITY_KEY, h);
        analyticsTrack("intensity_mouse_boost", { level: snapshot.level });
        return Math.round(nl);
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  // periodic decay toward baseline
  useEffect(() => {
    const t = setInterval(() => {
      setLevel((l) => {
        const nl = Math.max(6, Math.round(l * 0.96));
        if (nl !== l) {
          const snapshot: IntensityMetric = { timestamp: new Date().toISOString(), level: nl, source: "decay" };
          const h = [snapshot, ...history].slice(0, 200);
          setHistory(h);
          saveToLS(INTENSITY_KEY, h);
        }
        return nl;
      });
    }, 2200);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  // manual slider by user
  const onManualChange = useCallback((v: number) => {
    const snapshot: IntensityMetric = { timestamp: new Date().toISOString(), level: v, source: "manual" };
    const h = [snapshot, ...history].slice(0, 200);
    setLevel(v);
    setHistory(h);
    saveToLS(INTENSITY_KEY, h);
    analyticsTrack("intensity_manual_set", { level: v });
    // small confetti for high intensity
    if (v >= 90) triggerConfetti();
  }, [history]);

  // UI
  const barWidth = `${Math.min(100, Math.max(0, level))}%`;
  return (
    <div style={{ padding: 12, borderRadius: 8, background: "#071026" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 800 }}>Intensity Meter</div>
        <div style={{ fontSize: 12, color: colors.muted }}>{level}%</div>
      </div>
      <div style={{ marginTop: 10, height: 14, background: "#02141b", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ width: barWidth, height: "100%", background: `linear-gradient(90deg, ${colors.intense}, ${colors.accent})`, transition: "width 220ms linear" }} />
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
        <input
          aria-label="Intensity slider"
          type="range"
          min={0}
          max={100}
          value={level}
          onChange={(e) => onManualChange(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <div style={{ width: 44, height: 44, borderRadius: 22, display: "flex", justifyContent: "center", alignItems: "center", background: "#071827", border: `2px solid ${level > 70 ? colors.intense : colors.muted}` }}>
          <div style={{ fontWeight: 700 }}>{Math.round(level)}</div>
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: colors.muted }}>Tip: Move your mouse during the warm-up to feel the "boost" — this simulates effort spikes.</div>
    </div>
  );
});

/* ============================
   SparringSimulator (bootcamp variant)
   - Accepts intensity prop and exposes visual indicators.
   - Heavy rendering is memoized and uses requestAnimationFrame.
   ============================ */

const SparringSimulator: React.FC<{ intensityLevel?: number }> = React.memo(({ intensityLevel = 20 }) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const intensityRef = useRef<number>(intensityLevel);
  intensityRef.current = intensityLevel;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = 720;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let last = performance.now();

    // simple physics-ish positions
    let a = { x: 150, y: 150, vx: 0, color: "#e11" };
    let b = { x: 550, y: 150, vx: 0, color: "#118" };

    const draw = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;

      // intensity affects speed randomness & size (higher = more frantic)
      const intensity = intensityRef.current / 100;
      // random jitter influenced by intensity
      a.vx += (Math.sin(t / 120 + 1) * 20 - a.vx) * (0.1 + intensity * 0.9) * dt * 6;
      b.vx += (Math.cos(t / 140 + 2) * 20 - b.vx) * (0.1 + intensity * 0.9) * dt * 6;

      a.x += a.vx * (0.6 + intensity * 1.6);
      b.x += b.vx * (0.6 + intensity * 1.6);

      // bounce back in ring
      if (a.x < 80) a.x = 80;
      if (a.x > 300) a.x = 300;
      if (b.x < 420) b.x = 420;
      if (b.x > 640) b.x = 640;

      // draw background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#05060a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ring
      ctx.strokeStyle = "#132030";
      ctx.lineWidth = 4;
      ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);

      // energy aura around fighters (bigger with intensity)
      const auraA = 12 + intensity * 32;
      const auraB = 12 + intensity * 32;

      const drawFighter = (x: number, y: number, r: number, color: string, aura: number) => {
        // aura
        const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, aura);
        g.addColorStop(0, `${color}33`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, aura, 0, Math.PI * 2);
        ctx.fill();

        // body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      };

      drawFighter(a.x, a.y, 18 + intensity * 6, a.color, auraA);
      drawFighter(b.x, b.y, 18 + intensity * 6, b.color, auraB);

      // intensity meter overlay small
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Inter, sans-serif";
      ctx.fillText(`Simulator intensity: ${Math.round(intensityRef.current)}%`, 14, canvas.height - 12);

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div style={{ padding: 12, borderRadius: 8, background: "#071426" }}>
      <div style={{ fontWeight: 800 }}>Sparring Simulator</div>
      <canvas ref={ref} style={{ width: "100%", marginTop: 10, borderRadius: 8, display: "block" }} />
    </div>
  );
});

/* ============================
   SoundscapeToggle with multiple high-intensity options
   ============================ */

const SoundscapeToggle: React.FC = () => {
  const [playing, setPlaying] = useState(false);
  const [which, setWhich] = useState<"club" | "stadium" | "focus" | "none">("none");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (which === "none") {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlaying(false);
      return;
    }
    // placeholder file names — in real app these point to actual assets
    const map: Record<string, string> = {
      club: "/assets/club-beat.mp3",
      stadium: "/assets/stadium-hype.mp3",
      focus: "/assets/focus-loop.mp3",
      none: "",
    };
    try {
      audioRef.current = new Audio(map[which]);
      audioRef.current.loop = true;
      if (playing) audioRef.current.play().catch(() => {});
    } catch {
      audioRef.current = null;
    }
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [which]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.play().catch(() => {
        // a play error (autoplay) — just stop
        setPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [playing]);

  return (
    <div style={{ padding: 12, borderRadius: 8, background: "#071322" }}>
      <div style={{ fontWeight: 800 }}>Bootcamp Soundscapes</div>
      <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
        <select value={which} onChange={(e) => setWhich(e.target.value as any)} style={{ padding: 8, borderRadius: 8 }}>
          <option value="none">Select soundscape</option>
          <option value="club">Club Beat (High Energy)</option>
          <option value="stadium">Stadium Hype (Crowd)</option>
          <option value="focus">Focus Loop (Rhythmic)</option>
        </select>
        <button
          onClick={() => {
            if (which === "none") return;
            setPlaying((p) => !p);
            analyticsTrack("soundscape_toggled", { which, playing: !playing });
          }}
          style={{ padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: playing ? colors.intense : "#0f1724", color: colors.white }}
        >
          {playing ? "Stop" : "Play"}
        </button>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: colors.muted }}>Choose a soundscape to elevate your bootcamp session.</div>
    </div>
  );
};

/* ============================
   LeaderboardBracketBootcamp
   - Filtered / styled for bootcamp rankings
   ============================ */

const LeaderboardBracketBootcamp: React.FC = () => {
  const [round, setRound] = useState(1);
  const [entries] = useState(() => [
    { name: "Sofia R.", pts: 3120 },
    { name: "Tommy L.", pts: 2920 },
    { name: "Omar K.", pts: 2740 },
    { name: "Elena M.", pts: 2680 },
  ]);
  useEffect(() => {
    const t = setInterval(() => setRound((r) => (r % 5) + 1), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ padding: 12, borderRadius: 8, background: "#07121a" }}>
      <div style={{ fontWeight: 800, display: "flex", justifyContent: "space-between" }}>
        <span>Bootcamp Leaderboard</span>
        <span style={{ color: colors.muted, fontSize: 13 }}>Round {round}</span>
      </div>
      <div style={{ marginTop: 8 }}>
        {entries.map((e, idx) => (
          <div key={e.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: idx < entries.length - 1 ? "1px solid #081a23" : "none" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: idx === 0 ? colors.intense : "#0b1220", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{idx + 1}</div>
              <div>
                <div style={{ fontWeight: 700 }}>{e.name}</div>
                <div style={{ fontSize: 12, color: colors.muted }}>Bootcamp points</div>
              </div>
            </div>
            <div style={{ fontWeight: 800 }}>{e.pts}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================
   OccupancyMouseBooster adapted to Bootcamp classes
   - More intense interaction: mouse movement + click spawns "rush" events
   ============================ */

const OccupancyMouseBoosterBootcamp: React.FC = () => {
  const [occ, setOcc] = useState<number>(() => loadFromLS<number>("bootcamp_occ", 22));
  useEffect(() => saveToLS("bootcamp_occ", occ), [occ]);

  useEffect(() => {
    let boosted = false;
    const onMove = () => {
      if (!boosted) {
        setOcc((o) => Math.min(40, o + 1));
        boosted = true;
        setTimeout(() => (boosted = false), 450);
      }
    };
    const onClick = () => {
      // click gives a bigger surge
      setOcc((o) => Math.min(60, o + 5));
      analyticsTrack("occupancy_boost_click", { occ });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
    };
  }, [occ]);

  return (
    <div style={{ padding: 12, borderRadius: 8, background: "#071220" }}>
      <div style={{ fontWeight: 800 }}>Class Occupancy (Bootcamp)</div>
      <div style={{ marginTop: 8, fontSize: 20, fontWeight: 800, color: colors.intense }}>{occ} / 60</div>
      <div style={{ marginTop: 8, fontSize: 12, color: colors.muted }}>Mouse movement raises the 'hype' — click to push a surge (demo).</div>
    </div>
  );
};

/* ============================
   FlashSaleCard (bootcamp promotion)
   ============================ */

const FlashSaleCardBootcamp: React.FC = () => {
  const [endsAt] = useState<Date>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 18 + Math.floor(Math.random() * 15));
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
    <div style={{ padding: 12, borderRadius: 8, background: `linear-gradient(180deg, ${colors.intense}, #9b1b1b)`, color: colors.white }}>
      <div style={{ fontWeight: 900, fontSize: 18 }}>Bootcamp Flash Sale</div>
      <div style={{ marginTop: 6, fontSize: 13 }}>Premium Bootcamp Pass — 45% off for the next</div>
      <div style={{ marginTop: 8, fontSize: 20, fontWeight: 800 }}>{mm}:{String(ss).padStart(2, "0")}</div>
      <div style={{ marginTop: 10 }}>
        <button
          onClick={() => {
            analyticsTrack("bootcamp_flash_purchase_click");
            triggerConfetti();
            alert("Flash sale purchase simulated (demo).");
          }}
          style={{ marginTop: 6, padding: "10px 14px", borderRadius: 8, border: "none", background: "#fff", color: "#000", fontWeight: 800 }}
        >
          Grab Pass
        </button>
      </div>
    </div>
  );
};

/* ============================
   GuaranteedBanner (bootcamp-specific)
   ============================ */

const GuaranteedBannerBootcamp: React.FC = () => (
  <div style={{ padding: 12, borderRadius: 8, background: "#0b1f1a", border: "1px solid #0f3a31" }}>
    <div style={{ fontWeight: 800 }}>Guaranteed Bootcamp Results</div>
    <div style={{ color: colors.muted, marginTop: 6 }}>
      Finish our 6-week Fight Ready Bootcamp and we'll provide personalized ring-time coaching — or an extra 2 one-on-one sessions.
    </div>
  </div>
);

/* ============================
   Testimonials panel (bootcamp filtered)
   ============================ */

const TESTIMONIAL_KEY = "demo_bootcamp_testimonials";

const BootcampTestimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => loadFromLS<Testimonial[]>(TESTIMONIAL_KEY, [
    { id: "t1", name: "Sophie M.", quote: "Bootcamp took my cardio through the roof.", rating: 5, generated: false, tag: "bootcamp" },
  ]));
  useEffect(() => saveToLS(TESTIMONIAL_KEY, testimonials), [testimonials]);

  const addOne = useCallback(() => {
    const t = generateSyntheticTestimonial();
    setTestimonials((s) => [t, ...s].slice(0, 24));
    analyticsTrack("bootcamp_testimonial_added", { id: t.id });
  }, []);

  return (
    <div style={{ padding: 12, borderRadius: 8, background: "#071423" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 800 }}>Bootcamp Testimonials</div>
        <button onClick={addOne} style={{ padding: "6px 10px", borderRadius: 8, background: colors.accent, border: "none", cursor: "pointer" }}>Add</button>
      </div>
      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
        {testimonials.map((t) => (
          <div key={t.id} style={{ padding: 10, borderRadius: 8, background: "#0b1620", color: colors.white }}>
            <div style={{ fontWeight: 700 }}>{t.name} {t.generated && <span style={{ fontSize: 12, color: colors.muted }}>(synthetic)</span>}</div>
            <div style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>{t.quote}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================
   Main BootcampPage component
   ============================ */

/**
 * BootcampPage
 *
 * Production-minded single-file React component that showcases:
 * - Bootcamp challenge generator (persisted)
 * - Intensity meter and sparring simulator (interactive)
 * - Soundscapes, leaderboard, occupancy booster, testimonials, flash sale
 * - Analytics calls on key user interactions
 *
 * Important: This component is intentionally self-contained and uses inline styles only.
 */
export default function BootcampPage(): JSX.Element {
  const [simIntensity, setSimIntensity] = useState<number>(() => {
    const saved = loadFromLS<IntensityMetric[]>("demo_bootcamp_intensity", []);
    return saved.length ? saved[0].level : 22;
  });

  // load challenges count for header
  const [challenges] = useState<BootcampChallenge[]>(() => loadFromLS<BootcampChallenge[]>(CHALLENGE_KEY, []));

  useEffect(() => {
    analyticsTrack("bootcamp_page_loaded", { challenges: challenges.length });
  }, [challenges.length]);

  // hook: persist simIntensity to LS snapshots
  useEffect(() => {
    const snapshot: IntensityMetric = { timestamp: new Date().toISOString(), level: Math.round(simIntensity), source: "simulator" };
    const prev = loadFromLS<IntensityMetric[]>("demo_bootcamp_intensity", []);
    prev.unshift(snapshot);
    saveToLS("demo_bootcamp_intensity", prev.slice(0, 200));
  }, [simIntensity]);

  const handleGenerateChallenge = useCallback(() => {
    // delegate to child generator via localStorage change + analytics
    // (the BootcampChallengeGenerator will write to LS and fire analytics)
    analyticsTrack("bootcamp_generate_button_clicked");
    // we simulate a click by creating one here (to ensure immediate response)
    const lengths = [14, 21, 28, 30, 42];
    const focus: BootcampChallenge["focus"][] = ["conditioning", "sparring", "hypertrophy", "transformation"];
    const names = ["Fight Ready Bootcamp", "30-Day Transformation", "Warrior Circuit", "Bout Prep"];
    const title = names[Math.floor(Math.random() * names.length)];
    const lengthDays = lengths[Math.floor(Math.random() * lengths.length)];
    const f = focus[Math.floor(Math.random() * focus.length)];
    const challenge: BootcampChallenge = {
      id: `bc-${Date.now()}`,
      title,
      lengthDays,
      focus: f,
      description: `${title}: ${lengthDays}-day high-intensity program focused on ${f}. Expect interval conditioning, heavy bag circuits, and sparring drills.`,
      createdAt: new Date().toISOString(),
      tag: f === "transformation" ? "transformation" : "bootcamp",
    };
    const existing = loadFromLS<BootcampChallenge[]>(CHALLENGE_KEY, []);
    existing.unshift(challenge);
    saveToLS(CHALLENGE_KEY, existing.slice(0, 20));
    triggerConfetti();
  }, []);

  return (
    <div style={containerStyle}>
      <Helmet>
        <title>3rd Street Boxing — Bootcamp</title>
      </Helmet>

      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>3rd Street — Bootcamp</h1>
          <div style={{ marginTop: 6, color: colors.muted }}>High-intensity training programs & fight preparation</div>
          <div style={{ marginTop: 8, color: colors.muted, fontSize: 13 }}>{challenges.length} saved challenge(s)</div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => {
              analyticsTrack("quick_enroll_clicked");
              alert("Quick enroll simulated (demo).");
            }}
            style={{ padding: "10px 14px", borderRadius: 10, background: colors.intense, color: colors.white, border: "none", fontWeight: 800 }}
          >
            Quick Enroll
          </button>
          <button
            onClick={() => {
              analyticsTrack("open_schedule_clicked");
              alert("Schedule view simulated (demo).");
            }}
            style={{ padding: "10px 14px", borderRadius: 10, background: "#0b1720", color: colors.muted, border: "1px solid #0e2a34" }}
          >
            Schedule
          </button>
        </div>
      </header>

      <main style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
        <section>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 12 }}>
              <div style={{ padding: 12, borderRadius: 8, background: "#07111a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>Bootcamp Live Demo</div>
                  <div style={{ fontSize: 12, color: colors.muted }}>{formatInTimeZone(new Date(), "America/Los_Angeles", "MMM d, yyyy h:mm a")}</div>
                </div>
                <div style={{ marginTop: 10, color: colors.muted }}>
                  This page demonstrates an intense, interactive bootcamp experience. Elements are intentionally energetic to convey intensity.
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={handleGenerateChallenge} style={{ padding: "8px 12px", borderRadius: 8, background: colors.accent, border: "none", fontWeight: 700 }}>Generate Challenge</button>
                      <button onClick={() => { analyticsTrack("view_progress_clicked"); alert("Progress view (demo)."); }} style={{ padding: "8px 12px", borderRadius: 8, background: "#0b1220", border: "1px solid #0f2630", color: colors.white }}>View Progress</button>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <IntensityMeter initial={simIntensity} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <FlashSaleCardBootcamp />
                <GuaranteedBannerBootcamp />
                <SoundscapeToggle />
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 8, background: "#071425" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 900 }}>Sparring Lab</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ fontSize: 13, color: colors.muted }}>Simulator intensity:</div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={simIntensity}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSimIntensity(v);
                      analyticsTrack("simulator_intensity_changed", { v });
                    }}
                    style={{ width: 160 }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <SparringSimulator intensityLevel={simIntensity} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <BootcampChallengeGenerator />
              </div>
              <div>
                <BootcampTestimonials />
              </div>
            </div>
          </div>
        </section>

        <aside>
          <div style={{ display: "grid", gap: 12 }}>
            <LeaderboardBracketBootcamp />
            <OccupancyMouseBoosterBootcamp />
            <div style={{ padding: 12, borderRadius: 8, background: "#071221" }}>
              <div style={{ fontWeight: 900 }}>Quick Actions</div>
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => { analyticsTrack("join_challenge_quick"); alert("Joined challenge (demo)."); }} style={{ padding: 10, borderRadius: 8, background: colors.intense, border: "none", color: colors.white }}>Join Now</button>
                <button onClick={() => { analyticsTrack("book_sparring_slot"); alert("Booked sparring slot (demo)."); }} style={{ padding: 10, borderRadius: 8, background: "#0b1720", border: "1px solid #0f2630", color: colors.muted }}>Book Sparring</button>
                <button onClick={() => { analyticsTrack("contact_coach"); alert("Contacted coach (demo)."); }} style={{ padding: 10, borderRadius: 8, background: colors.accent, border: "none", color: "#000" }}>Contact Coach</button>
              </div>
            </div>

            <div>
              <FlashSaleCardBootcamp />
            </div>
          </div>
        </aside>
      </main>

      <footer style={{ marginTop: 18, color: colors.muted, fontSize: 13 }}>
        <div>Demo bootcamp page — all interactions are simulated client-side for demonstration only.</div>
      </footer>
    </div>
  );
}
