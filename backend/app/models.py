from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, DECIMAL, Enum, TIMESTAMP, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import bcrypt
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)
    phone = Column(String(20))
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    management = relationship("UserManagement", back_populates="user", uselist=False, foreign_keys="UserManagement.user_id")
    reviews = relationship("Review", back_populates="user", lazy="dynamic")
    travel_buddies = relationship("TravelBuddy", back_populates="user", lazy="dynamic")
    blog_posts = relationship("BlogPost", back_populates="author", lazy="dynamic")
    restaurants = relationship("Restaurant", back_populates="owner", lazy="dynamic")
    hotels = relationship("Hotel", back_populates="owner", lazy="dynamic")
    guide_profile = relationship("Guide", back_populates="user", uselist=False, cascade="all, delete-orphan")
    hotel_bookings = relationship("HotelBooking", back_populates="traveler", lazy="dynamic")
    assigned_requests = relationship("GuestRequest", back_populates="assigned_user", lazy="dynamic")
    
    def set_password(self, password: str):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def verify_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        """Convert user to dictionary (excluding password)"""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'phone': self.phone,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Destination(Base):
    __tablename__ = "destinations"
    
    id = Column(Integer, primary_key=True, index=True)
    destination_id = Column(String(100), unique=True, nullable=False, index=True)  # e.g., 'bali', 'tokyo'
    name = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)  # City name
    country = Column(String(100), nullable=False)  # Country name
    image = Column(String(500), nullable=False)
    about = Column(Text, nullable=True)  # Detailed description/about information
    key_sights = Column(Text, nullable=True)  # Key visiting sights/attractions
    best_time_to_visit = Column(String(200), nullable=True)  # Best time to visit
    weather = Column(String(200), nullable=True)  # Weather information
    currency = Column(String(50), nullable=True)  # Local currency
    language = Column(String(100), nullable=True)  # Local language(s)
    rating = Column(DECIMAL(3, 2), nullable=False, default=0.00)  # Changed from Float to DECIMAL to match DB
    reviews_count = Column(Integer, nullable=False, default=0)
    description = Column(Text, nullable=True)  # Short description
    highlights = Column(Text, nullable=True)  # JSON string or comma-separated
    region = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    reviews = relationship("Review", back_populates="destination", cascade="all, delete-orphan", lazy="dynamic")
    blog_posts = relationship("BlogPost", back_populates="destination", cascade="all, delete-orphan", lazy="dynamic")
    hotels = relationship("Hotel", back_populates="destination", cascade="all, delete-orphan", lazy="dynamic")
    restaurants = relationship("Restaurant", back_populates="destination", cascade="all, delete-orphan", lazy="dynamic")
    guides = relationship("Guide", back_populates="destination", cascade="all, delete-orphan", lazy="dynamic")

    def to_dict(self):
        """Convert destination to dictionary"""
        return {
            "id": self.id,
            "destination_id": self.destination_id,
            "name": self.name,
            "city": self.city,
            "country": self.country,
            "image": self.image,
            "about": self.about,
            "key_sights": self.key_sights,
            "best_time_to_visit": self.best_time_to_visit,
            "weather": self.weather,
            "currency": self.currency,
            "language": self.language,
            "rating": float(self.rating) if self.rating else 0.0,
            "reviews": self.reviews_count,
            "description": self.description,
            "highlights": self.highlights,
            "region": self.region,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)  # Database uses 'id', not 'review_id'
    destination_id = Column(Integer, ForeignKey("destinations.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    created_at = Column(TIMESTAMP, default=func.now())
    
    # Relationships
    destination = relationship("Destination", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
    
    def to_dict(self):
        return {
            "id": self.id,  # Frontend expects 'id'
            "review_id": self.id,  # Keep for backward compatibility
            "destination_id": self.destination_id,
            "user_id": self.user_id,
            "rating": self.rating,
            "comment": self.comment,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "user": {
                "id": self.user.id if self.user else None,
                "name": self.user.name if self.user else "Anonymous",
                "email": self.user.email if self.user else ""
            } if self.user else None
        }

class TravelBuddy(Base):
    __tablename__ = "travel_buddies"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    destination = Column(String(100), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    interests = Column(Text, nullable=True)  # JSON string or comma-separated
    budget_range = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="travel_buddies")

class BlogPost(Base):
    __tablename__ = "blog_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    destination_id = Column(Integer, ForeignKey("destinations.id"), nullable=True)
    image = Column(String(500), nullable=True)
    tags = Column(Text, nullable=True)  # JSON string or comma-separated
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    author = relationship("User", back_populates="blog_posts")
    destination = relationship("Destination", back_populates="blog_posts")

class Restaurant(Base):
    __tablename__ = "restaurants"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    destination_id = Column(Integer, ForeignKey("destinations.id"), nullable=False)  # Link to destination
    description = Column(Text, nullable=True)
    cuisine_type = Column(String(100), nullable=True)
    address = Column(String(500), nullable=True)
    phone = Column(String(50), nullable=True)
    website = Column(String(500), nullable=True)
    image = Column(String(500), nullable=True)
    menu_image = Column(String(500), nullable=True)  # New field for menu image
    rating = Column(Float, nullable=False, default=0.0)
    reviews = Column(Integer, nullable=False, default=0)
    price_range = Column(String(50), nullable=True)  # $, $$, $$$, $$$$
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    owner = relationship("User", back_populates="restaurants")
    destination = relationship("Destination", back_populates="restaurants")

    def to_dict(self):
        """Convert restaurant to dictionary with destination info"""
        return {
            "id": self.id,
            "name": self.name,
            "owner_id": self.owner_id,
            "destination_id": self.destination_id,
            "description": self.description,
            "cuisine_type": self.cuisine_type,
            "address": self.address,
            "phone": self.phone,
            "website": self.website,
            "image": self.image,
            "menu_image": self.menu_image,
            "rating": self.rating,
            "reviews": self.reviews,
            "price_range": self.price_range,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "destination": self.destination.to_dict() if self.destination else None
        }

class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    destination_id = Column(Integer, ForeignKey("destinations.id"), nullable=False)  # Link to destination
    description = Column(Text)
    address = Column(String(500))
    city = Column(String(100))  # Keep for backward compatibility
    country = Column(String(100))  # Keep for backward compatibility
    phone = Column(String(50))
    email = Column(String(255))
    website = Column(String(500))
    image = Column(String(500))
    rating = Column(DECIMAL(3, 2), default=0.00)
    reviews = Column(Integer, default=0)
    price_range = Column(String(50))
    amenities = Column(Text)
    room_types_text = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="hotels")
    destination = relationship("Destination", back_populates="hotels")
    bookings = relationship("HotelBooking", back_populates="hotel", cascade="all, delete-orphan", lazy="dynamic")
    availability = relationship("RoomAvailability", back_populates="hotel", cascade="all, delete-orphan", lazy="dynamic")
    room_types = relationship("HotelRoomType", back_populates="hotel", cascade="all, delete-orphan", lazy="dynamic")

    def to_dict(self):
        """Convert hotel to dictionary with destination info"""
        return {
            "id": self.id,
            "name": self.name,
            "owner_id": self.owner_id,
            "destination_id": self.destination_id,
            "description": self.description,
            "address": self.address,
            "city": self.city,
            "country": self.country,
            "phone": self.phone,
            "email": self.email,
            "website": self.website,
            "image": self.image,
            "rating": float(self.rating) if self.rating else 0.0,
            "reviews": self.reviews,
            "price_range": self.price_range,
            "amenities": self.amenities,
            "room_types_text": self.room_types_text,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "destination": self.destination.to_dict() if self.destination else None
        }

# Admin-specific models
class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    role = Column(Enum("admin", name="admin_role"), nullable=False, default="admin")
    password_hash = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())

    def set_password(self, password: str):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def verify_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class AdminStatistics(Base):
    __tablename__ = "admin_statistics"

    id = Column(Integer, primary_key=True, index=True)
    total_users = Column(Integer, default=0)
    travelers = Column(Integer, default=0)
    guides = Column(Integer, default=0)
    restaurant_owners = Column(Integer, default=0)
    hotel_owners = Column(Integer, default=0)
    admins = Column(Integer, default=0)
    total_destinations = Column(Integer, default=0)
    total_blog_posts = Column(Integer, default=0)
    average_rating = Column(DECIMAL(3, 2), default=0.00)
    total_reviews = Column(Integer, default=0)
    last_updated = Column(TIMESTAMP, default=func.now(), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "total_users": self.total_users,
            "travelers": self.travelers,
            "guides": self.guides,
            "restaurant_owners": self.restaurant_owners,
            "hotel_owners": self.hotel_owners,
            "admins": self.admins,
            "total_destinations": self.total_destinations,
            "total_blog_posts": self.total_blog_posts,
            "average_rating": float(self.average_rating) if self.average_rating else 0.0,
            "total_reviews": self.total_reviews,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None
        }

class AdminActivityLog(Base):
    __tablename__ = "admin_activity_log"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String(255), nullable=False)
    details = Column(Text)
    timestamp = Column(TIMESTAMP, default=func.now(), onupdate=func.now(), index=True)

    admin = relationship("User", foreign_keys=[admin_id])

    def to_dict(self):
        return {
            "id": self.id,
            "admin_id": self.admin_id,
            "action": self.action,
            "details": self.details,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }

