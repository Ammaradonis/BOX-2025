// server.ts
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

// --- App Setup ---
const app = new Hono();

// Enable CORS and request logging
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("*", logger());

// --- Supabase Client ---
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// --- Helpers ---
async function authenticateUser(request: Request) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);
  return error || !data.user ? null : data.user;
}

// --- Initialization Route (only run manually) ---
app.get("/make-server-9c83b899/init", async (c) => {
  try {
    const classes = [
      {
        id: "beginner-fog-cutter",
        name: "Beginner (Fog Cutter)",
        description: "From FiDi desk jockeys to Mission artists - find your fit",
        level: "beginner",
        duration: 60,
        maxCapacity: 20,
        price: 25,
        instructor: "Maria 'Mission' Gonzalez",
      },
      {
        id: "intermediate-bay-bridger",
        name: "Intermediate (Bay Bridger)",
        description: "Progress to the next level with advanced combinations",
        level: "intermediate",
        duration: 75,
        maxCapacity: 15,
        price: 35,
        instructor: "Raúl 'The Firewall' Mendoza",
      },
      {
        id: "advanced-twin-peaks",
        name: "Advanced (Twin Peaks Climber)",
        description: "Elite training for competitive boxers",
        level: "advanced",
        duration: 90,
        maxCapacity: 12,
        price: 45,
        instructor: "Jamal 'The Technician' Chen",
      },
    ];

    const trainers = [
      {
        id: "maria-gonzalez",
        name: "Maria 'Mission' Gonzalez",
        bio: "5x NorCal Golden Gloves, teaches footwork like a Tango dancer in the Mission",
        specialties: ["Beginner Training", "Footwork", "Technique"],
        experience: "8 years",
        hourlyRate: 85,
        availability: ["Monday", "Wednesday", "Friday"],
      },
      {
        id: "raul-mendoza",
        name: "Raúl 'The Firewall' Mendoza",
        bio: "Trained at King's Gym (Tenderloin) during the '90s. Specialty: Surviving 'Civic Center Clinches'",
        specialties: ["Defense", "Sparring", "Competition Prep"],
        experience: "15 years",
        hourlyRate: 95,
        availability: ["Tuesday", "Thursday", "Saturday"],
      },
      {
        id: "jamal-chen",
        name: "Jamal 'The Technician' Chen",
        bio: "NASM Certified. Transformed 200+ SF tech workers from keyboard warriors to ring warriors",
        specialties: ["Technical Boxing", "Strength Training", "Form Correction"],
        experience: "10 years",
        hourlyRate: 90,
        availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      },
    ];

    const schedule = [
      {
        id: "mon-6am-beginner",
        classId: "beginner-fog-cutter",
        day: "Monday",
        time: "06:00",
        duration: 60,
        instructor: "maria-gonzalez",
        currentBookings: 8,
        maxCapacity: 20,
      },
      {
        id: "mon-7pm-intermediate",
        classId: "intermediate-bay-bridger",
        day: "Monday",
        time: "19:00",
        duration: 75,
        instructor: "raul-mendoza",
        currentBookings: 12,
        maxCapacity: 15,
      },
      {
        id: "tue-12pm-beginner",
        classId: "beginner-fog-cutter",
        day: "Tuesday",
        time: "12:00",
        duration: 60,
        instructor: "maria-gonzalez",
        currentBookings: 15,
        maxCapacity: 20,
      },
      {
        id: "wed-6pm-advanced",
        classId: "advanced-twin-peaks",
        day: "Wednesday",
        time: "18:00",
        duration: 90,
        instructor: "jamal-chen",
        currentBookings: 5,
        maxCapacity: 12,
      },
    ];

    await kv.set("classes", classes);
    await kv.set("trainers", trainers);
    await kv.set("schedule", schedule);
    await kv.set("testimonials", [
      {
        id: "sarah-soma",
        name: "Sarah K.",
        location: "SoMa",
        quote:
          "Shredded my pandemic 'Dolores Park bod' in 8 weeks! More energizing than Philz coffee.",
        rating: 5,
        program: "Bootcamp",
      },
      {
        id: "diego-sunset",
        name: "Diego R.",
        location: "Sunset",
        quote: "Went from shy to school champ. Coaches here are like family.",
        rating: 5,
        program: "Youth Boxing",
      },
    ]);

    return c.json({ success: true, message: "Data initialized successfully" });
  } catch (err) {
    console.error("Initialization error:", err);
    return c.json({ error: "Failed to initialize data" }, 500);
  }
});

