import React, { useState, useEffect, lazy, Suspense } from 'react';
import { getCurrentUser, signOut, getDestinations, getGuidesByDestination, getHotelsByDestination, getRestaurantsByDestination, getDestinationReviews, getTravelerBookings } from '../services/api';
import './TouristDashboard.css';
// Import only the icons we actually use to reduce bundle size
import { 
  MapPin, 
  Compass, 
  Users, 
  Star, 
  Calendar, 
  Globe, 
  BookOpen, 
  Camera, 
  Heart,
  Search,
  Mountain,
  Sparkles,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Building
} from 'lucide-react';

// Lazy load components for better performance
const DestinationDetailsModal = lazy(() => import('./DestinationDetailsModal'));

const TravelerDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [showDestinationDetails, setShowDestinationDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [destinationGuides, setDestinationGuides] = useState<any[]>([]);
  const [destinationHotels, setDestinationHotels] = useState<any[]>([]);
  const [destinationRestaurants, setDestinationRestaurants] = useState<any[]>([]);
  const [destinationReviewsData, setDestinationReviewsData] = useState<{[key: string]: any[]}>({});
  const [loadingDestinationReviews, setLoadingDestinationReviews] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  // Hotel booking states
  const [hotelBookings, setHotelBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'traveler') {
      setUser(currentUser);
      loadDestinations();
    } else {
      window.location.href = '/signin';
    }
  }, []);

  // Fetch reviews when destinations tab is opened or destinations change
  useEffect(() => {
    if (activeTab === 'destinations' && destinations.length > 0) {
      fetchAllDestinationReviews();
    }
  }, [activeTab, destinations]);

  const loadDestinations = async () => {
    try {
      setLoading(true);
      const destinationsData = await getDestinations();
      setDestinations(destinationsData);
    } catch (error) {
      console.error('Error loading destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    window.location.href = '/';
  };

  const handleDestinationSelect = async (destination: any) => {
    console.log('🎯 Destination selected:', destination);
    console.log('🔍 Destination ID type:', typeof destination.id, 'Value:', destination.id);
    setSelectedDestination(destination);
    setShowDestinationDetails(true);
    setLoadingServices(true);
    
    try {
      console.log('🔄 Fetching services for destination ID:', destination.id);
      
      // Ensure destination ID is a number
      const destinationId = parseInt(destination.id) || destination.id;
      console.log('🔍 Parsed destination ID:', destinationId, 'Type:', typeof destinationId);
      
      // Fetch real data for the selected destination
      const [guidesData, hotelsData, restaurantsData] = await Promise.all([
        getGuidesByDestination(destinationId),
        getHotelsByDestination(destinationId),
        getRestaurantsByDestination(destinationId)
      ]);
      
      console.log('📊 Fetched data:', {
        guides: guidesData,
        hotels: hotelsData,
        restaurants: restaurantsData
      });
      
      setDestinationGuides(guidesData || []);
      setDestinationHotels(hotelsData || []);
      setDestinationRestaurants(restaurantsData || []);
    } catch (error) {
      console.error('❌ Error loading destination services:', error);
      
      // Show more specific error information
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      
      // Set empty arrays on error
      setDestinationGuides([]);
      setDestinationHotels([]);
      setDestinationRestaurants([]);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleBackToExplore = () => {
    setShowDestinationDetails(false);
    setSelectedDestination(null);
    setDestinationGuides([]);
    setDestinationHotels([]);
    setDestinationRestaurants([]);
    // Don't clear destinationReviewsData as it's used for the destinations tab
  };

  const fetchAllDestinationReviews = async () => {
    if (!destinations || destinations.length === 0) return;
    
    setLoadingDestinationReviews(true);
    try {
      console.log('🔄 Fetching reviews for all destinations...');
      const reviewsPromises = destinations.map(async (destination) => {
        try {
          const reviews = await getDestinationReviews(destination.destination_id);
          return { destinationId: destination.destination_id, reviews: reviews || [] };
        } catch (error) {
          console.error(`❌ Error fetching reviews for ${destination.destination_id}:`, error);
          return { destinationId: destination.destination_id, reviews: [] };
        }
      });
      
      const reviewsResults = await Promise.all(reviewsPromises);
      const reviewsMap: {[key: string]: any[]} = {};
      
      reviewsResults.forEach(({ destinationId, reviews }) => {
        reviewsMap[destinationId] = reviews;
      });
      
      setDestinationReviewsData(reviewsMap);
      console.log('✅ Fetched reviews for all destinations:', reviewsMap);
    } catch (error) {
      console.error('❌ Error fetching all destination reviews:', error);
    } finally {
      setLoadingDestinationReviews(false);
    }
  };

  const getDestinationRating = (destination: any) => {
    const reviews = destinationReviewsData[destination.destination_id] || [];
    if (reviews.length === 0) {
      return destination.rating || 0.0;
    }
    
    const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    return Math.round(averageRating * 10) / 10;
  };

  const getDestinationReviewCount = (destination: any) => {
    const reviews = destinationReviewsData[destination.destination_id] || [];
    return reviews.length;
  };

  const loadHotelBookings = async () => {
    if (!user) return;
    
    setLoadingBookings(true);
    try {
      const bookings = await getTravelerBookings();
      setHotelBookings(bookings);
    } catch (error) {
      console.error('Error loading hotel bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Load data after user is set
  useEffect(() => {
    if (user) {
      loadDestinations();
      loadHotelBookings();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-emerald-300 to-green-400 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-orange-300 to-red-400 rounded-full opacity-20 animate-float-delayed"></div>
        <div className="absolute bottom-32 left-32 w-28 h-28 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full opacity-20 animate-float-slow"></div>
        
        {/* Floating Travel Icons */}
        <div className="absolute top-1/4 left-1/4 text-4xl opacity-10 animate-float">
          ✈️
        </div>
        <div className="absolute top-1/3 right-1/3 text-3xl opacity-10 animate-float-delayed">
          🌍
        </div>
        <div className="absolute bottom-1/4 right-1/4 text-5xl opacity-10 animate-float-slow">
          🗺️
        </div>
        
        {/* Ocean Waves Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-200 to-transparent opacity-30">
          <div className="wave-container">
            <div className="wave wave1"></div>
            <div className="wave wave2"></div>
            <div className="wave wave3"></div>
          </div>
        </div>
      </div>

      {/* Header with Glassmorphism */}
      <div className="relative z-10 bg-white/20 backdrop-blur-md shadow-2xl border border-white/30 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-4">
               <div className="relative">
                {/* Unique Travel Mosaic Pattern */}
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg transform rotate-12 animate-pulse"></div>
                  <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg transform -rotate-12 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg transform rotate-6 animate-pulse" style={{animationDelay: '1s'}}></div>
                  <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg transform -rotate-6 animate-pulse" style={{animationDelay: '1.5s'}}></div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-bounce opacity-80"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-indigo-400 rounded-full animate-bounce opacity-80" style={{animationDelay: '0.3s'}}></div>
                
                <p className="text-gray-600 text-sm font-medium">Your travel adventure awaits</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right text-gray-700">
                <p className="font-semibold">Welcome back, {user.name}!</p>
                <p className="text-sm text-gray-500">Ready for your next journey?</p>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-2 shadow-xl border border-white/20">
          <div className="flex space-x-2">
            {[
              { id: 'explore', label: 'Explore', icon: Compass, color: 'from-blue-500 to-cyan-500' },
              { id: 'destinations', label: 'Destinations', icon: MapPin, color: 'from-green-500 to-emerald-500' },
              { id: 'bookings', label: 'My Bookings', icon: BookOpen, color: 'from-indigo-500 to-purple-500' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'explore' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden animate-fade-in-up">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10">
                <h2 className="text-4xl font-bold mb-4 gradient-text">Discover Your Next Adventure</h2>
                <p className="text-xl mb-6 text-orange-100">From pristine beaches to majestic mountains, find your perfect destination</p>
                
              </div>
              
              {/* Floating Icons */}
              <div className="absolute top-4 right-8 text-6xl opacity-20 animate-float">
                🌍
              </div>
              <div className="absolute bottom-4 right-16 text-4xl opacity-20 animate-float-delayed">
                ✈️
              </div>
              <div className="absolute top-1/2 left-8 text-5xl opacity-15 animate-float-slow">
                🏔️
              </div>
            </div>

            {/* Quick Stats - Dynamic Data */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { icon: Globe, label: 'Destinations', value: '🌍', color: 'from-blue-500 to-cyan-500' },
                { icon: Users, label: 'Local Guides', value: '👥', color: 'from-green-500 to-emerald-500' },
                { icon: BookOpen, label: 'Hotels', value: '🏨', color: 'from-purple-500 to-pink-500' },
                { icon: Camera, label: 'Restaurants', value: '🍽️', color: 'from-orange-500 to-red-500' },
                { icon: Package, label: 'Local Products', value: '🛍️', color: 'from-teal-500 to-cyan-500' }
              ].map((stat, index) => (
                <div key={index} className={`bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover-lift animate-fade-in-up`} style={{animationDelay: `${index * 0.1}s`}}>
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4 mx-auto animate-pulse-glow`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</p>
                    <p className="text-gray-600">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            

            {/* Featured Destinations - Real Data */}
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20 animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Sparkles className="w-6 h-6 mr-2 text-purple-500 animate-pulse-glow" />
                  Featured Destinations
                </h3>
                <button 
                  onClick={() => setActiveTab('destinations')}
                  className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors duration-300"
                >
                  View All →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 {destinations.slice(0, 3).map((destination, index) => (
                   <div 
                     key={destination.id} 
                     className={`group cursor-pointer animate-fade-in-up interactive-card bg-white/80 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover-lift`} 
                     style={{animationDelay: `${index * 0.2}s`}}
                     onClick={() => handleDestinationSelect(destination)}
                   >
                                       <div className="w-full h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-xl mb-4 flex items-center justify-center group-hover:shadow-lg transition-all duration-300 overflow-hidden relative">
                     {destination.image ? (
                       <>
                         <img 
                           src={destination.image} 
                           alt={destination.name}
                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                           onError={(e) => {
                             const target = e.currentTarget as HTMLImageElement;
                             target.style.display = 'none';
                             const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                             if (fallback) fallback.style.display = 'flex';
                           }}
                         />
                         <Globe className="w-16 h-16 text-blue-600 hidden fallback-icon absolute inset-0 m-auto" />
                       </>
                     ) : (
                       <Globe className="w-16 h-16 text-blue-600" />
                     )}
                   </div>
                    <h4 className="font-semibold text-gray-800 mb-2">{destination.name}</h4>
                    <p className="text-gray-600 text-sm mb-3">{destination.city}, {destination.country}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{destination.rating || 'New'}</span>
                        {destination.reviews && (
                          <>
                            <span>•</span>
                            <span>{destination.reviews} reviews</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                        Featured
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personalized Recommendations */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 shadow-xl border border-blue-200 animate-scale-in">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Heart className="w-6 h-6 mr-2 text-red-500 animate-pulse-glow" />
                Recommended for You
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/80 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover-lift">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Mountain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Adventure Destinations</h4>
                      <p className="text-sm text-gray-600">Based on your preferences</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">Discover thrilling mountain adventures and outdoor experiences that match your adventurous spirit.</p>
                  <button 
                    onClick={() => setActiveTab('destinations')}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Explore Adventures
                  </button>
                </div>
                <div className="bg-white/80 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover-lift">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Cultural Destinations</h4>
                      <p className="text-sm text-gray-600">Immerse in local culture</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">Discover destinations rich in culture, history, and authentic local experiences.</p>
                  <button 
                    onClick={() => setActiveTab('destinations')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Explore Culture
                  </button>
                </div>
              </div>
            </div>

                         {/* Destination Details Modal */}
             <Suspense fallback={
               <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                 <div className="bg-white rounded-3xl p-8 flex items-center justify-center">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                 </div>
               </div>
             }>
               <DestinationDetailsModal
                 selectedDestination={selectedDestination}
                 showDestinationDetails={showDestinationDetails}
                 loadingServices={loadingServices}
                 destinationGuides={destinationGuides}
                 destinationHotels={destinationHotels}
                 destinationRestaurants={destinationRestaurants}
                 onClose={handleBackToExplore}
               />
             </Suspense>
          </div>
        )}

        {activeTab === 'destinations' && (
          <div className="space-y-8">
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20 animate-scale-in">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <MapPin className="w-6 h-6 mr-2 text-green-500 animate-pulse-glow" />
                Explore Amazing Destinations
              </h3>
              
              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search destinations..."
                    className="w-full pl-10 pr-4 py-3 bg-white/80 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                {loadingDestinationReviews && (
                  <div className="text-center text-sm text-gray-500 mt-2">
                    🔄 Loading real review data for destinations...
                  </div>
                )}
              </div>
              
                             {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {destinations.map((destination, index) => (
                   <div 
                     key={index} 
                     className={`bg-white/80 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer hover-lift animate-fade-in-up interactive-card`} 
                     style={{animationDelay: `${index * 0.1}s`}}
                     onClick={() => handleDestinationSelect(destination)}
                   >
                                         <div className="w-full h-40 bg-gradient-to-br from-blue-200 to-purple-200 rounded-xl mb-4 flex items-center justify-center hover-glow overflow-hidden relative">
                       {destination.image ? (
                         <>
                           <img 
                             src={destination.image} 
                             alt={destination.name}
                             className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                             onError={(e) => {
                               const target = e.currentTarget as HTMLImageElement;
                               target.style.display = 'none';
                               const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                               if (fallback) fallback.style.display = 'flex';
                             }}
                           />
                           <Globe className="w-16 h-16 text-blue-600 hidden fallback-icon absolute inset-0 m-auto" />
                         </>
                       ) : (
                         <Globe className="w-16 h-16 text-blue-600" />
                       )}
                     </div>
                    <h4 className="font-semibold text-gray-800 mb-2">{destination.name}</h4>
                    <p className="text-gray-600 text-sm mb-3">{destination.city}, {destination.country}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{getDestinationRating(destination)}</span>
                      <span>•</span>
                      <span>
                        {loadingDestinationReviews ? (
                          <span className="text-gray-400">Loading...</span>
                        ) : (
                          `${getDestinationReviewCount(destination)} review${getDestinationReviewCount(destination) !== 1 ? 's' : ''}`
                        )}
                      </span>
                    </div>
                    {/* Rating source indicator */}
                    {!loadingDestinationReviews && getDestinationReviewCount(destination) === 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        Default rating
                      </div>
                    )}
                    {!loadingDestinationReviews && getDestinationReviewCount(destination) > 0 && (
                      <div className="text-xs text-green-500 mt-1">
                        Real traveler ratings
                      </div>
                    )}
                  </div>
                ))}
                </div>
              )}

                             {/* Destination Details Modal for Destinations Tab */}
               <Suspense fallback={
                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                   <div className="bg-white rounded-3xl p-8 flex items-center justify-center">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                   </div>
                 </div>
               }>
                 <DestinationDetailsModal
                   selectedDestination={selectedDestination}
                   showDestinationDetails={showDestinationDetails}
                   loadingServices={loadingServices}
                   destinationGuides={destinationGuides}
                   destinationHotels={destinationHotels}
                   destinationRestaurants={destinationRestaurants}
                   onClose={handleBackToExplore}
                 />
               </Suspense>
            </div>
          </div>
        )}





        {activeTab === 'bookings' && (
          <div className="space-y-8">
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20 animate-scale-in">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-indigo-500 animate-pulse-glow" />
                My Bookings
              </h3>
              
              {/* Booking Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                  { 
                    icon: CheckCircle, 
                    label: 'Confirmed', 
                    value: hotelBookings.filter(b => b.booking_status === 'confirmed').length.toString(),
                    color: 'from-green-500 to-emerald-500', 
                    bgColor: 'bg-green-100' 
                  },
                  { 
                    icon: Clock, 
                    label: 'Pending', 
                    value: hotelBookings.filter(b => b.booking_status === 'pending').length.toString(),
                    color: 'from-yellow-500 to-orange-500', 
                    bgColor: 'bg-yellow-100' 
                  },
                  { 
                    icon: Calendar, 
                    label: 'Upcoming', 
                    value: hotelBookings.filter(b => ['pending', 'confirmed'].includes(b.booking_status)).length.toString(),
                    color: 'from-blue-500 to-cyan-500', 
                    bgColor: 'bg-blue-100' 
                  },
                  { 
                    icon: XCircle, 
                    label: 'Cancelled', 
                    value: hotelBookings.filter(b => b.booking_status === 'cancelled').length.toString(),
                    color: 'from-red-500 to-pink-500', 
                    bgColor: 'bg-red-100' 
                  }
                ].map((stat, index) => (
                  <div key={index} className={`${stat.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up`} style={{animationDelay: `${index * 0.1}s`}}>
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4 mx-auto`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</p>
                      <p className="text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Current Bookings */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  Current & Upcoming Bookings
                </h4>
                
                {loadingBookings ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : hotelBookings.filter(booking => 
                  ['pending', 'confirmed', 'checked_in'].includes(booking.booking_status)
                ).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No current or upcoming bookings</p>
                    <p className="text-sm">Start exploring destinations to make your first booking!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hotelBookings
                      .filter(booking => ['pending', 'confirmed', 'checked_in'].includes(booking.booking_status))
                      .map((booking, index) => (
                        <div key={booking.booking_id} className="bg-white/80 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-purple-200 rounded-xl flex items-center justify-center overflow-hidden">
                              <Building className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-semibold text-gray-800">Hotel Booking #{booking.booking_id}</h5>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  booking.booking_status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  booking.booking_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  booking.booking_status === 'checked_in' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {booking.booking_status.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mb-1">Room Type: {booking.room_type}</p>
                              <p className="text-gray-500 text-xs mb-2">
                                {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{booking.num_guests} Guest{booking.num_guests !== 1 ? 's' : ''}</span>
                                <span className="font-semibold text-gray-800">${booking.total_price}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Past Bookings */}
              <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                  Past Bookings
                </h4>
                
                {loadingBookings ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                  </div>
                ) : hotelBookings.filter(booking => 
                  ['checked_out', 'cancelled'].includes(booking.booking_status)
                ).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No past bookings</p>
                    <p className="text-sm">Your completed and cancelled bookings will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hotelBookings
                      .filter(booking => ['checked_out', 'cancelled'].includes(booking.booking_status))
                      .map((booking, index) => (
                        <div key={booking.booking_id} className="bg-white/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center overflow-hidden">
                              <Building className="w-8 h-8 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-semibold text-gray-700">Hotel Booking #{booking.booking_id}</h5>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  booking.booking_status === 'checked_out' ? 'bg-green-100 text-green-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {booking.booking_status === 'checked_out' ? 'COMPLETED' : 'CANCELLED'}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mb-1">Room Type: {booking.room_type}</p>
                              <p className="text-gray-500 text-xs mb-2">
                                {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{booking.num_guests} Guest{booking.num_guests !== 1 ? 's' : ''}</span>
                                <span className="font-semibold text-gray-700">${booking.total_price}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelerDashboard;
