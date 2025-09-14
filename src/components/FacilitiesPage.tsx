/**
 * FacilitiesPage.tsx
 *
 * Facilities showcase page for "3rd Street Boxing".
 * This file is a standalone React + TypeScript module adapted from the uploaded demo source:
 * :contentReference[oaicite:0]{index=0}
 *
 * All styles are inline JSX style objects. No external files required at runtime.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
import confetti from "canvas-confetti";
import { formatInTimeZone } from "date-fns-tz";

/* -----------------------------
   Utilities (localStorage, analytics, etc.)
   ----------------------------- */

/** Safely save a value to localStorage */
const saveToLS = (k: string, v: any) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {
    // fail silently for privacy / storage errors
    // In prod could record to remote logging
    // eslint-disable-next-line no-console
    console.warn("saveToLS failed", e);
  }
};

/** Safely load a value from localStorage */
const loadFromLS = <T,>(k: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

/** Lightweight analytics (stores events into localStorage) */
const analyticsTrack = (event: string, meta: any = {}) => {
  try {
    const logs = loadFromLS<any[]>("fac_analytics", []);
    logs.unshift({ event, meta, time: new Date().toISOString() });
    saveToLS("fac_analytics", logs.slice(0, 300));
  } catch {
    // ignore analytics errors
  }
};

/** Trigger confetti in a safe way (creates a canvas) */
const triggerConfetti = (opts: any = {}) => {
  try {
    const c = document.createElement("canvas");
    c.setAttribute("aria-hidden", "true");
    document.body.appendChild(c);
    confetti.create(c, { resize: true })({
      particleCount: opts.particleCount ?? 80,
      spread: opts.spread ?? 60,
      origin: { y: 0.6 },
    });
    // remove canvas after a short delay
    setTimeout(() => {
      try {
        document.body.removeChild(c);
      } catch {}
    }, 3000);
  } catch {
    // ignore confetti failures
  }
};

/* -----------------------------
   Types
   ----------------------------- */

/** Single piece of equipment in the gym */
export type EquipmentItem = {
  id: string;
  name: string;
  description: string;
  category: "bags" | "ring" | "strength" | "locker" | "misc";
  specs?: Record<string, string | number>;
  imageUrl?: string; // optional image (data url or path); for demo can be null
  featured?: boolean;
  available?: boolean;
};

/** Tour point in the virtual facilities tour */
export type TourPoint = {
  id: string;
  title: string;
  description: string;
  area: "Ring" | "Bags" | "Strength Area" | "Locker Rooms" | "Reception" | "Recovery";
  equipmentIds?: string[]; // equipment relevant to the point
  ambientSound?: string; // identifier for soundscape toggle
};

/** Facility structure (could be extended) */
export type Facility = {
  id: string;
  name: string;
  address?: string;
  openHours?: string;
  capacity?: number;
  highlights?: string[];
  images?: string[];
};

/** Simple testimonial type */
export type Testimonial = {
  id: string;
  name: string;
  quote: string;
  rating?: number;
  generated?: boolean;
};

/* -----------------------------
   Synthetic testimonial generator (adapted from demo)
   ----------------------------- */

const testimonialTemplates = [
  "I gained so much confidence training here — {trainer} really changed my world.",
  "Lost {n} lbs and gained a championship mindset in {months} months.",
  "The community is unbeatable. {trainer}'s coaching is 🔥.",
];

export function generateSyntheticTestimonial(overrides: Partial<Testimonial> = {}): Testimonial {
  const t = testimonialTemplates[Math.floor(Math.random() * testimonialTemplates.length)];
  const filled = t
    .replace("{trainer}", ["Raúl", "Coach Omar", "Coach Elena"][Math.floor(Math.random() * 3)])
    .replace("{n}", String(10 + Math.floor(Math.random() * 20)))
    .replace("{months}", String(3 + Math.floor(Math.random() * 9)));
  const result: Testimonial = {
    id: `gen-${Date.now()}`,
    name: ["Alex P.", "Jordan S.", "Taylor R."][Math.floor(Math.random() * 3)],
    quote: filled,
    rating: 5,
    generated: true,
    ...overrides,
  };
  return result;
}

/* -----------------------------
   Reusable small components
   ----------------------------- */

const VisuallyHidden: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ border: 0, clip: "rect(0 0 0 0)", height: 1, margin: -1, overflow: "hidden", padding: 0, position: "absolute", width: 1 }}>
    {children}
  </span>
);

