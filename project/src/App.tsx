import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import ServicesOverview from './components/ServicesOverview';
import FeaturedDestinations from './components/FeaturedDestinations';
import Testimonials from './components/Testimonials';
import DestinationExplorer from './components/DestinationExplorer';
import DestinationDetail from './components/DestinationDetail';
import TravelBuddyFinder from './components/TravelBuddyFinder';
import TravelBlog from './components/TravelBlog';
import CarbonCalculator from './components/CarbonCalculator';
import EmergencyTools from './components/EmergencyTools';
import Footer from './components/Footer';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import TravelerDashboard from './components/TravelerDashboard';
import GuideDashboard from './components/GuideDashboard';
import AdminDashboard from './components/AdminDashboard';
import RestaurantOwnerDashboard from './components/RestaurantOwnerDashboard';
import HotelOwnerDashboard from './components/HotelOwnerDashboard';
import { getCurrentUser, isAuthenticated, signOut } from './services/api';

export type Page = 'home' | 'explorer' | 'destination' | 'buddy' | 'blog' | 'carbon' | 'emergency';

interface User {
  id: number;
  role: string;
  email: string;
  name: string;
  phone?: string;
}

// Inner component that can use useNavigate
function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = () => {
      if (isAuthenticated()) {
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Auto-redirect to appropriate dashboard after login (only once)
  useEffect(() => {
    if (user && !isLoading && !hasRedirected) {
      // Add a small delay to ensure user state is properly set
      const timer = setTimeout(() => {
        // Redirect to appropriate dashboard based on role using React Router
        switch (user.role) {
          case 'admin':
            navigate('/admin-dashboard');
            break;
          case 'guide':
            navigate('/guide-dashboard');
            break;
          case 'traveler':
            navigate('/traveler-dashboard');
            break;
          case 'restaurant_owner':
            navigate('/restaurant-dashboard');
            break;
          case 'hotel_owner':
            navigate('/hotel-dashboard');
            break;
          default:
            // For other roles, stay on home page
            break;
        }
        setHasRedirected(true); // Mark as redirected to prevent infinite loop
      }, 100); // 100ms delay

      return () => clearTimeout(timer);
    }
  }, [user, isLoading, hasRedirected, navigate]);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    signOut();
    setUser(null);
    setCurrentPage('home');
    setHasRedirected(false); // Reset redirect flag for next login
  };

  const handleSignUp = (userData: User) => {
    setUser(userData);
  };

  // Protected Route component
  const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
    if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }
    
    if (!user) {
      return <Navigate to="/signin" replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
    
    return <>{children}</>;
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Main app with routing for all users (authenticated and unauthenticated)
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        user={user}
        onLogout={handleLogout}
      />
      
      <Routes>
        {/* Landing Page - Available to all users */}
        <Route path="/" element={
          <>
            <Hero onExplore={() => setCurrentPage('explorer')} />
            <ServicesOverview onExplore={() => setCurrentPage('explorer')} />
            <FeaturedDestinations onSelectDestination={(dest) => {
              setSelectedDestination(dest);
              setCurrentPage('destination');
            }} />
            <Testimonials />
          </>
        } />
        
        {/* Destinations - Available to all users */}
        <Route path="/explorer" element={
          <DestinationExplorer onSelectDestination={(dest) => {
            setSelectedDestination(dest);
            setCurrentPage('destination');
          }} />
        } />
        
        <Route path="/destination/:id" element={
          <DestinationDetail 
            destination={selectedDestination || ''} 
            onBack={() => setCurrentPage('explorer')} 
          />
        } />
        
        {/* Travel Blog - Available to all users */}
        <Route path="/blog" element={<TravelBlog />} />
        
        {/* Carbon Calculator - Available to all users */}
        <Route path="/carbon" element={<CarbonCalculator />} />
        
        {/* Emergency Tools - Available to all users */}
        <Route path="/emergency" element={<EmergencyTools />} />
        
        {/* Authentication Routes */}
        <Route path="/signup" element={<SignUp onSignUp={handleSignUp} />} />
        <Route path="/signin" element={<SignIn onSignIn={handleLogin} />} />
        
        {/* Travel Buddy - Only for travelers */}
        {user && user.role === 'traveler' && (
          <Route path="/buddy" element={<TravelBuddyFinder />} />
        )}
        
        {/* Dashboard Routes - Only for authenticated users */}
        {user && (
          <>
            {user.role === 'admin' && (
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            )}
            {user.role === 'guide' && (
              <Route path="/guide-dashboard" element={<GuideDashboard />} />
            )}
            {user.role === 'traveler' && (
              <Route path="/traveler-dashboard" element={<TravelerDashboard />} />
            )}
            {user.role === 'restaurant_owner' && (
              <Route path="/restaurant-dashboard" element={<RestaurantOwnerDashboard />} />
            )}
            {user.role === 'hotel_owner' && (
              <Route path="/hotel-dashboard" element={<HotelOwnerDashboard />} />
            )}
          </>
        )}
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;