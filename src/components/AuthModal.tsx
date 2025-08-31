import React, { useState } from 'react';
import { DialogContent } from '@radix-ui/react-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { supabase } from '@/utils/supabase'; // Assuming supabase client is imported from utils

interface AuthModalProps {
  onClose: () => void;
  onAuthSuccess: (userData: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onAuthSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  const RATE_LIMIT_MS = 1000; // 1 second between submissions

  const projectId = new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0]; // Derive projectId from env

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      const parts = [];
      if (match[1]) parts.push(`(${match[1]}`);
      if (match[2]) parts.push(`) ${match[2]}`);
      if (match[3]) parts.push(`-${match[3]}`);
      return parts.join('');
    }
    return phone;
  };

  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 || cleaned.length === 0; // Allow empty phone (optional)
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 'Weak', color: 'text-red-500' };
    if (password.length < 10 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { strength: 'Medium', color: 'text-yellow-500' };
    }
    return { strength: 'Strong', color: 'text-green-500' };
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_MS) {
      setError('Please wait a moment before trying again');
      return;
    }
    setLastSubmitTime(now);
    setIsLoading(true);
    setError('');

    if (!validateEmail(loginForm.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) throw error;

      if (data.session) {
        try {
          const profileResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/profile`,
            {
              headers: {
                Authorization: `Bearer ${data.session.access_token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (!profileResponse.ok) {
            throw new Error('Failed to fetch user profile');
          }

          const profileData = await profileResponse.json();
          onAuthSuccess({
            ...data.user,
            profile: profileData.profile,
            accessToken: data.session.access_token,
          });
        } catch (profileError: any) {
          console.error('Profile fetch error:', profileError);
          // Fallback to basic user data if profile fetch fails
          onAuthSuccess({
            ...data.user,
            accessToken: data.session.access_token,
          });
        }
        onClose();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(`Login failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_MS) {
      setError('Please wait a moment before trying again');
      return;
    }
    setLastSubmitTime(now);
    setIsLoading(true);
    setError('');

    if (!validateEmail(signupForm.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (!validatePhoneNumber(signupForm.phone)) {
      setError('Please enter a valid 10-digit phone number or leave it blank');
      setIsLoading(false);
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          data: {
            full_name: signupForm.name,
            phone: signupForm.phone.replace(/\D/g, ''), // Store cleaned phone
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        // Fetch profile or handle similarly to login
        try {
          const profileResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-9c83b899/profile`,
            {
              headers: {
                Authorization: `Bearer ${data.session.access_token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (!profileResponse.ok) {
            throw new Error('Failed to fetch user profile');
          }

          const profileData = await profileResponse.json();
          onAuthSuccess({
            ...data.user,
            profile: profileData.profile,
            accessToken: data.session.access_token,
          });
        } catch (profileError: any) {
          console.error('Profile fetch error:', profileError);
          onAuthSuccess({
            ...data.user,
            accessToken: data.session.access_token,
          });
        }
        onClose();
      } else {
        setError('Check your email for verification link');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(`Signup failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!loginForm.email) {
      setError('Please enter your email to reset your password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginForm.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setError('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(`Password reset failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      // Redirect handled by Supabase
    } catch (error: any) {
      console.error('Google login error:', error);
      setError(`Google login failed: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md relative">
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <Tabs defaultValue="login" className="relative">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login" className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.02.68-2.33 1.09-3.71 1.09-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>
          <div className="text-center text-sm text-gray-500">
            Forgot your password?{' '}
            <button
              type="button"
              className="text-primary hover:text-primary/80 font-medium"
              onClick={handlePasswordReset}
              disabled={isLoading}
            >
              Reset it here
            </button>
          </div>
        </TabsContent>
        <TabsContent value="signup" className="space-y-4">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Your full name"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-phone">Phone (optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="signup-phone"
                  type="tel"
                  placeholder="(415) 555-0123"
                  value={signupForm.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setSignupForm((prev) => ({ ...prev, phone: formatted }));
                  }}
                  className="pl-10"
                  disabled={isLoading}
                  autoComplete="tel"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Strong password (6+ characters)"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {signupForm.password && (
                <div className={`text-sm ${getPasswordStrength(signupForm.password).color}`}>
                  Password Strength: {getPasswordStrength(signupForm.password).strength}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="signup-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={signupForm.confirmPassword}
                  onChange={(e) => setSignupForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </form>
        </TabsContent>
      </Tabs>
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </DialogContent>
  );
};

export default AuthModal;