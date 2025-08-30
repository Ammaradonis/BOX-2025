import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable CORS and logging
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"]
}));
app.use("*", logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Helper function to authenticate user
async function authenticateUser(request: Request) {
  const accessToken = request.headers.get("Authorization")?.split(" ")[1];
  if (!accessToken) {
    return null;
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user?.id) {
    return null;
  }
  
  return user;
}

// Initialize data on startup
app.get("/make-server-9c83b899/init", async (c) => {
  try {
    // Initialize classes data
    const classes = [
      {
        id: "beginner-fog-cutter",
        name: "Beginner (Fog Cutter)",
        description: "From FiDi desk jockeys to Mission artists - find your fit",
        level: "beginner",
        duration: 60,
        maxCapacity: 20,
        price: 25,
        instructor: "Maria 'Mission' Gonzalez"
      },
      {
        id: "intermediate-bay-bridger",
        name: "Intermediate (Bay Bridger)",
        description: "Progress to the next level with advanced combinations",
        level: "intermediate",
        duration: 75,
        maxCapacity: 15,
        price: 35,
        instructor: "Raúl 'The Firewall' Mendoza"
      },
      {
        id: "advanced-twin-peaks",
        name: "Advanced (Twin Peaks Climber)",
        description: "Elite training for competitive boxers",
        level: "advanced",
        duration: 90,
        maxCapacity: 12,
        price: 45,
        instructor: "Jamal 'The Technician' Chen"
      }
    ];

    // Initialize trainers data
    const trainers = [
      {
        id: "maria-gonzalez",
        name: "Maria 'Mission' Gonzalez",
        bio: "5x NorCal Golden Gloves, teaches footwork like a Tango dancer in the Mission",
        specialties: ["Beginner Training", "Footwork", "Technique"],
        experience: "8 years",
        hourlyRate: 85,
        availability: ["Monday", "Wednesday", "Friday"]
      },
      {
        id: "raul-mendoza",
        name: "Raúl 'The Firewall' Mendoza",
        bio: "Trained at King's Gym (Tenderloin) during the '90s. Specialty: Surviving 'Civic Center Clinches'",
        specialties: ["Defense", "Sparring", "Competition Prep"],
        experience: "15 years",
        hourlyRate: 95,
        availability: ["Tuesday", "Thursday", "Saturday"]
      },
      {
        id: "jamal-chen",
        name: "Jamal 'The Technician' Chen",
        bio: "NASM Certified. Transformed 200+ SF tech workers from keyboard warriors to ring warriors",
        specialties: ["Technical Boxing", "Strength Training", "Form Correction"],
        experience: "10 years",
        hourlyRate: 90,
        availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
      }
    ];

    // Initialize schedule
    const schedule = [
      {
        id: "mon-6am-beginner",
        classId: "beginner-fog-cutter",
        day: "Monday",
        time: "06:00",
        duration: 60,
        instructor: "maria-gonzalez",
        currentBookings: 8,
        maxCapacity: 20
      },
      {
        id: "mon-7pm-intermediate",
        classId: "intermediate-bay-bridger", 
        day: "Monday",
        time: "19:00",
        duration: 75,
        instructor: "raul-mendoza",
        currentBookings: 12,
        maxCapacity: 15
      },
      {
        id: "tue-12pm-beginner",
        classId: "beginner-fog-cutter",
        day: "Tuesday",
        time: "12:00",
        duration: 60,
        instructor: "maria-gonzalez",
        currentBookings: 15,
        maxCapacity: 20
      },
      {
        id: "wed-6pm-advanced",
        classId: "advanced-twin-peaks",
        day: "Wednesday", 
        time: "18:00",
        duration: 90,
        instructor: "jamal-chen",
        currentBookings: 5,
        maxCapacity: 12
      }
    ];

    await kv.set("classes", classes);
    await kv.set("trainers", trainers);
    await kv.set("schedule", schedule);
    await kv.set("testimonials", [
      {
        id: "sarah-soma",
        name: "Sarah K.",
        location: "SoMa",
        quote: "Shredded my pandemic 'Dolores Park bod' in 8 weeks! More energizing than Philz coffee.",
        rating: 5,
        program: "Bootcamp"
      },
      {
        id: "diego-sunset",
        name: "Diego R.",
        location: "Sunset",
        quote: "Went from shy to school champ. Coaches here are like family.",
        rating: 5,
        program: "Youth Boxing"
      }
    ]);

    return c.json({ success: true, message: "Data initialized successfully" });
  } catch (error) {
    console.error("Initialization error:", error);
    return c.json({ error: "Failed to initialize data" }, 500);
  }
});

// User signup
app.post("/make-server-9c83b899/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true // Auto-confirm since email server isn't configured
    });

    if (error) {
      console.error("Signup error:", error);
      return c.json({ error: "Failed to create user account" }, 400);
    }

    // Store user profile
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      memberSince: new Date().toISOString(),
      membershipType: "trial",
      bookings: []
    });

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.error("Signup processing error:", error);
    return c.json({ error: "Internal server error during signup" }, 500);
  }
});

// Get classes
app.get("/make-server-9c83b899/classes", async (c) => {
  try {
    const classes = await kv.get("classes") || [];
    return c.json({ classes });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return c.json({ error: "Failed to fetch classes" }, 500);
  }
});

