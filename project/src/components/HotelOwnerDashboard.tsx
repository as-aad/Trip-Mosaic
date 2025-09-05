import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut, getHotels, createHotel, updateHotel, deleteHotel, getDestinations, getHotelOwnerStatistics, getHotelOwnerHotels, getHotelOwnerDestinations, getHotelBookings, getHotelGuestRequests, updateHotelBooking } from '../services/api';
import { Building, Plus, Edit, Trash2, MapPin, Phone, Globe, Star, Users, Calendar, Settings, Hotel, Globe2, TrendingUp, Mail, Search, MessageSquare } from 'lucide-react';

interface HotelForm {
  name: string;
  description: string;
  address: string;
  destination_id: number; // Changed from city/country to destination_id
  phone: string;
  email: string;
  website: string;
  image: string;
  price_range: string;
  amenities: string;
  room_types: string;
}

const HotelOwnerDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [showHotelForm, setShowHotelForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState<any>(null);
  const [hotelForm, setHotelForm] = useState<HotelForm>({
    name: '', description: '', address: '', destination_id: 0, phone: '', 
    email: '', website: '', image: '', price_range: '', amenities: '', room_types: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<number | ''>('');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [statistics, setStatistics] = useState<any>(null);

  // Booking management states
  const [bookings, setBookings] = useState<any[]>([]);
  const [guestRequests, setGuestRequests] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedHotelForBookings, setSelectedHotelForBookings] = useState<number | ''>('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Helper function to calculate estimated revenue
  const calculateEstimatedRevenue = () => {
    let totalRevenue = 0;
    hotels.forEach(hotel => {
      if (hotel.room_types) {
        const rooms = hotel.room_types.split(',');
        rooms.forEach((room: string) => {
          const parts = room.trim().split(':');
          if (parts.length > 1) {
            const price = parts[1].trim();
            const priceMatch = price.match(/\$(\d+)/);
            if (priceMatch) {
              totalRevenue += parseInt(priceMatch[1]) * 30; // Assume 30 days occupancy
            }
          }
        });
      }
    });
    return totalRevenue;
  };

  // Load destinations for hotel creation
  const loadDestinations = async () => {
    try {
      console.log('🔄 Loading destinations for hotel creation...');
      const data = await getDestinations();
      console.log('✅ Destinations loaded:', data);
      setDestinations(data || []);
    } catch (error) {
      console.error('❌ HotelOwnerDashboard: Error loading destinations:', error);
      setMessage({ type: 'error', text: 'Failed to load destinations. Please try again.' });
      // Don't fail completely, just show error message
    }
  };

  // Load hotel owner destinations (for display purposes)
  const loadHotelOwnerDestinations = async () => {
    try {
      console.log('🔄 Loading hotel owner destinations...');
      const data = await getHotelOwnerDestinations();
      console.log('✅ Hotel owner destinations loaded:', data);
      // This is just for display, don't fail if it errors
    } catch (error) {
      console.warn('⚠️ HotelOwnerDashboard: Could not load hotel owner destinations:', error);
      // This is not critical, just log warning
    }
  };

  // Helper function to get destination details
  const getDestinationDetails = (destinationId: number) => {
    return destinations.find(d => d.id === destinationId);
  };

  // Load hotel owner statistics
  const loadStatistics = async () => {
    try {
      const stats = await getHotelOwnerStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('HotelOwnerDashboard: Error loading statistics:', error);
    }
  };

  const loadBookings = async () => {
    if (!selectedHotelForBookings) return;
    
    setLoadingBookings(true);
    try {
      const bookingsData = await getHotelBookings(selectedHotelForBookings);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setMessage({ type: 'error', text: 'Failed to load bookings' });
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadGuestRequests = async () => {
    if (!selectedHotelForBookings) return;
    
    setLoadingRequests(true);
    try {
      const requestsData = await getHotelGuestRequests(selectedHotelForBookings);
      setGuestRequests(requestsData);
    } catch (error) {
      console.error('Error loading guest requests:', error);
      setMessage({ type: 'error', text: 'Failed to load guest requests' });
    } finally {
      setLoadingRequests(false);
    }
  };

  // Load hotels with search and filter
  const loadHotels = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading hotels with filters:', { searchTerm, selectedDestination, selectedPriceRange });
      
      const data = await getHotelOwnerHotels(searchTerm, selectedDestination || undefined, selectedPriceRange || undefined);
      console.log('✅ Hotels loaded:', data);
      setHotels(data || []);
      
      // Clear any previous error messages
      if (message && message.type === 'error' && message.text.includes('Failed to load hotels')) {
        setMessage(null);
      }
      
    } catch (error) {
      console.error('❌ HotelOwnerDashboard: Error loading hotels:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load hotels';
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = 'Authentication expired. Please sign in again.';
        } else if (error.message.includes('403')) {
          errorMessage = 'Access denied. Please check your permissions.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        }
      }
      
      setMessage({ type: 'error', text: errorMessage });
      setHotels([]); // Clear hotels on error
    } finally {
      setIsLoading(false);
    }
  };

  // Load data after user is set
  useEffect(() => {
    if (user) {
      loadHotels();
      loadDestinations();
      loadHotelOwnerDestinations(); // Load destinations for display
      loadStatistics();
    }
  }, [user, searchTerm, selectedDestination, selectedPriceRange]);

  // Load bookings and requests when hotel selection changes
  useEffect(() => {
    if (selectedHotelForBookings) {
      loadBookings();
      loadGuestRequests();
    }
  }, [selectedHotelForBookings]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        loadHotels();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedDestination, selectedPriceRange]);

  // User authentication effect
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'hotel_owner') {
      setUser(currentUser);
    } else {
      navigate('/signin');
    }
  }, [navigate]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setHotelForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate destination selection
    if (!hotelForm.destination_id) {
      setMessage({ type: 'error', text: 'Please select a destination for your hotel' });
      return;
    }
    
    try {
      setIsLoading(true);
      await createHotel(hotelForm);
      setMessage({ type: 'success', text: 'Hotel created successfully!' });
      setShowHotelForm(false);
      resetForm();
      loadHotels(); // Reload hotels after creation
    } catch (error) {
      console.error('Error creating hotel:', error);
      setMessage({ type: 'error', text: 'Failed to create hotel' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHotel) return;
    
    // Validate destination selection
    if (!hotelForm.destination_id) {
      setMessage({ type: 'error', text: 'Please select a destination for your hotel' });
      return;
    }
    
    try {
      setIsLoading(true);
      await updateHotel(editingHotel.id, hotelForm);
      setMessage({ type: 'success', text: 'Hotel updated successfully!' });
      setShowHotelForm(false);
      setEditingHotel(null);
      resetForm();
      loadHotels(); // Reload hotels after update
    } catch (error) {
      console.error('Error updating hotel:', error);
      setMessage({ type: 'error', text: 'Failed to update hotel' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditHotel = (hotel: any) => {
    setEditingHotel(hotel);
    setHotelForm({
      name: hotel.name || '',
      description: hotel.description || '',
      address: hotel.address || '',
      destination_id: hotel.destination_id || 0, // Assuming destination_id is part of the hotel object
      phone: hotel.phone || '',
      email: hotel.email || '',
      website: hotel.website || '',
      image: hotel.image || '',
      price_range: hotel.price_range || '',
      amenities: hotel.amenities || '',
      room_types: hotel.room_types || ''
    });
    setShowHotelForm(true);
  };

  const handleDeleteHotel = async (hotelId: number) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) return;
    
    try {
      setIsLoading(true);
      await deleteHotel(hotelId);
      setMessage({ type: 'success', text: 'Hotel deleted successfully!' });
      loadHotels(); // Reload hotels after deletion
    } catch (error) {
      console.error('Error deleting hotel:', error);
      setMessage({ type: 'error', text: 'Failed to delete hotel' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setHotelForm({
      name: '', description: '', address: '', destination_id: 0, phone: '', 
      email: '', website: '', image: '', price_range: '', amenities: '', room_types: ''
    });
    setEditingHotel(null);
  };

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  // Booking Management Functions
  const handleConfirmBooking = async (bookingId: number) => {
    try {
      await updateHotelBooking(bookingId, { booking_status: 'confirmed' });
      setMessage({ type: 'success', text: 'Booking confirmed successfully!' });
      loadBookings(); // Reload bookings to show updated status
    } catch (error) {
      console.error('Error confirming booking:', error);
      setMessage({ type: 'error', text: 'Failed to confirm booking' });
    }
  };

  const handleRejectBooking = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to reject this booking?')) return;
    
    try {
      await updateHotelBooking(bookingId, { booking_status: 'cancelled' });
      setMessage({ type: 'success', text: 'Booking rejected successfully!' });
      loadBookings(); // Reload bookings to show updated status
    } catch (error) {
      console.error('Error rejecting booking:', error);
      setMessage({ type: 'error', text: 'Failed to reject booking' });
    }
  };

  const handleUpdateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      await updateHotelBooking(bookingId, { booking_status: newStatus });
      setMessage({ type: 'success', text: `Booking status updated to ${newStatus.replace('_', ' ')}!` });
      loadBookings(); // Reload bookings to show updated status
    } catch (error) {
      console.error('Error updating booking status:', error);
      setMessage({ type: 'error', text: 'Failed to update booking status' });
    }
  };

  const handleViewBookingDetails = (booking: any) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'hotels', label: 'Hotels', icon: Building },
    { id: 'destinations', label: 'Destinations', icon: Globe2 },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Travel Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200 to-teal-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-sky-200 to-blue-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Floating Travel Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 text-4xl opacity-10 animate-bounce">🏨</div>
        <div className="absolute top-40 right-32 text-3xl opacity-10 animate-bounce delay-300">🌍</div>
        <div className="absolute bottom-32 left-32 text-3xl opacity-10 animate-bounce delay-700">🗺️</div>
        <div className="absolute bottom-20 right-20 text-4xl opacity-10 animate-bounce delay-1000">✈️</div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/90 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Hotel Owner Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Welcome back, {user.name}! 🌟 Manage your hotels and grow your business.</p>
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
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl">
                <Building className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Hotels</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statistics ? statistics.total_hotels : 
                    (isLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : hotels.length)
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/30">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statistics ? statistics.average_rating : 
                    (isLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      hotels.length > 0 
                        ? (hotels.reduce((sum, hotel) => sum + (hotel.rating || 0), 0) / hotels.length).toFixed(1)
                        : '0.0'
                    ))
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/30">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Hotels</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statistics ? statistics.active_hotels : 
                    (isLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : hotels.filter(hotel => hotel.is_active).length)
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/30">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl">
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
                    ) : Array.from(new Set(hotels.map(h => h.destination_id))).length)
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-12">
          <button
            onClick={() => setShowHotelForm(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-8 rounded-3xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-2xl group max-w-md mx-auto"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-colors">
                <Plus className="w-10 h-10" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold">Add Hotel</div>
                <div className="text-emerald-100 text-lg">Create a new hotel listing</div>
              </div>
            </div>
          </button>
        </div>

        {/* Hotel Form Modal */}
        {showHotelForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
                </h2>
                <button
                  onClick={() => {
                    setShowHotelForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
                >
                  ×
                </button>
              </div>

              <form onSubmit={editingHotel ? handleUpdateHotel : handleCreateHotel} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Hotel Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={hotelForm.name}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter hotel name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range</label>
                    <select
                      name="price_range"
                      value={hotelForm.price_range}
                      onChange={handleFormChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    >
                      <option value="">Select price range</option>
                      <option value="$">$ (Budget)</option>
                      <option value="$$">$$ (Mid-range)</option>
                      <option value="$$$">$$$ (Luxury)</option>
                      <option value="$$$$">$$$$ (Ultra-luxury)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
                  <textarea
                    name="description"
                    value={hotelForm.description}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="Describe your hotel..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={hotelForm.address}
                      onChange={handleFormChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Street address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Destination *</label>
                    <select
                      name="destination_id"
                      value={hotelForm.destination_id}
                      onChange={handleFormChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
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
                        : '💡 Select from destinations created by admin. This ensures your hotel is properly linked to travel destinations.'
                      }
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={hotelForm.phone}
                      onChange={handleFormChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={hotelForm.email}
                      onChange={handleFormChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Email address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={hotelForm.website}
                      onChange={handleFormChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Website URL"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Image URL</label>
                    <input
                      type="url"
                      name="image"
                      value={hotelForm.image}
                      onChange={handleFormChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Hotel image URL (e.g., from Unsplash, Pexels)"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Tip: Use free images from <a href="https://unsplash.com/s/photos/hotel" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Unsplash</a> or <a href="https://www.pexels.com/search/hotel/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Pexels</a>
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Amenities</label>
                  <textarea
                    name="amenities"
                    value={hotelForm.amenities}
                    onChange={handleFormChange}
                    rows={2}
                    className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="WiFi, Pool, Gym, Restaurant, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Room Types & Prices</label>
                  <textarea
                    name="room_types"
                    value={hotelForm.room_types}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="Standard Room: $100/night, Deluxe Room: $150/night, Suite: $250/night"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowHotelForm(false);
                      resetForm();
                    }}
                    className="px-8 py-4 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 font-semibold shadow-lg"
                  >
                    {isLoading ? 'Saving...' : (editingHotel ? 'Update Hotel' : 'Create Hotel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* My Hotels Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                My Hotels
              </h2>
            </div>
            <span className="text-gray-500 text-lg font-medium">{hotels.length} hotel{hotels.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search hotels by name or destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                />
              </div>
              <div className="flex gap-3">
                <select 
                  value={selectedDestination} 
                  onChange={(e) => setSelectedDestination(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                >
                  <option value="">All Destinations</option>
                  {destinations.map(dest => (
                    <option key={dest.id} value={dest.id}>{dest.name}</option>
                  ))}
                </select>
                <select 
                  value={selectedPriceRange} 
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                >
                  <option value="">All Price Ranges</option>
                  <option value="$">$ (Budget)</option>
                  <option value="$$">$$ (Mid-range)</option>
                  <option value="$$$">$$$ (Luxury)</option>
                  <option value="$$$$">$$$$ (Ultra-luxury)</option>
                </select>
                {(searchTerm || selectedDestination || selectedPriceRange) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedDestination('');
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
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-gray-500 mt-6 text-lg">Loading hotels...</p>
            </div>
          ) : hotels.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Building className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">No hotels yet</h3>
              <p className="text-gray-500 mb-8 text-lg">Start by adding your first hotel to attract travelers</p>
              <button
                onClick={() => setShowHotelForm(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg"
              >
                Add Your First Hotel
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotels.map((hotel) => (
                <div key={hotel.id} className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  {hotel.image && (
                    <div className="h-56 bg-gray-200 overflow-hidden">
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{hotel.name}</h3>
                      {hotel.price_range && (
                        <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full text-sm font-semibold">
                          {hotel.price_range}
                        </span>
                      )}
                    </div>

                    {hotel.city && hotel.country && (
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
                        <span className="font-medium">{hotel.city}, {hotel.country}</span>
                      </div>
                    )}

                    {/* Destination Information */}
                    {hotel.destination_id && (
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
                        <span className="font-medium">
                          {getDestinationDetails(hotel.destination_id)?.name || 'Unknown Destination'}
                        </span>
                      </div>
                    )}

                    {/* Destination Details */}
                    {hotel.destination_id && getDestinationDetails(hotel.destination_id) && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-xs text-blue-600 mb-2 font-medium">DESTINATION INFO</p>
                        <div className="space-y-1">
                          {getDestinationDetails(hotel.destination_id)?.city && getDestinationDetails(hotel.destination_id)?.country && (
                            <div className="text-xs text-blue-700">
                              📍 {getDestinationDetails(hotel.destination_id)?.city}, {getDestinationDetails(hotel.destination_id)?.country}
                            </div>
                          )}
                          {getDestinationDetails(hotel.destination_id)?.description && (
                            <div className="text-xs text-blue-600 line-clamp-1">
                              {getDestinationDetails(hotel.destination_id)?.description}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {hotel.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{hotel.description}</p>
                    )}

                    {/* Amenities Preview */}
                    {hotel.amenities && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2 font-medium">AMENITIES</p>
                        <div className="flex flex-wrap gap-1">
                          {hotel.amenities.split(',').slice(0, 3).map((amenity: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                              {amenity.trim()}
                            </span>
                          ))}
                          {hotel.amenities.split(',').length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{hotel.amenities.split(',').length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Room Types Preview */}
                    {hotel.room_types && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2 font-medium">ROOM TYPES</p>
                        <div className="flex flex-wrap gap-1">
                          {hotel.room_types.split(',').slice(0, 2).map((room: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {room.trim().split(':')[0]}
                            </span>
                          ))}
                          {hotel.room_types.split(',').length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{hotel.room_types.split(',').length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="text-sm font-semibold">{hotel.rating || 0}</span>
                        <span className="text-gray-500 text-sm">({hotel.reviews || 0} reviews)</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        hotel.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {hotel.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Contact Info */}
                    {(hotel.phone || hotel.email || hotel.website) && (
                      <div className="mb-6 p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-2 font-medium">CONTACT INFO</p>
                        <div className="space-y-1">
                          {hotel.phone && (
                            <div className="flex items-center text-xs text-gray-600">
                              <Phone className="w-3 h-3 mr-2 text-emerald-600" />
                              <span>{hotel.phone}</span>
                            </div>
                          )}
                          {hotel.email && (
                            <div className="flex items-center text-xs text-gray-600">
                              <Mail className="w-3 h-3 mr-2 text-emerald-600" />
                              <span>{hotel.email}</span>
                            </div>
                          )}
                          {hotel.website && (
                            <div className="flex items-center text-xs text-gray-600">
                              <Globe className="w-3 h-3 mr-2 text-emerald-600" />
                              <span className="truncate">{hotel.website}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEditHotel(hotel)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteHotel(hotel.id)}
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

        {/* Bookings Management Section */}
        <div className="mt-12 space-y-8">
          {/* Hotel Selection for Bookings */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              📅 Booking Management
            </h3>
            <p className="text-gray-600 mb-6">
              Select a hotel to view and manage all bookings, track reservations, and handle guest requests in real-time.
            </p>
            <div className="flex space-x-4">
              <select
                value={selectedHotelForBookings}
                onChange={(e) => setSelectedHotelForBookings(e.target.value ? Number(e.target.value) : '')}
                className="px-6 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-lg"
              >
                <option value="">Choose a hotel to manage bookings</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedHotelForBookings && (
            <>
              {/* Bookings Overview */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-purple-600" />
                  Hotel Bookings
                </h3>
                
                {/* Booking Filters */}
                <div className="flex space-x-4 mb-6">
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-lg"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked In</option>
                    <option value="checked_out">Checked Out</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Bookings List */}
                {loadingBookings ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No bookings found for this hotel.</p>
                    <p className="text-sm">Bookings will appear here once travelers make reservations.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings
                      .filter(booking => !bookingStatusFilter || booking.booking_status === bookingStatusFilter)
                      .map((booking) => (
                        <div key={booking.booking_id} className="border border-gray-200 rounded-xl p-6 bg-white shadow-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                                booking.booking_status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.booking_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                booking.booking_status === 'checked_in' ? 'bg-blue-100 text-blue-800' :
                                booking.booking_status === 'checked_out' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {booking.booking_status.replace('_', ' ').toUpperCase()}
                              </div>
                              <span className="text-sm text-gray-600 font-medium">#{booking.booking_id}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-purple-600">${booking.total_price}</div>
                              <div className="text-sm text-gray-600">{booking.room_type}</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                            <div className="text-center">
                              <div className="text-sm text-gray-600 mb-1">Check-in</div>
                              <div className="font-semibold text-gray-800">{new Date(booking.check_in_date).toLocaleDateString()}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-600 mb-1">Check-out</div>
                              <div className="font-semibold text-gray-800">{new Date(booking.check_out_date).toLocaleDateString()}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-600 mb-1">Guests</div>
                              <div className="font-semibold text-gray-800">{booking.num_guests}</div>
                            </div>
                          </div>
                          
                          {booking.special_requests && (
                            <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <div className="text-sm text-purple-600 font-medium mb-2">Special Requests</div>
                              <div className="text-sm text-purple-800">{booking.special_requests}</div>
                            </div>
                          )}
                          
                                                     <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                             <span>Booked on {new Date(booking.created_at).toLocaleDateString()}</span>
                             <span>Traveler ID: {booking.traveler_id}</span>
                           </div>
                           
                           {/* Booking Management Actions */}
                           {booking.booking_status === 'pending' && (
                             <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-200">
                               <button
                                 onClick={() => handleConfirmBooking(booking.booking_id)}
                                 className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold"
                               >
                                 <span>✅</span>
                                 <span>Confirm Booking</span>
                               </button>
                               <button
                                 onClick={() => handleRejectBooking(booking.booking_id)}
                                 className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold"
                               >
                                 <span>❌</span>
                                 <span>Reject Booking</span>
                               </button>
                             </div>
                           )}
                           
                           {/* Status Update Actions for Confirmed Bookings */}
                           {booking.booking_status === 'confirmed' && (
                             <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-200">
                               <button
                                 onClick={() => handleUpdateBookingStatus(booking.booking_id, 'checked_in')}
                                 className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold"
                               >
                                 <span>🏨</span>
                                 <span>Check In</span>
                               </button>
                               <button
                                 onClick={() => handleUpdateBookingStatus(booking.booking_id, 'checked_out')}
                                 className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold"
                               >
                                 <span>🚪</span>
                                 <span>Check Out</span>
                               </button>
                             </div>
                           )}
                           
                           {/* Status Update Actions for Checked In Bookings */}
                           {booking.booking_status === 'checked_in' && (
                             <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-200">
                               <button
                                 onClick={() => handleUpdateBookingStatus(booking.booking_id, 'checked_out')}
                                 className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold"
                               >
                                 <span>🚪</span>
                                 <span>Check Out</span>
                               </button>
                             </div>
                           )}
                           
                           {/* View Details Button for All Bookings */}
                           <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-200">
                             <button
                               onClick={() => handleViewBookingDetails(booking)}
                               className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold"
                             >
                               <span>👁️</span>
                               <span>View Details</span>
                             </button>
                           </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Guest Requests */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <MessageSquare className="w-6 h-6 mr-3 text-pink-600" />
                  Guest Requests
                </h3>
                
                {loadingRequests ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                  </div>
                ) : guestRequests.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No guest requests found for this hotel.</p>
                    <p className="text-sm">Guest requests will appear here once travelers submit them.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {guestRequests.map((request) => (
                      <div key={request.request_id} className="border border-gray-200 rounded-xl p-6 bg-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                              request.request_status === 'completed' ? 'bg-green-100 text-green-800' :
                              request.request_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              request.request_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.request_status.replace('_', ' ').toUpperCase()}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {request.priority.toUpperCase()}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 font-medium">
                            {request.request_type.replace('_', ' ').toUpperCase()}
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="text-sm text-gray-600 font-medium mb-2">Request Details</div>
                          <div className="text-gray-800">{request.request_details}</div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                          <span>Requested on {new Date(request.created_at).toLocaleDateString()}</span>
                          <span>Booking ID: {request.booking_id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
                     )}
         </div>
       </div>

       {/* Booking Details Modal */}
       {showBookingModal && selectedBooking && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
           <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                 📋 Booking Details
               </h2>
               <button
                 onClick={() => {
                   setShowBookingModal(false);
                   setSelectedBooking(null);
                 }}
                 className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
               >
                 ×
               </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Left Column - Booking Information */}
               <div className="space-y-6">
                 <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                   <h3 className="text-xl font-bold text-purple-800 mb-4">📅 Booking Information</h3>
                   <div className="space-y-3">
                     <div className="flex justify-between">
                       <span className="font-semibold text-purple-700">Booking ID:</span>
                       <span className="text-purple-800">#{selectedBooking.booking_id}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-semibold text-purple-700">Status:</span>
                       <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                         selectedBooking.booking_status === 'confirmed' ? 'bg-green-100 text-green-800' :
                         selectedBooking.booking_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                         selectedBooking.booking_status === 'checked_in' ? 'bg-blue-100 text-blue-800' :
                         selectedBooking.booking_status === 'checked_out' ? 'bg-gray-100 text-gray-800' :
                         'bg-red-100 text-red-800'
                       }`}>
                         {selectedBooking.booking_status.replace('_', ' ').toUpperCase()}
                       </span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-semibold text-purple-700">Room Type:</span>
                       <span className="text-purple-800">{selectedBooking.room_type}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-semibold text-purple-700">Total Price:</span>
                       <span className="text-2xl font-bold text-purple-600">${selectedBooking.total_price}</span>
                     </div>
                   </div>
                 </div>

                 <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                   <h3 className="text-xl font-bold text-blue-800 mb-4">📅 Dates & Guests</h3>
                   <div className="space-y-3">
                     <div className="flex justify-between">
                       <span className="font-semibold text-blue-700">Check-in:</span>
                       <span className="text-blue-800">{new Date(selectedBooking.check_in_date).toLocaleDateString()}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-semibold text-blue-700">Check-out:</span>
                       <span className="text-blue-800">{new Date(selectedBooking.check_out_date).toLocaleDateString()}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-semibold text-blue-700">Number of Guests:</span>
                       <span className="text-blue-800">{selectedBooking.num_guests}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-semibold text-blue-700">Nights:</span>
                       <span className="text-blue-800">
                         {Math.ceil((new Date(selectedBooking.check_out_date).getTime() - new Date(selectedBooking.check_in_date).getTime()) / (1000 * 60 * 60 * 24))}
                       </span>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Right Column - Traveler & Special Requests */}
               <div className="space-y-6">
                 <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                   <h3 className="text-xl font-bold text-green-800 mb-4">👤 Traveler Information</h3>
                   <div className="space-y-3">
                     <div className="flex justify-between">
                       <span className="font-semibold text-green-700">Traveler ID:</span>
                       <span className="text-green-800">#{selectedBooking.traveler_id}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-semibold text-green-700">Booked On:</span>
                       <span className="text-green-800">{new Date(selectedBooking.created_at).toLocaleDateString()}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-semibold text-green-700">Last Updated:</span>
                       <span className="text-green-800">
                         {selectedBooking.updated_at ? new Date(selectedBooking.updated_at).toLocaleDateString() : 'Never'}
                       </span>
                     </div>
                   </div>
                 </div>

                 {selectedBooking.special_requests && (
                   <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
                     <h3 className="text-xl font-bold text-orange-800 mb-4">📝 Special Requests</h3>
                     <div className="bg-white/50 rounded-xl p-4 border border-orange-200">
                       <p className="text-orange-800">{selectedBooking.special_requests}</p>
                     </div>
                   </div>
                 )}

                 {/* Quick Actions */}
                 <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                   <h3 className="text-xl font-bold text-gray-800 mb-4">⚡ Quick Actions</h3>
                   <div className="space-y-3">
                     {selectedBooking.booking_status === 'pending' && (
                       <>
                         <button
                           onClick={() => {
                             handleConfirmBooking(selectedBooking.booking_id);
                             setShowBookingModal(false);
                           }}
                           className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold"
                         >
                           ✅ Confirm This Booking
                         </button>
                         <button
                           onClick={() => {
                             handleRejectBooking(selectedBooking.booking_id);
                             setShowBookingModal(false);
                           }}
                           className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold"
                         >
                           ❌ Reject This Booking
                         </button>
                       </>
                     )}
                     
                     {selectedBooking.booking_status === 'confirmed' && (
                       <>
                         <button
                           onClick={() => {
                             handleUpdateBookingStatus(selectedBooking.booking_id, 'checked_in');
                             setShowBookingModal(false);
                           }}
                           className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold"
                         >
                           🏨 Check In Guest
                         </button>
                         <button
                           onClick={() => {
                             handleUpdateBookingStatus(selectedBooking.booking_id, 'checked_out');
                             setShowBookingModal(false);
                           }}
                           className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold"
                         >
                           🚪 Check Out Guest
                         </button>
                       </>
                     )}
                     
                     {selectedBooking.booking_status === 'checked_in' && (
                       <button
                         onClick={() => {
                           handleUpdateBookingStatus(selectedBooking.booking_id, 'checked_out');
                           setShowBookingModal(false);
                         }}
                         className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold"
                       >
                         🚪 Check Out Guest
                       </button>
                     )}
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default HotelOwnerDashboard;
