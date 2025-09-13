
/* merged_hardcoded.tsx
   Combined single-file React + TypeScript module that merges PREVIEW.tsx with implementations
   of previously-missing PDF suggestions. This is a ready-to-download .tsx file.
   NOTE: This file is hardcoded for demo/emulation only and contains many UI mocks.
*/

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
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
const triggerConfetti = () =>
  confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

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
