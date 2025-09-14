import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import confetti from "canvas-confetti";
import { formatInTimeZone } from "date-fns-tz";

/**
 * ContactPage.tsx
 *
 * Self-contained contact / engagement hub for "3rd Street Boxing".
 * This file synthesizes interactive components and utilities adapted
 * from the provided demo merged_hardcoded.tsx into a single, standalone
 * React + TypeScript module that requires no external files beyond
 * installed packages (canvas-confetti, date-fns-tz).
 *
 * The component includes:
 * - FightTicker for brand consistency
 * - Comprehensive contact form with validation & persistence
 * - ArTryOn mock (image upload and canvas overlay)
 * - SoundscapeToggle to play ambient gym audio
 * - PressPopup shown post-submission or after a delay
 * - CelebrityGenerator for social proof
 * - Fake submission process with analytics & confetti
 * - Local analytics tracking (saved to localStorage)
 *
 * All styling is inline via JSX style objects (no external CSS).
 */

/* -----------------------------
   Types
   ----------------------------- */

/** Message type options for contact form */
type MessageType = "general" | "membership" | "sponsorship" | "media" | "other";

/** Contact form payload */
type ContactFormData = {
  fullName: string;
  email: string;
  phone?: string;
  messageType: MessageType;
  message: string;
  optIn?: boolean;
};

/** Submission status */
type SubmissionStatus = "idle" | "submitting" | "success" | "error";

/* -----------------------------
   Utilities (localStorage wrappers & analytics)
   ----------------------------- */

const saveToLS = (k: string, v: any) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    // ignore storage errors in demo
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

/** Lightweight local analytics logger (keeps last 200 events) */
const analyticsTrack = (event: string, meta: Record<string, any> = {}) => {
  try {
    const logs = loadFromLS<Record<string, any>[]>("demo_analytics", []);
    logs.unshift({ event, meta, time: new Date().toISOString() });
    saveToLS("demo_analytics", logs.slice(0, 200));
    // NOTE: in production you'd send to remote analytics
  } catch {
    // swallow
  }
};

/* -----------------------------
   Visual / UI helpers
   ----------------------------- */

const triggerConfetti = () => {
  try {
    // create a canvas to avoid interfering with layout
    const c = document.createElement("canvas");
    c.style.position = "fixed";
    c.style.left = "0";
    c.style.top = "0";
    c.style.pointerEvents = "none";
    c.style.zIndex = "999999";
    document.body.appendChild(c);
    const myConfetti = confetti.create(c, { resize: true });
    myConfetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    // remove canvas after a few seconds
    setTimeout(() => {
      document.body.removeChild(c);
    }, 2500);
  } catch {
    // ignore if confetti fails
  }
};

/* -----------------------------
   Small decorative / shared components
   ----------------------------- */

const VisuallyHidden: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ border: 0, clip: "rect(0 0 0 0)", height: 1, margin: -1, overflow: "hidden", padding: 0, position: "absolute", width: 1 }}>
    {children}
  </span>
);

/* -----------------------------
   FightTicker (top-of-page brand ticker)
   ----------------------------- */

