// API service for interacting with the backend
const API_BASE_URL = 'http://localhost:8000';

// JWT Token management
let authToken: string | null = localStorage.getItem('authToken');
let currentUser: any = JSON.parse(localStorage.getItem('currentUser') || 'null');

// Function to refresh token from localStorage
const refreshTokenFromStorage = () => {
  authToken = localStorage.getItem('authToken');
  currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
};

// Helper function to make API calls with authentication
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  // Refresh token from localStorage before each call
  refreshTokenFromStorage();
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add auth token if available
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  console.log('🌐 API Call:', {
    url,
    method: options.method || 'GET',
    headers,
    hasToken: !!authToken
  });

  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log('📡 Response status:', response.status, response.statusText);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ API Error:', errorData);
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Authentication functions
export const signUp = async (userData: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'traveler' | 'guide' | 'admin';
}) => {
  const response = await apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return response;
};

export const signIn = async (credentials: { email: string; password: string }) => {
  const response = await apiCall('/auth/signin', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  
  // Store token and user data
  authToken = response.access_token;
  currentUser = response.user;
  if (authToken) {
    localStorage.setItem('authToken', authToken);
  }
  if (currentUser) {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }
  
  return response;
};

export const signOut = () => {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
};

export const getCurrentUser = () => {
  refreshTokenFromStorage();
  return currentUser;
};

export const isAuthenticated = () => {
  refreshTokenFromStorage();
  return !!authToken;
};

export const hasRole = (role: string) => {
  refreshTokenFromStorage();
  return currentUser?.role === role;
};

// Function to manually refresh authentication state
export const refreshAuthState = () => {
  refreshTokenFromStorage();
  return { authToken, currentUser };
};

export const isAdmin = () => hasRole('admin');
export const isGuide = () => hasRole('guide');
export const isTraveler = () => hasRole('traveler');

// Health check
export const checkHealth = async () => {
  return apiCall('/health');
};

// User management
export const getUsers = async () => {
  return apiCall('/users');
};

export const getUser = async (id: number) => {
  return apiCall(`/users/${id}`);
};

export const updateUser = async (id: number, userData: any) => {
  return apiCall(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (id: number) => {
  return apiCall(`/users/${id}`, {
    method: 'DELETE',
  });
};

// Destination management
export const getDestinations = async () => {
  return apiCall('/destinations');
};

export const getDestination = async (id: string) => {
  return apiCall(`/destinations/${id}`);
};

export const createDestination = async (destinationData: any) => {
  return apiCall('/destinations', {
    method: 'POST',
    body: JSON.stringify(destinationData),
  });
};

export const updateDestination = async (id: string, destinationData: any) => {
  return apiCall(`/destinations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(destinationData),
  });
};

export const deleteDestination = async (id: string) => {
  return apiCall(`/destinations/${id}`, {
    method: 'DELETE',
  });
};

// Review management
export const getDestinationReviews = async (destinationId: string) => {
  return apiCall(`/destinations/${destinationId}/reviews`);
};

export const createReview = async (destinationId: string, reviewData: any) => {
  return apiCall(`/destinations/${destinationId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });
};

export const updateReview = async (id: number, reviewData: any) => {
  return apiCall(`/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(reviewData),
  });
};

export const deleteReview = async (id: number) => {
  return apiCall(`/reviews/${id}`, {
    method: 'DELETE',
  });
};

// Travel Buddy management
export const getTravelBuddies = async (destination?: string) => {
  const params = destination ? `?destination=${encodeURIComponent(destination)}` : '';
  return apiCall(`/travel-buddies${params}`);
};

export const createTravelBuddy = async (buddyData: any) => {
  return apiCall('/travel-buddies', {
    method: 'POST',
    body: JSON.stringify(buddyData),
  });
};

export const updateTravelBuddy = async (id: number, buddyData: any) => {
  return apiCall(`/travel-buddies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(buddyData),
  });
};

export const deleteTravelBuddy = async (id: number) => {
  return apiCall(`/travel-buddies/${id}`, {
    method: 'DELETE',
  });
};

// Blog Post management
export const getBlogPosts = async () => {
  return apiCall('/blog-posts');
};

export const getBlogPost = async (id: number) => {
  return apiCall(`/blog-posts/${id}`);
};

export const createBlogPost = async (postData: any) => {
  return apiCall('/blog-posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
};

export const updateBlogPost = async (id: number, postData: any) => {
  return apiCall(`/blog-posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
  });
};

export const deleteBlogPost = async (id: number) => {
  return apiCall(`/blog-posts/${id}`, {
    method: 'DELETE',
  });
};

// Seed data for development
export const seedData = async () => {
  return apiCall('/seed-data', {
    method: 'POST',
  });
};

// Utility functions
export const parseHighlights = (highlights: string): string[] => {
  if (!highlights) return [];
  return highlights.split(',').map(h => h.trim());
};

export const parseTags = (tags: string): string[] => {
  if (!tags) return [];
  return tags.split(',').map(t => t.trim());
};

// Guide management
export const getGuides = async () => {
  return apiCall('/users?role=guide');
};

export const getGuide = async (id: number) => {
  return apiCall(`/users/${id}`);
};

export const getGuidesByDestination = async (destinationId: number) => {
  return apiCall(`/guides/by-destination/${destinationId}`);
};

// Guide Booking management
export const createGuideBooking = async (bookingData: any) => {
  return apiCall('/guide-bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
};

export const getGuideBookings = async (userId?: number) => {
  const params = userId ? `?user_id=${userId}` : '';
  return apiCall(`/guide-bookings${params}`);
};

export const updateGuideBooking = async (id: number, bookingData: any) => {
  return apiCall(`/guide-bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bookingData),
  });
};

export const deleteGuideBooking = async (id: number) => {
  return apiCall(`/guide-bookings/${id}`, {
    method: 'DELETE',
  });
};

// Restaurant management
export const getRestaurants = async () => {
  return apiCall('/restaurants');
};

export const getRestaurantsByDestination = async (destinationId: number) => {
  return apiCall(`/restaurants/by-destination/${destinationId}`);
};

export const getRestaurantOwnerRestaurants = async (
  search?: string, 
  destination_id?: number, 
  cuisine_type?: string,
  price_range?: string
): Promise<any[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (destination_id) params.append('destination_id', destination_id.toString());
  if (cuisine_type) params.append('cuisine_type', cuisine_type);
  if (price_range) params.append('price_range', price_range);
  
  const queryString = params.toString();
  const endpoint = queryString ? `/restaurant-owner/restaurants?${queryString}` : '/restaurant-owner/restaurants';
  
  return apiCall(endpoint);
};

export const getRestaurantOwnerDestinations = async (): Promise<any[]> => {
  return apiCall('/restaurant-owner/destinations');
};

export const getRestaurantOwnerStatistics = async (): Promise<any> => {
  return apiCall('/restaurant-owner/statistics');
};

export const getRestaurant = async (id: number) => {
  return apiCall(`/restaurants/${id}`);
};

export const createRestaurant = async (restaurantData: any) => {
  return apiCall('/restaurants', {
    method: 'POST',
    body: JSON.stringify(restaurantData),
  });
};

export const updateRestaurant = async (id: number, restaurantData: any) => {
  return apiCall(`/restaurants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(restaurantData),
  });
};

export const deleteRestaurant = async (id: number) => {
  return apiCall(`/restaurants/${id}`, {
    method: 'DELETE',
  });
};

// Hotel management
export const getHotels = async () => {
  return apiCall('/hotels');
};

export const getHotel = async (id: number) => {
  return apiCall(`/hotels/${id}`);
};

export const getHotelsByDestination = async (destinationId: number) => {
  return apiCall(`/hotels/by-destination/${destinationId}`);
};

export const createHotel = async (hotelData: any) => {
  console.log('🔍 Creating hotel with data:', hotelData);
  console.log('🔑 Current auth token:', authToken);
  
  try {
    const response = await apiCall('/hotels', {
      method: 'POST',
      body: JSON.stringify(hotelData),
    });
    console.log('✅ Hotel created successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Error creating hotel:', error);
    throw error;
  }
};

export const updateHotel = async (id: number, hotelData: any) => {
  return apiCall(`/hotels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(hotelData),
  });
};

