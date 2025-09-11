import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle,
  Send,
  Loader2,
  CheckCircle,
  Star,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

// Environment variables should be set in Netlify dashboard
const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Form validation schema
const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().required('Email is required').email('Invalid email format'),
  phone: yup.string().matches(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, {
    message: 'Invalid phone number format (e.g., 123-456-7890)',
    excludeEmptyString: true
  }),
  subject: yup.string(),
  message: yup.string().required('Message is required').min(10, 'Message must be at least 10 characters')
}).required();

// Error Boundary Component
class ContactPageErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>
                  We're sorry, an error occurred. Please try again later or contact support at info@3rdstreetboxing.com
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

interface ContactPageProps {
  onNavigate?: (page: string) => void;
  currentUser?: any;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const ContactPage = React.memo(({ onNavigate, currentUser }: ContactPageProps) => {
  const [mapLoading, setMapLoading] = useState(true);
  const [submitMessage, setSubmitMessage] = useState('');

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: currentUser?.profile?.name || '',
      email: currentUser?.profile?.email || currentUser?.email || '',
      phone: currentUser?.profile?.phone || '',
      subject: '',
      message: ''
    }
  });

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setMapLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const onSubmit = useCallback(async (data: FormData) => {
    if (!projectId || !publicAnonKey) {
      setSubmitMessage('Configuration error. Please contact support.');
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/contact`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': window.location.origin // Ensure CORS compatibility
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to send message');
      }

      toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
      reset({
        name: currentUser?.profile?.name || '',
        email: currentUser?.profile?.email || currentUser?.email || '',
        phone: currentUser?.profile?.phone || '',
        subject: '',
        message: ''
      });
      setSubmitMessage('');
    } catch (error: any) {
      console.error('Contact form error:', error);
      setSubmitMessage(error.name === 'AbortError' ? 'Request timed out' : error.message || 'Failed to send message');
    } finally {
      clearTimeout(timeoutId);
    }
  }, [currentUser, reset]);

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" aria-hidden="true" />,
      title: 'Visit Our Gym',
      content: (
        <div>
          <p className="font-medium">2576 3rd Street</p>
          <p className="text-gray-600">Between 22nd & 23rd</p>
          <p className="text-gray-600">Dogpatch, San Francisco, CA 94107</p>
          <p className="text-sm text-gray-500 mt-2">
            Easy access via Muni T-Third or 22nd Street Caltrain
          </p>
        </div>
      )
    },
    {
      icon: <Phone className="w-6 h-6" aria-hidden="true" />,
      title: 'Call Us',
      content: (
        <div>
          <a 
            href="tel:+14155508260"
            className="font-medium text-primary hover:text-primary/80 transition-colors"
            aria-label="Call us at (415) 550-8260"
          >
            (415) 550-8260
          </a>
          <p className="text-gray-600 text-sm mt-1">
            Available during gym hours for immediate assistance
          </p>
        </div>
      )
    },
    {
      icon: <Mail className="w-6 h-6" aria-hidden="true" />,
      title: 'Email Us',
      content: (
        <div>
          <a 
            href="mailto:info@3rdstreetboxing.com"
            className="font-medium text-primary hover:text-primary/80 transition-colors"
            aria-label="Email us at info@3rdstreetboxing.com"
          >
            info@3rdstreetboxing.com
          </a>
          <p className="text-gray-600 text-sm mt-1">
            We respond to all emails within 24 hours
          </p>
        </div>
      )
    },
    {
      icon: <Clock className="w-6 h-6" aria-hidden="true" />,
      title: 'Gym Hours',
      content: (
        <div>
          <p className="font-medium">Monday - Friday: 5:00 AM - 10:00 PM</p>
          <p className="font-medium">Saturday - Sunday: 7:00 AM - 8:00 PM</p>
          <p className="text-gray-600 text-sm mt-1">
            Open all year except major holidays
          </p>
        </div>
      )
    }
  ];

  const faqs = [
    {
      question: 'Do I need experience to start boxing?',
      answer: 'Not at all! Our Beginner (Fog Cutter) classes are designed specifically for people with zero boxing experience. Our instructors will teach you proper form and technique from day one.'
    },
    {
      question: 'What should I bring to my first class?',
      answer: 'Just bring yourself, a water bottle, and a towel! We provide all boxing equipment including gloves, hand wraps, and protective gear. Wear comfortable athletic clothes and shoes.'
    },
    {
      question: 'How much does membership cost?',
      answer: 'We offer flexible membership options starting at $149/month for unlimited classes. New members get 50% off their first month! Personal training packages start at $85 per session.'
    },
    {
      question: 'Is there parking available?',
      answer: 'Yes! We have a small parking lot behind the gym, plus plenty of street parking in Dogpatch. The gym is also easily accessible by public transit via the T-Third line.'
    },
    {
      question: 'Do you offer youth programs?',
      answer: 'Absolutely! Our Youth Boxing program serves ages 6-17 with age-appropriate classes focused on fun, fitness, and character building. All youth instructors are background checked and CPR certified.'
    },
    {
      question: 'Can I try a class before committing?',
      answer: 'Yes! We offer a FREE intro class for new members. This gives you a chance to experience our training style and meet our community before making any commitment.'
    }
  ];

  return (
    <ContactPageErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                GET IN <span className="text-accent">TOUCH</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Ready to start your boxing journey? We're here to help every step of the way.
              </p>
              <div className="flex items-center justify-center space-x-6">
                <div className="flex items-center text-accent">
                  <Star className="w-5 h-5 fill-current mr-1" aria-hidden="true" />
                  <Star className="w-5 h-5 fill-current mr-1" aria-hidden="true" />
                  <Star className="w-5 h-5 fill-current mr-1" aria-hidden="true" />
                  <Star className="w-5 h-5 fill-current mr-1" aria-hidden="true" />
                  <Star className="w-5 h-5 fill-current mr-1" aria-hidden="true" />
                  <span className="ml-2 font-medium">5.0 on Yelp</span>
                </div>
                <div className="text-white/80">
                  Serving San Francisco since 2005
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information Cards */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {contactInfo.map((info, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="text-primary mb-4 flex justify-center">
                      {info.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      {info.title}
                    </h3>
                    <div className="text-sm text-gray-600">
                      {info.content}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary flex items-center">
                      <MessageCircle className="w-6 h-6 mr-2" aria-hidden="true" />
                      Send Us a Message
                    </CardTitle>
                    <p className="text-gray-600">
                      Have questions about our programs? Want to schedule a gym tour? 
                      Drop us a line and we'll get back to you faster than a BART train to the airport.
                    </p>
                  </CardHeader>
                  
                  <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            {...register('name')}
                            placeholder="Your name (like Willie Mays deserves)"
                            aria-invalid={errors.name ? 'true' : 'false'}
                          />
                          {errors.name && (
                            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            {...register('email')}
                            placeholder="your.email@gmail.com"
                            aria-invalid={errors.email ? 'true' : 'false'}
                          />
                          {errors.email && (
                            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone (Optional)</Label>
                          <Input
                            id="phone"
                            {...register('phone')}
                            placeholder="(415) 555-0123"
                            aria-invalid={errors.phone ? 'true' : 'false'}
                          />
                          {errors.phone && (
                            <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Controller
                            name="subject"
                            control={control}
                            render={({ field }) => (
                              <select
                                {...field}
                                id="subject"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                aria-invalid={errors.subject ? 'true' : 'false'}
                              >
                                <option value="">Select a topic</option>
                                {[
                                  'General Inquiry',
                                  'Class Information',
                                  'Membership Questions',
                                  'Personal Training',
                                  'Youth Programs',
                                  'Facilities Tour',
                                  'Partnership Opportunities',
                                  'Other'
                                ].map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            )}
                          />
                          {errors.subject && (
                            <p className="text-sm text-red-600 mt-1">{errors.subject.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          {...register('message')}
                          placeholder="Tell us how we can help you achieve your boxing goals..."
                          rows={5}
                          aria-invalid={errors.message ? 'true' : 'false'}
                        />
                        {errors.message && (
                          <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>
                        )}
                      </div>

                      {submitMessage && (
                        <Alert variant={submitMessage.includes('success') ? 'default' : 'destructive'}>
                          <AlertDescription>{submitMessage}</AlertDescription>
                        </Alert>
                      )}

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3"
                        aria-label="Send message"
                      >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                        <Send className="w-4 h-4 mr-2" aria-hidden="true" />
                        Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Map and Additional Info */}
              <div className="space-y-8">
                {/* Embedded Map */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      Find Us in Dogpatch
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                      {mapLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                          <Loader2 className="w-8 h-8 animate-spin text-gray-600" aria-label="Loading map" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                          <div className="text-center text-gray-600">
                            <MapPin className="w-12 h-12 mx-auto mb-2" aria-hidden="true" />
                            <p className="font-medium">Interactive Map</p>
                            <p className="text-sm">2576 3rd Street, San Francisco</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => window.open('https://maps.google.com/maps?q=2576+3rd+Street+San+Francisco+CA', '_blank')}
                              aria-label="Open location in Google Maps"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" aria-hidden="true" />
                              Open in Google Maps
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-600">
                      <p className="mb-2">
                        <strong>Public Transit:</strong> Take Muni T-Third to 23rd Street stop, 
                        or Caltrain to 22nd Street station (10-minute walk).
                      </p>
                      <p>
                        <strong>Parking:</strong> Free parking lot behind building, 
                        plus street parking available.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={() => onNavigate?.('schedule')}
                      className="w-full bg-primary hover:bg-primary/90 text-white justify-start"
                      aria-label="Book a free introductory class"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                      Book a Free Intro Class
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => onNavigate?.('facilities')}
                      className="w-full justify-start"
                      aria-label="Schedule a gym tour"
                    >
                      <MapPin className="w-4 h-4 mr-2" aria-hidden="true" />
                      Schedule a Gym Tour
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => window.open('tel:+14155508260')}
                      className="w-full justify-start"
                      aria-label="Call us at (415) 550-8260"
                    >
                      <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
                      Call Now: (415) 550-8260
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <p className="text-gray-600 mb-4">
                  Don't see your question answered?
                </p>
                <Button
                  onClick={() => document.getElementById('message')?.focus()}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  aria-label="Ask us any question"
                >
                  Ask Us Anything
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Join the 3rd Street Family?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Stop by anytime during gym hours for a tour, or book your free intro class today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => onNavigate?.('schedule')}
                className="bg-accent hover:bg-accent/90 text-black font-bold px-8 py-4"
                aria-label="Book your free introductory class"
              >
                Book Your Free Class
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.open('tel:+14155508260')}
                className="border-white text-white hover:bg-white hover:text-primary px-8 py-4"
                aria-label="Call us at (415) 550-8260"
              >
                <Phone className="w-5 h-5 mr-2" aria-hidden="true" />
                Call (415) 550-8260
              </Button>
            </div>
          </div>
        </section>
      </div>
    </ContactPageErrorBoundary>
  );
});

export default ContactPage;