// --- Auth: Signup ---
app.post("/make-server-9c83b899/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true,
    });

    if (error) return c.json({ error: "Failed to create user" }, 400);

    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      memberSince: new Date().toISOString(),
      membershipType: "trial",
      bookings: [],
    });

    return c.json({ success: true, user: data.user });
  } catch (err) {
    console.error("Signup error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// --- Public Endpoints ---
app.get("/make-server-9c83b899/classes", async (c) =>
  c.json({ classes: (await kv.get("classes")) || [] })
);

app.get("/make-server-9c83b899/trainers", async (c) =>
  c.json({ trainers: (await kv.get("trainers")) || [] })
);

app.get("/make-server-9c83b899/testimonials", async (c) =>
  c.json({ testimonials: (await kv.get("testimonials")) || [] })
);

app.get("/make-server-9c83b899/schedule", async (c) => {
  try {
    const [schedule, classes, trainers] = await Promise.all([
      kv.get("schedule"),
      kv.get("classes"),
      kv.get("trainers"),
    ]);

    const enriched = (schedule || []).map((slot: any) => {
      const classInfo = (classes || []).find((cl: any) => cl.id === slot.classId);
      const trainerInfo = (trainers || []).find((t: any) => t.id === slot.instructor);
      return {
        ...slot,
        className: classInfo?.name ?? "Unknown Class",
        classLevel: classInfo?.level ?? "unknown",
        trainerName: trainerInfo?.name ?? "Unknown Trainer",
        spotsAvailable: slot.maxCapacity - slot.currentBookings,
      };
    });

    return c.json({ schedule: enriched });
  } catch (err) {
    console.error("Schedule error:", err);
    return c.json({ error: "Failed to fetch schedule" }, 500);
  }
});

// --- Auth Required ---
app.post("/make-server-9c83b899/bookings", async (c) => {
  try {
    const user = await authenticateUser(c.req.raw);
    if (!user) return c.json({ error: "Authentication required" }, 401);

    const { scheduleId, classType } = await c.req.json();
    const schedule = (await kv.get("schedule")) || [];
    const slot = schedule.find((s: any) => s.id === scheduleId);

    if (!slot) return c.json({ error: "Schedule slot not found" }, 404);
    if (slot.currentBookings >= slot.maxCapacity)
      return c.json({ error: "Class is fully booked" }, 400);

    const booking = {
      id: `booking-${Date.now()}`,
      userId: user.id,
      scheduleId,
      classType,
      bookingDate: new Date().toISOString(),
      status: "confirmed",
    };

    slot.currentBookings++;
    await kv.set("schedule", schedule);

    const userProfile = (await kv.get(`user:${user.id}`)) || { bookings: [] };
    userProfile.bookings = [...(userProfile.bookings || []), booking];
    await kv.set(`user:${user.id}`, userProfile);
    await kv.set(`booking:${booking.id}`, booking);

    return c.json({ success: true, booking });
  } catch (err) {
    console.error("Booking error:", err);
    return c.json({ error: "Failed to create booking" }, 500);
  }
});

app.get("/make-server-9c83b899/profile", async (c) => {
  try {
    const user = await authenticateUser(c.req.raw);
    if (!user) return c.json({ error: "Authentication required" }, 401);

    const profile = await kv.get(`user:${user.id}`);
    return profile ? c.json({ profile }) : c.json({ error: "Profile not found" }, 404);
  } catch (err) {
    console.error("Profile error:", err);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// --- Newsletter & Contact ---
app.post("/make-server-9c83b899/newsletter", async (c) => {
  const { email } = await c.req.json();
  if (!email || !email.includes("@"))
    return c.json({ error: "Valid email required" }, 400);

  await kv.set(`newsletter:${email}`, {
    email,
    subscribedAt: new Date().toISOString(),
    active: true,
  });
  return c.json({ success: true, message: "Subscribed to newsletter" });
});

app.post("/make-server-9c83b899/contact", async (c) => {
  const { name, email, phone, message } = await c.req.json();
  const contact = {
    id: `contact-${Date.now()}`,
    name,
    email,
    phone,
    message,
    submittedAt: new Date().toISOString(),
    status: "new",
  };
  await kv.set(`contact:${contact.id}`, contact);
  return c.json({ success: true, message: "Contact form submitted" });
});

// --- Simulated Occupancy ---
app.get("/make-server-9c83b899/occupancy", (c) => {
  const hour = new Date().getHours();
  let base = 15;
  if (hour >= 6 && hour <= 8) base += 15;
  else if (hour >= 12 && hour <= 14) base += 10;
  else if (hour >= 17 && hour <= 20) base += 20;

  const current = Math.min(40, base + Math.floor(Math.random() * 8));
  return c.json({
    current,
    capacity: 40,
    percentage: Math.round((current / 40) * 100),
    lastUpdated: new Date().toISOString(),
  });
});

// --- Health Check ---
app.get("/make-server-9c83b899/health", (c) =>
  c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "3rd Street Boxing Gym API",
  })
);

// --- Global Error Handler ---
app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

// --- Start ---
Deno.serve(app.fetch);
