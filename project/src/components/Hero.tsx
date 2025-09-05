import React from 'react';
import { Search, MapPin, Compass, Globe, Plane, Mountain, Camera } from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
}

const Hero: React.FC<HeroProps> = ({ onExplore }) => {
  return (
    <section className="relative bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 min-h-[85vh] flex items-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sky-400/90 via-blue-500/90 to-indigo-600/90"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-300/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-orange-300/20 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-pink-300/20 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-purple-300/20 rounded-full animate-pulse delay-1500"></div>
      </div>

      {/* Floating Travel Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-16 text-4xl opacity-20 animate-bounce delay-300">✈️</div>
        <div className="absolute top-48 right-20 text-3xl opacity-20 animate-bounce delay-700">🗺️</div>
        <div className="absolute bottom-48 left-20 text-3xl opacity-20 animate-bounce delay-1000">🏔️</div>
        <div className="absolute bottom-32 right-16 text-4xl opacity-20 animate-bounce delay-500">🌍</div>
        <div className="absolute top-1/2 left-8 text-2xl opacity-20 animate-bounce delay-1200">🏖️</div>
        <div className="absolute top-1/2 right-8 text-2xl opacity-20 animate-bounce delay-800">🗽</div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <div className="max-w-5xl mx-auto">
          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="block">Discover Your Perfect</span>
              <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent animate-pulse">
                Travel Journey
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl lg:text-3xl text-blue-100 mb-8 leading-relaxed max-w-4xl mx-auto">
              Your all-in-one travel platform connecting you with 
              <span className="text-yellow-200 font-semibold"> destinations</span>, 
              <span className="text-orange-200 font-semibold"> experiences</span>, 
              <span className="text-pink-200 font-semibold"> local guides</span>, and 
              <span className="text-purple-200 font-semibold"> fellow travelers</span> worldwide
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button
              onClick={onExplore}
              className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-10 py-5 rounded-full font-bold text-xl hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/25 flex items-center space-x-3"
            >
              <Compass className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              <span>Explore Destinations</span>
              <Plane className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            
            <div className="flex items-center space-x-3 text-white/90 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
              <Globe className="w-5 h-5 text-yellow-300" />
              <span className="font-medium">195+ Countries • 10,000+ Destinations • 50K+ Travelers</span>
            </div>
          </div>

          {/* Enhanced Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group bg-white/15 backdrop-blur-md rounded-2xl p-8 hover:bg-white/25 transition-all duration-300 hover:scale-105 border border-white/20 hover:border-white/40">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Mountain className="w-8 h-8 text-white" />
              </div>
              <div className="text-yellow-300 text-2xl font-bold mb-3 group-hover:text-yellow-200 transition-colors">Complete Platform</div>
              <div className="text-blue-100 text-lg">Hotels • Guides • Transport • Local Products</div>
            </div>
            
            <div className="group bg-white/15 backdrop-blur-md rounded-2xl p-8 hover:bg-white/25 transition-all duration-300 hover:scale-105 border border-white/20 hover:border-white/40">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <div className="text-yellow-300 text-2xl font-bold mb-3 group-hover:text-yellow-200 transition-colors">Social Travel</div>
              <div className="text-blue-100 text-lg">Travel Buddies • Stories • Community</div>
            </div>
            
            <div className="group bg-white/15 backdrop-blur-md rounded-2xl p-8 hover:bg-white/25 transition-all duration-300 hover:scale-105 border border-white/20 hover:border-white/40">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div className="text-yellow-300 text-2xl font-bold mb-3 group-hover:text-yellow-200 transition-colors">Safe & Sustainable</div>
              <div className="text-blue-100 text-lg">Emergency Tools • Carbon Calculator</div>
            </div>
          </div>

          {/* Travel Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-300 mb-2">195+</div>
              <div className="text-blue-100">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-300 mb-2">10K+</div>
              <div className="text-blue-100">Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-300 mb-2">50K+</div>
              <div className="text-blue-100">Travelers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-300 mb-2">24/7</div>
              <div className="text-blue-100">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Effect */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-auto">
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            opacity=".25" 
            className="fill-white"
          ></path>
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            opacity=".5" 
            className="fill-white"
          ></path>
          <path 
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
            className="fill-white"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;