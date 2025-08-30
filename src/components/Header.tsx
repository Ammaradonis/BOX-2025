import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  Menu, 
  X, 
  ChevronDown, 
  Phone, 
  Calendar,
  Users,
  Trophy,
  Zap,
  Target,
  Dumbbell,
  Clock,
  MapPin
} from 'lucide-react';

interface HeaderProps {
  onNavigate?: (page: string) => void;
  currentUser?: any;
  onSignOut?: () => void;
}

export function Header({ onNavigate, currentUser, onSignOut }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState('');

  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
    setIsMenuOpen(false);
    setIsDropdownOpen('');
  };

  const toggleDropdown = (dropdown: string) => {
    setIsDropdownOpen(isDropdownOpen === dropdown ? '' : dropdown);
  };

  const navigation = [
    { 
      name: 'Home', 
      key: 'home',
      icon: <MapPin className="w-4 h-4" />
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
        { name: 'Sparring (Fog City Fights)', key: 'classes', type: 'sparring' }
      ]
    },
    {
      name: 'Academy',
      key: 'academy',
      icon: <Trophy className="w-4 h-4" />
    },
    {
      name: 'Bootcamp',
      key: 'bootcamp', 
      icon: <Zap className="w-4 h-4" />,
      dropdown: [
        { name: 'Sea Cliff Smasher', key: 'bootcamp', type: 'sea-cliff' },
        { name: 'Mission Mayhem', key: 'bootcamp', type: 'mission' }
      ]
    },
    {
      name: 'Personal Training',
      key: 'personal-training',
      icon: <Target className="w-4 h-4" />
    },
    {
      name: 'Youth',
      key: 'youth',
      icon: <Users className="w-4 h-4" />
    },
    {
      name: 'Facilities',
      key: 'facilities',
      icon: <Dumbbell className="w-4 h-4" />
    },
    {
      name: 'Schedule',
      key: 'schedule',
      icon: <Clock className="w-4 h-4" />
    }
  ];

  return (
    <header 
      role="banner" 
      aria-label="Main navigation"
      className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"
    >
      {/* Skip to content link for accessibility */}
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
              {/* Golden Gate Bridge with Boxing Glove Logo */}
              <svg
                width="60"
                height="40"
                viewBox="0 0 60 40"
                className="group-hover:scale-105 transition-transform duration-200"
                aria-hidden="true"
              >
                {/* Golden Gate Bridge */}
                <path
                  d="M5 25 L15 15 L25 25 L35 15 L45 25 L55 15"
                  stroke="#D92229"
                  strokeWidth="3"
                  fill="none"
                />
                <rect x="14" y="15" width="2" height="15" fill="#D92229" />
                <rect x="34" y="15" width="2" height="15" fill="#D92229" />
                
                {/* Boxing Glove Silhouette */}
                <ellipse cx="30" cy="25" rx="8" ry="6" fill="#FDB515" />
                <ellipse cx="30" cy="20" rx="5" ry="4" fill="#FDB515" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">
                3rd Street Boxing
              </h1>
              <p className="text-sm text-secondary">
                Dogpatch's Fight Factory Since 2005
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav 
            aria-label="Primary navigation"
            className="hidden lg:flex items-center space-x-1"
          >
            <ul role="menubar" className="flex items-center space-x-1">
              {navigation.map((item) => (
                <li key={item.key} role="none" className="relative">
                  {item.dropdown ? (
                    <div className="relative">
                      <button
                        role="menuitem"
                        aria-haspopup="true"
                        aria-expanded={isDropdownOpen === item.key}
                        className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                        onClick={() => toggleDropdown(item.key)}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      
                      {isDropdownOpen === item.key && (
                        <ul
                          role="menu"
                          aria-label={`${item.name} submenu`}
                          className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50"
                        >
                          {item.dropdown.map((subItem) => (
                            <li key={subItem.name} role="none">
                              <button
                                role="menuitem"
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50"
                                onClick={() => handleNavigation(subItem.key)}
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
                <span className="text-sm text-gray-700">
                  Hey, {currentUser.name}!
                </span>
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
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav 
            aria-label="Mobile navigation"
            className="lg:hidden py-4 border-t border-gray-200"
          >
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.key}>
                  <button
                    className="w-full flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                    onClick={() => handleNavigation(item.key)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </button>
                  
                  {item.dropdown && (
                    <ul className="ml-8 mt-2 space-y-1">
                      {item.dropdown.map((subItem) => (
                        <li key={subItem.name}>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                            onClick={() => handleNavigation(subItem.key)}
                          >
                            {subItem.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              
              {/* Mobile CTAs */}
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
                      <p className="text-sm text-gray-700 mb-2">
                        Hey, {currentUser.name}!
                      </p>
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
    </header>
  );
}