/* -----------------------------
   FightTicker (top-of-page consistency)
   ----------------------------- */

const FightTicker: React.FC = memo(function FightTicker() {
  const items = useMemo(
    () => [
      "Fight Night: Friday 8pm — Limited seats",
      "Celebrity guest appearance next week",
      "Register for sparring tournament",
    ],
    []
  );

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        background: "#f8fafc",
        padding: "6px 8px",
        borderRadius: 6,
      }}
    >
      <div style={{ display: "inline-block", animation: "ticker 14s linear infinite" }}>
        {items.join(" • ")}
      </div>
      <style>{`@keyframes ticker { 0% { transform: translateX(100%);} 100% { transform: translateX(-100%);} }`}</style>
    </div>
  );
});

/* -----------------------------
   SoundscapeToggle (ambient audio control)
   ----------------------------- */

const SoundscapeToggle: React.FC<{ soundId?: string }> = ({ soundId }) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Map soundId -> audio paths; in demo these are placeholders
    const src = soundId ? `/assets/soundscape-${soundId}.mp3` : "/assets/ambient-gym.mp3";
    audioRef.current = new Audio(src);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.6;
    return () => {
      try {
        audioRef.current?.pause();
      } finally {
        audioRef.current = null;
      }
    };
  }, [soundId]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.play().catch(() => {
        // autoplay prevented — silent failure
      });
    } else {
      audioRef.current.pause();
    }
  }, [playing]);

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button
        aria-pressed={playing}
        onClick={() => {
          setPlaying((p) => !p);
          analyticsTrack("soundscape_toggled", { soundId, newState: !playing });
        }}
        style={{
          padding: "6px 10px",
          borderRadius: 6,
          background: playing ? "#dc2626" : "#eee",
          color: playing ? "#fff" : "#000",
        }}
      >
        {playing ? "Stop Soundscape" : "Play Soundscape"}
      </button>
      <span style={{ color: "#666" }}>{playing ? "Playing ambient audio" : "Soundscape off"}</span>
    </div>
  );
};

/* -----------------------------
   SparringSimulator (adapted for facilities)
   ----------------------------- */

const SparringSimulator: React.FC<{ ringName?: string }> = memo(function SparringSimulator({ ringName = "Main Ring" }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 700 * dpr;
    canvas.height = 340 * dpr;
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    let raf = 0;
    let last = performance.now();
    const draw = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      const w = 700;
      const h = 340;
      ctx.clearRect(0, 0, w, h);

      // background
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, w, h);

      // ring
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, w - 80, h - 80);

      // ring label
      ctx.fillStyle = "#fff";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(ringName, 50, 70);

      // fighters
      const x1 = 200 + Math.sin(Date.now() / 320) * 80;
      const x2 = 500 + Math.cos(Date.now() / 420) * 80;
      ctx.fillStyle = "#e11";
      ctx.beginPath();
      ctx.arc(x1, h / 2, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#118";
      ctx.beginPath();
      ctx.arc(x2, h / 2, 26, 0, Math.PI * 2);
      ctx.fill();

      // subtle ring center glow
      ctx.fillStyle = "rgba(255,255,255,0.02)";
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2, 220, 60, 0, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [ringName]);

  return (
    <div aria-label={`${ringName} simulator`} role="img" style={{ width: "100%", borderRadius: 8, overflow: "hidden", background: "#01060a" }}>
      <canvas ref={ref} />
    </div>
  );
});

/* -----------------------------
   AR Try-On (integrated with equipment)
   - Accepts an optional equipment item to overlay equipment mock on user's photo.
   ----------------------------- */

