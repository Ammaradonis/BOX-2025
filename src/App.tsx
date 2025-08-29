import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    async function fetchHealth() {
      try {
        // Try a lightweight auth check instead of querying a table that may not exist
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setMessage(user ? "✅ Supabase auth available" : "✅ Supabase client initialized");
      } catch (err) {
        setMessage("⚠️ Supabase not configured (check .env on Netlify)");
        console.error(err);
      }
    }
    fetchHealth();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white p-8">
      <h1 className="text-4xl font-bold text-blue-600">3rd Street Boxing Gym</h1>
      <p className="mt-4 text-lg text-gray-700">{message}</p>
      <p className="mt-2 text-sm text-gray-500">
        Edit <code className="font-mono">src/App.tsx</code> and save to test HMR.
      </p>
    </main>
  );
}