# Add relationships
# Removed duplicate relationships to avoid conflicts

# Keep the original Item model for compatibility
class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class UserManagement(Base):
    __tablename__ = "user_management"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    status = Column(Enum('active', 'suspended', 'deleted', name='user_status'), default='active')
    admin_notes = Column(Text)
    last_modified_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    last_modified_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())
    created_at = Column(TIMESTAMP, default=func.now())
    
    # Relationships - specify foreign_keys explicitly
    user = relationship("User", back_populates="management", foreign_keys=[user_id])
    admin_user = relationship("User", foreign_keys=[last_modified_by])

class Guide(Base):
    __tablename__ = "guides"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    destination_id = Column(Integer, ForeignKey("destinations.id"), nullable=False)
    bio = Column(Text, nullable=True)
    experience_years = Column(Integer, default=0)
    languages = Column(String(500), nullable=True)
    specialties = Column(String(500), nullable=True)
    hourly_rate = Column(DECIMAL(10, 2), default=0.00)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    profile_image = Column(String(500), nullable=True)
    certifications = Column(Text, nullable=True)
    rating = Column(DECIMAL(3, 2), default=0.00)
    total_reviews = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="guide_profile")
    destination = relationship("Destination", back_populates="guides")
    reviews = relationship("GuideReview", back_populates="guide", cascade="all, delete-orphan", lazy="dynamic")
    
    def to_dict(self):
        """Convert guide to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "destination_id": self.destination_id,
            "bio": self.bio,
            "experience_years": self.experience_years,
            "languages": self.languages,
            "specialties": self.specialties,
            "hourly_rate": float(self.hourly_rate) if self.hourly_rate else 0.0,
            "phone": self.phone,
            "email": self.email,
            "profile_image": self.profile_image,
            "certifications": self.certifications,
            "rating": float(self.rating) if self.rating else 0.0,
            "total_reviews": self.total_reviews,
            "is_verified": self.is_verified,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "user": self.user.to_dict() if self.user else None,
            "destination": self.destination.to_dict() if self.destination else None,
            "reviews": [review.to_dict() for review in self.reviews] if self.reviews else []
        }



class GuideReview(Base):
    __tablename__ = "guide_reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    guide_id = Column(Integer, ForeignKey("guides.id"), nullable=False)
    traveler_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    review_text = Column(Text, nullable=True)
    tour_date = Column(Date, nullable=True)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())
    
    # Relationships
    guide = relationship("Guide", back_populates="reviews")
    traveler = relationship("User", foreign_keys=[traveler_id])
    
    def to_dict(self):
        """Convert guide review to dictionary"""
        return {
            "id": self.id,
            "guide_id": self.guide_id,
            "traveler_id": self.traveler_id,
            "rating": self.rating,
            "review_text": self.review_text,
            "tour_date": self.tour_date.isoformat() if self.tour_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "traveler": self.traveler.to_dict() if self.traveler else None
        }

# Hotel Booking Models
class HotelRoomType(Base):
    __tablename__ = "hotel_room_types"
    
    room_type_id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    room_type_name = Column(String(100), nullable=False)
    description = Column(Text)
    base_price_per_night = Column(DECIMAL(10, 2), nullable=False)
    max_guests = Column(Integer, default=2)
    amenities = Column(Text)
    total_rooms = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())
    
    # Relationships
    hotel = relationship("Hotel", back_populates="room_types")
    
    def to_dict(self):
        return {
            "room_type_id": self.room_type_id,
            "hotel_id": self.hotel_id,
            "room_type_name": self.room_type_name,
            "description": self.description,
            "base_price_per_night": float(self.base_price_per_night) if self.base_price_per_night else 0.0,
            "max_guests": self.max_guests,
            "amenities": self.amenities,
            "total_rooms": self.total_rooms,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class RoomAvailability(Base):
    __tablename__ = "room_availability"
    
    availability_id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    room_type = Column(String(100), nullable=False)
    date = Column(Date, nullable=False)
    total_rooms = Column(Integer, default=0)
    available_rooms = Column(Integer, default=0)
    price_per_night = Column(DECIMAL(10, 2), nullable=False)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())
    
    # Relationships
    hotel = relationship("Hotel", back_populates="availability")
    
    def to_dict(self):
        return {
            "availability_id": self.availability_id,
            "hotel_id": self.hotel_id,
            "room_type": self.room_type,
            "date": self.date.isoformat() if self.date else None,
            "total_rooms": self.total_rooms,
            "available_rooms": self.available_rooms,
            "price_per_night": float(self.price_per_night) if self.price_per_night else 0.0,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class HotelBooking(Base):
    __tablename__ = "hotel_bookings"
    
    booking_id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    traveler_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    room_type = Column(String(100), nullable=False)
    check_in_date = Column(Date, nullable=False)
    check_out_date = Column(Date, nullable=False)
    num_guests = Column(Integer, default=1)
    total_price = Column(DECIMAL(10, 2), nullable=False)
    booking_status = Column(Enum('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'), default='pending')
    special_requests = Column(Text)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())
    
    # Relationships
    hotel = relationship("Hotel", back_populates="bookings")
    traveler = relationship("User", back_populates="hotel_bookings")
    guest_requests = relationship("GuestRequest", back_populates="booking", lazy="dynamic")
    
    def to_dict(self):
        return {
            "booking_id": self.booking_id,
            "hotel_id": self.hotel_id,
            "traveler_id": self.traveler_id,
            "room_type": self.room_type,
            "check_in_date": self.check_in_date.isoformat() if self.check_in_date else None,
            "check_out_date": self.check_out_date.isoformat() if self.check_out_date else None,
            "num_guests": self.num_guests,
            "total_price": float(self.total_price) if self.total_price else 0.0,
            "booking_status": self.booking_status,
            "special_requests": self.special_requests,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class GuestRequest(Base):
    __tablename__ = "guest_requests"
    
    request_id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("hotel_bookings.booking_id"), nullable=False)
    request_type = Column(Enum('early_checkin', 'late_checkout', 'room_service', 'housekeeping', 'maintenance', 'other'), nullable=False)
    request_status = Column(Enum('pending', 'in_progress', 'completed', 'declined'), default='pending')
    request_details = Column(Text, nullable=False)
    priority = Column(Enum('low', 'medium', 'high', 'urgent'), default='medium')
    assigned_to = Column(Integer, ForeignKey("users.id"))
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())
    completed_at = Column(TIMESTAMP)
    
    # Relationships
    booking = relationship("HotelBooking", back_populates="guest_requests")
    assigned_user = relationship("User", back_populates="assigned_requests")
    
    def to_dict(self):
        return {
            "request_id": self.request_id,
            "booking_id": self.booking_id,
            "request_type": self.request_type,
            "request_status": self.request_status,
            "request_details": self.request_details,
            "priority": self.priority,
            "assigned_to": self.assigned_to,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }
