import React from 'react';
import { X, MapPin, Star, Globe, Calendar, Thermometer, DollarSign, Languages } from 'lucide-react';

interface DestinationViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: any;
}

const DestinationViewModal: React.FC<DestinationViewModalProps> = ({ isOpen, onClose, destination }) => {
  if (!isOpen || !destination) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <MapPin className="w-6 h-6 mr-3 text-blue-600" />
            Destination Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image and Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-64 object-cover rounded-2xl shadow-lg"
              />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">{destination.name}</h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  <span>{destination.city}, {destination.country}</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  <span>{destination.rating} ({destination.reviews} reviews)</span>
                </div>
              </div>
              {destination.region && (
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                  {destination.region}
                </div>
              )}
            </div>
          </div>

          {/* Travel Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-600" />
                Best Time to Visit
              </h3>
              <p className="text-gray-700">{destination.best_time_to_visit || 'Information not available'}</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Thermometer className="w-5 h-5 mr-2 text-orange-600" />
                Weather
              </h3>
              <p className="text-gray-700">{destination.weather || 'Information not available'}</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Currency
              </h3>
              <p className="text-gray-700">{destination.currency || 'Information not available'}</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Languages className="w-5 h-5 mr-2 text-purple-600" />
                Language
              </h3>
              <p className="text-gray-700">{destination.language || 'Information not available'}</p>
            </div>
          </div>

          {/* About Section */}
          {destination.about && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">About</h3>
              <p className="text-gray-700 leading-relaxed">{destination.about}</p>
            </div>
          )}

          {/* Key Sights */}
          {destination.key_sights && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Sights & Attractions</h3>
              <p className="text-gray-700 leading-relaxed">{destination.key_sights}</p>
            </div>
          )}

          {/* Description */}
          {destination.description && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-700 leading-relaxed">{destination.description}</p>
            </div>
          )}

          {/* Highlights */}
          {destination.highlights && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Highlights</h3>
              <div className="flex flex-wrap gap-2">
                {destination.highlights.split(',').map((highlight: string, index: number) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {highlight.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DestinationViewModal;
