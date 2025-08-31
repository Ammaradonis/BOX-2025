import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import {
  Menu,
  X,
  ChevronDown,
  Calendar,
  Users,
  Trophy,
  Zap,
  Target,
  Dumbbell,
  Clock,
  MapPin,
} from 'lucide-react';

// TypeScript Interfaces
interface DropdownItem {
  name: string;
  key: string;
  type: string;
}

interface NavigationItem {
  name: string;
  key: string;
  icon: React.ReactNode;
  dropdown?: DropdownItem[];
}

interface HeaderProps {
  onNavigate?: (page: string) => void;
  currentUser?: { name: string } | null;
  onSignOut?: () => void;
}

// Custom Hook for Focus Trap
function useFocusTrap(active: boolean) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !menuRef.current) return;

    const focusableElements = menuRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active]);

  return menuRef;
}

// Custom Hook for Debounce (Optional for Hover)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function Header({ onNavigate, currentUser, onSignOut }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<string>('');
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState<Record<string, boolean>>({});
  const menuRef = useFocusTrap(isMenuOpen);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle Outside Click and Esc Key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen('');
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
        setMobileDropdownOpen({});
      }
    };

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen('');
        setIsMenuOpen(false);
        setMobileDropdownOpen({});
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  const handleNavigation = (page: string, type?: string) => {
    if (onNavigate) {
      onNavigate(type ? `${page}?type=${type}` : page);
    }
    setIsMenuOpen(false);
    setIsDropdownOpen('');
    setMobileDropdownOpen({});
  };

  const toggleDropdown = (dropdown: string) => {
    setIsDropdownOpen(isDropdownOpen === dropdown ? '' : dropdown);
  };

  const toggleMobileDropdown = (dropdown: string) => {
    setMobileDropdownOpen((prev) => ({
      ...prev,
      [dropdown]: !prev[dropdown],
    }));
  };

  const navigation: NavigationItem[] = [
    {
      name: 'Home',
      key: 'home',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      name: 'Classes',
      key: 'classes',
      icon: <Users className="w-4 h-4" />,
      dropdown: [
        { name: 'Beginner (Fog Cutter)', key: 'classes', type: 'beginner' },
        { name: 'Intermediate (Bay Bridger)', key: 'classes', type: 'intermediate' },
        { name: 'Advanced (Twin Peaks Climber)', key: 'classes', type: 'advanced' },
        { name: 'Youth (Future Champs)', key: 'classes', type: 'youth' },
        { name: 'Sparring (Fog City Fights)', key: 'classes', type: 'sparring' },
      ],
    },
    {
      name: 'Academy',
      key: 'academy',
      icon: <Trophy className="w-4 h-4" />,
    },
    {
      name: 'Bootcamp',
      key: 'bootcamp',
      icon: <Zap className="w-4 h-4" />,
      dropdown: [
        { name: 'Sea Cliff Smasher', key: 'bootcamp', type: 'sea-cliff' },
        { name: 'Mission Mayhem', key: 'bootcamp', type: 'mission' },
      ],
    },
    {
      name: 'Personal Training',
      key: 'personal-training',
      icon: <Target className="w-4 h-4" />,
    },
    {
      name: 'Youth',
      key: 'youth',
      icon: <Users className="w-4 h-4" />,
    },
    {
      name: 'Facilities',
      key: 'facilities',
      icon: <Dumbbell className="w-4 h-4" />,
    },
    {
      name: 'Schedule',
      key: 'schedule',
      icon: <Clock className="w-4 h-4" />,
    },
  ];

  return (
    <header
      role="banner"
      aria-label="Main navigation"
      className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-accent text-accent-foreground px-4 py-2 rounded-md z-50"
      >
        Skip to content
      </a>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => handleNavigation('home')}
            role="button"
            tabIndex={0}
            aria-label="3rd Street Boxing Gym - Home"
            onKeyDown={(e) => e.key === 'Enter' && handleNavigation('home')}
          >
            <div className="relative">
              <svg
                width="60"
                height="40"
                viewBox="0 0 60 40"
                className="group-hover:scale-105 transition-transform duration-200"
                aria-hidden="true"
              >
                <path
                  d="M5 25 L15 15 L25 25 L35 15 L45 25 L55 15"
                  stroke="#D92229"
                  strokeWidth="3"
                  fill="none"
                />
                <rect x="14" y="15" width="2" height="15" fill="#D92229" />
                <rect x="34" y="15" width="2" height="15" fill="#D92229" />
                <ellipse cx="30" cy="25" rx="8" ry="6" fill="#FDB515" />
                <ellipse cx="30" cy="20" rx="5" ry="4" fill="#FDB515" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">3rd Street Boxing</h1>
              <p className="text-sm text-secondary">Dogpatch's Fight Factory Since 2005</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center space-x-1">
            <ul role="menubar" className="flex items-center space-x-1">
              {navigation.map((item) => (
                <li key={item.key} role="none" className="relative" ref={item.dropdown ? dropdownRef : null}>
                  {item.dropdown ? (
                    <div className="relative">
                      <button
                        role="menuitem"
                        aria-haspopup="true"
                        aria-expanded={isDropdownOpen === item.key}
                        aria-controls={`dropdown-${item.key}`}
                        className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                        onClick={() => toggleDropdown(item.key)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleDropdown(item.key);
                          }
                          if (e.key === 'ArrowDown' && isDropdownOpen === item.key) {
                            e.preventDefault();
                            const firstSubItem = document.querySelector(
                              `#dropdown-${item.key} [role="menuitem"]`
                            ) as HTMLElement;
                            firstSubItem?.focus();
                          }
                        }}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {isDropdownOpen === item.key && (
                        <ul
                          id={`dropdown-${item.key}`}
                          role="menu"
                          aria-label={`${item.name} submenu`}
                          className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50 transition-all duration-200 ease-in-out opacity-0 animate-[fadeIn_200ms_ease-in-out_forwards]"
                        >
                          {item.dropdown.map((subItem, index) => (
                            <li key={subItem.name} role="none">
                              <button
                                role="menuitem"
                                tabIndex={0}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50"
                                onClick={() => handleNavigation(subItem.key, subItem.type)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleNavigation(subItem.key, subItem.type);
                                  }
                                  if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    const nextItem = document.querySelector(
                                      `#dropdown-${item.key} [role="menuitem"]:nth-child(${index + 2})`
                                    ) as HTMLElement;
                                    nextItem?.focus();
                                  }
                                  if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    if (index === 0) {
                                      const parentButton = document.querySelector(
                                        `[aria-controls="dropdown-${item.key}"]`
                                      ) as HTMLElement;
                                      parentButton?.focus();
                                    } else {
                                      const prevItem = document.querySelector(
                                        `#dropdown-${item.key} [role="menuitem"]:nth-child(${index})`
                                      ) as HTMLElement;
                                      prevItem?.focus();
                                    }
                                  }
                                }}
                              >
                                {subItem.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <button
                      role="menuitem"
                      className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                      onClick={() => handleNavigation(item.key)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleNavigation(item.key);
                        }
                      }}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* CTAs and User Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            <Button
              variant="default"
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 animate-pulse"
              onClick={() => handleNavigation('book-intro')}
            >
              FREE Intro Class
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-secondary text-secondary hover:bg-secondary hover:text-white"
              onClick={() => handleNavigation('facilities')}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Book Open Gym
            </Button>
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Hey, {currentUser.name}!</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSignOut}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('login')}
                className="text-secondary hover:text-secondary/80"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav
            ref={menuRef}
            aria-label="Mobile navigation"
            className="lg:hidden py-4 border-t border-gray-200"
          >
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.key}>
                  {item.dropdown ? (
                    <>
                      <button
                        className="w-full flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                        onClick={() => toggleMobileDropdown(item.key)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleMobileDropdown(item.key);
                          }
                        }}
                        aria-expanded={mobileDropdownOpen[item.key] || false}
                        aria-controls={`mobile-dropdown-${item.key}`}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            mobileDropdownOpen[item.key] ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {mobileDropdownOpen[item.key] && (
                        <ul
                          id={`mobile-dropdown-${item.key}`}
                          className="ml-8 mt-2 space-y-1 transition-all duration-200 ease-in-out"
                        >
                          {item.dropdown.map((subItem) => (
                            <li key={subItem.name}>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                                onClick={() => handleNavigation(subItem.key, subItem.type)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleNavigation(subItem.key, subItem.type);
                                  }
                                }}
                              >
                                {subItem.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <button
                      className="w-full flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                      onClick={() => handleNavigation(item.key)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleNavigation(item.key);
                        }
                      }}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </button>
                  )}
                </li>
              ))}
              <li className="pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white justify-center"
                    onClick={() => handleNavigation('book-intro')}
                  >
                    FREE Intro Class
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-secondary text-secondary hover:bg-secondary hover:text-white justify-center"
                    onClick={() => handleNavigation('facilities')}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Open Gym
                  </Button>
                  {currentUser ? (
                    <div className="pt-2">
                      <p歪 p className="text-sm text-gray-700 mb-2">Hey, {currentUser.name}!</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSignOut}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      className="w-full text-secondary hover:text-secondary/80 justify-center"
                      onClick={() => handleNavigation('login')}
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* Tailwind Animation Keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
}