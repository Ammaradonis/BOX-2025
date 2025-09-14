// src/App.tsx
import React, { useState } from "react";
import { HomePage } from "./components/HomePage";
import { AcademyPage } from "./components/AcademyPage";
import { BootcampPage } from "./components/BootcampPage";
import { PersonalTrainingPage } from "./components/PersonalTrainingPage";
import { YouthBoxingPage } from "./components/YouthBoxingPage";
import { FacilitiesPage } from "./components/FacilitiesPage";
import SchedulePage from "./components/SchedulePage";
import ContactPage from "./components/ContactPage";
import { Toaster } from "./ui/sonner";
import { projectId, publicAnonKey } from "./utils/supabase/info";

function App() {
  const [page, setPage] = useState("home");

  const renderPage = () => {
    switch (page) {
      case "academy":
        return <AcademyPage />;
      case "bootcamp":
        return <BootcampPage />;
      case "personal":
        return <PersonalTrainingPage />;
      case "youth":
        return <YouthBoxingPage />;
      case "facilities":
        return <FacilitiesPage />;
      case "schedule":
        return <SchedulePage />;
      case "contact":
        return <ContactPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div>
      {/* Simple nav for swapping pages */}
      <nav className="flex gap-4 p-4 bg-gray-900 text-white">
        <button onClick={() => setPage("home")}>Home</button>
        <button onClick={() => setPage("academy")}>Academy</button>
        <button onClick={() => setPage("bootcamp")}>Bootcamp</button>
        <button onClick={() => setPage("personal")}>Personal Training</button>
        <button onClick={() => setPage("youth")}>Youth Boxing</button>
        <button onClick={() => setPage("facilities")}>Facilities</button>
        <button onClick={() => setPage("schedule")}>Schedule</button>
        <button onClick={() => setPage("contact")}>Contact</button>
      </nav>

      {renderPage()}

      <Toaster />
    </div>
  );
}

export default App;
