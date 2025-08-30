import { useEffect, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Load env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client only if env vars exist
let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export default function App() {
  const [message, setMessage] = useState("🔄 Connecting to Supabase...");
  const [activeTab, setActiveTab] = useState("home");
  const [classSchedule, setClassSchedule] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check Supabase connection
  useEffect(() => {
    async function checkSupabase() {
      if (!supabase) {
        setMessage("⚠️ Supabase not configured (missing env vars)");
        return;
      }

      try {
        const { error } = await supabase.from("pg_stat_activity").select("*").limit(1);
        if (error) {
          console.warn("Supabase query error:", error.message);
          setMessage("✅ Supabase client initialized (no auth session)");
        } else {
          setMessage("✅ Supabase client initialized successfully!");
        }
      } catch (err) {
        console.error("Supabase connection error:", err);
        setMessage("⚠️ Could not connect to Supabase");
      }
    }

    checkSupabase();
  }, []);

  // Fetch data from Supabase
  useEffect(() => {
    if (!supabase) return;

    // Fetch class schedule
    const fetchClassSchedule = async () => {
      const { data, error } = await supabase
        .from("class_schedule")
        .select("*")
        .order("start_time", { ascending: true });
      
      if (!error && data) setClassSchedule(data);
    };

    // Fetch trainers
    const fetchTrainers = async () => {
      const { data, error } = await supabase
        .from("trainers")
        .select("*")
        .order("name", { ascending: true });
      
      if (!error && data) setTrainers(data);
    };

    // Fetch membership plans
    const fetchMembershipPlans = async () => {
      const { data, error } = await supabase
        .from("membership_plans")
        .select("*")
        .order("price", { ascending: true });
      
      if (!error && data) setMembershipPlans(data);
    };

    fetchClassSchedule();
    fetchTrainers();
    fetchMembershipPlans();
  }, []);

  // Handle contact form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) return;

    const { error } = await supabase
      .from("contact_submissions")
      .insert([contactForm]);

    if (error) {
      alert("Error submitting form. Please try again.");
    } else {
      alert("Thank you for your message! We'll get back to you soon.");
      setContactForm({ name: "", email: "", message: "" });
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-red-700 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="font-bold text-2xl">3rd Street Boxing Gym</div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6">
              {["home", "classes", "trainers", "schedule", "membership", "contact"].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`capitalize ${activeTab === tab ? "font-bold underline" : "hover:text-gray-200"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ☰
            </button>
          </div>
          
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col space-y-2">
                {["home", "classes", "trainers", "schedule", "membership", "contact"].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setIsMenuOpen(false);
                    }}
                    className={`capitalize py-2 text-left ${activeTab === tab ? "font-bold underline" : ""}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        {activeTab === "home" && (
          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Welcome to 3rd Street Boxing Gym
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Where champions are made. Train with the best in a supportive community.
            </p>
            <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Hero Image/Video</span>
            </div>
          </section>
        )}

        {/* Class Schedule */}
        {activeTab === "schedule" && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Class Schedule</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Class</th>
                    <th className="py-3 px-4 text-left">Day & Time</th>
                    <th className="py-3 px-4 text-left">Trainer</th>
                  </tr>
                </thead>
                <tbody>
                  {classSchedule.map((classItem, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="py-3 px-4">{classItem.name}</td>
                      <td className="py-3 px-4">{classItem.day}, {classItem.start_time} - {classItem.end_time}</td>
                      <td className="py-3 px-4">{classItem.trainer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Trainers */}
        {activeTab === "trainers" && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Trainers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainers.map((trainer, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-gray-500">Photo</span>
                  </div>
                  <h3 className="text-xl font-bold text-center">{trainer.name}</h3>
                  <p className="text-gray-600 text-center mb-3">{trainer.specialty}</p>
                  <p className="text-gray-700">{trainer.bio}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Membership Plans */}
        {activeTab === "membership" && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Membership Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {membershipPlans.map((plan, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                  <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>
                  <p className="text-3xl font-bold text-center text-red-700 mb-4">${plan.price}/mo</p>
                  <ul className="mb-6">
                    {plan.features.split(',').map((feature, i) => (
                      <li key={i} className="py-2 border-b border-gray-100">✓ {feature.trim()}</li>
                    ))}
                  </ul>
                  <button className="w-full bg-red-700 text-white py-3 rounded-lg font-bold hover:bg-red-800 transition">
                    Sign Up Now
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact Form */}
        {activeTab === "contact" && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={handleContactSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={contactForm.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={contactForm.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="bg-red-700 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-800 transition"
                >
                  Send Message
                </button>
              </form>
            </div>
          </section>
        )}

        {/* Database Connection Status (discreet) */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">3rd Street Boxing Gym</h3>
              <p>123 Boxing Avenue<br />Fight City, FC 12345</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Hours</h3>
              <p>Monday-Friday: 5am - 10pm<br />Saturday-Sunday: 7am - 8pm</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <p>Phone: (123) 456-7890<br />Email: info@3rdstreetboxing.com</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p>© {new Date().getFullYear()} 3rd Street Boxing Gym. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}