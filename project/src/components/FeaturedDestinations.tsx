import React, { useState, useEffect } from 'react';
import { Star, MapPin, Users, Compass, Heart, Plane } from 'lucide-react';
import { getDestinations, Destination, parseHighlights } from '../services/api';

interface FeaturedDestinationsProps {
  onSelectDestination: (destination: string) => void;
}

const FeaturedDestinations: React.FC<FeaturedDestinationsProps> = ({ onSelectDestination }) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        const data = await getDestinations();
        setDestinations(data);
      } catch (err) {
        setError('Failed to load destinations');
        console.error('Error fetching destinations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full mb-6 shadow-lg">
              <Compass className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Featured Destinations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Loading amazing destinations...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-sky-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full mb-6 shadow-lg">
              <Plane className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Featured Destinations
            </h2>
            <p className="text-xl text-red-600 max-w-3xl mx-auto mb-6">
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-8 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-full hover:from-sky-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (destinations.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full mb-6 shadow-lg">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Featured Destinations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No destinations available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-sky-200 to-blue-300 rounded-full opacity-10 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full mb-6 shadow-lg">
            <Compass className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Featured Destinations
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the world's most captivating destinations, each offering unique experiences 
            and unforgettable memories that will inspire your next adventure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <div
              key={destination.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2 border border-gray-100 hover:border-gray-200"
              onClick={() => onSelectDestination(destination.destination_id)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 shadow-lg">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-sm font-bold text-gray-800">{destination.rating}</span>
                </div>

                {/* Country Badge */}
                {destination.country && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-full px-4 py-2 shadow-lg">
                    <span className="text-sm font-semibold">{destination.country}</span>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-center space-x-2 text-white">
                      <span className="text-sm font-medium">Click to explore</span>
                      <Compass className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-sky-600 transition-colors leading-tight">
                    {destination.name}
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                  {destination.description}
                </p>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 rounded-full px-4 py-2">
                    <Users className="w-4 h-4 text-sky-500" />
                    <span className="font-medium">{destination.reviews.toLocaleString()} reviews</span>
                  </div>
                  {destination.region && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 rounded-full px-4 py-2">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">{destination.region}</span>
                    </div>
                  )}
                </div>

                {destination.highlights && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {parseHighlights(destination.highlights).map((highlight, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-sky-100 to-indigo-100 text-sky-800 text-sm font-medium rounded-full border border-sky-200 hover:from-sky-200 hover:to-indigo-200 transition-all duration-300"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}

                {/* Explore Button */}
                <div className="flex items-center justify-center pt-4 border-t border-gray-100">
                  <button className="flex items-center space-x-2 text-sky-600 hover:text-sky-700 font-semibold group-hover:translate-x-2 transition-all duration-300">
                    <span>Explore Destination</span>
                    <Plane className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-3xl p-10 text-white shadow-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h3>
            <p className="text-sky-100 text-lg mb-8 max-w-2xl mx-auto">
              Explore thousands of destinations, connect with local guides, and create memories that last a lifetime
            </p>
            <button 
              onClick={() => onSelectDestination('explorer')}
              className="bg-white text-sky-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Explore All Destinations
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;