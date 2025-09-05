import React, { useState } from 'react';
import { Calendar, User, Heart, MessageCircle, Share, Camera, MapPin, BookOpen, Globe, Compass, Star, ArrowRight, Plane } from 'lucide-react';

const TravelBlog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const posts = [
    {
      id: 1,
      author: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100',
      title: '5 Hidden Temples in Bali You Must Visit',
      excerpt: 'Discover the secret spiritual sites that most tourists never see. From ancient shrines nestled in rice terraces to sacred caves hidden in the jungle, these mystical places offer a glimpse into Bali\'s rich spiritual heritage.',
      image: 'https://images.pexels.com/photos/2832432/pexels-photo-2832432.jpeg?auto=compress&cs=tinysrgb&w=800',
      location: 'Bali, Indonesia',
      date: '2 days ago',
      likes: 127,
      comments: 23,
      category: 'Culture',
      readTime: '5 min read',
      rating: 4.8
    },
    {
      id: 2,
      author: 'Mike Johnson',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      title: 'Tokyo Food Adventure: Best Street Food Guide',
      excerpt: 'From ramen stalls to sushi counters, here are the best authentic eats in Tokyo. Navigate the bustling streets and discover hidden gems that locals love, from traditional izakayas to modern fusion spots.',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
      location: 'Tokyo, Japan',
      date: '1 week ago',
      likes: 89,
      comments: 15,
      category: 'Food',
      readTime: '7 min read',
      rating: 4.6
    },
    {
      id: 3,
      author: 'Elena Rodriguez',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100',
      title: 'Sunset Photography Tips in Santorini',
      excerpt: 'Capture the perfect golden hour shots with these professional tips. Learn the best locations, timing, and techniques to immortalize Santorini\'s breathtaking sunsets in your photography portfolio.',
      image: 'https://images.pexels.com/photos/161901/santorini-greece-island-sunset-161901.jpeg?auto=compress&cs=tinysrgb&w=800',
      location: 'Santorini, Greece',
      date: '2 weeks ago',
      likes: 156,
      comments: 31,
      category: 'Photography',
      readTime: '6 min read',
      rating: 4.9
    },
    {
      id: 4,
      author: 'David Kim',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
      title: 'Adventure Hiking in the Swiss Alps',
      excerpt: 'Experience the thrill of mountain climbing in the majestic Swiss Alps. From beginner-friendly trails to challenging peaks, discover routes that offer stunning panoramic views and unforgettable memories.',
      image: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800',
      location: 'Swiss Alps',
      date: '3 weeks ago',
      likes: 203,
      comments: 42,
      category: 'Adventure',
      readTime: '8 min read',
      rating: 4.7
    },
    {
      id: 5,
      author: 'Maria Santos',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      title: 'Local Markets of Marrakech: A Sensory Journey',
      excerpt: 'Immerse yourself in the vibrant colors, sounds, and aromas of Marrakech\'s famous souks. Navigate the labyrinthine alleys and discover authentic Moroccan crafts, spices, and cultural treasures.',
      image: 'https://images.pexels.com/photos/4488638/pexels-photo-4488638.jpeg?auto=compress&cs=tinysrgb&w=800',
      location: 'Marrakech, Morocco',
      date: '1 month ago',
      likes: 178,
      comments: 28,
      category: 'Culture',
      readTime: '9 min read',
      rating: 4.8
    },
    {
      id: 6,
      author: 'James Wilson',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100',
      title: 'Budget Travel Tips for Southeast Asia',
      excerpt: 'Explore Southeast Asia without breaking the bank. Learn insider secrets for finding affordable accommodation, local transportation, and authentic experiences that won\'t compromise on adventure.',
      image: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=800',
      location: 'Southeast Asia',
      date: '1 month ago',
      likes: 145,
      comments: 35,
      category: 'Tips',
      readTime: '10 min read',
      rating: 4.5
    }
  ];

  const categories = [
    { name: 'All', icon: '🌍', count: posts.length },
    { name: 'Adventure', icon: '🏔️', count: posts.filter(p => p.category === 'Adventure').length },
    { name: 'Culture', icon: '🏛️', count: posts.filter(p => p.category === 'Culture').length },
    { name: 'Food', icon: '🍽️', count: posts.filter(p => p.category === 'Food').length },
    { name: 'Photography', icon: '📸', count: posts.filter(p => p.category === 'Photography').length },
    { name: 'Tips', icon: '💡', count: posts.filter(p => p.category === 'Tips').length },
    { name: 'Reviews', icon: '⭐', count: posts.filter(p => p.category === 'Reviews').length }
  ];

  const filteredPosts = selectedCategory === 'All' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-sky-200 to-blue-300 rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-5 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-lg">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Travel Stories & Tips
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Share your adventures and discover inspiring travel stories from our global community of explorers
          </p>
          
          {/* Create Post Button */}
          <button className="group bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:from-sky-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-sky-500/25 flex items-center space-x-3 mx-auto">
            <Camera className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            <span>Share Your Story</span>
            <Plane className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-16">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`group px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  selectedCategory === category.name
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 border-2 border-gray-200 hover:scale-105'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span>{category.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedCategory === category.name
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 border border-gray-100 hover:border-gray-200"
            >
              {/* Image Section */}
              <div className="relative overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  {post.category}
                </div>
                
                {/* Location Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center space-x-1">
                  <MapPin className="w-4 h-4 text-sky-500" />
                  <span>{post.location}</span>
                </div>

                {/* Rating Badge */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-2 rounded-full text-sm font-bold shadow-lg flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>{post.rating}</span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-center space-x-2 text-white">
                      <span className="text-sm font-medium">Click to read more</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8">
                {/* Author Info */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className="relative">
                    <img
                      src={post.avatar}
                      alt={post.author}
                      className="w-12 h-12 rounded-full object-cover ring-4 ring-sky-100 group-hover:ring-sky-200 transition-all duration-300"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-lg">{post.author}</div>
                    <div className="flex items-center text-gray-500 text-sm space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-sky-500" />
                        {post.date}
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1 text-orange-500" />
                        {post.readTime}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title and Excerpt */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-sky-600 transition-colors">
                  {post.title}
                </h3>

                <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Engagement Stats */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <div className="flex items-center space-x-6">
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-all duration-300 group-hover:scale-110">
                      <Heart className="w-5 h-5 group-hover:fill-current" />
                      <span className="text-sm font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-all duration-300 group-hover:scale-110">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{post.comments}</span>
                    </button>
                  </div>
                  <button className="text-gray-500 hover:text-sky-600 transition-all duration-300 group-hover:scale-110">
                    <Share className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load More Section */}
        <div className="text-center mb-20">
          <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-3xl p-10 text-white shadow-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-4">More Stories Await!</h3>
            <p className="text-sky-100 text-lg mb-8 max-w-2xl mx-auto">
              Discover thousands of travel stories, tips, and adventures from our global community
            </p>
            <button className="bg-white text-sky-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 shadow-lg">
              Load More Stories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelBlog;