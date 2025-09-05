from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# Authentication schemas
class UserSignUp(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    role: str = "traveler"  # traveler, guide, admin, restaurant_owner, hotel_owner

class UserSignIn(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    phone: Optional[str] = None
    role: str
    created_at: str
    updated_at: Optional[str] = None
    
    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# User management schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    role: str = "traveler"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Destination schemas
class DestinationBase(BaseModel):
    destination_id: str
    name: str
    city: str
    country: str
    image: str
    about: Optional[str] = None
    key_sights: Optional[str] = None
    best_time_to_visit: Optional[str] = None
    weather: Optional[str] = None
    currency: Optional[str] = None
    language: Optional[str] = None
    rating: float = 0.0
    reviews: int = 0
    description: Optional[str] = None
    highlights: Optional[str] = None
    region: Optional[str] = None

class DestinationCreate(DestinationBase):
    pass

class DestinationUpdate(DestinationBase):
    destination_id: Optional[str] = None
    name: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    image: Optional[str] = None
    about: Optional[str] = None
    key_sights: Optional[str] = None
    best_time_to_visit: Optional[str] = None
    weather: Optional[str] = None
    currency: Optional[str] = None
    language: Optional[str] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    description: Optional[str] = None
    highlights: Optional[str] = None
    region: Optional[str] = None

class Destination(DestinationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Review schemas
class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    comment: Optional[str] = None

class Review(BaseModel):
    review_id: int
    destination_id: int
    user_id: int
    rating: int
    comment: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

# Travel Buddy schemas
class TravelBuddyBase(BaseModel):
    destination: str
    start_date: datetime
    end_date: datetime
    interests: Optional[str] = None
    budget_range: Optional[str] = None

class TravelBuddyCreate(TravelBuddyBase):
    pass

class TravelBuddyUpdate(TravelBuddyBase):
    destination: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None

class TravelBuddy(TravelBuddyBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Blog Post schemas
class BlogPostBase(BaseModel):
    title: str
    content: str
    destination_id: Optional[int] = None
    image: Optional[str] = None
    tags: Optional[str] = None

class BlogPostCreate(BlogPostBase):
    pass

class BlogPostUpdate(BlogPostBase):
    title: Optional[str] = None
    content: Optional[str] = None

class BlogPost(BlogPostBase):
    id: int
    author_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Keep original schemas for compatibility
class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemUpdate(ItemBase):
    name: Optional[str] = None

class Item(ItemBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class HealthResponse(BaseModel):
    status: str

# Restaurant schemas
class RestaurantBase(BaseModel):
    name: str
    destination_id: int  # Required destination ID
    description: Optional[str] = None
    cuisine_type: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    image: Optional[str] = None
    menu_image: Optional[str] = None  # New field for menu image
    price_range: Optional[str] = None

class RestaurantCreate(RestaurantBase):
    pass

class RestaurantUpdate(RestaurantBase):
    name: Optional[str] = None
    destination_id: Optional[int] = None  # Optional for updates

class Restaurant(RestaurantBase):
    id: int
    owner_id: int
    rating: float
    reviews: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    destination: Optional[dict] = None  # Destination information
    
    class Config:
        from_attributes = True

# Hotel schemas
class HotelBase(BaseModel):
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    destination_id: int  # Required destination ID
    city: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    image: Optional[str] = None
    price_range: Optional[str] = None
    amenities: Optional[str] = None
    room_types: Optional[str] = None

class HotelCreate(HotelBase):
    pass

class HotelUpdate(HotelBase):
    name: Optional[str] = None
    destination_id: Optional[int] = None  # Optional for updates

class Hotel(HotelBase):
    id: int
    owner_id: int
    rating: float
    reviews: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    destination: Optional[dict] = None  # Destination information
    
    class Config:
        from_attributes = True

# Token schemas
class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# Admin Statistics schemas
class UserStatistics(BaseModel):
    total_users: int
    travelers: int
    guides: int
    restaurant_owners: int
    hotel_owners: int
    admins: int

class AdminStatistics(BaseModel):
    total_users: int
    travelers: int
    guides: int
    restaurant_owners: int
    hotel_owners: int
    admins: int
    total_destinations: int
    total_blog_posts: int
    average_rating: float
    total_reviews: int
    last_updated: Optional[str] = None

class AdminStatisticsResponse(BaseModel):
    id: int
    total_users: int
    travelers: int
    guides: int
    restaurant_owners: int
    hotel_owners: int
    admins: int
    total_destinations: int
    total_blog_posts: int
    average_rating: float
    total_reviews: int
    last_updated: Optional[str] = None

class DashboardOverview(BaseModel):
    statistics: AdminStatistics
    recent_users: List[UserResponse]
    recent_destinations: List[Destination]
    recent_blog_posts: List[BlogPost]
    system_health: dict

# Admin Authentication schemas
class AdminSignIn(BaseModel):
    email: str
    password: str

class AdminAuthResponse(BaseModel):
    access_token: str
    token_type: str
    admin_user: dict

# Admin Activity schemas
class AdminActivityLog(BaseModel):
    id: int
    admin_id: int
    action: str
    details: Optional[str] = None
    timestamp: str

class UserManagementBase(BaseModel):
    status: str
    admin_notes: Optional[str] = None

class UserManagementUpdate(UserManagementBase):
    pass

class UserManagementResponse(UserManagementBase):
    id: int
    user_id: int
    last_modified_by: Optional[int] = None
    last_modified_at: datetime
    created_at: datetime

class UserManagementData(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    registration_date: datetime
    status: str
    admin_notes: Optional[str] = None
    last_modified_at: datetime
    last_modified_by_name: str

class UpdateUserStatusRequest(BaseModel):
    user_id: int
    status: str
    admin_notes: Optional[str] = None

class GuideBase(BaseModel):
    destination_id: int
    bio: Optional[str] = ""
    experience_years: Optional[int] = 0
    languages: Optional[str] = ""
    specialties: Optional[str] = ""
    hourly_rate: Optional[float] = 0.0
    phone: Optional[str] = ""
    email: Optional[str] = ""
    profile_image: Optional[str] = ""
    certifications: Optional[str] = ""

class GuideCreate(GuideBase):
    user_id: int

class GuideUpdate(GuideBase):
    pass

class Guide(GuideBase):
    id: int
    user_id: int
    rating: float
    total_reviews: int
    is_verified: bool
    is_active: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    user: Optional[dict] = None
    destination: Optional[dict] = None
    reviews: Optional[list] = []

    class Config:
        from_attributes = True
        # Since we're now returning dictionaries from CRUD, we don't need from_attributes
        # but keeping it for backward compatibility



class GuideReviewBase(BaseModel):
    guide_id: int
    traveler_id: int
    rating: int
    review_text: Optional[str] = None
    tour_date: Optional[str] = None

class GuideReviewCreate(GuideReviewBase):
    pass

class GuideReviewUpdate(GuideReviewBase):
    pass

class GuideReview(GuideReviewBase):
    id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    traveler: Optional[dict] = None

    class Config:
        from_attributes = True
        # Since we're now returning dictionaries from CRUD, we don't need from_attributes
        # but keeping it for backward compatibility

# Hotel Booking Schemas
class HotelRoomTypeCreate(BaseModel):
    hotel_id: int
    room_type_name: str
    description: Optional[str] = None
    base_price_per_night: float
    max_guests: int = 2
    amenities: Optional[str] = None
    total_rooms: int = 0

class HotelRoomTypeUpdate(BaseModel):
    room_type_name: Optional[str] = None
    description: Optional[str] = None
    base_price_per_night: Optional[float] = None
    max_guests: Optional[int] = None
    amenities: Optional[str] = None
    total_rooms: Optional[int] = None
    is_active: Optional[bool] = None

class HotelRoomType(BaseModel):
    room_type_id: int
    hotel_id: int
    room_type_name: str
    description: Optional[str] = None
    base_price_per_night: float
    max_guests: int
    amenities: Optional[str] = None
    total_rooms: int
    is_active: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

class RoomAvailabilityCreate(BaseModel):
    hotel_id: int
    room_type: str
    date: str
    total_rooms: int
    available_rooms: int
    price_per_night: float

class RoomAvailabilityUpdate(BaseModel):
    total_rooms: Optional[int] = None
    available_rooms: Optional[int] = None
    price_per_night: Optional[float] = None

class RoomAvailability(BaseModel):
    availability_id: int
    hotel_id: int
    room_type: str
    date: str
    total_rooms: int
    available_rooms: int
    price_per_night: float
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

class HotelBookingCreate(BaseModel):
    room_type: str
    check_in_date: str
    check_out_date: str
    num_guests: int = 1
    special_requests: Optional[str] = None

class HotelBookingUpdate(BaseModel):
    room_type: Optional[str] = None
    check_in_date: Optional[str] = None
    check_out_date: Optional[str] = None
    num_guests: Optional[int] = None
    special_requests: Optional[str] = None
    booking_status: Optional[str] = None

class HotelBooking(BaseModel):
    booking_id: int
    hotel_id: int
    traveler_id: int
    room_type: str
    check_in_date: str
    check_out_date: str
    num_guests: int
    total_price: float
    booking_status: str
    special_requests: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

class GuestRequestCreate(BaseModel):
    booking_id: int
    request_type: str
    request_details: str
    priority: str = "medium"

class GuestRequestUpdate(BaseModel):
    request_status: Optional[str] = None
    request_details: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[int] = None
    completed_at: Optional[str] = None

class GuestRequest(BaseModel):
    request_id: int
    booking_id: int
    request_type: str
    request_status: str
    request_details: str
    priority: str
    assigned_to: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    completed_at: Optional[str] = None

    class Config:
        from_attributes = True
