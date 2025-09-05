import React, { useState } from 'react';
import { Menu, X, MapPin, Users, BookOpen, Leaf, Shield, User, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Page } from '../App';

interface User {
  id: number;
  role: string;  // 'admin', 'guide', 'traveler'
  email: string;
  name: string;
  phone?: string;
}

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'Home', path: '/', page: 'home' as Page, icon: null },
    { name: 'Travel Blog', path: '/blog', page: 'blog' as Page, icon: BookOpen },
    { name: 'Carbon Calculator', path: '/carbon', page: 'carbon' as Page, icon: Leaf },
    { name: 'Emergency', path: '/emergency', page: 'emergency' as Page, icon: Shield },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'traveler': return 'bg-sky-600';
      case 'guide': return 'bg-orange-600';
      case 'restaurant_owner': return 'bg-purple-600';
      case 'hotel_owner': return 'bg-emerald-600';
      default: return 'bg-gray-600';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'traveler': return 'Traveler';
      case 'guide': return 'Guide';
      case 'restaurant_owner': return 'Restaurant Owner';
      case 'hotel_owner': return 'Hotel Owner';
      default: return 'User';
    }
  };

  const handleNavigation = (path: string, page: Page) => {
    navigate(path);
    onNavigate(page);
  };

  const isActivePage = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-sky-600 hover:text-sky-700 transition-colors"
            >
              Trip Mosaic
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path, item.page)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePage(item.path)
                      ? 'text-sky-600 bg-sky-50'
                      : 'text-gray-700 hover:text-sky-600 hover:bg-gray-50'
                  }`}
                >
                  {Icon && <Icon size={16} />}
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* User Menu / Login Button */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-8 h-8 ${getRoleColor(user.role)} rounded-full flex items-center justify-center`}>
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{getRoleLabel(user.role)}</div>
                  </div>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    
                    {/* Destinations - Available to all users */}
                    <Link
                      to="/explorer"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Destinations</span>
                    </Link>
                    
                    {/* Travel Buddy - Only for travelers */}
                    {user.role === 'traveler' && (
                      <Link
                        to="/buddy"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Users className="w-4 h-4" />
                        <span>Travel Buddy</span>
                      </Link>
                    )}
                    
                    {/* Dashboard Access */}
                    <div className="border-t border-gray-100 pt-2 mt-2">
                      <div className="px-4 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Dashboard
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin-dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <span className="w-4 h-4">⚡</span>
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      {user.role === 'guide' && (
                        <Link
                          to="/guide-dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <span className="w-4 h-4">🗺️</span>
                          <span>Guide Dashboard</span>
                        </Link>
                      )}
                      {user.role === 'traveler' && (
                        <Link
                          to="/traveler-dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <span className="w-4 h-4">🌍</span>
                          <span>Traveler Dashboard</span>
                        </Link>
                      )}
                      {user.role === 'restaurant_owner' && (
                        <Link
                          to="/restaurant-dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <span className="w-4 h-4">🍽️</span>
                          <span>Restaurant Dashboard</span>
                        </Link>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        onLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/signin"
                className="bg-sky-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      handleNavigation(item.path, item.page);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActivePage(item.path)
                        ? 'text-sky-600 bg-sky-50'
                        : 'text-gray-700 hover:text-sky-600 hover:bg-gray-50'
                    }`}
                  >
                    {Icon && <Icon size={16} />}
                    <span>{item.name}</span>
                  </button>
                );
              })}
              
              {/* Mobile User Menu */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 ${getRoleColor(user.role)} rounded-full flex items-center justify-center`}>
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{getRoleLabel(user.role)}</div>
                        </div>
                      </div>
                    </div>
                    {/* Destinations - Available to all users */}
                    <Link
                      to="/explorer"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Destinations</span>
                    </Link>
                    
                    {/* Travel Buddy - Only for travelers */}
                    {user.role === 'traveler' && (
                      <Link
                        to="/buddy"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Users className="w-4 h-4" />
                        <span>Travel Buddy</span>
                      </Link>
                    )}
                    
                    {/* Dashboard Access */}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Dashboard
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin-dashboard"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <span className="w-4 h-4">⚡</span>
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      {user.role === 'guide' && (
                        <Link
                          to="/guide-dashboard"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <span className="w-4 h-4">🗺️</span>
                          <span>Guide Dashboard</span>
                        </Link>
                      )}
                      {user.role === 'traveler' && (
                        <Link
                          to="/traveler-dashboard"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <span className="w-4 h-4">🌍</span>
                          <span>Traveler Dashboard</span>
                        </Link>
                      )}
                      {user.role === 'restaurant_owner' && (
                        <Link
                          to="/restaurant-dashboard"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <span className="w-4 h-4">🍽️</span>
                          <span>Restaurant Dashboard</span>
                        </Link>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        onLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/signin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full bg-sky-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;