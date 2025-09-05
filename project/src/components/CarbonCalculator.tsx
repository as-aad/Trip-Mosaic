import React, { useState } from 'react';
import { Leaf, Plane, Car, Train, Calculator, Award, TreePine, Globe, Compass, Star, ArrowRight, Heart, Zap, Waves, Mountain } from 'lucide-react';

const CarbonCalculator: React.FC = () => {
  const [tripData, setTripData] = useState({
    origin: '',
    destination: '',
    transport: 'plane',
    distance: 0,
    passengers: 1,
  });
  
  const [results, setResults] = useState<{
    carbon: number;
    trees: number;
    alternatives: any[];
  } | null>(null);

  const transportOptions = [
    { value: 'plane', label: 'Airplane', icon: Plane, factor: 0.255, emoji: '✈️', color: 'from-blue-500 to-indigo-600' },
    { value: 'car', label: 'Car', icon: Car, factor: 0.171, emoji: '🚗', color: 'from-green-500 to-emerald-600' },
    { value: 'train', label: 'Train', icon: Train, factor: 0.041, emoji: '🚂', color: 'from-orange-500 to-red-600' },
  ];

  const calculateCarbon = () => {
    const option = transportOptions.find(opt => opt.value === tripData.transport);
    if (!option || !tripData.distance) return;

    const carbonKg = (tripData.distance * option.factor * tripData.passengers);
    const treesNeeded = Math.ceil(carbonKg / 22); // 22kg CO2 per tree per year

    const alternatives = transportOptions
      .filter(opt => opt.value !== tripData.transport)
      .map(opt => ({
        ...opt,
        carbon: tripData.distance * opt.factor * tripData.passengers,
        savings: carbonKg - (tripData.distance * opt.factor * tripData.passengers),
      }))
      .sort((a, b) => a.carbon - b.carbon);

    setResults({
      carbon: carbonKg,
      trees: treesNeeded,
      alternatives,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200 to-blue-300 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200 to-indigo-300 rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-200 to-teal-200 rounded-full opacity-5 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full mb-6 shadow-lg">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Carbon Footprint Calculator
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Calculate your travel's environmental impact and discover eco-friendly alternatives to make your adventures more sustainable
          </p>
          
          {/* Floating Travel Icons */}
          <div className="flex justify-center space-x-8 text-4xl opacity-20 animate-bounce">
            <span className="animate-bounce delay-300">🌍</span>
            <span className="animate-bounce delay-700">🌱</span>
            <span className="animate-bounce delay-1000">🏔️</span>
            <span className="animate-bounce delay-500">🌊</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Calculator */}
          <div className="group bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1 transition-all duration-500">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Trip Calculator</h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    From
                  </label>
                  <input
                    type="text"
                    value={tripData.origin}
                    onChange={(e) => setTripData({...tripData, origin: e.target.value})}
                    placeholder="Origin city"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-green-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    To
                  </label>
                  <input
                    type="text"
                    value={tripData.destination}
                    onChange={(e) => setTripData({...tripData, destination: e.target.value})}
                    placeholder="Destination city"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-green-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Distance (km)
                </label>
                <input
                  type="number"
                  value={tripData.distance || ''}
                  onChange={(e) => setTripData({...tripData, distance: Number(e.target.value)})}
                  placeholder="0"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-green-300"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Transport Mode
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {transportOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setTripData({...tripData, transport: option.value})}
                        className={`group p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center space-y-3 transform hover:scale-105 ${
                          tripData.transport === option.value
                            ? `border-green-500 bg-gradient-to-br ${option.color} text-white shadow-lg scale-105`
                            : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                        }`}
                      >
                        <span className="text-2xl">{option.emoji}</span>
                        <Icon className={`w-6 h-6 ${tripData.transport === option.value ? 'text-white' : 'text-gray-600'}`} />
                        <span className={`text-sm font-bold ${tripData.transport === option.value ? 'text-white' : 'text-gray-700'}`}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Number of Passengers
                </label>
                <input
                  type="number"
                  min="1"
                  value={tripData.passengers}
                  onChange={(e) => setTripData({...tripData, passengers: Number(e.target.value)})}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:border-green-300"
                />
              </div>

              <button
                onClick={calculateCarbon}
                disabled={!tripData.distance || !tripData.origin || !tripData.destination}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/25 flex items-center justify-center space-x-3 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Calculator className="w-6 h-6" />
                <span>Calculate Impact</span>
                <Leaf className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-8">
            {results ? (
              <>
                {/* Carbon Impact */}
                <div className="group bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1 transition-all duration-500">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Your Carbon Impact</h3>
                  </div>
                  <div className="text-center">
                    <div className="text-6xl font-bold bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent mb-3">
                      {results.carbon.toFixed(2)} kg
                    </div>
                    <div className="text-xl text-gray-600 font-semibold">CO₂ Emissions</div>
                  </div>
                  
                  <div className="mt-8 p-6 bg-gradient-to-r from-green-100 to-teal-100 rounded-2xl border border-green-200">
                    <div className="flex items-center justify-center space-x-3 text-green-700">
                      <TreePine className="w-6 h-6 text-green-600" />
                      <span className="font-bold text-lg">
                        {results.trees} trees needed to offset this trip
                      </span>
                    </div>
                  </div>
                </div>

                {/* Eco Alternatives */}
                <div className="group bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1 transition-all duration-500">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Compass className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Eco-Friendly Alternatives</h3>
                  </div>
                  <div className="space-y-4">
                    {results.alternatives.map((alt, index) => {
                      const Icon = alt.icon;
                      const savings = alt.savings > 0;
                      return (
                        <div key={alt.value} className="group/item p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:scale-105">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-2xl">{alt.emoji}</span>
                              <Icon className="w-6 h-6 text-gray-600" />
                              <span className="font-bold text-gray-900">{alt.label}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900 text-lg">
                                {alt.carbon.toFixed(2)} kg CO₂
                              </div>
                              {savings && (
                                <div className="text-green-600 font-semibold">
                                  -{alt.savings.toFixed(2)} kg saved
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Offset Actions */}
                <div className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 rounded-3xl shadow-2xl p-8 text-white transform hover:scale-105 transition-transform duration-500">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">Offset Your Carbon</h3>
                  </div>
                  <div className="space-y-4">
                    <button className="w-full bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-left hover:bg-white/30 transition-all duration-300 group transform hover:scale-105">
                      <div className="flex items-center space-x-3">
                        <TreePine className="w-6 h-6 text-green-200" />
                        <div>
                          <div className="font-bold text-lg">Plant Trees</div>
                          <div className="text-green-100">Offset ${(results.carbon * 0.02).toFixed(2)}</div>
                        </div>
                      </div>
                    </button>
                    <button className="w-full bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-left hover:bg-white/30 transition-all duration-300 group transform hover:scale-105">
                      <div className="flex items-center space-x-3">
                        <Zap className="w-6 h-6 text-yellow-200" />
                        <div>
                          <div className="font-bold text-lg">Renewable Energy Projects</div>
                          <div className="text-green-100">Support clean energy initiatives</div>
                        </div>
                      </div>
                    </button>
                    <button className="w-full bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-left hover:bg-white/30 transition-all duration-300 group transform hover:scale-105">
                      <div className="flex items-center space-x-3">
                        <Waves className="w-6 h-6 text-blue-200" />
                        <div>
                          <div className="font-bold text-lg">Ocean Conservation</div>
                          <div className="text-green-100">Protect marine ecosystems</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="group bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1 transition-all duration-500">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-600 mb-4">
                  Calculate Your Impact
                </h3>
                <p className="text-gray-500 text-lg leading-relaxed">
                  Enter your trip details to see your carbon footprint and discover eco-friendly alternatives for sustainable travel
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Tips Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-20 border border-gray-100">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full mb-6 shadow-lg">
              <Star className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-6">Sustainable Travel Tips</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Make your adventures more eco-friendly with these sustainable travel practices
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl">
                <Plane className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-3 text-lg">Choose Direct Flights</h4>
              <p className="text-gray-600 leading-relaxed">Reduce emissions by avoiding layovers and connections</p>
            </div>
            
            <div className="group text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl">
                <Car className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-3 text-lg">Use Public Transport</h4>
              <p className="text-gray-600 leading-relaxed">Explore destinations using buses, trains, and metros</p>
            </div>
            
            <div className="group text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl">
                <Leaf className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-3 text-lg">Stay Longer</h4>
              <p className="text-gray-600 leading-relaxed">Maximize your impact by taking longer, less frequent trips</p>
            </div>
            
            <div className="group text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl">
                <Mountain className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-3 text-lg">Eco Accommodations</h4>
              <p className="text-gray-600 leading-relaxed">Choose hotels with green certifications and practices</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mb-20">
          <div className="bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 rounded-3xl p-12 text-white shadow-2xl transform hover:scale-105 transition-transform duration-500">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-4xl font-bold mb-6">Make Every Trip Count!</h3>
            <p className="text-green-100 text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of eco-conscious travelers who are making a positive impact on the planet while exploring the world
            </p>
            <button className="bg-white text-green-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 shadow-lg">
              Start Your Eco Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonCalculator;