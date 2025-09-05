import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut, 
  RefreshCw, 
  Trash2, 
  Edit, 
  Plus,
  Eye,
  Star,
  Globe,
  Calendar,
  Thermometer,
  DollarSign,
  Languages,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Shield
} from 'lucide-react';
import { signOut, getCurrentUser, getUserManagementData, getAdminStatistics, getAdminDashboardStats, getDestinations, getBlogPosts, deleteUser, deleteDestination, deleteBlogPost, refreshAdminData, createDestination, updateDestination } from '../services/api';
import DestinationForm from './DestinationForm';
import DestinationViewModal from './DestinationViewModal';
import DestinationEditModal from './DestinationEditModal';

const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'destinations' | 'blog'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isDestinationFormOpen, setIsDestinationFormOpen] = useState(false);
  const [isAddingDestination, setIsAddingDestination] = useState(false);
  const [isViewingDestination, setIsViewingDestination] = useState(false);
  const [isEditingDestination, setIsEditingDestination] = useState(false);
  const [isUpdatingDestination, setIsUpdatingDestination] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);

  // Get current user when component mounts
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'admin') {
      setUser(currentUser);
    } else {
      // Redirect to signin if not authenticated or not admin
      window.location.href = '/signin';
    }
  }, []);

  // Load data when component mounts
  useEffect(() => {
    if (user && user.role === 'admin') {
      loadData();
    }
  }, [user]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    console.log('Manual refresh requested...');
    console.log('Current user stats before refresh:', userStats);
    
    await loadData();
    
    console.log('User stats after refresh:', userStats);
    setLastRefresh(new Date());
    setMessage({ type: 'success', text: 'Data refreshed manually!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const loadData = async () => {
    if (!user || user.role !== 'admin') return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Loading admin data...');
      
      // Try to get all data from the new simplified endpoint
      const data = await refreshAdminData();
      console.log('Admin data loaded successfully:', data);
      
      if (data.adminStats) {
        // Extract user counts from admin stats
        setUserStats({
          total_users: data.adminStats.total_users || 0,
          travelers: data.adminStats.travelers || 0,
          guides: data.adminStats.guides || 0,
          restaurant_owners: data.adminStats.restaurant_owners || 0,
          hotel_owners: data.adminStats.hotel_owners || 0,
          admins: data.adminStats.admins || 0
        });
        
        // Set admin stats
        setAdminStats({
          total_users: data.adminStats.total_users || 0,
          total_destinations: data.adminStats.total_destinations || 0,
          total_blog_posts: data.adminStats.total_blog_posts || 0,
          average_rating: data.adminStats.average_rating || 0,
          total_reviews: data.adminStats.total_reviews || 0
        });
      }
      
      // Also fetch individual data for detailed views
      try {
        console.log('Fetching individual data...');
        const [usersData, destinationsData, blogPostsData] = await Promise.all([
          getUserManagementData(), // Use new user management data
          getDestinations(),
          getBlogPosts()
        ]);
        
        console.log('Individual data received:', {
          users: usersData,
          destinations: destinationsData,
          blogPosts: blogPostsData
        });
        
        setUsers(usersData || []);
        setDestinations(destinationsData || []);
        setBlogPosts(blogPostsData || []);
        
      } catch (error) {
        console.error('Error fetching individual data:', error);
        setError('Failed to fetch some data. Please try refreshing.');
      }
      
    } catch (error) {
      console.error('Error loading admin data:', error);
      setError('Failed to load admin data. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setIsLoading(true);
      
      // Get fresh admin data
      const data = await refreshAdminData();
      console.log('Refresh data received:', data);
      
      if (data.adminStats) {
        // Update user statistics from admin stats
        setUserStats({
          total_users: data.adminStats.total_users || 0,
          travelers: data.adminStats.travelers || 0,
          guides: data.adminStats.guides || 0,
          restaurant_owners: data.adminStats.restaurant_owners || 0,
          hotel_owners: data.adminStats.hotel_owners || 0,
          admins: data.adminStats.admins || 0
        });
        
        // Update admin stats
        setAdminStats({
          total_users: data.adminStats.total_users || 0,
          total_destinations: data.adminStats.total_destinations || 0,
          total_blog_posts: data.adminStats.total_blog_posts || 0,
          average_rating: data.adminStats.average_rating || 0,
          total_reviews: data.adminStats.total_reviews || 0
        });
      }
      
      // Also fetch fresh individual data
      const [usersData, destinationsData, blogPostsData] = await Promise.all([
        getUserManagementData(), // Use new user management data
        getDestinations(),
        getBlogPosts()
      ]);
      
      setUsers(usersData || []);
      setDestinations(destinationsData || []);
      setBlogPosts(blogPostsData || []);
      
      setLastRefresh(new Date());
      setMessage({ type: 'success', text: 'Data refreshed successfully!' });
      
    } catch (error) {
      console.error('Error refreshing data:', error);
      setMessage({ type: 'error', text: 'Failed to refresh data. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    console.log('🚨 handleDeleteUser called with userId:', userId);
    
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) {
      console.error('User not found for deletion:', userId);
      return;
    }

    // Prevent admin from deleting themselves
    if (userToDelete.id === user?.id) {
      setMessage({ type: 'error', text: 'You cannot delete your own account!' });
      return;
    }

    // Prevent admin from deleting other admins
    if (userToDelete.role === 'admin') {
      setMessage({ type: 'error', text: 'You cannot delete other admin accounts!' });
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${userToDelete.name} (${userToDelete.email})?\n\nThis action cannot be undone and will permanently remove the user from the system.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        setIsLoading(true);
        console.log('🔄 Starting user deletion process...');
        console.log('User to delete:', userToDelete);
        console.log('Auth token exists:', !!localStorage.getItem('authToken'));
        
        // Call the delete API
        console.log('📡 Calling deleteUser API...');
        const result = await deleteUser(userId);
        console.log('✅ Delete API response:', result);
        
        setMessage({ type: 'success', text: `User ${userToDelete.name} deleted successfully!` });
        
        // Remove the user from the local state immediately
        setUsers(prevUsers => {
          const newUsers = prevUsers.filter(u => u.id !== userId);
          console.log('📊 Updated users list:', newUsers.length, 'users remaining');
          return newUsers;
        });
        
        // Refresh admin statistics to update the user count
        try {
          console.log('🔄 Refreshing admin statistics...');
          const data = await refreshAdminData();
          console.log('📊 New admin stats:', data);
          
          if (data.adminStats) {
            setUserStats({
              total_users: data.adminStats.total_users || 0,
              travelers: data.adminStats.travelers || 0,
              guides: data.adminStats.guides || 0,
              restaurant_owners: data.adminStats.restaurant_owners || 0,
              hotel_owners: data.adminStats.hotel_owners || 0,
              admins: data.adminStats.admins || 0
            });
          }
        } catch (error) {
          console.error('⚠️ Error refreshing admin stats after deletion:', error);
        }
        
        // Clear success message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
      } catch (error: any) {
        console.error('❌ Error deleting user:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        
        setMessage({ type: 'error', text: `Failed to delete user: ${error.message || 'Unknown error'}` });
        // Clear error message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('❌ User cancelled deletion');
    }
  };

  const handleDeleteDestination = async (destinationId: number) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      try {
        await deleteDestination(destinationId.toString());
        setMessage({ type: 'success', text: 'Destination deleted successfully!' });
        
        // Refresh destinations data
        try {
          const destinationsData = await getDestinations();
          setDestinations(destinationsData || []);
        } catch (error) {
          console.error('Error refreshing destinations:', error);
        }
        
        // Refresh admin statistics
        await refreshData();
        
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message || 'Failed to delete destination' });
      }
    }
  };

  const handleViewDestination = (destination: any) => {
    setSelectedDestination(destination);
    setIsViewingDestination(true);
  };

  const handleEditDestination = (destination: any) => {
    setSelectedDestination(destination);
    setIsEditingDestination(true);
  };

  const handleUpdateDestination = async (updatedData: any) => {
    try {
      setIsUpdatingDestination(true);
      
      // Call the API to update the destination
      await updateDestination(selectedDestination.id, updatedData);
      setMessage({ type: 'success', text: 'Destination updated successfully!' });
      
      // Close the edit modal
      setIsEditingDestination(false);
      setSelectedDestination(null);
      
      // Refresh destinations data
      const destinationsData = await getDestinations();
      setDestinations(destinationsData || []);
      
      // Refresh admin statistics
      await refreshData();
      
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update destination' });
    } finally {
      setIsUpdatingDestination(false);
    }
  };

  const handleDeleteBlogPost = async (postId: number) => {
    if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      try {
        await deleteBlogPost(postId);
        setBlogPosts(prev => prev.filter(post => post.id !== postId));
        setMessage({ type: 'success', text: 'Blog post deleted successfully!' });
        
        // Refresh admin statistics
        await refreshData();
      } catch (error) {
        console.error('Error deleting blog post:', error);
        setMessage({ type: 'error', text: 'Failed to delete blog post. Please try again.' });
      }
    }
  };

  const handleAddDestination = async (destinationData: any) => {
    try {
      setIsAddingDestination(true);
      
      console.log('🚀 Starting destination creation...');
      console.log('📝 Destination data:', destinationData);
      
      // Call the API to create the destination in the database
      console.log('📡 Calling createDestination API...');
      const newDestination = await createDestination(destinationData);
      console.log('✅ Destination created successfully:', newDestination);
      
      // Close the form
      setIsDestinationFormOpen(false);
      setMessage({ type: 'success', text: 'Destination added successfully!' });
      
      // Refresh all data to get the latest information
      console.log('🔄 Refreshing data...');
      await refreshData();
      console.log('✅ Data refresh completed');
      
    } catch (error: any) {
      console.error('❌ Error adding destination:', error);
      setMessage({ type: 'error', text: `Failed to add destination: ${error.message || 'Unknown error'}` });
    } finally {
      setIsAddingDestination(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    window.location.href = '/';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'suspended':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'deleted':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading Dashboard Data...</p>
          <p className="text-gray-500 mt-2">Please wait while we fetch your statistics</p>
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Data Loading Issue</h2>
          <p className="text-gray-600 mb-6">Unable to load user statistics. Please check:</p>
          <div className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
            <div>• Backend server is running</div>
            <div>• Database connection is working</div>
            <div>• You have admin privileges</div>
          </div>
          <button
            onClick={loadData}
            className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold"
          >
            Retry Loading Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Admin Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-indigo-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-slate-200 to-blue-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Floating Admin Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 text-4xl opacity-10 animate-bounce">⚡</div>
        <div className="absolute top-40 right-32 text-3xl opacity-10 animate-bounce delay-300">🛡️</div>
        <div className="absolute bottom-32 left-32 text-3xl opacity-10 animate-bounce delay-700">📊</div>
        <div className="absolute bottom-20 right-20 text-4xl opacity-10 animate-bounce delay-1000">🔧</div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/90 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Welcome, {user.name}! ⚡
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Admin Dashboard - Full System Control & Management</p>
              <p className="text-gray-500 mt-1 text-sm">
                Last updated: {lastRefresh ? lastRefresh.toLocaleTimeString() : 'N/A'} | Manual Refresh
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-2xl">
                <Shield className="w-5 h-5" />
                <span className="font-semibold text-sm">{user.role}</span>
              </div>
              
              {/* Manual Refresh Button */}
              <button
                onClick={handleManualRefresh}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Now</span>
              </button>
                  
                  <button
                    onClick={async () => {
                      console.log('Manual load users clicked');
                      try {
                        const usersData = await getUserManagementData();
                        console.log('Users data loaded:', usersData);
                        setUsers(usersData || []);
                      } catch (error) {
                        console.error('Error loading users:', error);
                      }
                    }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 font-semibold"
                  >
                    <span>Load Users</span>
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                  >
                    Sign Out
                  </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Message Display */}
        {message && (
          <div className={`mb-8 rounded-2xl border-l-4 shadow-lg p-6 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-400 text-green-800' 
              : 'bg-red-50 border-red-400 text-red-800'
          }`}>
            <div className="flex items-center">
              <span className="text-2xl mr-3">
                {message.type === 'success' ? '✅' : '❌'}
              </span>
              <span className="font-medium text-lg">{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="ml-auto text-2xl hover:opacity-70 transition-opacity"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-10">
          <nav className="flex space-x-2 bg-white/80 backdrop-blur-sm rounded-3xl p-2 shadow-lg border border-white/30">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'destinations', label: 'Destinations', icon: '🗺️' },
              { id: 'blog', label: 'Blog Posts', icon: '📝' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              System Overview
            </h2>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-2xl rounded-3xl border border-white/30 hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="text-2xl font-bold text-gray-900">{userStats.total_users}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-2xl rounded-3xl border border-white/30 hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl">
                        <MapPin className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Destinations</dt>
                        <dd className="text-2xl font-bold text-gray-900">{destinations.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-2xl rounded-3xl border border-white/30 hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Blog Posts</dt>
                        <dd className="text-2xl font-bold text-gray-900">{blogPosts.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-2xl rounded-3xl border border-white/30 hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-4 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl">
                        <Star className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Avg Rating</dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {adminStats?.average_rating || '0.0'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Breakdown */}
            <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/30 p-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-indigo-600" />
                User Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl text-white">
                  <div className="text-3xl font-bold">{userStats.travelers}</div>
                  <div className="text-blue-100 text-sm">Travelers</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white">
                  <div className="text-3xl font-bold">{userStats.guides}</div>
                  <div className="text-orange-100 text-sm">Guides</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl text-white">
                  <div className="text-3xl font-bold">{userStats.restaurant_owners}</div>
                  <div className="text-purple-100 text-sm">Restaurant Owners</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl text-white">
                  <div className="text-3xl font-bold">{userStats.hotel_owners}</div>
                  <div className="text-emerald-100 text-sm">Hotel Owners</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/30">
              <div className="px-8 py-6 border-b border-gray-200/50">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                  <Activity className="w-6 h-6 mr-3 text-indigo-600" />
                  Recent Activity
                </h3>
              </div>
              <div className="divide-y divide-gray-200/50">
                <div className="px-8 py-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mr-4">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-lg text-gray-700">
                      <span className="font-bold text-blue-600">{userStats.total_users}</span> total users registered
                    </p>
                  </div>
                </div>
                <div className="px-8 py-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mr-4">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-lg text-gray-700">
                      <span className="font-bold text-emerald-600">{destinations.length}</span> destinations available
                    </p>
                  </div>
                </div>
                <div className="px-8 py-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mr-4">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-lg text-gray-700">
                      <span className="font-bold text-purple-600">{blogPosts.length}</span> blog posts published
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
              <Users className="w-8 h-8 mr-3 text-indigo-600" />
              User Management ({userStats.total_users} Users)
            </h2>
            
            {/* Search and Filter Controls */}
            <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl border border-white/30 p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search users by name, email, or role..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      onChange={(e) => {
                        // Simple search functionality - you can enhance this later
                        const searchTerm = e.target.value.toLowerCase();
                        // Filter users based on search term
                        const filteredUsers = users.filter(user => 
                          user.name.toLowerCase().includes(searchTerm) ||
                          user.email.toLowerCase().includes(searchTerm) ||
                          user.role.toLowerCase().includes(searchTerm)
                        );
                        // You could add a filteredUsers state to show filtered results
                      }}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 font-medium">Filter by Role:</span>
                  <select className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200">
                    <option value="">All Roles</option>
                    <option value="traveler">Travelers</option>
                    <option value="guide">Guides</option>
                    <option value="restaurant_owner">Restaurant Owners</option>
                    <option value="hotel_owner">Hotel Owners</option>
                    <option value="admin">Admins</option>
                  </select>
                  <button
                    onClick={handleManualRefresh}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 font-semibold"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/30 overflow-hidden">
              <div className="px-8 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600">
                  <div className="col-span-4">User Information</div>
                  <div className="col-span-3">Contact</div>
                  <div className="col-span-3">Role & Status</div>
                  <div className="col-span-2">Actions</div>
                </div>
              </div>
              <ul className="divide-y divide-gray-200/50">
                {users.length === 0 ? (
                  <li className="px-8 py-12 text-center">
                    <div className="text-gray-500">
                      <div className="text-6xl mb-4">👥</div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Users Found</h3>
                      <p className="text-gray-500">There are currently no users registered in the system.</p>
                    </div>
                  </li>
                ) : (
                  users.map((user) => (
                    <li key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <div className="px-8 py-6">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* User Information */}
                          <div className="col-span-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                  <span className="text-white font-bold text-lg">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-lg font-bold text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">ID: {user.id}</div>
                                <div className="text-sm text-gray-500">
                                  Registered: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Contact Information */}
                          <div className="col-span-3">
                            <div className="text-sm">
                              <div className="text-gray-900 font-medium">{user.email}</div>
                              <div className="text-gray-500">{user.phone || 'No phone'}</div>
                            </div>
                          </div>
                          
                          {/* Role & Status - Only show status for non-admin users */}
                          <div className="col-span-3">
                            <div className="flex flex-col space-y-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                user.role === 'admin' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                                user.role === 'guide' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                                user.role === 'restaurant_owner' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' :
                                user.role === 'hotel_owner' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' :
                                'bg-gradient-to-r from-green-500 to-green-600 text-white'
                              }`}>
                                {user.role.replace('_', ' ').toUpperCase()}
                              </span>
                              {/* Only show status for non-admin users */}
                              {user.role !== 'admin' && (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(user.status)}`}>
                                  {getStatusIcon(user.status)} {user.status.replace('_', ' ').toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions - Only Delete button */}
                          <div className="col-span-2">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg flex items-center space-x-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Destinations Tab */}
        {activeTab === 'destinations' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Destination Management
              </h2>
              <button
                onClick={() => setIsDestinationFormOpen(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 font-semibold"
              >
                <Plus className="w-5 h-5" />
                <span>Add Destination</span>
              </button>
            </div>

            {/* Destinations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((destination) => (
                <div key={destination.id} className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-2xl rounded-3xl border border-white/30 hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                  {/* Destination Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Destination';
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold text-gray-800">{destination.rating}</span>
                    </div>
                  </div>

                  {/* Destination Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{destination.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{destination.city}, {destination.country}</span>
                        </div>
                        {destination.region && (
                          <div className="text-sm text-gray-500 mb-3">
                            <Globe className="w-4 h-4 inline mr-1" />
                            {destination.region}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Travel Information */}
                    <div className="space-y-2 mb-4">
                      {destination.best_time_to_visit && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{destination.best_time_to_visit}</span>
                        </div>
                      )}
                      {destination.weather && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Thermometer className="w-4 h-4 mr-2" />
                          <span>{destination.weather}</span>
                        </div>
                      )}
                      {destination.currency && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          <span>{destination.currency}</span>
                        </div>
                      )}
                      {destination.language && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Languages className="w-4 h-4 mr-2" />
                          <span>{destination.language}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {destination.about && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {destination.about}
                      </p>
                    )}

                    {/* Key Sights */}
                    {destination.key_sights && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Sights:</h4>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {destination.key_sights}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{destination.reviews} reviews</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDestination(destination)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Destination"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditDestination(destination)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit Destination"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDestination(destination.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Destination"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {destinations.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">No destinations yet</h3>
                <p className="text-gray-400">Start by adding your first destination to showcase amazing travel locations.</p>
              </div>
            )}
          </div>
        )}

        {/* Blog Posts Tab */}
        {activeTab === 'blog' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
              <FileText className="w-8 h-8 mr-3 text-indigo-600" />
              Blog Post Management
            </h2>
            
            {/* Coming Soon Message */}
            <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/30 p-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Feature Coming Soon!</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  We're working hard to bring you comprehensive blog post management features. 
                  Soon you'll be able to create, edit, and manage travel blog posts with ease.
                </p>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4">
                  <p className="text-sm text-indigo-700 font-medium">
                    🚀 Blog post creation, editing, and management
                  </p>
                  <p className="text-sm text-indigo-600 mt-1">
                    📝 Rich text editor with image support
                  </p>
                  <p className="text-sm text-indigo-600 mt-1">
                    🏷️ Tag and category management
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {/* Removed Status Update Modal */}

      {/* Destination Form Modal */}
      <DestinationForm
        isOpen={isDestinationFormOpen}
        onClose={() => setIsDestinationFormOpen(false)}
        onSubmit={handleAddDestination}
        isLoading={isAddingDestination}
      />

      {/* Destination View Modal */}
      <DestinationViewModal
        isOpen={isViewingDestination}
        onClose={() => {
          setIsViewingDestination(false);
          setSelectedDestination(null);
        }}
        destination={selectedDestination}
      />

      {/* Destination Edit Modal */}
      <DestinationEditModal
        isOpen={isEditingDestination}
        onClose={() => {
          setIsEditingDestination(false);
          setSelectedDestination(null);
        }}
        destination={selectedDestination}
        onSubmit={handleUpdateDestination}
        isLoading={isUpdatingDestination}
      />
    </div>
  );
};

export default AdminDashboard;
