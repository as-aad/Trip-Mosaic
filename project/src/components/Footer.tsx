import React from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Trip Mosaic</h3>
            <p className="text-gray-300 mb-4">
              Your comprehensive travel platform connecting you with destinations, experiences, 
              local guides, authentic products, and fellow travelers worldwide.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#destinations" className="text-gray-300 hover:text-white">Destinations</a></li>
              <li><a href="#hotels" className="text-gray-300 hover:text-white">Hotels</a></li>
              <li><a href="#guides" className="text-gray-300 hover:text-white">Local Guides</a></li>
              <li><a href="#blog" className="text-gray-300 hover:text-white">Travel Blog</a></li>
              <li><a href="#buddy" className="text-gray-300 hover:text-white">Travel Buddy</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li><a href="#products" className="text-gray-300 hover:text-white">Local Products</a></li>
              <li><a href="#restaurants" className="text-gray-300 hover:text-white">Restaurant Finder</a></li>
              <li><a href="#transport" className="text-gray-300 hover:text-white">Transport Booking</a></li>
              <li><a href="#carbon" className="text-gray-300 hover:text-white">Carbon Calculator</a></li>
              <li><a href="#emergency" className="text-gray-300 hover:text-white">Emergency Tools</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Get in Touch</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">Global Headquarters</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">24/7 Support Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">hello@tripmosaic.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © Asad Chowdhury. All rights reserved. | Connecting travelers worldwide.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;