// Get schedule
app.get("/make-server-9c83b899/schedule", async (c) => {
  try {
    const schedule = await kv.get("schedule") || [];
    const classes = await kv.get("classes") || [];
    const trainers = await kv.get("trainers") || [];
    
    // Enrich schedule with class and trainer details
    const enrichedSchedule = schedule.map(slot => {
      const classInfo = classes.find(c => c.id === slot.classId);
      const trainerInfo = trainers.find(t => t.id === slot.instructor);
      return {
        ...slot,
        className: classInfo?.name || "Unknown Class",
        classLevel: classInfo?.level || "unknown",
        trainerName: trainerInfo?.name || "Unknown Trainer",
        spotsAvailable: slot.maxCapacity - slot.currentBookings
      };
    });
    
    return c.json({ schedule: enrichedSchedule });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return c.json({ error: "Failed to fetch schedule" }, 500);
  }
});

// Get trainers
app.get("/make-server-9c83b899/trainers", async (c) => {
  try {
    const trainers = await kv.get("trainers") || [];
    return c.json({ trainers });
  } catch (error) {
    console.error("Error fetching trainers:", error);
    return c.json({ error: "Failed to fetch trainers" }, 500);
  }
});

// Book a class (requires authentication)
app.post("/make-server-9c83b899/bookings", async (c) => {
  try {
    const user = await authenticateUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Authentication required to book classes" }, 401);
    }

    const { scheduleId, classType } = await c.req.json();
    
    // Get current schedule
    const schedule = await kv.get("schedule") || [];
    const scheduleSlot = schedule.find(slot => slot.id === scheduleId);
    
    if (!scheduleSlot) {
      return c.json({ error: "Schedule slot not found" }, 404);
    }
    
    if (scheduleSlot.currentBookings >= scheduleSlot.maxCapacity) {
      return c.json({ error: "Class is fully booked" }, 400);
    }
    
    // Create booking
    const booking = {
      id: `booking-${Date.now()}`,
      userId: user.id,
      scheduleId,
      classType,
      bookingDate: new Date().toISOString(),
      status: "confirmed"
    };
    
    // Update schedule with new booking count
    scheduleSlot.currentBookings += 1;
    await kv.set("schedule", schedule);
    
    // Save booking to user's record
    const userProfile = await kv.get(`user:${user.id}`) || { bookings: [] };
    userProfile.bookings = userProfile.bookings || [];
    userProfile.bookings.push(booking);
    await kv.set(`user:${user.id}`, userProfile);
    
    // Save individual booking record
    await kv.set(`booking:${booking.id}`, booking);
    
    return c.json({ success: true, booking });
  } catch (error) {
    console.error("Booking error:", error);
    return c.json({ error: "Failed to create booking" }, 500);
  }
});

// Get user profile and bookings (requires authentication)
app.get("/make-server-9c83b899/profile", async (c) => {
  try {
    const user = await authenticateUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Authentication required" }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// Newsletter signup
app.post("/make-server-9c83b899/newsletter", async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email || !email.includes("@")) {
      return c.json({ error: "Valid email address required" }, 400);
    }
    
    const subscription = {
      email,
      subscribedAt: new Date().toISOString(),
      active: true
    };
    
    await kv.set(`newsletter:${email}`, subscription);
    
    return c.json({ success: true, message: "Successfully subscribed to newsletter" });
  } catch (error) {
    console.error("Newsletter signup error:", error);
    return c.json({ error: "Failed to subscribe to newsletter" }, 500);
  }
});

// Contact form submission
app.post("/make-server-9c83b899/contact", async (c) => {
  try {
    const { name, email, phone, message } = await c.req.json();
    
    const contact = {
      id: `contact-${Date.now()}`,
      name,
      email,
      phone,
      message,
      submittedAt: new Date().toISOString(),
      status: "new"
    };
    
    await kv.set(`contact:${contact.id}`, contact);
    
    return c.json({ success: true, message: "Contact form submitted successfully" });
  } catch (error) {
    console.error("Contact form error:", error);
    return c.json({ error: "Failed to submit contact form" }, 500);
  }
});

// Get testimonials
app.get("/make-server-9c83b899/testimonials", async (c) => {
  try {
    const testimonials = await kv.get("testimonials") || [];
    return c.json({ testimonials });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return c.json({ error: "Failed to fetch testimonials" }, 500);
  }
});

// Get gym occupancy (real-time simulation)
app.get("/make-server-9c83b899/occupancy", async (c) => {
  try {
    // Simulate real-time occupancy data
    const currentHour = new Date().getHours();
    let baseOccupancy = 15; // Base occupancy
    
    // Peak hours simulation
    if (currentHour >= 6 && currentHour <= 8) {
      baseOccupancy += 15; // Morning rush
    } else if (currentHour >= 12 && currentHour <= 14) {
      baseOccupancy += 10; // Lunch crowd
    } else if (currentHour >= 17 && currentHour <= 20) {
      baseOccupancy += 20; // Evening peak
    }
    
    // Add some randomness
    const currentOccupancy = Math.min(40, baseOccupancy + Math.floor(Math.random() * 8));
    
    return c.json({
      current: currentOccupancy,
      capacity: 40,
      percentage: Math.round((currentOccupancy / 40) * 100),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching occupancy:", error);
    return c.json({ error: "Failed to fetch occupancy data" }, 500);
  }
});

// Health check
app.get("/make-server-9c83b899/health", (c) => {
  return c.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    service: "3rd Street Boxing Gym API"
  });
});

// Error handler
app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

// Start server
Deno.serve(app.fetch);