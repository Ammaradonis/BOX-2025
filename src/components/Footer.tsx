import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Instagram, 
  ExternalLink,
  Shield,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom for navigation

interface FooterProps {
  onNewsletterSignup?: (email: string) => Promise<void>;
}

export function Footer({ onNewsletterSignup }: FooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Reset submit message after 5 seconds
  useEffect(() => {
    if (submitMessage) {
      const timer = setTimeout(() => setSubmitMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [submitMessage]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setSubmitMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onNewsletterSignup) {
        await onNewsletterSignup(newsletterEmail);
        setSubmitMessage('Successfully subscribed! Welcome to the 3rd Street family.');
        setNewsletterEmail('');
      }
    } catch (error) {
      setSubmitMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Classes', path: '/classes' },
    { name: 'Academy', path: '/academy' },
    { name: 'Bootcamp', path: '/bootcamp' },
    { name: 'Personal Training', path: '/personal-training' },
    { name: 'Youth Boxing', path: '/youth' },
    { name: 'Facilities', path: '/facilities' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Contact', path: '/contact' }
  ];

  const localSeoKeywords = [
    'Best Boxing Gym San Francisco',
    'Dogpatch Fitness',
    'Bay Area Boxing Classes', 
    'SF Youth Boxing',
    'Personal Training Mission Bay',
    'Golden Gate Boxing',
    'SoMa Boxing Gym',
    'Mission District Training'
  ];

  return (
    <footer 
      role="contentinfo" 
      aria-label="Business information"
      className="bg-gray-900 text-white"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Contact Information */}
          <div className="space-y-6" role="region" aria-label="Contact information">
            <h3 className="text-xl font-semibold mb-4 text-accent">
              Our Corner of the City
            </h3>
            
            <address className="not-italic space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium">2576 3rd Street</p>
                  <p className="text-gray-300">Between 22nd & 23rd</p>
                  <p className="text-gray-300">Dogpatch, San Francisco, CA 94107</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-accent flex-shrink-0" aria-hidden="true" />
                <a 
                  href="tel:+14155508260"
                  className="hover:text-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
                  aria-label="Call us at (415) 550-8260"
                >
                  (415) 550-8260
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-accent flex-shrink-0" aria-hidden="true" />
                <a 
                  href="mailto:info@3rdstreetboxing.com"
                  className="hover:text-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
                  aria-label="Email us at info@3rdstreetboxing.com"
                >
                  info@3rdstreetboxing.com
                </a>
              </div>
            </address>

            <div className="flex items-start space-x-3" aria-label="Business hours">
              <Clock className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium mb-1">Open Daily:</p>
                <p className="text-gray-300">Mon-Fri: 5AM–10PM</p>
                <p className="text-gray-300">Sat-Sun: 7AM–8PM</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6" role="region" aria-label="Quick links">
            <h3 className="text-xl font-semibold mb-4 text-accent">Navigate</h3>
            <ul role="menu" className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path} role="none">
                  <Link
                    to={link.path}
                    role="menuitem"
                    className="text-gray-300 hover:text-white focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Local SEO & Trust Badges */}
          <div className="space-y-6" role="region" aria-label="Local keywords and badges">
            <h3 className="text-xl font-semibold mb-4 text-accent">SF's Boxing Hub</h3>
            
            <ul className="space-y-2" aria-label="Local search keywords">
              {localSeoKeywords.map((keyword, index) => (
                <li 
                  key={index}
                  className="inline-block text-sm text-gray-400 mr-2 mb-1 px-2 py-1 bg-gray-800 rounded-md"
                >
                  {keyword}
                </li>
              ))}
            </ul>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-accent" aria-label="Rated A+ by Better Business Bureau">
                  <Shield className="w-5 h-5" aria-hidden="true" />
                  <span className="text-sm font-medium">BBB A+ Rating</span>
                </div>
                <div className="flex items-center space-x-1 text-accent" aria-label="Five star rating on Yelp">
                  <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                  <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                  <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                  <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                  <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span className="text-sm ml-1">Yelp</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-400">
                "SF Weekly Best Gym 2024" | "As Seen In SF Chronicle"
              </p>
            </div>

            {/* Social Media */}
            <div className="flex items-center space-x-4">
              <a
                href="https://www.facebook.com/3rdstreetboxing"
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Follow us on Facebook"
                className="text-gray-400 hover:text-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://www.instagram.com/3rdstreetboxing"
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Follow us on Instagram"
                className="text-gray-400 hover:text-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://www.yelp.com/biz/3rd-street-boxing-gym-san-francisco"
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Read our Yelp reviews"
                className="text-gray-400 hover:text-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
              >
                <ExternalLink className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-6" role="region" aria-label="Newsletter signup">
            <h3 className="text-xl font-semibold mb-4 text-accent">Stay in the Ring</h3>
            
            <p className="text-gray-300 text-sm">
              Get updates on classes, events, and exclusive SF boxing tips.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div>
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address for newsletter
                </label>
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder="Your email (like Willie Mays deserves)"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-accent focus:ring-accent"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent hover:bg-accent/90 text-black font-medium focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-live="polite"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Subscribing...
                  </span>
                ) : (
                  'Subscribe'
                )}
              </Button>
              
              {submitMessage && (
                <p 
                  className={`text-sm ${
                    submitMessage.toLowerCase().includes('success') ? 'text-green-400' : 'text-red-400'
                  }`}
                  role="alert"
                  aria-live="assertive"
                >
                  {submitMessage}
                </p>
              )}
            </form>

            <p className="text-xs text-gray-400">
              We respect your privacy. 
              <Link
                to="/privacy"
                className="text-accent hover:text-accent/80 underline focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
              <p>&copy; 2025 3rd Street Boxing Gym. All rights reserved.</p>
              <Link
                to="/accessibility"
                className="text-accent hover:text-accent/80 focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                WCAG 2.1 AA Compliant
              </Link>
            </div>
            
            <div className="text-sm text-gray-500">
              Made by Ammar Alkheder
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}