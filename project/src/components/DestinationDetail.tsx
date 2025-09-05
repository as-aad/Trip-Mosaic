import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, MapPin, Clock, Users, Car, Utensils, ShoppingBag, Home } from 'lucide-react';
import BookingTabs from './BookingTabs';
import RatingSystem from './RatingSystem';
import { getDestination, Destination, parseHighlights } from '../services/api';

interface DestinationDetailProps {
  destination: string;
  onBack: () => void;
}

const DestinationDetail: React.FC<DestinationDetailProps> = ({ destination, onBack }) => {
  const [activeTab, setActiveTab] = useState<'hotels' | 'guides' | 'products' | 'food' | 'transport'>('hotels');
  const [destinationData, setDestinationData] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        setLoading(true);
        const data = await getDestination(destination);
        setDestinationData(data);
      } catch (err) {
        setError('Failed to load destination details');
        console.error('Error fetching destination:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDestination();
  }, [destination]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading destination details...</p>
        </div>
      </div>
    );
  }

  if (error || !destinationData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error || 'Destination not found'}</p>
          <button 
            onClick={onBack}
            className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const highlights = parseHighlights(destinationData.highlights);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
          <img
            src={destinationData.image}
            alt={destinationData.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
              {destinationData.name}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-semibold">{destinationData.rating}</span>
                <span className="text-white/80">({destinationData.reviews.toLocaleString()} reviews)</span>
              </div>
              {destinationData.country && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-5 h-5" />
                  <span>{destinationData.country}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About {destinationData.name}</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {destinationData.description || 'No description available for this destination.'}
              </p>
              
              {highlights.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  {highlights.map((highlight, index) => (
                    <div key={index} className="bg-sky-50 rounded-lg p-3 text-center">
                      <span className="text-sky-700 font-medium">{highlight}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Booking Tabs */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Services & Bookings</h2>
              <div className="flex flex-wrap gap-2 mb-6 border-b">
                {[
                  { key: 'hotels', label: 'Hotels', icon: Home },
                  { key: 'guides', label: 'Local Guides', icon: Users },
                  { key: 'products', label: 'Local Products', icon: ShoppingBag },
                  { key: 'food', label: 'Restaurants', icon: Utensils },
                  { key: 'transport', label: 'Transport', icon: Car },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${
                      activeTab === key
                        ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50'
                        : 'text-gray-600 hover:text-sky-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              
              <BookingTabs activeTab={activeTab} destination={destinationData.name} />
            </div>

            {/* Rating System */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Rate Your Experience</h2>
              <RatingSystem destinationId={destinationData.destination_id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Info</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Region</p>
                    <p className="font-medium">{destinationData.region || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="font-medium">{destinationData.rating}/5.0</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Reviews</p>
                    <p className="font-medium">{destinationData.reviews.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="w-full bg-sky-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-sky-700 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;