const ArTryOn: React.FC<{ equipment?: EquipmentItem | null }> = ({ equipment = null }) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!dataUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = canvasRef.current!;
      // square canvas for demo
      const size = 420;
      c.width = size;
      c.height = size;
      const ctx = c.getContext("2d")!;
      ctx.clearRect(0, 0, size, size);

      // draw user photo
      ctx.drawImage(img, 0, 0, size, size);

      // overlay mock for equipment (different visuals for categories)
      ctx.save();
      switch (equipment?.category) {
        case "bags":
          ctx.fillStyle = "rgba(139, 92, 246, 0.35)";
          ctx.fillRect(size - 160, size - 240, 120, 200);
          ctx.fillStyle = "#fff";
          ctx.font = "12px sans-serif";
          ctx.fillText(equipment?.name ?? "Bag (mock)", size - 156, size - 220);
          break;
        case "ring":
          ctx.fillStyle = "rgba(236, 72, 153, 0.25)";
          ctx.beginPath();
          ctx.ellipse(size / 2, size / 2, 160, 90, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.fillText(equipment?.name ?? "Ring (mock)", size / 2 - 40, size / 2 - 60);
          break;
        case "strength":
          ctx.fillStyle = "rgba(34,197,94,0.28)";
          ctx.fillRect(40, size - 220, 100, 180);
          ctx.fillStyle = "#fff";
          ctx.fillText(equipment?.name ?? "Strength (mock)", 44, size - 200);
          break;
        default:
          // generic overlay
          ctx.fillStyle = "rgba(17,24,39,0.2)";
          ctx.fillRect(size - 160, size - 160, 120, 120);
          ctx.fillStyle = "#fff";
          ctx.fillText(equipment?.name ?? "3rd Street Gear", size - 156, size - 140);
      }
      ctx.restore();
    };
    img.src = dataUrl;
  }, [dataUrl, equipment]);

  const onFile = useCallback((f?: File) => {
    const file = f || (fileRef.current?.files && fileRef.current.files[0]);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDataUrl(String(reader.result));
    reader.readAsDataURL(file);
    analyticsTrack("ar_tryon_upload", { equipmentId: equipment?.id ?? null });
  }, [equipment]);

  return (
    <div style={{ padding: 12, borderRadius: 8, background: "#fff" }}>
      <div style={{ marginBottom: 8, fontWeight: 700 }}>AR Try-On</div>
      <div style={{ marginBottom: 8 }}>Upload a selfie to preview how selected equipment looks (demo overlay).</div>
      <input
        ref={fileRef as any}
        aria-label="Upload selfie for AR try-on"
        type="file"
        accept="image/*"
        onChange={() => onFile()}
        style={{ marginBottom: 8 }}
      />
      <div>
        <canvas ref={canvasRef} style={{ width: 420, height: 420, display: dataUrl ? "block" : "none", borderRadius: 8 }} />
        {!dataUrl && <div style={{ color: "#666" }}>Upload a photo to preview overlay.</div>}
      </div>
    </div>
  );
};

/* -----------------------------
   EquipmentShowcase (new)
   - Displays equipment library, allows favorites, details, AR try-on integration
   ----------------------------- */

const defaultEquipment: EquipmentItem[] = [
  {
    id: "e_ring_main",
    name: "Competition Ring",
    category: "ring",
    description: "Full-size competition ring with sprung floor and professional ropes.",
    specs: { size: "20x20ft", surface: "sprung", lights: "overhead" },
    featured: true,
    available: true,
  },
  {
    id: "e_heavybag_xl",
    name: "Heavy Bag XL",
    category: "bags",
    description: "Durable leather heavy bag for power and conditioning.",
    specs: { weight: "80kg", material: "leather" },
    available: true,
  },
  {
    id: "e_power_rack",
    name: "Power Rack & Free Weights",
    category: "strength",
    description: "Racks, plates, and benches for strength training.",
    specs: { maxLoad: "500kg", benches: 2 },
    available: true,
  },
  {
    id: "e_recovery_pod",
    name: "Recovery Pod",
    category: "misc",
    description: "Infrared recovery pod for post-sparring recovery.",
    specs: { type: "infrared" },
    available: false,
  },
];

