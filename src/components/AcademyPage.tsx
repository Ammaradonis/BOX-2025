import React, { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Trophy, Target, Calendar, Users, Star, DollarSign } from 'lucide-react';
import confetti from "canvas-confetti";
import { formatInTimeZone } from "date-fns-tz";

// TypeScript interfaces from first snippet
interface ClassBookingData {
  id: string;
  name: string;
  description: string;
  level: string;
  price: number;
  membership?: string;
}
interface Phase {
  id: string;
  phase: string;
  duration: string;
  title: string;
  icon: string;
  description: string;
  drills: string[];
  goals: string;
}
interface Coach {
  id: string;
  name: string;
  title: string;
  image: string;
  bio: string;
  specialties: string[];
  experience: string;
  record: string;
  achievements: string[];
}
interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
}
interface Graduate {
  name: string;
  achievement: string;
  image: string;
  quote: string;
}
interface AcademyPageProps {
  onBookClass: (classData: ClassBookingData) => void;
}

// Types from second snippet
type Challenge = {
  id: string;
  title: string;
  description: string;
  lengthDays: number;
  createdAt: string;
};
type LeaderboardEntry = {
  id: string;
  name: string;
  points: number;
  country?: string;
};
type CelebrityQuote = {
  id: string;
  celeb: string;
  quote: string;
  createdAt: string;
};
type FamePost = {
  id: string;
  text: string;
  likes: number;
  createdAt: string;
};
type UserProgress = {
  userId: string;
  points: number;
  beltLevel?: string;
  lastActive?: string;
  history?: { date: string; event: string }[];
};

/* ============================
   Utilities
   ============================ */
/** Lightweight confetti trigger for celebratory UX feedback on achievements and milestones. */
const triggerConfetti = () => {
  try {
    const c = document.createElement("canvas");
    c.style.position = "fixed";
    c.style.pointerEvents = "none";
    c.style.left = "0";
    c.style.top = "0";
    document.body.appendChild(c);
    confetti.create(c, { resize: true })({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => {
      try {
        document.body.removeChild(c);
      } catch {}
    }, 3500);
  } catch (e) {
    // non-fatal
  }
}
/** Save to localStorage safely for persistent user data across sessions. */
const saveToLS = (k: string, v: any) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {
    // swallow
  }
};
/** Load from localStorage safely with fallback for seamless data retrieval. */
const loadFromLS = <T,>(k: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

/* ============================
   Small presentational helpers
   ============================ */
const headerStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 12,
};
const cardBase: React.CSSProperties = {
  padding: 12,
  borderRadius: 8,
  background: "#fff",
  boxShadow: "0 4px 14px rgba(15,23,42,0.03)",
  color: "#111827",
};

