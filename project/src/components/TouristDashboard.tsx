import React, { useState, useEffect } from 'react';
import { getCurrentUser, signOut, getDestinations } from '../services/api';
import './TouristDashboard.css';
import { 
  MapPin, 
  Compass, 
  Users, 
  Star, 
  Calendar, 
  Globe, 
  BookOpen, 
  Camera, 
  Map, 
  Heart,
  Search,
  Plane,
  Mountain,
  TreePine,
  Palette,
  Sparkles
} from 'lucide-react';

const TouristDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('explore');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteDestinations, setFavoriteDestinations] = useState<number[]>([]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'traveler') {
      setUser(currentUser);
      loadDestinations();
    } else {
      window.location.href = '/signin';
    }
  }, []);

  const loadDestinations = async () => {
    setLoading(true);
    try {
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
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-purple-600 bg-clip-text text-transparent">
                  Wanderlust
                </h1>
                <p className="text-gray-600 text-sm">Your travel adventure awaits</p>
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
              { id: 'experiences', label: 'Experiences', icon: Sparkles, color: 'from-orange-500 to-red-500' },
              { id: 'planning', label: 'Planning', icon: Calendar, color: 'from-indigo-500 to-purple-500' }
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
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-xl font-semibold text-gray-700">Loading amazing destinations...</p>
              </div>
            ) : (
              <>
                {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden animate-fade-in-up">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10">
                <h2 className="text-4xl font-bold mb-4 gradient-text">Discover Your Next Adventure</h2>
                <p className="text-xl mb-6 text-orange-100">From pristine beaches to majestic mountains, find your perfect destination</p>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => setActiveTab('destinations')}
                    className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 transform hover:scale-105 hover-lift flex items-center"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Explore Destinations
                  </button>
                  <button 
                    onClick={() => setActiveTab('planning')}
                    className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 transform hover:scale-105 hover-lift flex items-center"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Plan Your Trip
                  </button>
                </div>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { icon: MapPin, label: 'Destinations', value: `${destinations.length}+`, color: 'from-blue-500 to-cyan-500' },
                { icon: Users, label: 'Local Guides', value: 'Active', color: 'from-green-500 to-emerald-500' },
                { icon: Star, label: 'Top Rated', value: '4.8★', color: 'from-purple-500 to-pink-500' },
                { icon: Heart, label: 'Your Favorites', value: '0', color: 'from-orange-500 to-red-500' }
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

            {/* Quick Actions */}
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20 animate-scale-in">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Compass className="w-6 h-6 mr-2 text-blue-500 animate-pulse-glow" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Search Destinations', icon: Search, color: 'from-blue-500 to-cyan-500', action: () => setActiveTab('destinations') },
                  { title: 'Plan Trip', icon: Calendar, color: 'from-purple-500 to-pink-500', action: () => setActiveTab('planning') },
                  { title: 'Experiences', icon: Sparkles, color: 'from-orange-500 to-red-500', action: () => setActiveTab('experiences') }
                ].map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`group p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover-lift animate-fade-in-up`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:shadow-lg transition-all duration-300`}>
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-800 text-center">{action.title}</h4>
                  </button>
                ))}
              </div>
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
                    onClick={() => setActiveTab('destinations')}
                  >
                    <div className="w-full h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-xl mb-4 flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
                      <Globe className="w-16 h-16 text-blue-600" />
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
              </>
            )}
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.map((destination, index) => (
                  <div key={index} className={`bg-white/80 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer hover-lift animate-fade-in-up interactive-card`} style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="w-full h-40 bg-gradient-to-br from-blue-200 to-purple-200 rounded-xl mb-4 flex items-center justify-center hover-glow">
                      <Globe className="w-16 h-16 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">{destination.name}</h4>
                    <p className="text-gray-600 text-sm mb-3">{destination.city}, {destination.country}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{destination.rating || 0.0}</span>
                      <span>•</span>
                      <span>{destination.reviews || 0} reviews</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}



        {activeTab === 'experiences' && (
          <div className="space-y-8">
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20 animate-scale-in">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Sparkles className="w-6 h-6 mr-2 text-orange-500 animate-pulse-glow" />
                Unforgettable Experiences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: 'Cultural Immersion', description: 'Dive deep into local traditions and customs', icon: Palette, color: 'from-purple-500 to-pink-500', emoji: '🎭' },
                  { title: 'Adventure Sports', description: 'Thrilling outdoor activities and extreme sports', icon: Mountain, color: 'from-green-500 to-emerald-500', emoji: '🏂' },
                  { title: 'Culinary Journeys', description: 'Taste authentic local cuisine and flavors', icon: Heart, color: 'from-red-500 to-pink-500', emoji: '🍜' },
                  { title: 'Nature Exploration', description: 'Discover pristine landscapes and wildlife', icon: TreePine, color: 'from-blue-500 to-cyan-500', emoji: '🌿' }
                ].map((exp, index) => (
                  <div key={index} className={`bg-white/80 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover-lift animate-fade-in-up interactive-card`} style={{animationDelay: `${index * 0.15}s`}}>
                    <div className={`w-16 h-16 bg-gradient-to-r ${exp.color} rounded-xl flex items-center justify-center mb-4 animate-pulse-glow`}>
                      <exp.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-4xl mb-3">{exp.emoji}</div>
                    <h4 className="font-semibold text-gray-800 mb-2">{exp.title}</h4>
                    <p className="text-gray-600 text-sm">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'planning' && (
          <div className="space-y-8">
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20 animate-scale-in">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-indigo-500 animate-pulse-glow" />
                Plan Your Perfect Trip
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 hover-lift animate-fade-in-up`} style={{animationDelay: '0.1s'}}>
                  <div className="text-4xl mb-3">🗺️</div>
                  <h4 className="font-semibold text-blue-800 mb-2">Trip Builder</h4>
                  <p className="text-blue-600 mb-4">Create custom itineraries with our intelligent trip planning tool.</p>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Start Planning
                  </button>
                </div>
                <div className={`bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 hover-lift animate-fade-in-up`} style={{animationDelay: '0.2s'}}>
                  <div className="text-4xl mb-3">📋</div>
                  <h4 className="font-semibold text-green-800 mb-2">Travel Checklist</h4>
                  <p className="text-green-600 mb-4">Never forget essential items with our comprehensive packing lists.</p>
                  <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    View Checklist
                  </button>
                </div>
              </div>
              
              {/* Additional Planning Tools */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Budget Calculator', icon: '💰', color: 'from-yellow-400 to-orange-500' },
                  { title: 'Weather Forecast', icon: '🌤️', color: 'from-sky-400 to-blue-500' },
                  { title: 'Local Time', icon: '🕐', color: 'from-purple-400 to-pink-500' }
                ].map((tool, index) => (
                  <div key={index} className={`bg-white/80 rounded-xl p-4 text-center hover-lift animate-fade-in-up`} style={{animationDelay: `${0.3 + index * 0.1}s`}}>
                    <div className="text-3xl mb-2">{tool.icon}</div>
                    <h5 className="font-medium text-gray-800">{tool.title}</h5>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TouristDashboard;
