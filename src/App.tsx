import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { ClassesPage } from './components/ClassesPage';
import { AcademyPage } from './components/AcademyPage';
import { BootcampPage } from './components/BootcampPage';
import { PersonalTrainingPage } from './components/PersonalTrainingPage';
import { YouthBoxingPage } from './components/YouthBoxingPage';
import { FacilitiesPage } from './components/FacilitiesPage';
import { SchedulePage } from './components/SchedulePage';
import { ContactPage } from './components/ContactPage';
import { AuthModal } from './components/AuthModal';
import { BookingModal } from './components/BookingModal';
import { Toaster } from './components/ui/sonner';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (event === 'SIGNED_IN') {
          setShowAuthModal(false);
        }
      }
    );

    // Initialize backend data on first load
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/init`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    }).catch(error => {
      console.log('Backend init failed, but app will continue:', error);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
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
      case 'home':
        return <HomePage onNavigate={handleNavigation} onBookClass={handleBookClass} />;
      case 'classes':
        return <ClassesPage onBookClass={handleBookClass} />;
      case 'academy':
        return <AcademyPage onBookClass={handleBookClass} />;
      case 'bootcamp':
        return <BootcampPage onBookClass={handleBookClass} />;
      case 'personal-training':
        return <PersonalTrainingPage onBookClass={handleBookClass} />;
      case 'youth':
        return <YouthBoxingPage onBookClass={handleBookClass} />;
      case 'facilities':
        return <FacilitiesPage onBookClass={handleBookClass} />;
      case 'schedule':
        return <SchedulePage onBookClass={handleBookClass} />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage onNavigate={handleNavigation} onBookClass={handleBookClass} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="skip-link"
        aria-label="Skip to main content"
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
        className="pt-20" // Account for fixed header
      >
        {renderCurrentPage()}
      </main>
      
      <Footer onNavigate={handleNavigation} />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          supabase={supabase}
        />
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