// Error Boundary Component from first snippet
class AcademyPageErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600">Please try refreshing the page or contact support.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Enhanced ImageWithFallback Component from first snippet
interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
}
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, alt, className }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" aria-hidden="true" />
      )}
      <img
        src={hasError ? '/fallback-image.png' : src}
        alt={alt}
        className={`object-cover ${hasError ? 'opacity-50' : ''}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        loading="lazy"
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-600">
          Image failed to load
        </div>
      )}
    </div>
  );
};

/* ============================
   Subcomponents
   ============================ */
/** Simple top ticker for upcoming events and announcements to keep members informed and engaged. */
const FightTicker: React.FC = React.memo(() => {
  const items = useMemo(
    () => ["Fight Night: Friday 8pm — Secure Your Spot for an Unforgettable Evening of Action and Strategy", "Exclusive Celebrity Training Session Next Week: Learn Advanced Techniques from Boxing Legends", "Sparring Workshop Open for Registration: Hone Your Skills in a Controlled, Professional Environment"],
    []
  );
  return (
    <div style={{ overflow: "hidden", whiteSpace: "nowrap", background: "#f8fafc", padding: "8px 12px", borderRadius: 6 }}>
      <div style={{ display: "inline-block", animation: "ticker 14s linear infinite" }}>
        {items.join(" • ")}
      </div>
      <style>{`@keyframes ticker { 0% { transform: translateX(100%);} 100% { transform: translateX(-100%);} }`}</style>
    </div>
  );
});
/** Guaranteed results banner emphasizing our commitment to your success with detailed assurances. */
const GuaranteedBanner: React.FC = React.memo(() => (
  <div style={{ background: "#fff7ed", border: "1px solid #ffd7a6", padding: 12, borderRadius: 8 }}>
    <strong>Our Ironclad Guarantee for Your Boxing Journey:</strong> Embark on our comprehensive 12-week structured training program, designed with progressive phases that build from foundational techniques to elite competition readiness, and we guarantee you'll be fully prepared for your first amateur bout. This includes personalized coaching on footwork, defensive strategies, offensive combinations, and mental resilience. If, after diligent participation and adherence to the program, you're not ready to step into the ring with confidence, we'll provide additional one-on-one coaching sessions at no extra cost until you achieve that milestone. Your success is our priority—backed by years of proven results from our experienced coaching staff.
  </div>
));
/* ============================
   ChallengeGenerator (persisted)
   ============================ */
/**
 * ChallengeGenerator
 * - Enables members to generate personalized training challenges tailored to their goals.
 * - Persists generated challenges to localStorage for ongoing access and progress tracking.
 */
const ChallengeGenerator: React.FC<{ onGenerate?: (c: Challenge) => void }> = ({ onGenerate }) => {
  const STORAGE_KEY = "academy_challenges";
  const [challenges, setChallenges] = useState<Challenge[]>(() => loadFromLS(STORAGE_KEY, [] as Challenge[]));
  useEffect(() => {
    saveToLS(STORAGE_KEY, challenges);
  }, [challenges]);
  const generate = useCallback(() => {
    const namePool = ["Fog City Fury Challenge: Intense Urban Conditioning for Unmatched Endurance", "Golden Gate Bridge Builder: Strengthening Core and Power for Explosive Performance", "Mission District Shred: Precision Technique Refinement and Speed Drills", "Third Street Tenacity Program: Building Mental Toughness and Strategic Ring Intelligence", "San Francisco Ring Rhythm: Advanced Footwork and Combination Mastery"];
    const name = namePool[Math.floor(Math.random() * namePool.length)];
    const days = 7 + Math.floor(Math.random() * 21);
    const challenge: Challenge = {
      id: `ch_${Date.now()}`,
      title: `${name}`,
      description: `This meticulously designed challenge focuses on enhancing your boxing prowess through a balanced regimen of technique drills, cardiovascular conditioning, strength training, and strategic sparring sessions. Commit to at least four sessions per week, incorporating recovery protocols such as active rest days, nutrition optimization, and mobility work to prevent injury and maximize gains. Track your progress daily to see measurable improvements in speed, power, and endurance.`,
      lengthDays: days,
      createdAt: new Date().toISOString(),
    };
    setChallenges((c) => [challenge, ...c].slice(0, 30));
    triggerConfetti();
    onGenerate?.(challenge);
  }, [onGenerate]);
  return (
    <div style={{ ...cardBase }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontWeight: 700 }}>Personalized Challenge Generator</div>
        <button onClick={generate} style={{ padding: "8px 12px", background: "#dc2626", color: "#fff", borderRadius: 6 }}>Generate New Challenge</button>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {challenges.length === 0 && <div style={{ color: "#6b7280" }}>No challenges generated yet—create one to elevate your training regimen.</div>}
        {challenges.map((c) => (
          <div key={c.id} style={{ padding: 10, background: "#f8fafc", borderRadius: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: "#374151", marginTop: 4 }}>{c.description}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>{c.lengthDays} days • Created on {new Date(c.createdAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
/* ============================
   LeaderboardBracket (animated rounds)
   ============================ */
/**
 * LeaderboardBracket
 * - Displays a dynamic leaderboard with rotating rounds to showcase member achievements.
 * - Cycles through views for an engaging, real-time feel.
 */
const LeaderboardBracket: React.FC<{ initial?: LeaderboardEntry[] }> = ({ initial }) => {
  const [round, setRound] = useState<number>(1);
  const entries = useMemo<LeaderboardEntry[]>(
    () =>
      initial ??
      [
        { id: "u1", name: "Sofia Rodriguez", points: 1250, country: "USA" },
        { id: "u2", name: "Tommy Liu", points: 980, country: "USA" },
        { id: "u3", name: "Andre Kowalski", points: 870, country: "USA" },
        { id: "u4", name: "Maya Singh", points: 820, country: "USA" },
        { id: "u5", name: "Carlos Mendoza", points: 760, country: "USA" },
      ],
    [initial]
  );
  // Cycle rounds for dynamic engagement
  useEffect(() => {
    const t = setInterval(() => {
      setRound((r) => (r % 3) + 1);
    }, 3200);
    return () => clearInterval(t);
  }, []);
  // Vary sorting for different perspectives: points, alphabetical, simulated fluctuations
  const sorted = useMemo(() => {
    if (round === 1) return entries.slice().sort((a, b) => b.points - a.points);
    if (round === 2) return entries.slice().sort((a, b) => a.name.localeCompare(b.name));
    return entries.slice().map((e, i) => ({ ...e, points: e.points + Math.floor(Math.sin(i + round) * 30) }));
  }, [entries, round]);
  return (
    <div style={{ ...cardBase }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Academy Leaderboard — Current Round {round}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {sorted.map((e, i) => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", background: i % 2 === 0 ? "#f8fafc" : "#fff0f0", borderRadius: 6 }}>
            <div>
              <div style={{ fontWeight: 700 }}>{e.name}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{e.country ?? "Local Fighter"} • Ranking #{i + 1}</div>
            </div>
            <div style={{ fontWeight: 700 }}>{e.points} Points Earned</div>
          </div>
        ))}
      </div>
    </div>
  );
};
/* ============================
   CelebrityGenerator (persisted)
   ============================ */
/**
 * CelebrityGenerator
 * - Generates inspirational quotes from boxing celebrities to motivate members.
 * - Persists quotes for repeated inspiration and sharing.
 */
const CelebrityGenerator: React.FC = () => {
  const STORAGE_KEY = "academy_celebrity_quotes";
  const seedCelebs = ["Mike Tyson", "Ronda Rousey", "Manny Pacquiao", "Claressa Shields", "Terence Crawford"];
  const [cards, setCards] = useState<CelebrityQuote[]>(() => loadFromLS(STORAGE_KEY, [] as CelebrityQuote[]));
  const [last, setLast] = useState<CelebrityQuote | null>(null);
  useEffect(() => {
    saveToLS(STORAGE_KEY, cards);
  }, [cards]);
  const generate = useCallback(() => {
    const celeb = seedCelebs[Math.floor(Math.random() * seedCelebs.length)];
    const quoteText = `${celeb} shares profound insights: "Training at 3rd Street Boxing has reignited my passion for the sport, reminding me of the discipline, resilience, and strategic mindset required to dominate in the ring. It's not just about punches—it's about building a champion's mentality that translates to every aspect of life."`;
    const card: CelebrityQuote = { id: `celeb_${Date.now()}`, celeb, quote: quoteText, createdAt: new Date().toISOString() };
    setCards((s) => [card, ...s].slice(0, 30));
    setLast(card);
    triggerConfetti();
  }, []);
  return (
    <div style={{ ...cardBase }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontWeight: 700 }}>Celebrity Inspiration Generator</div>
        <button onClick={generate} style={{ padding: "6px 10px", background: "#111827", color: "#fff", borderRadius: 6 }}>Generate Quote</button>
      </div>
      {last && (
        <div style={{ padding: 10, background: "#f1f5f9", borderRadius: 6, marginBottom: 8 }}>
          <div style={{ fontWeight: 700 }}>{last.celeb}</div>
          <div style={{ fontSize: 13 }}>{last.quote}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>Generated on {new Date(last.createdAt).toLocaleString()}</div>
        </div>
      )}
      <div style={{ maxHeight: 220, overflow: "auto", display: "grid", gap: 8 }}>
        {cards.length === 0 && <div style={{ color: "#6b7280" }}>No inspirational quotes yet—generate one for motivation.</div>}
        {cards.map((c) => (
          <div key={c.id} style={{ padding: 8, background: "#fff", borderRadius: 6, border: "1px solid #eef2ff" }}>
            <div style={{ fontWeight: 700 }}>{c.celeb}</div>
            <div style={{ fontSize: 13 }}>{c.quote}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>{new Date(c.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
/* ============================
   FameSimulator (persisted)
   ============================ */
/**
 * FameSimulator
 * - Simulates viral social media posts to inspire members to share their progress.
 * - Persists posts for review and motivation.
 */
const FameSimulator: React.FC = () => {
  const STORAGE_KEY = "academy_fame_posts";
  const [feed, setFeed] = useState<FamePost[]>(() => loadFromLS(STORAGE_KEY, [] as FamePost[]));
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    saveToLS(STORAGE_KEY, feed);
  }, [feed]);
  const simulate = useCallback(async () => {
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 450));
      const id = `p${Date.now()}`;
      const textPool = [
        "Just achieved a new personal best in my boxing journey at 3rd Street Boxing Gym! From refining my jab-cross combinations to building unbreakable endurance, this place has transformed my approach to fitness and competition. #BoxingChampInTheMaking #3rdStreetBoxing",
        "90 days into the program and my transformation is undeniable—thanks to the expert coaching and structured phases at 3rd Street Boxing. Gained power, speed, and confidence that's spilling over into my daily life. Ready for the ring! #BoxingEvolution #SanFranciscoFighters",
        "Sparred with one of our elite coaches today and mastered the art of the uppercut under pressure. The strategic insights and personalized feedback at 3rd Street Boxing are unmatched for anyone serious about elevating their game. #RingMastery #BoxingTraining",
      ];
      const text = textPool[Math.floor(Math.random() * textPool.length)];
      const likes = 100 + Math.floor(Math.random() * 2000);
      const post: FamePost = { id, text, likes, createdAt: new Date().toISOString() };
      setFeed((f) => [post, ...f].slice(0, 40));
      triggerConfetti();
    } catch (e) {
      // ignore
    } finally {
      setBusy(false);
    }
  }, []);
  return (
    <div style={{ ...cardBase }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontWeight: 700 }}>Social Fame Simulator</div>
        <button onClick={simulate} style={{ padding: "6px 10px", background: "#06b6d4", color: "#fff", borderRadius: 6 }} disabled={busy}>
          {busy ? "Simulating..." : "Simulate Viral Post"}
        </button>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {feed.length === 0 && <div style={{ color: "#6b7280" }}>No fame posts yet—simulate one to inspire your journey.</div>}
        {feed.map((p) => (
          <div key={p.id} style={{ padding: 10, background: "#f8fafc", borderRadius: 6 }}>
            <div style={{ fontWeight: 700 }}>{p.text}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>{p.likes} Likes • Posted on {new Date(p.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
/* ============================
   UserProgress summary
   ============================ */
const UserProgressCard: React.FC<{ initial?: UserProgress }> = ({ initial }) => {
  const STORAGE_KEY = "academy_user_progress";
  const [progress, setProgress] = useState<UserProgress>(() => loadFromLS(STORAGE_KEY, initial ?? { userId: "member-user", points: 420, beltLevel: "Blue", lastActive: new Date().toISOString(), history: [] }));
  useEffect(() => {
    saveToLS(STORAGE_KEY, progress);
  }, [progress]);
  const addPoints = useCallback((pts: number) => {
    setProgress((p) => {
      const next = { ...p, points: (p.points || 0) + pts, lastActive: new Date().toISOString(), history: [{ date: new Date().toISOString(), event: `+${pts} points earned through dedicated training` }, ...(p.history || [])].slice(0, 20) };
      return next;
    });
    triggerConfetti();
  }, []);
  return (
    <div style={{ ...cardBase }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Your Training Progress Overview</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{progress.points} Accumulated Points</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Current Belt Level: {progress.beltLevel ?? "White Belt Beginner"}</div>
        </div>
        <div>
          <button onClick={() => addPoints(50)} style={{ padding: "8px 10px", background: "#10b981", color: "#fff", borderRadius: 6 }}>+50 Points (Session Complete)</button>
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>
        Last Training Activity: {progress.lastActive ? new Date(progress.lastActive).toLocaleString() : "Start your journey today"}
      </div>
    </div>
  );
};

export function AcademyPage({ onBookClass }: AcademyPageProps) {
  const phases: Phase[] = [
    {
      id: 'foundations',
      phase: 'Phase 1',
      duration: '1-3 months',
      title: 'FOUNDATIONS',
      icon: '🌉',
      description: 'Establish a rock-solid boxing foundation stronger than the iconic Golden Gate Bridge itself. This initial phase is meticulously crafted to introduce newcomers to the art and science of boxing, focusing on proper form, basic movements, and building essential physical conditioning. Through guided instruction, you\'ll develop the core skills necessary for long-term success in the sport, while immersing yourself in the vibrant culture of our San Francisco boxing community. Our expert coaches will ensure you progress at a pace that challenges yet supports your individual fitness level, setting the stage for advanced training ahead.',
      drills: [
        'Cable Car Footwork Drills: Master agile movement patterns inspired by San Francisco\'s historic transit system, enhancing balance, coordination, and quick directional changes essential for effective ring navigation.',
        'Embarcadero Endurance Runs: Build cardiovascular stamina along the scenic waterfront, incorporating interval training to simulate the high-intensity demands of a boxing match while enjoying the city\'s breathtaking views.',
        'Basic Boxing Stance & Guard: Develop an impenetrable defensive posture akin to the fortress of Alcatraz, learning to protect vital areas while maintaining offensive readiness.',
        'Fundamental Punches: Perfect the jab, cross, hook, and uppercut through repetitive drills, focusing on technique, power generation from the ground up, and proper body mechanics to maximize impact and efficiency.'
      ],
      goals: 'Master the fundamental techniques of boxing, establish a strong cardiovascular and muscular base for sustained performance, and fully integrate into our supportive gym culture where camaraderie and mutual encouragement drive everyone toward excellence.'
    },
    {
      id: 'pressure-testing',
      phase: 'Phase 2',
      duration: '4-6 months',
      title: 'PRESSURE TESTING',
      icon: '🌫️',
      description: 'Embrace the unpredictable challenges akin to San Francisco\'s famous rolling fog, where visibility is limited and adaptability is key. This intermediate phase intensifies your training by introducing controlled pressure scenarios that mimic real fight conditions. You\'ll refine your skills under stress, learning to maintain composure, execute strategies, and respond instinctively. Our coaches draw from years of competitive experience to guide you through this transformative period, helping you bridge the gap between technical proficiency and practical application in the ring.',
      drills: [
        'Monthly "Fog City Fights" Sparring Sessions: Participate in structured sparring that progressively increases in intensity, teaching you to apply techniques against live opponents while prioritizing safety and learning.',
        'Defensive Shell Work: Fortify your guard like the enduring Sutro Tower against the elements, mastering slips, blocks, and parries to create an unbreachable defense.',
        'Advanced Combinations Under Pressure: Chain punches and movements in high-stress drills, developing fluidity and timing to overwhelm opponents with precise, powerful sequences.',
        'Ring Movement and Corner Work: Learn to control the ring space effectively, using angles and positioning to your advantage, including strategies for handling corner situations.'
      ],
      goals: 'Introduce controlled sparring to build real-world experience, enhance your ability to perform under pressure, and prepare you for the rigors of competitive boxing with confidence and poise.'
    },
    {
      id: 'competition-ready',
      phase: 'Phase 3',
      duration: '6+ months',
      title: 'COMPETITION READY',
      icon: '🏆',
      description: 'Ascend to elite status in San Francisco\'s thriving boxing circuit, where champions are forged through relentless pursuit of excellence. This advanced phase hones your skills to a razor\'s edge, incorporating sophisticated tactics, peak physical conditioning, and mental fortitude training. You\'ll prepare for actual competitions, analyzing opponents, developing fight plans, and pushing your limits in a supportive yet demanding environment that mirrors professional training camps.',
      drills: [
        'Amateur Tournament Preparation: Simulate full fight scenarios with timed rounds, referee oversight, and post-session analysis to fine-tune your competitive edge.',
        'Advanced Sparring with Various Styles: Face diverse opponents to adapt to different fighting approaches, building versatility and strategic depth.',
        'Mental Game and Strategy Development: Incorporate visualization, focus exercises, and tactical planning to cultivate a champion\'s mindset.',
        'Peak Physical Conditioning: Achieve optimal fitness through high-intensity interval training, strength circuits, and recovery optimization for sustained performance.'
      ],
      goals: 'Enter competitive bouts with full preparation, master advanced techniques across all aspects of boxing, and gear up for championship-level achievements in both amateur and potential professional circuits.'
    }
  ];
  const coaches: Coach[] = [
    {
      id: 'raul-mendoza',
      name: 'Raúl "The Firewall" Mendoza',
      title: 'Head Academy Coach',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      bio: 'A veteran of the ring who honed his skills at the legendary King\'s Gym in San Francisco\'s Tenderloin district during the gritty 1990s era. Raúl specializes in teaching survival tactics for close-range combat, drawing from his experiences in "Civic Center Clinches" where quick thinking and unyielding defense turned the tide of many bouts. With a passion for mentoring the next generation, he combines old-school grit with modern training methodologies to transform aspiring boxers into resilient competitors ready for any challenge.',
      specialties: ['Advanced Defensive Strategies', 'High-Intensity Sparring Sessions', 'Comprehensive Competition Preparation'],
      experience: '15 years of professional coaching',
      record: '12-3 Amateur Record, 8-2 Professional Record',
      achievements: [
        'Northern California Golden Gloves Champion 1994',
        'Mentored and Trained 15 Amateur Champions Across Various Weight Classes',
        'Served as a Member of the San Francisco Boxing Commission, Influencing Fair Play and Safety Standards'
      ]
    },
    {
      id: 'jamal-chen',
      name: 'Jamal "The Technician" Chen',
      title: 'Technical Development Coach',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      bio: 'Holding NASM certification and a degree in Sports Science from UCSF, Jamal has successfully guided over 200 San Francisco professionals—from tech executives to entrepreneurs—in transitioning from sedentary lifestyles to peak athletic performance in the boxing ring. His approach emphasizes biomechanical efficiency, injury prevention, and data-driven progress tracking, ensuring each trainee achieves optimal results through personalized, evidence-based programs that blend science with the artistry of boxing.',
      specialties: ['Precision Technical Boxing Instruction', 'In-Depth Form and Technique Analysis', 'Integrated Strength and Conditioning Training'],
      experience: '10 years of specialized coaching',
      record: '18-4 Amateur Record',
      achievements: [
        'Certified USA Boxing Coach with National Recognition',
        'Holds a Sports Science Degree from University of California, San Francisco',
        'Maintained an Undefeated Streak in the California Amateur Circuit from 2018-2020'
      ]
    }
  ];
  const pricingTiers: PricingTier[] = [
    {
      id: 'fog-belt',
      name: 'FOG BELT',
      price: 199,
      period: '/month',
      description: 'Ideal for committed beginners and intermediates seeking structured group sessions to build skills and fitness in a supportive community environment.',
      features: [
        'Unlimited Access to All Group Academy Classes, Including Technique Workshops and Conditioning Circuits',
        'Focused Basic Technique Development with Progressive Drills',
        'Comprehensive Fitness and Conditioning Programs Tailored to Boxing Demands',
        'Full Academy Community Access for Networking and Motivation',
        'Detailed Progress Tracking Tools to Monitor Your Advancement'
      ],
      cta: 'START YOUR FOG BELT JOURNEY',
      popular: false
    },
    {
      id: 'golden-gate-belt',
      name: 'GOLDEN GATE BELT',
      price: 349,
      period: '/month',
      description: 'Designed for serious athletes wanting a blend of group dynamics and personalized attention to accelerate progress toward competitive readiness.',
      features: [
        'Everything Included in the Fog Belt Membership for a Solid Foundation',
        'Two Private One-on-One Sessions Per Month with Expert Coaches',
        'Exclusive Access to Advanced Sparring Programs and Sessions',
        'In-Depth Competition Preparation Including Strategy and Mental Training',
        'Professional Video Analysis Sessions to Refine Technique',
        'Customized Nutrition Guidance to Optimize Performance and Recovery'
      ],
      cta: 'ELEVATE WITH GOLDEN GATE BELT',
      popular: true
    },
    {
      id: 'bart-pass',
      name: 'BART PASS',
      price: 499,
      period: '/month',
      description: 'The ultimate commitment for elite performers seeking unlimited resources to dominate in the ring and achieve championship aspirations.',
      features: [
        'All Benefits from the Golden Gate Belt for Comprehensive Support',
        'Unlimited Private Coaching Sessions Tailored to Your Schedule and Goals',
        'Coverage of Competition Entry Fees for Tournaments and Events',
        'Fully Customized Training Plans Based on Your Unique Strengths and Needs',
        'Advanced Recovery and Injury Prevention Protocols Including Therapy Access',
        'Premium Equipment Provided, Including Gloves, Wraps, and Gear'
      ],
      cta: 'UNLOCK UNLIMITED POTENTIAL',
      popular: false
    }
  ];
  const graduates: Graduate[] = [
    {
      name: 'Sofia "Lightning" Rodriguez',
      achievement: '2024 Northern California Golden Gloves Champion',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=300',
      quote: 'Starting as a busy mom from the Mission District, I transformed into a regional champion in just 18 months thanks to the structured phases, expert coaching, and unwavering support at 3rd Street Boxing. This academy didn\'t just teach me to box—it empowered me to conquer challenges both in and out of the ring, building confidence that radiates through my family and community.'
    },
    {
      name: 'Tommy "TechKO" Liu',
      achievement: '2023 USA Boxing National Qualifier',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      quote: 'Transitioning from debugging code in Silicon Valley to delivering knockouts in the ring, 3rd Street Boxing provided the perfect blend of technical precision and physical intensity. The coaches\' insights into strategy and conditioning turned my analytical mind into a formidable weapon, qualifying me for nationals and proving that discipline in training leads to triumphs in life.'
    }
  ];

  const onChallengeGenerated = useCallback((c: Challenge) => {
    // Optional hook for future integration
  }, []);

  return (
    <AcademyPageErrorBoundary>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <Helmet>
          <title>3rd Street Boxing Academy - San Francisco's Premier Boxing Training</title>
          <meta name="description" content="Join 3rd Street Boxing Academy in San Francisco for elite boxing training. From fundamentals to championship preparation, our coaches guide you to success." />
          <meta name="keywords" content="boxing academy, San Francisco boxing, boxing training, boxing classes, championship training" />
          <meta name="robots" content="index,follow" />
          <meta property="og:title" content="3rd Street Boxing Academy - San Francisco" />
          <meta property="og:description" content="Elite boxing training in San Francisco. Join our academy to become a champion." />
          <meta property="og:image" content="/og-image.jpg" />
          <meta property="og:url" content="https://www.3rdstreetboxing.com/academy" />
        </Helmet>
        <div className="min-h-screen bg-gray-50">
          {/* Fight Ticker from second snippet */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <FightTicker />
          </div>
          {/* Hero Section from first snippet */}
          <section className="relative bg-gradient-to-r from-red-900 to-red-700 text-white py-16 sm:py-24">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
                FORGE SAN FRANCISCO'S NEXT BOXING CHAMPIONS
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-red-100 mb-8 max-w-3xl mx-auto">
                From the vibrant streets of the Castro to the historic alleys of Chinatown, true champions are born and bred right here at 3rd Street Boxing Academy. Our elite training programs are designed for serious competitors who demand excellence, offering a comprehensive pathway from foundational skills to podium finishes in major tournaments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => onBookClass({
                    id: 'academy-trial',
                    name: 'Academy Trial Session',
                    description: 'Experience our championship training program',
                    level: 'academy',
                    price: 45
                  })}
                  className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                  aria-label="Book a trial session for the boxing academy"
                >
                  🏆 BOOK TRIAL SESSION
                </button>
                <button
                  className="btn btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                  aria-label="Learn more about our champions"
                >
                  MEET OUR CHAMPIONS
                </button>
              </div>
            </div>
          </section>
          {/* Guaranteed Banner from second snippet */}
          <section className="py-8 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <GuaranteedBanner />
            </div>
          </section>
          {/* Program Structure from first snippet */}
          <section className="py-12 sm:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  YOUR STRATEGIC PATH TO BOXING CHAMPIONSHIP GLORY
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                  A meticulously structured progression system designed to take you from novice enthusiast to elite competitor, with each phase building upon the last for exponential growth in skill, strength, and strategy.
                </p>
              </div>
              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-red-200 hidden sm:block"></div>
                <div className="space-y-8 sm:space-y-12">
                  {phases.map((phase, index) => (
                    <div key={phase.id} className="relative">
                      {/* Timeline Icon */}
                      <div className="hidden sm:flex absolute left-6 w-5 h-5 bg-red-600 rounded-full items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div className="sm:ml-16 bg-white rounded-xl shadow-lg p-6 sm:p-8">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
                          <div className="lg:w-1/3 mb-6 lg:mb-0">
                            <div className="flex items-center space-x-3 mb-4">
                              <span className="text-2xl sm:text-3xl">{phase.icon}</span>
                              <div>
                                <div className="text-sm text-red-600 font-medium">{phase.phase}</div>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{phase.title}</h3>
                                <div className="text-sm text-gray-500">{phase.duration}</div>
                              </div>
                            </div>
                            <p className="text-gray-600 mb-4 text-sm sm:text-base">{phase.description}</p>
                            <div className="bg-red-50 rounded-lg p-4">
                              <h4 className="font-semibold text-red-900 mb-2">Phase Goals</h4>
                              <p className="text-sm text-red-700">{phase.goals}</p>
                            </div>
                          </div>
                          <div className="lg:w-2/3">
                            <h4 className="font-semibold text-gray-900 mb-4">Key Training Focus Areas</h4>
                            <ul className="space-y-3">
                              {phase.drills.map((drill, drillIndex) => (
                                <li key={drillIndex} className="flex items-start space-x-3">
                                  <div className="bg-red-100 text-red-600 rounded-full p-1 mt-1 flex-shrink-0">
                                    <Target size={12} />
                                  </div>
                                  <span className="text-gray-700 text-sm sm:text-base">{drill}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          {/* Interactive Tools Section: Merging ChallengeGenerator, LeaderboardBracket, CelebrityGenerator, FameSimulator, UserProgressCard from second snippet */}
          <section className="py-12 sm:py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  INTERACTIVE TRAINING TOOLS FOR CHAMPION DEVELOPMENT
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                  Leverage our suite of advanced tools to personalize your training, track progress, draw inspiration, and simulate real-world success scenarios—all designed to accelerate your path to boxing mastery.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                <UserProgressCard />
                <ChallengeGenerator onGenerate={onChallengeGenerated} />
                <LeaderboardBracket />
                <CelebrityGenerator />
                <FameSimulator />
              </div>
            </div>
          </section>
          {/* Coach Roster from first snippet */}
          <section className="py-12 sm:py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  OUR ELITE COACHING STAFF: MASTERS OF THE RING
                </h2>
                <p className="text-lg sm:text-xl text-gray-600">
                  Benefit from the wisdom and experience of champions who have battled in the ring and now dedicate themselves to forging the next generation of boxing greats.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {coaches.map((coach) => (
                  <div key={coach.id} className="card bg-white">
                    <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                      <ImageWithFallback
                        src={coach.image}
                        alt={`${coach.name} - Academy coach at 3rd Street Boxing`}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{coach.name}</h3>
                        <p className="text-red-600 font-medium mb-2">{coach.title}</p>
                        <p className="text-gray-600 text-sm sm:text-base mb-4">{coach.bio}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-900">Experience:</span>
                            <div className="text-gray-600">{coach.experience}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Record:</span>
                            <div className="text-gray-600">{coach.record}</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="font-medium text-gray-900 mb-2">Specialties:</div>
                          <div className="flex flex-wrap gap-2">
                            {coach.specialties.map((specialty) => (
                              <span key={specialty} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Notable Achievements:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {coach.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <Trophy size={12} className="text-yellow-500 flex-shrink-0" />
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          {/* Pricing Tiers from first snippet */}
          <section className="py-12 sm:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  SELECT YOUR CHAMPIONSHIP TRAINING PATH
                </h2>
                <p className="text-lg sm:text-xl text-gray-600">
                  Choose from our flexible membership options, each crafted to match your commitment level and provide the resources needed for unparalleled growth in boxing.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`card relative ${tier.popular ? 'ring-2 ring-red-500' : ''}`}
                    role="region"
                    aria-label={`${tier.name} pricing tier`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                          Most Popular Choice
                        </span>
                      </div>
                    )}
                    <div className="text-center mb-6">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                      <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">
                        ${tier.price}<span className="text-base sm:text-lg text-gray-500">{tier.period}</span>
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base">{tier.description}</p>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="bg-green-100 text-green-600 rounded-full p-1 mt-1">
                            <span className="text-xs">✓</span>
                          </div>
                          <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => onBookClass({
                        id: `academy-${tier.id}`,
                        name: `Academy ${tier.name}`,
                        description: tier.description,
                        level: 'academy',
                        price: tier.price,
                        membership: tier.name
                      })}
                      className={`btn w-full ${tier.popular ? 'btn-primary' : 'btn-secondary'}`}
                      aria-label={`Select ${tier.name} membership plan`}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
          {/* Academy Graduates from first snippet */}
          <section className="py-12 sm:py-20 bg-red-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                  OUR PROUD ACADEMY CHAMPIONS
                </h2>
                <p className="text-lg sm:text-xl text-red-100">
                  Witness the inspiring stories of our graduates who have risen to prominence in the boxing world, making San Francisco proud through their dedication and triumphs.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {graduates.map((graduate, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                      <ImageWithFallback
                        src={graduate.image}
                        alt={`${graduate.name} - Academy graduate`}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold">{graduate.name}</h3>
                        <p className="text-yellow-300 font-medium mb-2">{graduate.achievement}</p>
                        <blockquote className="text-red-100 italic text-sm sm:text-base">
                          "{graduate.quote}"
                        </blockquote>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </Suspense>
    </AcademyPageErrorBoundary>
  );
}