export const deleteHotel = async (id: number) => {
  return apiCall(`/hotels/${id}`, {
    method: 'DELETE',
  });
};

// Hotel Owner Dashboard API functions
export const getHotelOwnerStatistics = async (): Promise<any> => {
  return apiCall('/hotel-owner/statistics');
};

export const getHotelOwnerHotels = async (
  search?: string, 
  destination_id?: number, 
  price_range?: string
): Promise<any[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (destination_id) params.append('destination_id', destination_id.toString());
  if (price_range) params.append('price_range', price_range);
  
  const queryString = params.toString();
  const endpoint = queryString ? `/hotel-owner/hotels?${queryString}` : '/hotel-owner/hotels';
  
  return apiCall(endpoint);
};

export const getHotelOwnerDestinations = async (): Promise<any[]> => {
  return apiCall('/hotel-owner/destinations');
};

// Test authentication endpoint
export const testHotelOwnerAuth = async (): Promise<any> => {
  return apiCall('/test/hotel-owner-auth');
};

// Test hotel creation components
export const testHotelCreation = async (): Promise<any> => {
  return apiCall('/test/hotel-creation');
};

// Admin API functions
export const getAdminStatistics = async (): Promise<any> => {
  try {
    // Use the new simple endpoint instead of the old one
    const response = await fetch(`${API_BASE_URL}/admin/statistics/simple`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Admin statistics response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    throw error;
  }
};

export const getUserStatistics = async (): Promise<any> => {
  try {
    // Use the new simple endpoint instead of the old one
    const response = await fetch(`${API_BASE_URL}/admin/users/simple`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('User statistics response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    throw error;
  }
};

export const getDashboardOverview = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/overview`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Dashboard overview response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    throw error;
  }
};

// New simplified admin stats endpoint
export const getAdminDashboardStats = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/statistics/simple`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Admin dashboard stats response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    throw error;
  }
};

// Refresh admin dashboard data
export const refreshAdminData = async (): Promise<any> => {
  try {
    console.log('Refreshing admin data...');
    
    // Try the new simplified endpoint first
    const adminStats = await getAdminDashboardStats();
    console.log('Admin stats fetched successfully:', adminStats);
    
    return {
      adminStats,
      userStats: {
        total_users: adminStats.total_users,
        travelers: adminStats.travelers,
        guides: adminStats.guides,
        restaurant_owners: adminStats.restaurant_owners,
        hotel_owners: adminStats.hotel_owners,
        admins: adminStats.admins
      }
    };
  } catch (error) {
    console.error('Error refreshing admin data:', error);
    
    // Fallback to individual endpoints if the main one fails
    try {
      console.log('Trying fallback endpoints...');
      const [adminStats, userStats] = await Promise.all([
        getAdminStatistics(),
        getUserStatistics()
      ]);
      
      return { adminStats, userStats };
    } catch (fallbackError) {
      console.error('Fallback endpoints also failed:', fallbackError);
      throw fallbackError;
    }
  }
};

// User Management API functions
export const getUserManagementData = async (): Promise<any[]> => {
  try {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('http://localhost:8000/admin/users/simple', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user management data:', error);
    throw error;
  }
};

export const updateUserStatus = async (
  userId: number, 
  status: string, 
  adminNotes?: string
): Promise<any> => {
  try {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`http://localhost:8000/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        status: status,
        admin_notes: adminNotes || ''
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

// Guide Profile API functions
export const getGuideProfile = async (guideId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/guides/${guideId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch guide profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching guide profile:', error);
    throw error;
  }
};

export const getGuideByUser = async (userId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/guides/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch guide profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching guide profile:', error);
    throw error;
  }
};

export const createGuideProfile = async (guideData: any) => {
  try {
    console.log('🔍 API: Sending guide data:', guideData);
    
    const response = await fetch(`${API_BASE_URL}/guides`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(guideData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('🔍 API: Error response:', errorData);
      console.error('🔍 API: Response status:', response.status);
      console.error('🔍 API: Response headers:', response.headers);
      
      // Try to extract meaningful error message
      let errorMessage = 'Failed to create guide profile';
      if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (Array.isArray(errorData)) {
        errorMessage = errorData.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
      } else {
        errorMessage = JSON.stringify(errorData);
      }
      
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('🔍 API: Success response:', result);
    return result;
  } catch (error) {
    console.error('🔍 API: Error creating guide profile:', error);
    throw error;
  }
};

export const updateGuideProfile = async (guideId: number, guideData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/guides/${guideId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(guideData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update guide profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating guide profile:', error);
    throw error;
  }
};

export const deleteGuideProfile = async (guideId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/guides/${guideId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete guide profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting guide profile:', error);
    throw error;
  }
};



// Guide Reviews API functions
export const getGuideReviews = async (guideId: number, skip: number = 0, limit: number = 100) => {
  try {
    const response = await fetch(`${API_BASE_URL}/guides/${guideId}/reviews?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch guide reviews');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching guide reviews:', error);
    throw error;
  }
};

export const createGuideReview = async (guideId: number, reviewData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/guides/${guideId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(reviewData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create guide review');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating guide review:', error);
    throw error;
  }
};

// Hotel booking management
export const createHotelBooking = async (hotelId: number, bookingData: any): Promise<any> => {
  try {
    const response = await apiCall(`/hotels/${hotelId}/book`, {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
    return response;
  } catch (error) {
    console.error('Error creating hotel booking:', error);
    throw error;
  }
};

export const getHotelBookings = async (hotelId: number): Promise<any[]> => {
  try {
    const response = await apiCall(`/hotels/${hotelId}/bookings`);
    return response;
  } catch (error) {
    console.error('Error getting hotel bookings:', error);
    throw error;
  }
};

export const getTravelerBookings = async (): Promise<any[]> => {
  try {
    const response = await apiCall('/traveler/bookings');
    return response;
  } catch (error) {
    console.error('Error getting traveler bookings:', error);
    throw error;
  }
};

export const updateHotelBooking = async (bookingId: number, updateData: any): Promise<any> => {
  try {
    const response = await apiCall(`/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    return response;
  } catch (error) {
    console.error('Error updating hotel booking:', error);
    throw error;
  }
};

export const cancelHotelBooking = async (bookingId: number): Promise<any> => {
  try {
    const response = await apiCall(`/bookings/${bookingId}/cancel`, {
      method: 'POST'
    });
    return response;
  } catch (error) {
    console.error('Error cancelling hotel booking:', error);
    throw error;
  }
};

// Hotel room types and availability
export const getHotelRoomTypes = async (hotelId: number): Promise<any[]> => {
  try {
    const response = await apiCall(`/hotels/${hotelId}/room-types`);
    return response;
  } catch (error) {
    console.error('Error getting hotel room types:', error);
    throw error;
  }
};

export const getHotelAvailability = async (hotelId: number, roomType: string, startDate: string, endDate: string): Promise<any[]> => {
  try {
    const response = await apiCall(`/hotels/${hotelId}/availability?room_type=${roomType}&start_date=${startDate}&end_date=${endDate}`);
    return response;
  } catch (error) {
    console.error('Error getting hotel availability:', error);
    throw error;
  }
};

// Guest request management
export const createGuestRequest = async (bookingId: number, requestData: any): Promise<any> => {
  try {
    const response = await apiCall(`/bookings/${bookingId}/requests`, {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
    return response;
  } catch (error) {
    console.error('Error creating guest request:', error);
    throw error;
  }
};

export const getGuestRequests = async (bookingId: number): Promise<any[]> => {
  try {
    const response = await apiCall(`/bookings/${bookingId}/requests`);
    return response;
  } catch (error) {
    console.error('Error getting guest requests:', error);
    throw error;
  }
};

export const getHotelGuestRequests = async (hotelId: number): Promise<any[]> => {
  try {
    const response = await apiCall(`/hotels/${hotelId}/requests`);
    return response;
  } catch (error) {
    console.error('Error getting hotel guest requests:', error);
    throw error;
  }
};

export const updateGuestRequest = async (requestId: number, updateData: any): Promise<any> => {
  try {
    const response = await apiCall(`/requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    return response;
  } catch (error) {
    console.error('Error updating guest request:', error);
    throw error;
  }
};

// Hotel booking statistics
export const getHotelBookingStatistics = async (hotelId: number): Promise<any> => {
  try {
    const response = await apiCall(`/hotels/${hotelId}/booking-statistics`);
    return response;
  } catch (error) {
    console.error('Error getting hotel booking statistics:', error);
    throw error;
  }
};
