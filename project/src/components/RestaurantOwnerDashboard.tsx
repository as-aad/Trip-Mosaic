import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut, getRestaurantOwnerRestaurants, createRestaurant, updateRestaurant, deleteRestaurant, getRestaurantOwnerDestinations, getRestaurantOwnerStatistics } from '../services/api';
import { Utensils, Plus, Edit, Trash2, MapPin, Phone, Globe, Star, Users, Calendar, Settings, ChefHat, Globe2, TrendingUp, Mail, Search, Clock, Award } from 'lucide-react';

interface RestaurantForm {
  name: string;
  destination_id: number; // New field for destination selection
  description: string;
  cuisine_type: string;
  address: string;
  phone: string;
  website: string;
  image: string;
  menu_image: string; // New field for menu image
  price_range: string;
}

const RestaurantOwnerDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]); // New state for destinations
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<any>(null);
  const [restaurantForm, setRestaurantForm] = useState<RestaurantForm>({
    name: '',
    destination_id: 0, // Initialize new field
    description: '',
    cuisine_type: '',
    address: '',
    phone: '',
    website: '',
    image: '',
    menu_image: '', // Initialize new field
    price_range: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<number | ''>(''); // New filter state
  const [statistics, setStatistics] = useState<any>(null); // New state for statistics

  // Helper function to calculate estimated revenue
  const calculateEstimatedRevenue = () => {
    let totalRevenue = 0;
    restaurants.forEach(restaurant => {
      if (restaurant.price_range) {
        const price = restaurant.price_range.length;
        // Estimate based on price range: $ = $20, $$ = $40, $$$ = $80, $$$$ = $150 per meal
        const avgMealPrice = price === 1 ? 20 : price === 2 ? 40 : price === 3 ? 80 : 150;
        totalRevenue += avgMealPrice * 30 * 2; // Assume 30 days, 2 meals per day
      }
    });
    return totalRevenue;
  };

  // Load data
  const loadData = async () => {
    try {
      console.log('🔄 RestaurantOwnerDashboard: Loading restaurants with filters:', {
        searchTerm,
        selectedDestination,
        selectedCuisine,
        selectedPriceRange
      });
      
      console.log('🔑 RestaurantOwnerDashboard: Current user:', user);
      console.log('🔑 RestaurantOwnerDashboard: User ID:', user?.id);
      console.log('🔑 RestaurantOwnerDashboard: User role:', user?.role);
      
      const restaurantsData = await getRestaurantOwnerRestaurants(
        searchTerm || undefined,
        selectedDestination || undefined,
        selectedCuisine || undefined,
        selectedPriceRange || undefined
      );
      
      console.log('✅ RestaurantOwnerDashboard: Restaurants loaded:', restaurantsData);
      console.log('📊 RestaurantOwnerDashboard: Number of restaurants:', restaurantsData?.length || 0);
      console.log('📊 RestaurantOwnerDashboard: Type of restaurantsData:', typeof restaurantsData);
      console.log('📊 RestaurantOwnerDashboard: Is array:', Array.isArray(restaurantsData));
      
      if (restaurantsData && Array.isArray(restaurantsData)) {
        setRestaurants(restaurantsData);
        console.log('✅ RestaurantOwnerDashboard: Restaurants state updated with:', restaurantsData.length, 'restaurants');
      } else {
        console.log('⚠️ RestaurantOwnerDashboard: restaurantsData is not an array, setting empty array');
        setRestaurants([]);
      }
      
      // Reload statistics after data changes
      loadStatistics();
    } catch (error: any) {
      console.error('❌ RestaurantOwnerDashboard: Error loading data:', error);
      console.error('❌ RestaurantOwnerDashboard: Error details:', {
        message: error.message,
        stack: error.stack
      });
      setRestaurants([]);
    }
  };

  // Load destinations for restaurant creation
  const loadDestinations = async () => {
    try {
      console.log('🔄 RestaurantOwnerDashboard: Loading destinations for restaurant creation...');
      const data = await getRestaurantOwnerDestinations();
      console.log('✅ RestaurantOwnerDashboard: Destinations loaded:', data);
      console.log('📊 RestaurantOwnerDashboard: Number of destinations:', data?.length || 0);
      setDestinations(data || []);
    } catch (error: any) {
      console.error('❌ RestaurantOwnerDashboard: Error loading destinations:', error);
      setMessage({ type: 'error', text: 'Failed to load destinations. Please try again.' });
      // Don't fail completely, just show error message
    }
  };

  // Helper function to get destination details
  const getDestinationDetails = (destinationId: number) => {
    return destinations.find(d => d.id === destinationId);
  };

  // Load restaurant owner statistics
  const loadStatistics = async () => {
    try {
      console.log('🔄 RestaurantOwnerDashboard: Loading statistics...');
      const stats = await getRestaurantOwnerStatistics();
      console.log('✅ RestaurantOwnerDashboard: Statistics loaded:', stats);
      setStatistics(stats);
    } catch (error: any) {
      console.error('❌ RestaurantOwnerDashboard: Error loading statistics:', error);
    }
  };

  // Debug effect to log state changes
  useEffect(() => {
    console.log('🔍 RestaurantOwnerDashboard: State update:', {
      restaurants: restaurants,
      restaurantsLength: restaurants?.length,
      isLoading: isLoading,
      statistics: statistics,
      destinations: destinations?.length
    });
  }, [restaurants, isLoading, statistics, destinations]);

  // Load data after user is set
  useEffect(() => {
    if (user) {
      loadData();
      loadDestinations(); // Load destinations when user is logged in
      loadStatistics(); // Load statistics when user is logged in
    }
  }, [user]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        loadData();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCuisine, selectedPriceRange, selectedDestination]);

  // User authentication effect
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'restaurant_owner') {
      setUser(currentUser);
    } else {
      navigate('/signin');
    }
  }, [navigate]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRestaurantForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate destination selection
    if (!restaurantForm.destination_id) {
      setMessage({ type: 'error', text: 'Please select a destination for your restaurant' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);

    try {
      await createRestaurant(restaurantForm);
      setMessage({ type: 'success', text: 'Restaurant created successfully!' });
      setShowRestaurantForm(false);
      resetForm();
      loadData(); // Reload data
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create restaurant' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRestaurant) return;
    
    // Validate destination selection
    if (!restaurantForm.destination_id) {
      setMessage({ type: 'error', text: 'Please select a destination for your restaurant' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);

    try {
      await updateRestaurant(editingRestaurant.id, restaurantForm);
      setMessage({ type: 'success', text: 'Restaurant updated successfully!' });
      setShowRestaurantForm(false);
      setEditingRestaurant(null);
      resetForm();
      loadData(); // Reload data
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update restaurant' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRestaurant = (restaurant: any) => {
    setEditingRestaurant(restaurant);
    setRestaurantForm({
      name: restaurant.name,
      destination_id: restaurant.destination_id, // Initialize new field
      description: restaurant.description || '',
      cuisine_type: restaurant.cuisine_type || '',
      address: restaurant.address || '',
      phone: restaurant.phone || '',
      website: restaurant.website || '',
      image: restaurant.image || '',
      menu_image: restaurant.menu_image || '', // Initialize new field
      price_range: restaurant.price_range || ''
    });
    setShowRestaurantForm(true);
  };

  const handleDeleteRestaurant = async (restaurantId: number) => {
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await deleteRestaurant(restaurantId);
        setMessage({ type: 'success', text: 'Restaurant deleted successfully!' });
        loadData(); // Reload data
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message || 'Failed to delete restaurant' });
      }
    }
  };

  const resetForm = () => {
    setRestaurantForm({
      name: '',
      destination_id: 0, // Reset new field
      description: '',
      cuisine_type: '',
      address: '',
      phone: '',
      website: '',
      image: '',
      menu_image: '', // Reset new field
      price_range: ''
    });
  };

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-100 relative overflow-hidden">
      {/* Background Travel Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200 to-red-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200 to-red-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Floating Travel Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 text-4xl opacity-10 animate-bounce">🍽️</div>
        <div className="absolute top-40 right-32 text-3xl opacity-10 animate-bounce delay-300">🌍</div>
        <div className="absolute bottom-32 left-32 text-3xl opacity-10 animate-bounce delay-700">🗺️</div>
        <div className="absolute bottom-20 right-20 text-4xl opacity-10 animate-bounce delay-1000">✈️</div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/90 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Restaurant Owner Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Welcome back, {user.name}! 🌟 Manage your restaurants and delight travelers with amazing cuisine.</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className={`p-4 rounded-2xl border-l-4 shadow-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-400 text-green-800' 
              : 'bg-red-50 border-red-400 text-red-800'
          }`}>
            <div className="flex items-center">
              <span className="text-lg mr-2">
                {message.type === 'success' ? '✅' : '❌'}
              </span>
              <span className="font-medium">{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="ml-auto text-lg hover:opacity-70 transition-opacity"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/30">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl">
                <Utensils className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Restaurants</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statistics ? statistics.total_restaurants : 
                    (isLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : restaurants.length)
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/30">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Cuisine Types</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statistics ? statistics.cuisine_types : 
                    (isLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : Array.from(new Set(restaurants.map(r => r.cuisine_type).filter(Boolean))).length)
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/30">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-pink-500 to-red-600 rounded-2xl">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Listings</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statistics ? statistics.active_restaurants : 
                    (isLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : restaurants.filter(r => r.is_active !== false).length)
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/30">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Est. Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${statistics ? statistics.estimated_monthly_revenue.toLocaleString() : 
                    (isLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : calculateEstimatedRevenue().toLocaleString())
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/30">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Destinations Covered</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statistics ? statistics.destinations_covered : 
                    (isLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : Array.from(new Set(restaurants.map(r => r.destination_id))).length)
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-12">
          <button
            onClick={() => {
              setEditingRestaurant(null);
              resetForm();
              setShowRestaurantForm(true);
            }}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-8 rounded-3xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-2xl group max-w-md mx-auto"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-colors">
                <Plus className="w-10 h-10" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold">Add Restaurant</div>
                <div className="text-orange-100 text-lg">Create a new restaurant listing</div>
              </div>
            </div>
          </button>
        </div>

        {/* Restaurant Form Modal */}
        {showRestaurantForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
                </h2>
                <button
                  onClick={() => {
                    setShowRestaurantForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
                >
                  ×
                </button>
              </div>

              <form onSubmit={editingRestaurant ? handleUpdateRestaurant : handleCreateRestaurant} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Restaurant Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={restaurantForm.name}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter restaurant name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Destination *</label>
                    <select
                      name="destination_id"
                      value={restaurantForm.destination_id}
                      onChange={handleFormChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      required
                      disabled={destinations.length === 0}
                    >
                      <option value="">
                        {destinations.length === 0 ? 'Loading destinations...' : 'Select a destination'}
                      </option>
                      {destinations.map(dest => (
                        <option key={dest.id} value={dest.id}>{dest.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      {destinations.length === 0 
                        ? '🔄 Loading available destinations...' 
                        : '💡 Select from destinations created by admin. This ensures your restaurant is properly linked to travel destinations.'
                      }
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
                    <textarea
                      name="description"
                      value={restaurantForm.description}
                      onChange={handleFormChange}
                      rows={3}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Describe your restaurant, specialties, and atmosphere..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Cuisine Type</label>
                    <input
                      type="text"
                      name="cuisine_type"
                      value={restaurantForm.cuisine_type}
                      onChange={handleFormChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Italian, Asian, Local, Fusion, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={restaurantForm.address}
                      onChange={handleFormChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Restaurant address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={restaurantForm.phone}
                      onChange={handleFormChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Contact number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={restaurantForm.website}
                      onChange={handleFormChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="https://your-restaurant.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Image URL</label>
                    <input
                      type="url"
                      name="image"
                      value={restaurantForm.image}
                      onChange={handleFormChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Restaurant image URL (e.g., from Unsplash, Pexels)"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Tip: Use free images from <a href="https://unsplash.com/s/photos/restaurant" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Unsplash</a> or <a href="https://www.pexels.com/search/restaurant/" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Pexels</a>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Menu Image URL</label>
                    <input
                      type="url"
                      name="menu_image"
                      value={restaurantForm.menu_image}
                      onChange={handleFormChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Restaurant menu image URL (e.g., from Unsplash, Pexels)"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      🍽️ Upload your restaurant menu to showcase dining options to guests
                    </p>
                    
                    {/* Menu Image Preview */}
                    {restaurantForm.menu_image && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2 font-medium">📸 MENU IMAGE PREVIEW</p>
                        <div className="relative">
                          <img
                            src={restaurantForm.menu_image}
                            alt="Menu Preview"
                            className="w-full h-32 object-cover rounded-xl border border-gray-200"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                              const errorDiv = target.nextElementSibling as HTMLDivElement;
                              if (errorDiv) {
                                errorDiv.style.display = 'block';
                              }
                            }}
                          />
                          <div className="hidden text-xs text-red-500 mt-1">
                            ❌ Invalid image URL. Please check the link and try again.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range</label>
                    <select
                      name="price_range"
                      value={restaurantForm.price_range}
                      onChange={handleFormChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    >
                      <option value="">Select price range</option>
                      <option value="$">$ (Budget)</option>
                      <option value="$$">$$ (Mid-range)</option>
                      <option value="$$$">$$$ (Fine Dining)</option>
                      <option value="$$$$">$$$$ (Luxury)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRestaurantForm(false);
                      resetForm();
                    }}
                    className="px-8 py-4 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 disabled:opacity-50 font-semibold shadow-lg"
                  >
                    {isLoading ? 'Saving...' : (editingRestaurant ? 'Update Restaurant' : 'Create Restaurant')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* My Restaurants Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl">
                <Utensils className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                My Restaurants
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadData}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
              <span className="text-gray-500 text-lg font-medium">{restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search restaurants by name or cuisine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                />
              </div>
              <div className="flex gap-3">
                <select 
                  value={selectedDestination} 
                  onChange={(e) => setSelectedDestination(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                >
                  <option value="">All Destinations</option>
                  {destinations.map(dest => (
                    <option key={dest.id} value={dest.id}>{dest.name}</option>
                  ))}
                </select>
                <select 
                  value={selectedCuisine} 
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                >
                  <option value="">All Cuisines</option>
                  {Array.from(new Set(restaurants.map(r => r.cuisine_type).filter(Boolean))).map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
                <select 
                  value={selectedPriceRange} 
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                >
                  <option value="">All Price Ranges</option>
                  <option value="$">$ (Budget)</option>
                  <option value="$$">$$ (Mid-range)</option>
                  <option value="$$$">$$$ (Fine Dining)</option>
                  <option value="$$$$">$$$$ (Luxury)</option>
                </select>
                {(searchTerm || selectedDestination || selectedCuisine || selectedPriceRange) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedDestination('');
                      setSelectedCuisine('');
                      setSelectedPriceRange('');
                    }}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all duration-200 font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
              <p className="text-gray-500 mt-6 text-lg">Loading restaurants...</p>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Utensils className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">No restaurants yet</h3>
              <p className="text-gray-500 mb-8 text-lg">Start by adding your first restaurant to attract hungry travelers</p>
              <button
                onClick={() => {
                  setEditingRestaurant(null);
                  resetForm();
                  setShowRestaurantForm(true);
                }}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-2xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg"
              >
                Add Your First Restaurant
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  {restaurant.image && (
                    <div className="h-56 bg-gray-200 overflow-hidden">
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
                      {restaurant.price_range && (
                        <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full text-sm font-semibold">
                          {restaurant.price_range}
                        </span>
                      )}
                    </div>

                    {restaurant.cuisine_type && (
                      <div className="flex items-center text-gray-600 mb-4">
                        <ChefHat className="w-5 h-5 mr-2 text-orange-600" />
                        <span className="font-medium">{restaurant.cuisine_type}</span>
                      </div>
                    )}

                    {restaurant.address && (
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                        <span className="font-medium">{restaurant.address}</span>
                      </div>
                    )}

                    {/* Destination Information */}
                    {restaurant.destination_id && (
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                        <span className="font-medium">
                          {getDestinationDetails(restaurant.destination_id)?.name || 'Unknown Destination'}
                        </span>
                      </div>
                    )}

                    {/* Destination Details */}
                    {restaurant.destination_id && getDestinationDetails(restaurant.destination_id) && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-xs text-blue-600 mb-2 font-medium">DESTINATION INFO</p>
                        <div className="space-y-1">
                          {getDestinationDetails(restaurant.destination_id)?.city && getDestinationDetails(restaurant.destination_id)?.country && (
                            <div className="text-xs text-blue-700">
                              📍 {getDestinationDetails(restaurant.destination_id)?.city}, {getDestinationDetails(restaurant.destination_id)?.country}
                            </div>
                          )}
                          {getDestinationDetails(restaurant.destination_id)?.description && (
                            <div className="text-xs text-blue-600 line-clamp-1">
                              {getDestinationDetails(restaurant.destination_id)?.description}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {restaurant.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{restaurant.description}</p>
                    )}

                    {/* Menu Image Display */}
                    {restaurant.menu_image && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2 font-medium">🍽️ RESTAURANT MENU</p>
                        <div className="relative group cursor-pointer" onClick={() => window.open(restaurant.menu_image, '_blank')}>
                          <img
                            src={restaurant.menu_image}
                            alt="Restaurant Menu"
                            className="w-full h-32 object-cover rounded-xl border border-gray-200 group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 rounded-xl flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm font-medium">
                              Click to view full menu
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Restaurant menu available for guests</p>
                      </div>
                    )}

                    {/* Contact Info */}
                    {(restaurant.phone || restaurant.website) && (
                      <div className="mb-6 p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-2 font-medium">CONTACT INFO</p>
                        <div className="space-y-1">
                          {restaurant.phone && (
                            <div className="flex items-center text-xs text-gray-600">
                              <Phone className="w-3 h-3 mr-2 text-orange-600" />
                              <span>{restaurant.phone}</span>
                            </div>
                          )}
                          {restaurant.website && (
                            <div className="flex items-center text-xs text-gray-600">
                              <Globe className="w-3 h-3 mr-2 text-orange-600" />
                              <span className="truncate">{restaurant.website}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEditRestaurant(restaurant)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteRestaurant(restaurant.id)}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coming Soon Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Reservation Management</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Soon you'll be able to manage table reservations, 
                track bookings, and handle special requests in real-time.
              </p>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4">
                <p className="text-sm text-purple-700 font-medium">🚀 Real-time reservation notifications</p>
                <p className="text-sm text-purple-600 mt-1">📅 Table availability calendar</p>
                <p className="text-sm text-purple-600 mt-1">👥 Guest preferences and special requests</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Menu Analytics</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Get insights into your most popular dishes, 
                customer preferences, and revenue trends to optimize your menu.
              </p>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4">
                <p className="text-sm text-yellow-700 font-medium">📊 Popular dish analytics</p>
                <p className="text-sm text-yellow-600 mt-1">💰 Revenue and order trends</p>
                <p className="text-sm text-yellow-600 mt-1">📈 Customer satisfaction metrics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantOwnerDashboard;