export const FightTicker: React.FC = React.memo(() => {
  const items = useMemo(
    () => [
      "Fight Night: Friday 8pm — Limited seats",
      "Celebrity guest appearance next week",
      "Register for sparring tournament",
      "Open mats every Sunday — drop in",
    ],
    []
  );

  return (
    <div
      aria-hidden="false"
      role="region"
      aria-label="Announcements ticker"
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        background: "#f8fafc",
        padding: "8px 10px",
        borderRadius: 6,
        border: "1px solid #eef2f7",
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
   ArTryOn (mock) - file upload + canvas overlay
   ----------------------------- */

export const ArTryOn: React.FC<{ onInteract?: () => void }> = React.memo(({ onInteract }) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!dataUrl) return;
    const img = new Image();
    img.onload = () => {
      const c = canvasRef.current!;
      if (!c) return;
      c.width = 400;
      c.height = 400;
      const ctx = c.getContext("2d")!;
      ctx.clearRect(0, 0, c.width, c.height);
      // draw photo and overlay glove-like mock
      ctx.drawImage(img, 0, 0, c.width, c.height);
      ctx.fillStyle = "rgba(220,38,38,0.6)";
      ctx.beginPath();
      ctx.ellipse(c.width - 100, c.height - 100, 70, 50, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("3rd Street Glove (mock)", c.width - 200, c.height - 90);
    };
    img.src = dataUrl;
  }, [dataUrl]);

  const onFile = useCallback(
    (f?: File | null) => {
      const file = f || (fileRef.current?.files && fileRef.current.files[0]);
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setDataUrl(String(reader.result));
        analyticsTrack("ar_tryon_used", { type: file.type });
        onInteract && onInteract();
      };
      reader.readAsDataURL(file);
    },
    [onInteract]
  );

  return (
    <div style={{ border: "1px dashed #ddd", padding: 12, borderRadius: 8, background: "#fff" }}>
      <div style={{ marginBottom: 8 }}>
        <strong id="ar-tryon-title">AR Try-On Mock</strong>
      </div>
      <label htmlFor="ar-file" style={{ display: "block", marginBottom: 8 }}>
        <input
          ref={fileRef as any}
          id="ar-file"
          type="file"
          accept="image/*"
          onChange={() => onFile()}
          aria-describedby="ar-tryon-desc"
          style={{ display: "block" }}
        />
      </label>
      <div id="ar-tryon-desc" style={{ marginTop: 8 }}>
        <canvas
          ref={canvasRef}
          style={{
            width: 400,
            height: 400,
            display: dataUrl ? "block" : "none",
            borderRadius: 8,
            background: "#f3f4f6",
          }}
          aria-hidden={dataUrl ? "false" : "true"}
        />
        {!dataUrl && <div style={{ color: "#666" }}>Upload a selfie to preview glove overlay (demo).</div>}
      </div>
    </div>
  );
});
ArTryOn.displayName = "ArTryOn";

/* -----------------------------
   SoundscapeToggle - ambient audio toggle
   ----------------------------- */

export const SoundscapeToggle: React.FC = React.memo(() => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // placeholder path - in demo this will likely 404, but code is resilient
    audioRef.current = new Audio("/assets/ambient-gym.mp3");
    audioRef.current.loop = true;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [playing]);

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button
        onClick={() => {
          setPlaying((p) => !p);
          analyticsTrack("soundscape_toggled", { to: !playing });
        }}
        style={{
          padding: "6px 10px",
          borderRadius: 6,
          background: playing ? "#dc2626" : "#eee",
          color: playing ? "#fff" : "#000",
          border: "none",
          cursor: "pointer",
        }}
        aria-pressed={playing}
      >
        {playing ? "Stop Soundscape" : "Play Soundscape"}
      </button>
      <span style={{ color: "#666", fontSize: 13 }}>{playing ? "Playing ambient gym audio" : "Soundscape off"}</span>
    </div>
  );
});
SoundscapeToggle.displayName = "SoundscapeToggle";

/* -----------------------------
   PressPopup (appears after submission or delay)
   ----------------------------- */

