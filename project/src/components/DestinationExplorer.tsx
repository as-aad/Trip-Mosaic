import React, { useState } from 'react';
import { Search, Filter, MapPin, Globe, Map } from 'lucide-react';

interface DestinationExplorerProps {
  onSelectDestination: (destination: string) => void;
}

const countries = [
  'Indonesia', 'Japan', 'Greece', 'UAE', 'Iceland', 'Peru', 'France', 'Italy', 'Spain', 'Thailand'
];

const categories = [
  'All', 'Beaches', 'Mountains', 'Cities', 'Culture', 'Adventure', 'Romance', 'Nature'
];

const destinations = [
  { id: 'bali', name: 'Bali', country: 'Indonesia', category: 'Beaches', image: 'https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', category: 'Cities', image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'santorini', name: 'Santorini', country: 'Greece', category: 'Romance', image: 'https://images.pexels.com/photos/161901/santorini-greece-island-sunset-161901.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'dubai', name: 'Dubai', country: 'UAE', category: 'Cities', image: 'https://images.pexels.com/photos/1467300/pexels-photo-1467300.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'iceland', name: 'Reykjavik', country: 'Iceland', category: 'Nature', image: 'https://images.pexels.com/photos/1559827/pexels-photo-1559827.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'peru', name: 'Cusco', country: 'Peru', category: 'Culture', image: 'https://images.pexels.com/photos/2613455/pexels-photo-2613455.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

const DestinationExplorer: React.FC<DestinationExplorerProps> = ({ onSelectDestination }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch = dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dest.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = !selectedCountry || dest.country === selectedCountry;
    const matchesCategory = selectedCategory === 'All' || dest.category === selectedCategory;
    
    return matchesSearch && matchesCountry && matchesCategory;
  });

  return (
    <div className="py-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Explore Destinations
          </h1>
          <p className="text-xl text-gray-600">
            Discover amazing places around the world
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search destinations, countries, or cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            {/* Country Filter */}
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="pl-10 pr-8 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none bg-white min-w-[160px]"
              >
                <option value="">All Countries</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 flex items-center space-x-2 transition-colors ${
                  viewMode === 'grid' ? 'bg-sky-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-3 flex items-center space-x-2 transition-colors ${
                  viewMode === 'map' ? 'bg-sky-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Map className="w-4 h-4" />
                <span>Map</span>
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-sky-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-sky-50 hover:text-sky-600'
                } border border-gray-200`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDestinations.map((destination) => (
              <div
                key={destination.id}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => onSelectDestination(destination.id)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 group-hover:text-sky-600 transition-colors">
                      {destination.name}
                    </h3>
                    <MapPin className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{destination.country}</p>
                  <span className="inline-block px-2 py-1 bg-sky-100 text-sky-700 text-xs rounded-full">
                    {destination.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-200 rounded-xl h-96 flex items-center justify-center">
            <div className="text-center">
              <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Interactive Map View</h3>
              <p className="text-gray-500">Map integration coming soon</p>
            </div>
          </div>
        )}

        {filteredDestinations.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No destinations found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationExplorer;