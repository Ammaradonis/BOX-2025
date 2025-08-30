import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageSquare, 
  Send,
  Shield,
  Star,
  Navigation
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Contact form error:', error);
      setFormStatus('error');
      setErrorMessage(error.message || 'Failed to send message');
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Our Dogpatch Location',
      details: [
        '2576 3rd Street',
        'Between 22nd & 23rd Streets',
        'Dogpatch, San Francisco, CA 94107'
      ],
      action: 'Get Directions',
      link: 'https://maps.google.com/?q=2576+3rd+Street+San+Francisco+CA'
    },
    {
      icon: Phone,
      title: 'Call or Text Us',
      details: [
        '(415) 550-8269',
        'Available during business hours',
        'Quick response guaranteed'
      ],
      action: 'Call Now',
      link: 'tel:+14155508269'
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: [
        'info@3rdstreetboxing.com',
        'Response within 24 hours',
        'All inquiries welcome'
      ],
      action: 'Send Email',
      link: 'mailto:info@3rdstreetboxing.com'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: [
        'Mon-Fri: 5:00 AM - 10:00 PM',
        'Sat-Sun: 7:00 AM - 8:00 PM',
        'Holiday hours may vary'
      ],
      action: 'View Schedule',
      link: '/schedule'
    }
  ];

  const trustBadges = [
    {
      icon: Shield,
      title: 'BBB A+ Rating',
      description: 'Accredited Business since 2005'
    },
    {
      icon: Star,
      title: 'Yelp 5-Star Rating',
      description: '200+ positive reviews'
    },
    {
      icon: MessageSquare,
      title: 'Featured in SF Chronicle',
      description: "SF's premier boxing destination"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            GET IN TOUCH
          </h1>
          <p className="text-xl text-red-100 max-w-3xl mx-auto">
            Ready to start your boxing journey? We're here to answer questions and help you find your perfect training program.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* Contact Form */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send Us a Message
              </h2>
              
              {formStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="text-green-600 mb-4">
                    <MessageSquare size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Thanks for reaching out! We'll get back to you within 24 hours.
                  </p>
                  <p className="text-sm text-gray-500 italic">
                    Time to lace up those gloves! 🥊
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Like 'Willie Mays' deserves"
                        disabled={formStatus === 'loading'}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@sf.com"
                        disabled={formStatus === 'loading'}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(415) XXX-XXXX"
                      disabled={formStatus === 'loading'}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your boxing goals, experience level, or any questions you have..."
                      disabled={formStatus === 'loading'}
                      className="w-full resize-none"
                    />
                  </div>
                  
                  {formStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-600">
                        Whoa! That submission's shakier than a Lombard Street descent. {errorMessage}
                      </p>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={formStatus === 'loading'}
                    className="btn btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formStatus === 'loading' ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending Message...</span>
                      </div>
                    ) : (
                      <>
                        <Send size={20} className="mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Contact Information
              </h2>
              
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-start space-x-4">
                      <div className="bg-red-100 text-red-600 p-3 rounded-lg">
                        <info.icon size={24} />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {info.title}
                        </h3>
                        
                        <div className="space-y-1 mb-3">
                          {info.details.map((detail, detailIndex) => (
                            <p key={detailIndex} className="text-gray-600 text-sm">
                              {detail}
                            </p>
                          ))}
                        </div>
                        
                        <a
                          href={info.link}
                          target={info.link.startsWith('http') ? '_blank' : undefined}
                          rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-red-600 hover:text-red-700 font-medium text-sm inline-flex items-center"
                        >
                          {info.action}
                          <Navigation size={14} className="ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Why Choose 3rd Street Boxing?
              </h3>
              
              <div className="space-y-4">
                {trustBadges.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-white rounded-lg p-4 shadow-sm">
                    <badge.icon size={20} className="text-yellow-500 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">{badge.title}</div>
                      <div className="text-sm text-gray-600">{badge.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Find Us in Dogpatch
            </h2>
            <p className="text-lg text-gray-600">
              Located in the heart of San Francisco's historic Dogpatch neighborhood
            </p>
          </div>
          
          {/* Embedded Map Placeholder */}
          <div className="bg-gray-200 rounded-xl h-96 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin size={48} className="mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
              <p className="text-sm mb-4">
                Map showing 3rd Street Boxing Gym location in Dogpatch, San Francisco
              </p>
              <a
                href="https://maps.google.com/?q=2576+3rd+Street+San+Francisco+CA"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                View on Google Maps
              </a>
            </div>
          </div>
          
          {/* Neighborhood Info */}
          <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Public Transit</h4>
              <p className="text-sm text-gray-600">
                T-Third Line, 22-Fillmore, 48-Quintara/24th Street buses nearby
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Parking</h4>
              <p className="text-sm text-gray-600">
                Street parking available. Bike racks at gym entrance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Neighborhood</h4>
              <p className="text-sm text-gray-600">
                Historic Dogpatch - near waterfront, cafes, and local businesses
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SF Flavor Footer */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 italic">
            "Questions faster than a cable car descent? We've got answers quicker than BART at rush hour!" 🌉
          </p>
        </div>
      </section>
    </div>
  );
}