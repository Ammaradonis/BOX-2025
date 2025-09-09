// src/App.tsx
import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { HomePage } from "./components/HomePage";
import ClassesPage from "./components/ClassesPage";
import { AcademyPage } from "./components/AcademyPage";
import BootcampPage from "./components/BootcampPage";
import PersonalTrainingPage from "./components/PersonalTrainingPage";
import YouthBoxingPage from "./components/YouthBoxingPage";
import FacilitiesPage from "./components/FacilitiesPage";
import SchedulePage from "./components/SchedulePage";
import ContactPage from "./components/ContactPage";
import AuthModal from "./components/AuthModal";
import BookingModal from "./components/BookingModal";
import { Toaster } from "./ui/sonner";
import { createClient, User } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "./utils/supabase/info";

// Supabase client instance
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) setUser(session?.user ?? null);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        setUser(session?.user ?? null);
        if (event === "SIGNED_IN") setShowAuthModal(false);
      }
    );

    // Initialize backend function (safe to fail silently)
    fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/init`,
      {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      }
    ).catch((error) => {
      console.warn("Backend init failed, continuing anyway:", error);
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBookClass = (classData: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setBookingData(classData);
    setShowBookingModal(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <HomePage onNavigate={handleNavigation} onBookClass={handleBookClass} />
        );
      case "classes":
        return <ClassesPage onBookClass={handleBookClass} />;
      case "academy":
        return <AcademyPage onBookClass={handleBookClass} />;
      case "bootcamp":
        return <BootcampPage onBookClass={handleBookClass} />;
      case "personal-training":
        return <PersonalTrainingPage onBookClass={handleBookClass} />;
      case "youth":
        return <YouthBoxingPage onBookClass={handleBookClass} />;
      case "facilities":
        return <FacilitiesPage onBookClass={handleBookClass} />;
      case "schedule":
        return <SchedulePage onBookClass={handleBookClass} />;
      case "contact":
        return <ContactPage />;
      default:
        return (
          <HomePage onNavigate={handleNavigation} onBookClass={handleBookClass} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Accessibility: skip link */}
      <a
        href="#main-content"
        className="skip-link absolute top-0 left-0 p-2 bg-white text-blue-600 z-50 focus:block"
      >
        Skip to content
      </a>

      <Header
        currentPage={currentPage}
        onNavigate={handleNavigation}
        user={user}
        onAuthClick={() => setShowAuthModal(true)}
        onSignOut={handleSignOut}
      />

      <main
        id="main-content"
        role="main"
        aria-label="Primary content"
        className="pt-20"
      >
        {renderCurrentPage()}
      </main>

      <Footer onNavigate={handleNavigation} />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} supabase={supabase} />
      )}

      {/* Booking Modal */}
      {showBookingModal && bookingData && (
        <BookingModal
          classData={bookingData}
          user={user}
          onClose={() => {
            setShowBookingModal(false);
            setBookingData(null);
          }}
        />
      )}

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}