const EquipmentShowcase: React.FC<{
  onSelect?: (e: EquipmentItem) => void;
  persistedKey?: string;
}> = ({ onSelect, persistedKey = "fac_equipment_favs" }) => {
  const [equipment] = useState<EquipmentItem[]>(() => {
    // In a real app you'd fetch; here we use defaults
    return defaultEquipment;
  });

  const [favorites, setFavorites] = useState<string[]>(() => loadFromLS(persistedKey, [] as string[]));
  useEffect(() => saveToLS(persistedKey, favorites), [favorites, persistedKey]);

  const toggleFav = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [id, ...prev];
      analyticsTrack("equipment_favorite_toggled", { id, nowFav: next.includes(id) });
      return next;
    });
  }, []);

  return (
    <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontWeight: 700 }}>Equipment Showcase</div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>{favorites.length} favorites</div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {equipment.map((eq) => (
          <div key={eq.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: 8, borderRadius: 8, border: "1px solid #eee" }}>
            <div style={{ width: 72, height: 72, background: "#f3f4f6", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span aria-hidden>{eq.name.slice(0, 1)}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{eq.name} {eq.featured && <span style={{ fontSize: 12, color: "#d97706" }}>(Featured)</span>}</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>{eq.description}</div>
              <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    onSelect?.(eq);
                    analyticsTrack("equipment_selected", { id: eq.id });
                  }}
                  style={{ padding: "6px 10px", borderRadius: 6, background: "#111827", color: "#fff" }}
                >
                  View
                </button>
                <button
                  onClick={() => toggleFav(eq.id)}
                  aria-pressed={favorites.includes(eq.id)}
                  style={{ padding: "6px 10px", borderRadius: 6, background: favorites.includes(eq.id) ? "#f97316" : "#e5e7eb" }}
                >
                  {favorites.includes(eq.id) ? "Favorited" : "Favorite"}
                </button>
                {!eq.available && <div style={{ fontSize: 12, color: "#9ca3af", alignSelf: "center" }}>Coming soon</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -----------------------------
   PressPopup (showcasing facility achievements)
   ----------------------------- */

const PressPopup: React.FC<{ open?: boolean; onClose?: () => void }> = ({ open = false, onClose }) => {
  const [isOpen, setIsOpen] = useState(open);
  useEffect(() => setIsOpen(open), [open]);
  if (!isOpen) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Press announcement"
      style={{
        position: "fixed",
        inset: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div style={{ width: 520, background: "#fff", borderRadius: 8, padding: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Press: 3rd Street Facilities Ranked Best in City</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Read more about our ring upgrades and world-class trainers.</div>
          </div>
          <div>
            <button
              onClick={() => {
                setIsOpen(false);
                onClose?.();
                analyticsTrack("press_popup_closed", {});
              }}
              style={{ background: "#ef4444", color: "#fff", padding: "6px 10px", borderRadius: 6 }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -----------------------------
   CelebrityGenerator (endorsements)
   ----------------------------- */

const CelebrityGenerator: React.FC = () => {
  const celebs = ["Mike Tyson", "Ronda Rousey", "Conor McGregor"];
  const [card, setCard] = useState<{ celeb: string; quote: string } | null>(null);
  return (
    <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
      <button
        onClick={() => {
          const c = celebs[Math.floor(Math.random() * celebs.length)];
          const q = `${c} says: "3rd Street Boxing's facilities took my training to the next level." (mock)`;
          setCard({ celeb: c, quote: q });
          analyticsTrack("celebrity_card_generated", { celeb: c });
          triggerConfetti({ particleCount: 40 });
        }}
        style={{ padding: "8px 12px", background: "#111827", color: "#fff", borderRadius: 6 }}
      >
        Generate Celebrity Endorsement
      </button>
      {card && (
        <div style={{ marginTop: 8, padding: 8, borderRadius: 6, background: "#f8fafc" }}>
          <strong>{card.celeb}</strong>
          <div style={{ fontSize: 13 }}>{card.quote}</div>
        </div>
      )}
    </div>
  );
};

/* -----------------------------
   OccupancyMouseBooster (real-time usage demo)
   ----------------------------- */

const OccupancyMouseBooster: React.FC<{ persistedKey?: string }> = ({ persistedKey = "fac_occ" }) => {
  const [occ, setOcc] = useState<number>(() => loadFromLS(persistedKey, 28));
  useEffect(() => saveToLS(persistedKey, occ), [occ, persistedKey]);

  useEffect(() => {
    let boosted = false;
    const onMove = () => {
      if (!boosted) {
        setOcc((o) => Math.min(120, o + 1));
        boosted = true;
        setTimeout(() => {
          boosted = false;
        }, 700);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
      <div style={{ fontWeight: 700 }}>Facility Occupancy</div>
      <div style={{ fontSize: 14, color: "#374151", marginTop: 6 }}>{occ} / 120 currently training</div>
      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
        Move your mouse in the page to see live occupancy nudges (demo).
      </div>
    </div>
  );
};

/* -----------------------------
   Celebrity / Testimonial list (simple)
   ----------------------------- */

const TestimonialsList: React.FC<{ items: Testimonial[]; onAddSynthetic?: () => void }> = ({ items, onAddSynthetic }) => {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Testimonials</h3>
        <button onClick={onAddSynthetic} style={{ padding: 8, borderRadius: 6, background: "#dc2626", color: "#fff" }}>
          Add Synthetic
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12, marginTop: 12 }}>
        {items.map((t) => (
          <div key={t.id} style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
            <div style={{ fontWeight: 700 }}>{t.name} {t.generated && <span style={{ fontSize: 12, color: "#6b7280" }}>(synthetic)</span>}</div>
            <div style={{ fontSize: 13, color: "#374151", marginTop: 6 }}>{t.quote}</div>
            <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>{t.rating || 5} ⭐</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -----------------------------
   Virtual Tour System (core)
   - Multiple points of interest
   - Navigation, persistence, analytics
   - Confetti on first discovery
   ----------------------------- */

/**
 * VirtualTour component
 * - Manages tour points, current position, discovery state.
 * - Persists progress to localStorage.
 */
const VirtualTour: React.FC<{
  tourPoints: TourPoint[];
  equipmentCatalog: EquipmentItem[];
  onDiscover?: (point: TourPoint) => void;
}> = ({ tourPoints, equipmentCatalog, onDiscover }) => {
  const STORAGE_KEY = "fac_tour_progress";
  const [index, setIndex] = useState<number>(() => loadFromLS(STORAGE_KEY, { idx: 0 }).idx ?? 0);
  const [discovered, setDiscovered] = useState<Record<string, boolean>>(() => loadFromLS("fac_tour_discovered", {} as Record<string, boolean>));
  const current = tourPoints[index];

  useEffect(() => {
    saveToLS(STORAGE_KEY, { idx: index });
  }, [index]);

  const markDiscovered = useCallback((pt: TourPoint) => {
    if (!discovered[pt.id]) {
      const next = { ...discovered, [pt.id]: true };
      setDiscovered(next);
      saveToLS("fac_tour_discovered", next);
      analyticsTrack("tour_point_discovered", { id: pt.id, title: pt.title });
      try {
        triggerConfetti({ particleCount: 60 });
      } catch {}
      onDiscover?.(pt);
    }
  }, [discovered, onDiscover]);

  // Mark current discovered on mount / index change
  useEffect(() => {
    if (current) markDiscovered(current);
  }, [current, markDiscovered]);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(tourPoints.length - 1, i + 1));
    analyticsTrack("tour_navigate", { direction: "next" });
  }, [tourPoints.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
    analyticsTrack("tour_navigate", { direction: "prev" });
  }, []);

  // Show small list of relevant equipment for the point
  const relevantEquipment = useMemo(() => {
    if (!current) return [];
    return equipmentCatalog.filter((e) => current.equipmentIds?.includes(e.id) || (current.area === "Bags" && e.category === "bags") || (current.area === "Ring" && e.category === "ring"));
  }, [current, equipmentCatalog]);

  return (
    <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontWeight: 700 }}>Virtual Tour</div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>{index + 1} / {tourPoints.length}</div>
      </div>

      {current ? (
        <div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{current.title}</div>
              <div style={{ color: "#6b7280", marginTop: 6 }}>{current.area}</div>
              <div style={{ marginTop: 8 }}>{current.description}</div>

              <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={goPrev} disabled={index === 0} aria-disabled={index === 0} style={{ padding: "6px 10px", borderRadius: 6 }}>
                  Previous
                </button>
                <button onClick={goNext} disabled={index === tourPoints.length - 1} aria-disabled={index === tourPoints.length - 1} style={{ padding: "6px 10px", borderRadius: 6, background: "#dc2626", color: "#fff" }}>
                  Next
                </button>
                <button onClick={() => { markDiscovered(current); }} style={{ padding: "6px 10px", borderRadius: 6, background: "#06b6d4", color: "#fff" }}>
                  Mark Discovered
                </button>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{discovered[current.id] ? "Discovered" : "Undiscovered"}</div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 700 }}>Relevant Equipment</div>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  {relevantEquipment.length === 0 && <div style={{ color: "#9ca3af" }}>No equipment listed for this area.</div>}
                  {relevantEquipment.map((eq) => (
                    <div key={eq.id} style={{ padding: 8, border: "1px solid #eee", borderRadius: 8, minWidth: 140 }}>
                      <div style={{ fontWeight: 700 }}>{eq.name}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{eq.category}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside style={{ width: 320 }}>
              <div style={{ marginBottom: 8 }}>
                <SoundscapeToggle soundId={current.ambientSound} />
              </div>

              <div style={{ marginTop: 12 }}>
                <SparringSimulator ringName={current.area === "Ring" ? `${current.title} - Ring` : "Demo Ring"} />
              </div>
            </aside>
          </div>
        </div>
      ) : (
        <div>No tour points available.</div>
      )}
    </div>
  );
};

/* -----------------------------
   Main FacilitiesPage component
   - Combines everything into a single-page experience
   ----------------------------- */

/**
 * FacilitiesPage
 *
 * The primary facilities showcase page for 3rd Street Boxing.
 * - Self-contained: all types, utils, and components are in this file.
 * - Inline styles are used throughout for portability.
 *
 * Accessibility:
 * - Interactive elements use ARIA attributes, proper labels, and keyboard-accessible controls.
 *
 * Performance:
 * - Memoized components and stable callbacks are used to reduce re-renders.
 *
 * Persistence:
 * - Tour progress and favorites are saved to localStorage.
 *
 * Analytics:
 * - analyticsTrack is called for key interactions.
 */
export default function FacilitiesPage(): JSX.Element {
  // Facility metadata (could be replaced with a prop or fetch)
  const [facility] = useState<Facility>(() => ({
    id: "f_3rd_st",
    name: "3rd Street Boxing - Main Facility",
    address: "3rd Street, San Francisco, CA",
    openHours: "6:00 - 22:00",
    capacity: 120,
    highlights: ["Full-size ring", "Pro heavy bags", "Strength area", "Infrared recovery"],
  }));

  // Testimonials persisted
  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    () => loadFromLS<Testimonial[]>("fac_testimonials", [
      { id: "t1", name: "Sophie M.", quote: "This gym changed my life.", rating: 5 },
    ])
  );
  useEffect(() => saveToLS("fac_testimonials", testimonials), [testimonials]);

  // Equipment (catalog)
  const [equipmentCatalog] = useState<EquipmentItem[]>(() => {
    // could merge remote data - here we use defaults declared above
    return defaultEquipment;
  });

  // Tour points - a curated virtual tour
  const tourPoints: TourPoint[] = useMemo(
    () => [
      {
        id: "tp_ring",
        title: "Main Competition Ring",
        description: "Our flagship competition-standard ring: sprung floor, thick ropes, excellent lighting.",
        area: "Ring",
        equipmentIds: ["e_ring_main"],
        ambientSound: "ring",
      },
      {
        id: "tp_bags",
        title: "Bag Alley",
        description: "Rows of heavy and speed bags for power and precision training.",
        area: "Bags",
        equipmentIds: ["e_heavybag_xl"],
        ambientSound: "bags",
      },
      {
        id: "tp_strength",
        title: "Strength & Conditioning",
        description: "Power racks, plates, and functional trainers to support explosive athleticism.",
        area: "Strength Area",
        equipmentIds: ["e_power_rack"],
        ambientSound: "strength",
      },
      {
        id: "tp_locker",
        title: "Locker Rooms & Recovery",
        description: "Clean locker rooms, showers, and dedicated recovery pods.",
        area: "Locker Rooms",
        equipmentIds: ["e_recovery_pod"],
        ambientSound: "locker",
      },
    ],
    []
  );

  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);
  const [pressOpen, setPressOpen] = useState(true);
  const [showTour, setShowTour] = useState(true);

  // Analytics on mount
  useEffect(() => {
    analyticsTrack("facilities_page_view", { facilityId: facility.id });
    // lightweight service worker register attempt (non-blocking)
    if ("serviceWorker" in navigator && !navigator.serviceWorker.controller) {
      navigator.serviceWorker?.register?.("/sw.js").catch(() => {});
    }
  }, [facility.id]);

  const addSynthetic = useCallback(() => {
    const t = generateSyntheticTestimonial();
    setTestimonials((prev) => [t, ...prev]);
    analyticsTrack("testimonial_added", { synthetic: true });
  }, []);

  const onDiscoverPoint = useCallback((point: TourPoint) => {
    // when user discovers a tour point, we reward them
    analyticsTrack("facility_point_discovered_callback", { id: point.id });
    // small confetti and notification
    try {
      triggerConfetti({ particleCount: 45 });
    } catch {}
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Facility discovered", { body: `${point.title} unlocked in your tour.` });
      } else if ("Notification" in window) {
        Notification.requestPermission().then((p) => {
          if (p === "granted") new Notification("Facility discovered", { body: `${point.title} unlocked in your tour.` });
        });
      }
    } catch {}
  }, []);

  // Favorite equipment toggles persisted globally (EquipmentShowcase handles persistence)
  // Provide handler to open AR try-on for an equipment
  const openArForEquipment = useCallback((eq: EquipmentItem) => {
    setSelectedEquipment(eq);
    analyticsTrack("ar_open_for_equipment", { id: eq.id });
  }, []);

  // Small UI layout styles
  const containerStyle: React.CSSProperties = { maxWidth: 1100, margin: "18px auto", padding: 12 };
  const headerStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 };
  const gridTwoCols: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 340px", gap: 12 };

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh", paddingBottom: 40 }}>
      <div style={containerStyle}>
        <header style={headerStyle}>
          <div>
            <h1 style={{ margin: 0 }}>{facility.name}</h1>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{facility.address} • Open: {facility.openHours}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <FightTicker />
            <button
              onClick={() => {
                setShowTour((s) => !s);
                analyticsTrack("toggle_tour", { newState: !showTour });
              }}
              style={{ padding: 8, borderRadius: 6 }}
            >
              {showTour ? "Hide Tour" : "Show Tour"}
            </button>
            <button
              onClick={() => {
                setPressOpen(true);
                analyticsTrack("press_opened", {});
              }}
              style={{ padding: 8, borderRadius: 6, background: "#ef4444", color: "#fff" }}
            >
              Press
            </button>
          </div>
        </header>

        <main>
          <section style={gridTwoCols}>
            <div>
              {showTour && (
                <div style={{ marginBottom: 12 }}>
                  <VirtualTour tourPoints={tourPoints} equipmentCatalog={equipmentCatalog} onDiscover={onDiscoverPoint} />
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 12, marginBottom: 12 }}>
                <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
                  <h3 style={{ marginTop: 0 }}>Explore Facilities</h3>
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ color: "#6b7280" }}>Highlights</div>
                    <ul>
                      {facility.highlights?.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>

                    <div style={{ marginTop: 8 }}>
                      <button
                        onClick={() => {
                          analyticsTrack("tour_start_clicked", {});
                          setShowTour(true);
                          // jump to ring as an example
                          saveToLS("fac_tour_progress", { idx: 0 });
                          try {
                            triggerConfetti({ particleCount: 30 });
                          } catch {}
                        }}
                        style={{ padding: "8px 12px", background: "#dc2626", color: "#fff", borderRadius: 6 }}
                      >
                        Start Guided Tour
                      </button>
                    </div>
                  </div>
                </div>

                <aside style={{ display: "grid", gap: 12 }}>
                  <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
                    <div style={{ fontWeight: 700 }}>Quick Actions</div>
                    <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                      <button onClick={() => { analyticsTrack("book_ring_demo", {}); scheduleAndConfetti(); }} style={{ padding: 8, borderRadius: 6, background: "#10b981", color: "#fff" }}>
                        Book Ring Demo
                      </button>
                      <button onClick={() => { analyticsTrack("view_equipment_catalog", {}); }} style={{ padding: 8, borderRadius: 6 }}>
                        View Equipment Catalog
                      </button>
                    </div>
                  </div>

                  <div>
                    <OccupancyMouseBooster />
                  </div>
                </aside>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 12 }}>
                  <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
                    <EquipmentShowcase onSelect={openArForEquipment} />
                  </div>

                  <div>
                    <div style={{ padding: 12, background: "#fff", borderRadius: 8, marginBottom: 12 }}>
                      <div style={{ fontWeight: 700 }}>AR Try-On Preview</div>
                      <div style={{ marginTop: 8 }}>
                        <ArTryOn equipment={selectedEquipment} />
                      </div>
                    </div>

                    <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
                      <CelebrityGenerator />
                    </div>
                  </div>
                </div>

                <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
                  <SparringSimulator ringName="Main Showcase Ring" />
                </div>
              </div>
            </div>

            <aside>
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
                  <h3 style={{ marginTop: 0 }}>Contact & Details</h3>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>{facility.address}</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Capacity: {facility.capacity}</div>
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => { analyticsTrack("contact_clicked", {}); }} style={{ padding: 8, borderRadius: 6 }}>Contact</button>
                  </div>
                </div>

                <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
                  <h4 style={{ marginTop: 0 }}>Press & Awards</h4>
                  <PressPopup open={pressOpen} onClose={() => { setPressOpen(false); analyticsTrack("press_closed", {}); }} />
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Local Champion signed with 3rd Street Boxing.</div>
                </div>

                <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
                  <h4 style={{ marginTop: 0 }}>Quick Challenges</h4>
                  <button onClick={() => { const days = 7 + Math.floor(Math.random() * 14); analyticsTrack("challenge_joined", { days }); triggerConfetti({ particleCount: 25 }); }} style={{ padding: 8, borderRadius: 6, background: "#06b6d4", color: "#fff" }}>
                    Join a 14-day Challenge
                  </button>
                </div>
              </div>
            </aside>
          </section>

          <section style={{ marginTop: 18 }}>
            <TestimonialsList items={testimonials} onAddSynthetic={addSynthetic} />
          </section>
        </main>

        <footer style={{ marginTop: 18, color: "#6b7280", fontSize: 13 }}>
          <div>Facilities showcase — all interactive elements are demo-only and for exploratory use.</div>
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => {
                // quick dump of analytics for QA
                const logs = loadFromLS("fac_analytics", []);
                // accessible way to show logs
                // In production, this would be private, here we use alert for demo
                try {
                  alert(`Analytics events stored: ${logs.length}`);
                } catch {}
              }}
              style={{ padding: 8, borderRadius: 6, marginTop: 8 }}
            >
              View Analytics Count
            </button>
          </div>
        </footer>
      </div>
    </div>
  );

  /** schedule and show confetti helper */
  function scheduleAndConfetti() {
    triggerConfetti({ particleCount: 60 });
    scheduleBrowserNotification("Ring demo booked", { body: "Your ring demo is scheduled. See you soon!" });
  }

  /** wrapper for Notification scheduling (safe) */
  function scheduleBrowserNotification(title: string, opts: NotificationOptions & { delayMs?: number } = {}) {
    const delay = opts.delayMs ?? 0;
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      setTimeout(() => new Notification(title, opts), delay);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((p) => {
        if (p === "granted") setTimeout(() => new Notification(title, opts), delay);
      });
    }
  }
}
