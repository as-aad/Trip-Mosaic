import React, { useState, useEffect } from 'react';
import { 
  X, MapPin, Clock, Globe, Users, BookOpen, Camera, ShoppingBag, Heart, Share2, 
  Calendar, Phone, Mail, Globe2, TrendingUp, Award, Info, ChevronRight, ChevronLeft, 
  ExternalLink, Star, MessageCircle, ThumbsUp, Flag, Building, Utensils, User, MessageSquare, Clock as ClockIcon, CheckCircle, AlertCircle
} from 'lucide-react';
import { getDestinationReviews, createReview } from '../services/api';
import HotelBookingModal from './HotelBookingModal';

interface DestinationDetailsModalProps {
  selectedDestination: any;
  showDestinationDetails: boolean;
  loadingServices: boolean;
  destinationGuides: any[];
  destinationHotels: any[];
  destinationRestaurants: any[];
  onClose: () => void;
}

const DestinationDetailsModal: React.FC<DestinationDetailsModalProps> = ({
  selectedDestination,
  showDestinationDetails,
  loadingServices,
  destinationGuides,
  destinationHotels,
  destinationRestaurants,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [destinationReviews, setDestinationReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showHotelBookingModal, setShowHotelBookingModal] = useState(false);
  const [selectedHotelForBooking, setSelectedHotelForBooking] = useState<any>(null);

  // Mock local products data (you can replace with real API call)
  const localProducts = [
    {
      id: 1,
      name: 'Handcrafted Wooden Bowl',
      description: 'Beautiful hand-carved wooden bowl made from local teak wood',
      price: '$25',
      category: 'Handicrafts',
      rating: 4.8,
      image: 'https://images.pexels.com/photos/3251539/pexels-photo-3251539.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      name: 'Traditional Batik Scarf',
      description: 'Colorful batik scarf with traditional Indonesian patterns',
      price: '$18',
      category: 'Textiles',
      rating: 4.6,
      image: 'https://images.pexels.com/photos/3251539/pexels-photo-3251539.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  // Mock destination images (you can replace with real API call)
  const destinationImages = [
    selectedDestination?.image || 'https://images.pexels.com/photos/3251539/pexels-photo-3251539.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3251539/pexels-photo-3251539.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3251539/pexels-photo-3251539.jpeg?auto=compress&cs=tinysrgb&w=800'
  ];

  // Fetch reviews when destination changes
  useEffect(() => {
    if (selectedDestination && showDestinationDetails) {
      fetchDestinationReviews();
    }
  }, [selectedDestination, showDestinationDetails]);

  const fetchDestinationReviews = async () => {
    if (!selectedDestination?.destination_id) return;
    
    setLoadingReviews(true);
    try {
      console.log('🔄 Fetching reviews for destination:', selectedDestination.destination_id);
      const reviewsData = await getDestinationReviews(selectedDestination.destination_id);
      console.log('📊 Fetched reviews:', reviewsData);
      setDestinationReviews(reviewsData || []);
    } catch (error) {
      console.error('❌ Error loading destination reviews:', error);
      setDestinationReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedDestination?.destination_id || !newReview.comment.trim()) {
      alert('Please provide a comment for your review');
      return;
    }

    setSubmittingReview(true);
    try {
      console.log('🔄 Submitting review for destination:', selectedDestination.destination_id);
      const reviewData = {
        rating: newReview.rating,
        comment: newReview.comment.trim()
      };
      
      const submittedReview = await createReview(selectedDestination.destination_id, reviewData);
      console.log('✅ Review submitted successfully:', submittedReview);
      
      // Reset form and close modal
      setNewReview({ rating: 5, comment: '' });
      setShowReviewModal(false);
      
      // Refresh reviews to show the new one
      await fetchDestinationReviews();
      
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('❌ Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewChange = (field: string, value: any) => {
    setNewReview(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const hasUserReviewed = () => {
    // This would need to be updated when user authentication is implemented
    // For now, we'll assume no user has reviewed
    return false;
  };

  const formatReviewDate = (dateString: string) => {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString();
  };

  const calculateAverageRating = () => {
    console.log('🔍 Calculating average rating from reviews:', destinationReviews);
    
    if (!destinationReviews || destinationReviews.length === 0) {
      console.log('📊 No reviews, using destination rating:', selectedDestination.rating);
      return selectedDestination.rating || 0;
    }
    
    const totalRating = destinationReviews.reduce((sum, review) => {
      console.log('⭐ Review rating:', review.rating, 'Type:', typeof review.rating);
      return sum + Number(review.rating);
    }, 0);
    
    const averageRating = totalRating / destinationReviews.length;
    console.log('📊 Total rating:', totalRating, 'Count:', destinationReviews.length, 'Average:', averageRating);
    
    // Round to 1 decimal place
    return Math.round(averageRating * 10) / 10;
  };

  const getAverageRatingDisplay = () => {
    const avgRating = calculateAverageRating();
    console.log('🎯 Final average rating for display:', avgRating);
    
    if (avgRating === 0) return 'New';
    return avgRating.toFixed(1);
  };

  const getRatingStats = () => {
    if (!destinationReviews || destinationReviews.length === 0) {
      return {
        total: 0,
        average: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        highestRating: 0,
        lowestRating: 0
      };
    }
    
    const ratings = destinationReviews.map(review => review.rating);
    const total = ratings.reduce((sum, rating) => sum + rating, 0);
    const average = total / ratings.length;
    const highestRating = Math.max(...ratings);
    const lowestRating = Math.min(...ratings);
    
    const distribution: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(rating => {
      if (rating in distribution) {
        distribution[rating]++;
      }
    });
    
    return {
      total,
      average: Math.round(average * 10) / 10,
      distribution,
      highestRating,
      lowestRating
    };
  };

  const getRatingTrend = () => {
    if (destinationReviews.length === 0) return null;
    
    const stats = getRatingStats();
    const staticRating = selectedDestination.rating || 0;
    const dynamicRating = stats.average;
    
    if (dynamicRating > staticRating) {
      return { type: 'improving', difference: (dynamicRating - staticRating).toFixed(1) };
    } else if (dynamicRating < staticRating) {
      return { type: 'declining', difference: (staticRating - dynamicRating).toFixed(1) };
    } else {
      return { type: 'stable', difference: '0.0' };
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % destinationImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + destinationImages.length) % destinationImages.length);
  };
  
  if (!showDestinationDetails || !selectedDestination) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'services', label: 'Services', icon: BookOpen },
    { id: 'products', label: 'Local Products', icon: ShoppingBag },
    { id: 'reviews', label: 'Reviews', icon: Star }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Destination Description */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Globe2 className="w-5 h-5 mr-2 text-blue-500" />
          About {selectedDestination.name}
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          {selectedDestination.description || selectedDestination.about || 'Discover the magic of this incredible destination with its rich culture, stunning landscapes, and unforgettable experiences.'}
        </p>
        
        {/* Key Highlights */}
        {selectedDestination.highlights && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-800 mb-2">Highlights</h4>
            <div className="flex flex-wrap gap-2">
              {selectedDestination.highlights.split(',').map((highlight: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {highlight.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Key Sights */}
        {selectedDestination.key_sights && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-800 mb-2">Key Sights & Attractions</h4>
            <div className="flex flex-wrap gap-2">
              {selectedDestination.key_sights.split(',').map((sight: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                  {sight.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Facts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-semibold text-gray-800">{selectedDestination.city}, {selectedDestination.country}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rating</p>
              <p className="font-semibold text-gray-800">{getAverageRatingDisplay()} / 5.0</p>
              <p className="text-xs text-gray-500">
                {destinationReviews.length > 0 
                  ? `Based on ${destinationReviews.length} review${destinationReviews.length !== 1 ? 's' : ''}`
                  : 'No reviews yet'
                }
              </p>
              {destinationReviews.length > 0 && (() => {
                const trend = getRatingTrend();
                if (trend) {
                  return (
                    <p className={`text-xs mt-1 ${
                      trend.type === 'improving' ? 'text-green-500' : 
                      trend.type === 'declining' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {trend.type === 'improving' && `↗️ +${trend.difference} from default`}
                      {trend.type === 'declining' && `↘️ -${trend.difference} from default`}
                      {trend.type === 'stable' && '→ Same as default rating'}
                    </p>
                  );
                }
                return null;
              })()}
              {destinationReviews.length === 0 && (
                <p className="text-xs text-purple-500 mt-1">
                  Showing destination default rating
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Reviews</p>
              <p className="font-semibold text-gray-800">{destinationReviews.length} reviews</p>
              <p className="text-xs text-gray-500">
                {destinationReviews.length > 0 
                  ? 'Real traveler feedback'
                  : 'Be the first to review!'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Region</p>
              <p className="font-semibold text-gray-800">{selectedDestination.region || 'Asia'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Destination Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedDestination.best_time_to_visit && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Best Time to Visit</p>
                <p className="font-semibold text-gray-800">{selectedDestination.best_time_to_visit}</p>
              </div>
            </div>
          </div>
        )}

        {selectedDestination.weather && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                <Globe2 className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Weather</p>
                <p className="font-semibold text-gray-800">{selectedDestination.weather}</p>
              </div>
            </div>
          </div>
        )}

        {selectedDestination.currency && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Currency</p>
                <p className="font-semibold text-gray-800">{selectedDestination.currency}</p>
              </div>
            </div>
              </div>
            )}

        {selectedDestination.language && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Language</p>
                <p className="font-semibold text-gray-800">{selectedDestination.language}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Best Time to Visit - Enhanced with real data */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-yellow-600" />
          Travel Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedDestination.best_time_to_visit ? (
            <div className="text-center">
              <div className="text-2xl mb-2">🌞</div>
              <h4 className="font-semibold text-gray-800">Best Time</h4>
              <p className="text-sm text-gray-600">{selectedDestination.best_time_to_visit}</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-2xl mb-2">🌞</div>
              <h4 className="font-semibold text-gray-800">Peak Season</h4>
              <p className="text-sm text-gray-600">June - August</p>
            </div>
          )}
          
          {selectedDestination.weather ? (
            <div className="text-center">
              <div className="text-2xl mb-2">🌤️</div>
              <h4 className="font-semibold text-gray-800">Weather</h4>
              <p className="text-sm text-gray-600">{selectedDestination.weather}</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-2xl mb-2">🍃</div>
              <h4 className="font-semibold text-gray-800">Shoulder Season</h4>
              <p className="text-sm text-gray-600">March - May</p>
            </div>
          )}
          
          {selectedDestination.currency ? (
            <div className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <h4 className="font-semibold text-gray-800">Currency</h4>
              <p className="text-sm text-gray-600">{selectedDestination.currency}</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-2xl mb-2">🌧️</div>
              <h4 className="font-semibold text-gray-800">Low Season</h4>
              <p className="text-sm text-gray-600">November - February</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderServicesTab = () => (
          <div className="space-y-6">
            {/* Local Guides */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
              <h3 className="text-xl font-bold text-green-800">Local Guides</h3>
              <p className="text-sm text-green-600">Expert local guides for authentic experiences</p>
                </div>
              </div>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            {destinationGuides.length} Available
          </span>
        </div>
        
              {loadingServices ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
                                       ) : destinationGuides.length > 0 ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {destinationGuides.map((guide, index) => (
              <div key={guide.id || index} className="bg-white/80 rounded-xl p-4 border border-green-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-200 to-emerald-300 rounded-xl flex items-center justify-center overflow-hidden">
                    {guide.image || guide.user?.image ? (
                      <img 
                        src={guide.image || guide.user?.image} 
                        alt={guide.name || guide.user?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-8 h-8 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{guide.name || guide.user?.name || 'Local Guide'}</h4>
                    <p className="text-sm text-gray-600 mb-2">{guide.specialty || guide.expertise || guide.specialties || 'Cultural Tours'}</p>
                    {guide.experience && (
                      <p className="text-xs text-green-600 mb-2">{guide.experience} experience</p>
                    )}
                    {guide.languages && (
                      <p className="text-xs text-gray-500 mb-2">Languages: {guide.languages.join(', ')}</p>
                    )}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">{guide.rating || 'New'}</span>
                        {guide.reviews && (
                          <span className="text-xs text-gray-500 ml-1">({guide.reviews})</span>
                        )}
                        </div>
                      <div className="flex items-center space-x-2">
                        {guide.price && (
                          <span className="text-sm font-semibold text-green-600">{guide.price}/day</span>
                        )}
                        <button className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors">
                          Book Guide
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p>No guides available for this destination yet.</p>
            <p className="text-sm">Check back later for local guide availability.</p>
                </div>
              )}
            </div>

            {/* Hotels */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
              <h3 className="text-xl font-bold text-purple-800">Hotels & Accommodations</h3>
              <p className="text-sm text-purple-600">Comfortable places to stay</p>
                </div>
              </div>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            {destinationHotels.length} Available
          </span>
        </div>
        
              {loadingServices ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : destinationHotels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                 {destinationHotels.map((hotel, index) => (
              <div key={hotel.id || index} className="bg-white/80 rounded-xl p-4 border border-purple-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-300 rounded-xl flex items-center justify-center overflow-hidden">
                    {hotel.image ? (
                      <img 
                        src={hotel.image} 
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-8 h-8 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{hotel.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{hotel.price_range || hotel.type || 'Accommodation'}</p>
                    {hotel.address && (
                      <p className="text-xs text-gray-500 mb-2">{hotel.address}</p>
                    )}
                    {hotel.amenities && (
                      <p className="text-xs text-purple-600 mb-2">{hotel.amenities.split(',').slice(0, 3).join(', ')}</p>
                    )}
                    <div className="flex items-center justify-between">
                                     <div className="flex items-center space-x-1">
                                       <Star className="w-4 h-4 text-yellow-500" />
                                       <span className="text-sm font-medium">{hotel.rating || 'New'}</span>
                        {hotel.reviews && (
                          <span className="text-xs text-gray-500 ml-1">({hotel.reviews})</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {hotel.price_range && (
                          <span className="text-sm font-semibold text-purple-600">{hotel.price_range}</span>
                        )}
                        <button 
                          onClick={() => {
                            setSelectedHotelForBooking(hotel);
                            setShowHotelBookingModal(true);
                          }}
                          className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-600 transition-colors"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                                     </div>
                                   </div>
                                 </div>
                               ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p>No hotels available for this destination yet.</p>
            <p className="text-sm">Check back later for accommodation options.</p>
                </div>
              )}
            </div>

            {/* Restaurants */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
              <h3 className="text-xl font-bold text-orange-800">Restaurants & Dining</h3>
                  <p className="text-sm text-orange-600">Local cuisine & flavors</p>
                </div>
              </div>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
            {destinationRestaurants.length} Available
          </span>
        </div>
        
              {loadingServices ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : destinationRestaurants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                 {destinationRestaurants.map((restaurant, index) => (
              <div key={restaurant.id || index} className="bg-white/80 rounded-xl p-4 border border-orange-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-200 to-red-300 rounded-xl flex items-center justify-center overflow-hidden">
                    {restaurant.image ? (
                      <img 
                        src={restaurant.image} 
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{restaurant.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{restaurant.cuisine_type || restaurant.cuisine || 'Local Cuisine'}</p>
                    {restaurant.address && (
                      <p className="text-xs text-gray-500 mb-2">{restaurant.address}</p>
                    )}
                    {restaurant.specialties && (
                      <p className="text-xs text-orange-600 mb-2">{restaurant.specialties.split(',').slice(0, 3).join(', ')}</p>
                    )}
                    <div className="flex items-center justify-between">
                                     <div className="flex items-center space-x-1">
                                       <Star className="w-4 h-4 text-yellow-500" />
                                       <span className="text-sm font-medium">{restaurant.rating || 'New'}</span>
                        {restaurant.reviews && (
                          <span className="text-xs text-gray-500 ml-1">({restaurant.reviews})</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {restaurant.price_range && (
                          <span className="text-sm font-semibold text-orange-600">{restaurant.price_range}</span>
                        )}
                        <button className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-orange-600 transition-colors">
                          View Menu
                        </button>
                      </div>
                    </div>
                                     </div>
                                   </div>
                                 </div>
                               ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
            <Camera className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p>No restaurants available for this destination yet.</p>
            <p className="text-sm">Check back later for dining options.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderProductsTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-teal-800">Local Products & Souvenirs</h3>
            <p className="text-sm text-teal-600">Authentic local crafts and products</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {localProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl overflow-hidden border border-teal-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="h-32 bg-gradient-to-br from-teal-100 to-cyan-200 relative overflow-hidden">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 text-teal-600" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <button className="p-1 bg-white/80 rounded-full hover:bg-white transition-colors">
                    <Heart className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
                    {product.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-gray-600">{product.rating}</span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">{product.name}</h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-teal-600">{product.price}</span>
                  <button className="bg-teal-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-teal-600 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReviewsTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-indigo-800">Traveler Reviews</h3>
              <p className="text-sm text-indigo-600">What others say about this destination</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600">{getAverageRatingDisplay()}</div>
            <div className="text-sm text-indigo-500">Average Rating</div>
            <div className="text-xs text-indigo-400">{destinationReviews.length} reviews</div>
            {destinationReviews.length > 0 && (
              <div className="text-xs text-indigo-300 mt-1">
                Based on {destinationReviews.length} review{destinationReviews.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
        
        {loadingReviews ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <span className="ml-3 text-indigo-600">Loading reviews...</span>
          </div>
        ) : destinationReviews.length > 0 ? (
          <div className="space-y-4">
            {destinationReviews.map((review) => (
              <div key={review.id} className="bg-white/80 rounded-xl p-4 border border-indigo-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-200 to-purple-300 rounded-full flex items-center justify-center overflow-hidden">
                    {review.user?.image ? (
                      <img 
                        src={review.user.image} 
                        alt={review.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-6 h-6 text-indigo-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">
                        {review.user?.name || 'Anonymous Traveler'}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {formatReviewDate(review.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">({review.rating})</span>
                    </div>
                    <p className="text-gray-700">{review.comment || 'No comment provided'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-lg font-medium mb-2">No reviews yet</p>
            <p className="text-sm">Be the first to share your experience!</p>
          </div>
        )}
        
        {/* Rating Distribution */}
        {destinationReviews.length > 0 && (
          <div className="mb-6 p-4 bg-white/60 rounded-xl border border-indigo-100">
            <h4 className="text-sm font-semibold text-indigo-700 mb-3">Rating Distribution</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const stats = getRatingStats();
                const count = stats.distribution[stars] || 0;
                const percentage = destinationReviews.length > 0 ? (count / destinationReviews.length) * 100 : 0;
                
                return (
                  <div key={stars} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 w-16">
                      <span className="text-xs text-gray-600">{stars}</span>
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-right">
                      <span className="text-xs text-gray-600">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
                </div>
              )}
        
        {/* Additional Rating Stats */}
        {destinationReviews.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
            <h4 className="text-sm font-semibold text-indigo-700 mb-3">Rating Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-indigo-600">{getRatingStats().highestRating}</div>
                <div className="text-xs text-indigo-500">Highest Rating</div>
              </div>
              <div>
                <div className="text-lg font-bold text-indigo-600">{getRatingStats().lowestRating}</div>
                <div className="text-xs text-indigo-500">Lowest Rating</div>
              </div>
              <div>
                <div className="text-lg font-bold text-indigo-600">{destinationReviews.length}</div>
                <div className="text-xs text-indigo-500">Total Reviews</div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button 
            onClick={() => setShowReviewModal(true)}
            className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center mx-auto space-x-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{hasUserReviewed() ? 'Edit Review' : 'Write a Review'}</span>
          </button>
          {hasUserReviewed() && (
            <p className="text-xs text-indigo-500 mt-2">You've already reviewed this destination</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden">
      <div className="w-full h-full overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  console.log('🔒 Close button clicked, calling onClose');
                  onClose();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedDestination.name}</h2>
                <p className="text-gray-600 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {selectedDestination.city}, {selectedDestination.country}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  isFavorite ? 'bg-red-100 text-red-500' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 text-gray-600">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

                  {/* Navigation Tabs */}
        <div className="px-6 pb-4">
          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 max-w-4xl mx-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-full max-w-6xl mx-auto">
          {/* Hero Image Section */}
          <div className="relative w-full h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-2xl overflow-hidden mb-6">
            {destinationImages[currentImageIndex] ? (
              <img 
                src={destinationImages[currentImageIndex]} 
                alt={selectedDestination.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Globe className="w-24 h-24 text-blue-600" />
              </div>
            )}
            
            {/* Image Navigation */}
            {destinationImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
                
                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {destinationImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'services' && renderServicesTab()}
          {activeTab === 'products' && renderProductsTab()}
          {activeTab === 'reviews' && renderReviewsTab()}
        </div>
      </div>

      {/* Review Creation Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        review={newReview}
        onReviewChange={handleReviewChange}
        submitting={submittingReview}
      />

      {/* Hotel Booking Modal */}
      <HotelBookingModal
        isOpen={showHotelBookingModal}
        onClose={() => setShowHotelBookingModal(false)}
        hotel={selectedHotelForBooking} // Pass the selected destination as the hotel
        onBookingSuccess={() => {
          setShowHotelBookingModal(false);
          alert('Hotel booking successful!');
        }}
      />
    </div>
  );
};

// Review Creation Modal
const ReviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  review: { rating: number; comment: string };
  onReviewChange: (field: string, value: any) => void;
  submitting: boolean;
}> = ({ isOpen, onClose, onSubmit, review, onReviewChange, submitting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Rating Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onReviewChange('rating', star)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    review.rating >= star
                      ? 'text-yellow-500 bg-yellow-50'
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <Star className={`w-6 h-6 ${review.rating >= star ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {review.rating === 5 && 'Excellent!'}
              {review.rating === 4 && 'Very Good!'}
              {review.rating === 3 && 'Good!'}
              {review.rating === 2 && 'Fair!'}
              {review.rating === 1 && 'Poor!'}
            </p>
          </div>

          {/* Comment Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={review.comment}
              onChange={(e) => onReviewChange('comment', e.target.value)}
              placeholder="Share your experience with this destination..."
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {review.comment.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!review.comment.trim() || submitting}
              className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetailsModal;