export const PressPopup: React.FC<{ onClose?: () => void; openInitially?: boolean }> = ({ onClose, openInitially = true }) => {
  const [open, setOpen] = useState<boolean>(openInitially);
  useEffect(() => {
    // auto-show after some time (to emulate PR)
    const timer = setTimeout(() => {
      setOpen(true);
      analyticsTrack("press_popup_shown", {});
    }, 120000); // 2 minutes in demo (if not already open)
    return () => clearTimeout(timer);
  }, []);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
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
            <div style={{ fontSize: 18, fontWeight: 700 }}>Press: Local Champion Signs with 3rd Street Boxing</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>Read more about our program and success stories.</div>
          </div>
          <div>
            <button
              onClick={() => {
                setOpen(false);
                onClose?.();
                analyticsTrack("press_popup_closed", {});
              }}
              style={{
                background: "#ef4444",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
              }}
              aria-label="Close press popup"
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
   CelebrityGenerator (social proof)
   ----------------------------- */

export const CelebrityGenerator: React.FC = React.memo(() => {
  const celebs = ["Mike Tyson", "Ronda Rousey", "Conor McGregor", "Serena W."];
  const [card, setCard] = useState<{ celeb: string; quote: string } | null>(null);
  const gen = useCallback(() => {
    const c = celebs[Math.floor(Math.random() * celebs.length)];
    const q = `${c} says: "3rd Street Boxing made me remember why I love this sport." (mock)`;
    setCard({ celeb: c, quote: q });
    analyticsTrack("celebrity_card_generated", { celeb: c });
  }, [celebs]);

  return (
    <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
      <button
        onClick={gen}
        style={{ padding: "8px 12px", background: "#111827", color: "#fff", borderRadius: 6, border: "none", cursor: "pointer" }}
      >
        Generate Celebrity Card
      </button>
      {card && (
        <div style={{ marginTop: 8, padding: 8, borderRadius: 6, background: "#f8fafc" }}>
          <strong>{card.celeb}</strong>
          <div style={{ fontSize: 13 }}>{card.quote}</div>
        </div>
      )}
    </div>
  );
});

/* -----------------------------
   Form validation helpers
   ----------------------------- */

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex =
  /^\+?[\d\s().-]{7,20}$/;

/** Validate contact form; return map of field -> error message */
const validateForm = (d: ContactFormData) => {
  const errors: Partial<Record<keyof ContactFormData, string>> = {};
  if (!d.fullName || d.fullName.trim().length < 2) errors.fullName = "Please enter your full name.";
  if (!d.email || !emailRegex.test(d.email)) errors.email = "Please provide a valid email address.";
  if (d.phone && !phoneRegex.test(d.phone)) errors.phone = "Phone number looks invalid.";
  if (!d.message || d.message.trim().length < 10) errors.message = "Please write a short message (10+ characters).";
  return errors;
};

/* -----------------------------
   ContactPage (main exported component)
   ----------------------------- */

/**
 * ContactPage
 *
 * The primary Contact / Engagement component for 3rd Street Boxing.
 *
 * - Persists drafts to localStorage under "demo_contact_drafts"
 * - Tracks analytics for key interactions
 * - Provides AR try-on, soundscape, celebrity generator, press popup
 * - Accessible, keyboard-friendly form with inline validation
 */
const DRAFT_KEY = "demo_contact_drafts";

const defaultForm: ContactFormData = {
  fullName: "",
  email: "",
  phone: "",
  messageType: "general",
  message: "",
  optIn: true,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #e6e7eb",
  fontSize: 14,
};

export default function ContactPage(): JSX.Element {
  // form state
  const [form, setForm] = useState<ContactFormData>(() => loadFromLS<ContactFormData>(DRAFT_KEY, defaultForm));
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [pressOpen, setPressOpen] = useState<boolean>(false);
  const [showPressAfterDelay] = useState<boolean>(true);
  const submitAbortRef = useRef<{ aborted: boolean }>({ aborted: false });
  const [celebrityVisible, setCelebrityVisible] = useState(false);

  // persist drafts to localStorage whenever the form changes (debounced-ish)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        saveToLS(DRAFT_KEY, form);
      } catch {
        // ignore
      }
    }, 600);
    return () => clearTimeout(t);
  }, [form]);

  // page load analytics
  useEffect(() => {
    analyticsTrack("contact_page_loaded", { ts: new Date().toISOString() });
    // optionally show press popup after a short time to demonstrate feature
    if (showPressAfterDelay) {
      const timer = setTimeout(() => {
        setPressOpen(true);
        analyticsTrack("press_popup_auto_shown", {});
      }, 90000); // 90s
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handle input changes
  const onChange = useCallback(<K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  // focus analytics
  const handleFocus = (field: keyof ContactFormData) => {
    analyticsTrack("form_field_focused", { field });
  };

  // validate and submit (fake)
  const onSubmit = useCallback(
    async (evt?: React.FormEvent) => {
      evt?.preventDefault?.();
      analyticsTrack("form_submit_attempt", { formPreview: { ...form, message: form.message.slice(0, 80) } });
      const v = validateForm(form);
      setErrors(v);
      if (Object.keys(v).length > 0) {
        analyticsTrack("form_validation_failed", { errors: v });
        setStatus("error");
        return;
      }

      setStatus("submitting");
      submitAbortRef.current = { aborted: false };

      try {
        // simulate network latency
        await new Promise((r) => setTimeout(r, 1200 + Math.random() * 1200));
        if (submitAbortRef.current.aborted) throw new Error("aborted");

        // simulate occasional failure
        const fail = Math.random() < 0.08;
        if (fail) {
          throw new Error("Simulated network error");
        }

        // "submit" payload stored locally
        saveToLS("demo_contact_submissions", [
          { id: `c${Date.now()}`, created_at: new Date().toISOString(), payload: form },
          ...loadFromLS<any[]>("demo_contact_submissions", []),
        ]);

        analyticsTrack("form_submit_success", { messageType: form.messageType });
        setStatus("success");
        triggerConfetti();

        // clear draft on success
        setForm(defaultForm);
        saveToLS(DRAFT_KEY, defaultForm);

        // show PressPopup as part of engagement flow
        setPressOpen(true);

        // reveal celebrity card for social proof
        setCelebrityVisible(true);
      } catch (e: any) {
        if (e?.message === "aborted") {
          analyticsTrack("form_submit_aborted", {});
          setStatus("idle");
        } else {
          analyticsTrack("form_submit_failed", { error: String(e?.message) });
          setStatus("error");
        }
      } finally {
        // revert to idle after a moment so UI resets
        setTimeout(() => {
          if (status !== "success") setStatus("idle");
        }, 1800);
      }
    },
    [form, status]
  );

  // abort submit if unmounted
  useEffect(() => {
    return () => {
      submitAbortRef.current.aborted = true;
    };
  }, []);

  // helper to show inline error for a field
  const fieldError = (k: keyof ContactFormData) => errors[k] ? String(errors[k]) : undefined;

  // small helper to mark aria-invalid
  const ariaInvalid = (k: keyof ContactFormData) => (!!errors[k]).toString();

  // AR try-on interaction handler (analytics)
  const handleArInteract = useCallback(() => {
    analyticsTrack("ar_tryon_interaction", {});
  }, []);

  // celebrity generator control (exposed near form for quick social proof)
  const handleGenerateCelebrity = useCallback(() => {
    analyticsTrack("celebrity_clicked", {});
    setCelebrityVisible(true);
  }, []);

  // small helper to format current local time for submission meta
  const formattedNow = useMemo(() => {
    try {
      return formatInTimeZone(new Date(), "Europe/Vienna", "yyyy-MM-dd HH:mm:ss zzz");
    } catch {
      return new Date().toISOString();
    }
  }, []);

  /* -----------------------------
     Accessibility-focused keyboard handlers (form shortcuts)
     ----------------------------- */
  const formRef = useRef<HTMLFormElement | null>(null);
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      // ctrl+enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onSubmit();
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [onSubmit]);

  /* -----------------------------
     Render
     ----------------------------- */

  return (
    <div style={{ maxWidth: 1100, margin: "18px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>3rd Street Boxing — Contact</h1>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>We're here to help — reach out and we'll get back quickly.</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <FightTicker />
        </div>
      </header>

      <main style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
        <section aria-labelledby="contact-form-heading" style={{ padding: 12, background: "#fff", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <h2 id="contact-form-heading" style={{ marginTop: 0 }}>Get in touch</h2>

          <form
            ref={formRef}
            onSubmit={onSubmit}
            aria-describedby="contact-form-desc"
            style={{ display: "grid", gap: 12 }}
            noValidate
          >
            <div id="contact-form-desc" style={{ fontSize: 13, color: "#6b7280" }}>
              Fill out the form and we'll respond within 1–2 business days. Use <strong>Play Soundscape</strong> for atmosphere while composing.
            </div>

            {/* Name */}
            <div>
              <label htmlFor="fullName" style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={(e) => onChange("fullName", e.target.value)}
                onFocus={() => handleFocus("fullName")}
                aria-invalid={ariaInvalid("fullName")}
                aria-describedby={fieldError("fullName") ? "err-fullName" : undefined}
                style={{ ...inputStyle, borderColor: errors.fullName ? "#ef4444" : inputStyle.border }}
                required
              />
              {errors.fullName && (
                <div id="err-fullName" role="alert" style={{ color: "#ef4444", marginTop: 6, fontSize: 13 }}>
                  {errors.fullName}
                </div>
              )}
            </div>

            {/* Email & phone */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label htmlFor="email" style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  onFocus={() => handleFocus("email")}
                  aria-invalid={ariaInvalid("email")}
                  aria-describedby={fieldError("email") ? "err-email" : undefined}
                  style={{ ...inputStyle, borderColor: errors.email ? "#ef4444" : inputStyle.border }}
                  required
                />
                {errors.email && (
                  <div id="err-email" role="alert" style={{ color: "#ef4444", marginTop: 6, fontSize: 13 }}>
                    {errors.email}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="phone" style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                  Phone (optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                  onFocus={() => handleFocus("phone")}
                  aria-invalid={ariaInvalid("phone")}
                  aria-describedby={fieldError("phone") ? "err-phone" : undefined}
                  style={{ ...inputStyle, borderColor: errors.phone ? "#ef4444" : inputStyle.border }}
                  placeholder="+1 (555) 555-5555"
                />
                {errors.phone && (
                  <div id="err-phone" role="alert" style={{ color: "#ef4444", marginTop: 6, fontSize: 13 }}>
                    {errors.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Message type */}
            <div>
              <label htmlFor="messageType" style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                Message type
              </label>
              <select
                id="messageType"
                value={form.messageType}
                onChange={(e) => onChange("messageType", e.target.value as MessageType)}
                onFocus={() => handleFocus("messageType")}
                style={{ ...inputStyle, appearance: "none" }}
              >
                <option value="general">General inquiry</option>
                <option value="membership">Membership / Pricing</option>
                <option value="sponsorship">Sponsorship / Partnerships</option>
                <option value="media">Media / Press</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                Message
              </label>
              <textarea
                id="message"
                value={form.message}
                onChange={(e) => onChange("message", e.target.value)}
                onFocus={() => handleFocus("message")}
                aria-invalid={ariaInvalid("message")}
                aria-describedby={fieldError("message") ? "err-message" : undefined}
                rows={6}
                style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
              />
              {errors.message && (
                <div id="err-message" role="alert" style={{ color: "#ef4444", marginTop: 6, fontSize: 13 }}>
                  {errors.message}
                </div>
              )}
            </div>

            {/* Opt-in */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                id="optIn"
                type="checkbox"
                checked={form.optIn}
                onChange={(e) => onChange("optIn", e.target.checked)}
                onFocus={() => handleFocus("optIn")}
              />
              <label htmlFor="optIn" style={{ fontSize: 13, color: "#374151" }}>
                I agree to receive occasional emails about classes and events.
              </label>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                type="submit"
                disabled={status === "submitting"}
                style={{
                  padding: "10px 14px",
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: status === "submitting" ? "wait" : "pointer",
                }}
                aria-disabled={status === "submitting"}
              >
                {status === "submitting" ? "Sending..." : status === "success" ? "Sent!" : "Send message"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForm(defaultForm);
                  setErrors({});
                  saveToLS(DRAFT_KEY, defaultForm);
                  analyticsTrack("form_cleared", {});
                }}
                style={{
                  padding: "10px 12px",
                  background: "#f3f4f6",
                  borderRadius: 8,
                  border: "1px solid #e6e7eb",
                }}
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => {
                  // quick sample message to speed up testing/demo
                  const sample: ContactFormData = {
                    fullName: "Jamie Sample",
                    email: "jamie@example.com",
                    phone: "+1 415 555 1234",
                    messageType: "membership",
                    message: "Hi — I'm interested in membership options and a trial class. Please advise.",
                    optIn: true,
                  };
                  setForm(sample);
                  analyticsTrack("form_prefill_sample", {});
                }}
                style={{
                  padding: "8px 12px",
                  background: "#111827",
                  color: "#fff",
                  borderRadius: 8,
                  border: "none",
                }}
              >
                Prefill (demo)
              </button>

              <div style={{ marginLeft: "auto", fontSize: 13, color: "#6b7280" }}>
                {status === "error" && <span role="status" aria-live="polite">There was a problem — please check fields or try again.</span>}
              </div>
            </div>

            <div style={{ fontSize: 12, color: "#9ca3af" }}>
              Submitted: <strong>{formattedNow}</strong>
            </div>
          </form>

          {/* Small feature row under form */}
          <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "center", flexWrap: "wrap" }}>
            <SoundscapeToggle />
            <button
              onClick={() => {
                analyticsTrack("ar_tryon_launcher_clicked", {});
                // focus user to ArTryOn below by scroll
                const el = document.getElementById("artryon-anchor");
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              style={{
                padding: "8px 12px",
                background: "#06b6d4",
                color: "#fff",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
              }}
            >
              Try On Gloves
            </button>

            <button
              onClick={() => {
                handleGenerateCelebrity();
              }}
              style={{
                padding: "8px 12px",
                background: "#111827",
                color: "#fff",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
              }}
            >
              Social Proof
            </button>
          </div>

          {/* AR Try-On placed near form */}
          <div id="artryon-anchor" style={{ marginTop: 18 }}>
            <ArTryOn onInteract={handleArInteract} />
          </div>
        </section>

        <aside style={{ display: "grid", gap: 12 }}>
          {/* Quick info cards */}
          <div style={{ padding: 12, borderRadius: 8, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <strong>Why 3rd Street?</strong>
            <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>
              Community-led training, pro-level coaches, and classes for all levels. Ask about trial memberships.
            </div>
            <div style={{ marginTop: 10 }}>
              <button
                onClick={() => {
                  analyticsTrack("book_trial_clicked", {});
                  // fill form to book a trial
                  setForm((f) => ({ ...f, messageType: "membership", message: "Hi — I'd like a trial class. What's available?" }));
                }}
                style={{
                  padding: "8px 12px",
                  background: "#10b981",
                  color: "#fff",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Request Trial
              </button>
            </div>
          </div>

          {/* Celebrity generator / social proof area */}
          <div style={{ padding: 12, borderRadius: 8, background: "#fff", minHeight: 120 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>Social Proof</strong>
              <button
                onClick={() => {
                  analyticsTrack("celebrity_generate_sidebar", {});
                  setCelebrityVisible((v) => !v);
                }}
                style={{
                  padding: "6px 8px",
                  background: "#111827",
                  color: "#fff",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                }}
                aria-pressed={celebrityVisible}
              >
                {celebrityVisible ? "Hide" : "Show"}
              </button>
            </div>

            {celebrityVisible ? (
              <div style={{ marginTop: 10 }}>
                <CelebrityGeneratorInline />
              </div>
            ) : (
              <div style={{ marginTop: 10, color: "#6b7280", fontSize: 13 }}>
                Click "Show" to reveal endorsements and quick trust signals.
              </div>
            )}
          </div>

          {/* Small extras */}
          <div style={{ padding: 12, borderRadius: 8, background: "#fff" }}>
            <div style={{ fontWeight: 700 }}>Quick Stats</div>
            <div style={{ fontSize: 28, color: "#dc2626", marginTop: 6 }}>{getSocialCount().toLocaleString()}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>SF locals training this week</div>
          </div>

          {/* Press popup control for demo */}
          <div style={{ padding: 12, borderRadius: 8, background: "#fff" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  setPressOpen(true);
                  analyticsTrack("press_popup_manual_open", {});
                }}
                style={{ padding: "8px 10px", background: "#111827", color: "#fff", borderRadius: 6, border: "none", cursor: "pointer" }}
              >
                Open Press Popup
              </button>

              <button
                onClick={() => {
                  setPressOpen(false);
                  analyticsTrack("press_popup_manual_close", {});
                }}
                style={{ padding: "8px 10px", background: "#f3f4f6", borderRadius: 6, border: "1px solid #e6e7eb", cursor: "pointer" }}
              >
                Close
              </button>
            </div>

            <div style={{ marginTop: 10 }}>
              <small style={{ color: "#6b7280" }}>Press popup also appears automatically after a short delay for engagement.</small>
            </div>
          </div>
        </aside>
      </main>

      {/* PressPopup rendered conditionally */}
      {pressOpen && <PressPopup onClose={() => { setPressOpen(false); analyticsTrack("press_popup_closed_by_user", {}); }} />}

      {/* Footer */}
      <footer style={{ marginTop: 18, color: "#6b7280", fontSize: 13 }}>
        <div>Contact page — demo-only UI. Form submissions are stored locally for testing.</div>
      </footer>
    </div>
  );
}

/* -----------------------------
   Inline helper components used above
   ----------------------------- */

/** Celebrity generator inline (small copy from demo but local to this file) */
const CelebrityGeneratorInline: React.FC = () => {
  const celebs = ["Mike Tyson", "Ronda Rousey", "Conor McGregor", "Serena Williams"];
  const [card, setCard] = useState<{ celeb: string; quote: string } | null>(null);
  const gen = useCallback(() => {
    const c = celebs[Math.floor(Math.random() * celebs.length)];
    const q = `${c} says: "3rd Street Boxing made me remember why I love this sport." (mock)`;
    setCard({ celeb: c, quote: q });
    analyticsTrack("celebrity_card_generated_inline", { celeb: c });
  }, [celebs]);

  return (
    <div>
      <button
        onClick={gen}
        style={{ padding: "8px 12px", background: "#111827", color: "#fff", borderRadius: 6, border: "none", cursor: "pointer" }}
      >
        Generate Endorsement
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
   Small utility copied from demo: getSocialCount
   ----------------------------- */

function getSocialCount() {
  const base = 1243;
  const drift = Math.floor(Math.sin(Date.now() / (1000 * 60 * 60)) * 20);
  return base + drift + Math.floor(Math.random() * 30);
}
