from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from . import crud, models, schemas
from .database import engine, get_db
from typing import List, Optional
import json
import jwt
from datetime import datetime, timedelta, timezone
import os

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Travel Backend API",
    description="A FastAPI backend for travel application with role-based authentication",
    version="1.0.0"
)

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Security
security = HTTPBearer()

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return user data"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {"email": email, "role": role}
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(token_data: dict = Depends(verify_token), db: Session = Depends(get_db)):
    """Get current authenticated user"""
    user = crud.get_user_by_email(db, email=token_data["email"])
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# Health check endpoint
# SQL: No database query - simple status check
# Function: Returns API health status
@app.get("/health", response_model=schemas.HealthResponse)
def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

# Test endpoint for debugging
# SQL: No database query - simple response test
# Function: Returns test message with current timestamp
@app.get("/test/simple")
def test_simple():
    """Simple test endpoint to check basic functionality"""
    return {"message": "Simple test endpoint working", "timestamp": datetime.now(timezone.utc).isoformat()}

# SQL: SELECT COUNT(*) FROM users;
# Function: Tests database connectivity by counting users
@app.get("/test/database")
def test_database(db: Session = Depends(get_db)):
    """Test database connection"""
    try:
        # Simple database query
        user_count = db.query(models.User).count()
        return {"message": "Database connection working", "user_count": user_count}
    except Exception as e:
        return {"error": f"Database connection failed: {str(e)}"}

# SQL: No database query - model introspection
# Function: Tests model accessibility and returns attribute count
@app.get("/test/models")
def test_models():
    """Test if models can be imported and accessed"""
    try:
        # Test model access
        user_attrs = [attr for attr in dir(models.User) if not attr.startswith('_')]
        return {"message": "Models working", "user_attributes": len(user_attrs)}
    except Exception as e:
        return {"error": f"Models test failed: {str(e)}"}

# SQL: SELECT * FROM users WHERE id = ?;
# Function: Tests user existence for debugging deletion operations
@app.get("/test/delete/{user_id}")
def test_delete_user(user_id: int, db: Session = Depends(get_db)):
    """Test endpoint to check if user exists and can be deleted (for debugging)"""
    print(f"🧪 Test delete endpoint called for user {user_id}")
    
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        return {
            "user_exists": True,
            "user_id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role,
            "created_at": db_user.created_at.isoformat() if db_user.created_at else None
        }
    else:
        return {"user_exists": False, "user_id": user_id}

# Authentication endpoints


# SQL: SELECT * FROM users WHERE email = ?; INSERT INTO users (name, email, password_hash, role, phone, created_at) VALUES (?, ?, ?, ?, ?, ?);
# Function: Creates new user account with role validation and email uniqueness check
@app.post("/auth/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user: schemas.UserSignUp, db: Session = Depends(get_db)):
    """User signup with role selection"""
    # Check if user already exists
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate role
    valid_roles = ["traveler", "guide", "admin", "restaurant_owner", "hotel_owner"]
    if user.role not in valid_roles:
        raise HTTPException(status_code=400, detail="Invalid role. Must be: traveler, guide, admin, restaurant_owner, or hotel_owner")
    
    # Create user
    return crud.create_user(db=db, user=user)

# SQL: SELECT * FROM users WHERE email = ? AND password_hash = ?;
# Function: Authenticates user credentials and returns JWT access token
@app.post("/auth/signin", response_model=schemas.AuthResponse)
def signin(user_credentials: schemas.UserSignIn, db: Session = Depends(get_db)):
    """User signin with email and password"""
    # Authenticate user
    user = crud.authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user.to_dict()
    }

# SQL: SELECT * FROM users WHERE email = ?; (via JWT token)
# Function: Returns current authenticated user information from JWT token
@app.get("/auth/me", response_model=schemas.UserResponse)
def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    """Get current user information"""
    return current_user.to_dict()

# User endpoints (protected)
# SQL: SELECT * FROM users LIMIT ? OFFSET ?;
# Function: Retrieves paginated list of all users (admin only)
@app.get("/users", response_model=List[schemas.UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Get all users (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    users = crud.get_users(db, skip=skip, limit=limit)
    return [user.to_dict() for user in users]

# SQL: SELECT * FROM users WHERE id = ?;
# Function: Retrieves specific user by ID with access control (admin or self)
@app.get("/users/{user_id}", response_model=schemas.UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Get a specific user by ID"""
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user.to_dict()

# SQL: DELETE FROM users WHERE id = ?;
# Function: Deletes user account with admin-only access and self-deletion prevention
@app.delete("/users/{user_id}")
def delete_user_endpoint(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Delete a user (admin only)"""
    print(f"🔍 Delete user request: user_id={user_id}, current_user={current_user.id}, role={current_user.role}")
    
    if current_user.role != "admin":
        print(f"❌ Access denied: {current_user.role} is not admin")
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if current_user.id == user_id:
        print(f"❌ Self-deletion attempt: {current_user.id}")
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    print(f"✅ Proceeding with user deletion: {user_id}")
    success = crud.delete_user(db, user_id=user_id)
    
    if not success:
        print(f"❌ User not found for deletion: {user_id}")
        raise HTTPException(status_code=404, detail="User not found")
    
    print(f"✅ User {user_id} deleted successfully")
    return {"message": "User deleted successfully"}

# Admin Statistics endpoints
# SQL: SELECT * FROM admin_statistics; UPDATE admin_statistics SET ...;
# Function: Retrieves and updates admin dashboard statistics from dedicated table
@app.get("/admin/statistics", response_model=schemas.AdminStatistics)
def get_admin_statistics(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Get admin dashboard statistics (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Update statistics first, then return
    updated_stats = crud.update_admin_statistics(db)
    if updated_stats:
        return updated_stats.to_dict()
    else:
        # Fallback to calculated stats
        return crud.get_admin_statistics(db)

# Simple working admin statistics endpoint (no special tables required)
# SQL: SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM users WHERE role = ?; SELECT COUNT(*) FROM destinations; SELECT COUNT(*) FROM blog_posts; SELECT rating FROM destinations; SELECT COUNT(*) FROM reviews;
# Function: Calculates admin statistics by querying multiple tables directly
@app.get("/admin/statistics/simple")
def get_simple_admin_statistics(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Get simple admin statistics without requiring special tables (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Get basic counts directly
        total_users = db.query(models.User).count()
        travelers = db.query(models.User).filter(models.User.role == "traveler").count()
        guides = db.query(models.User).filter(models.User.role == "guide").count()
        restaurant_owners = db.query(models.User).filter(models.User.role == "restaurant_owner").count()
        hotel_owners = db.query(models.User).filter(models.User.role == "hotel_owner").count()
        admins = db.query(models.User).filter(models.User.role == "admin").count()
        
        destinations = db.query(models.Destination).count()
        blog_posts = db.query(models.BlogPost).count()
        
        # Calculate average rating
        destination_ratings = db.query(models.Destination.rating).all()
        if destination_ratings:
            average_rating = sum([rating[0] for rating in destination_ratings if rating[0] is not None]) / len(destination_ratings)
        else:
            average_rating = 0.0
        
        total_reviews = db.query(models.Review).count()
        
        return {
            "total_users": total_users,
            "travelers": travelers,
            "guides": guides,
            "restaurant_owners": restaurant_owners,
            "hotel_owners": hotel_owners,
            "admins": admins,
            "total_destinations": destinations,
            "total_blog_posts": blog_posts,
            "average_rating": round(average_rating, 1),
            "total_reviews": total_reviews,
            "last_updated": datetime.utcnow().isoformat()
        }
    except Exception as e:
        print(f"Error getting simple admin statistics: {e}")
        # Return default values if anything fails
        return {
            "total_users": 0,
            "travelers": 0,
            "guides": 0,
            "restaurant_owners": 0,
            "hotel_owners": 0,
            "admins": 0,
            "total_destinations": 0,
            "total_blog_posts": 0,
            "average_rating": 0.0,
            "total_reviews": 0,
            "last_updated": datetime.utcnow().isoformat()
        }

# Simple working users endpoint (no special tables required)
# SQL: SELECT * FROM users;
# Function: Retrieves all users with formatted data for admin user management
@app.get("/admin/users/simple")
def get_simple_users(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Get simple user list without requiring user management system (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Get all users with basic information
        users = db.query(models.User).all()
        user_list = []
        
        for user in users:
            user_list.append({
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone or 'No phone',
                'role': user.role,
                'registration_date': user.created_at,
                'status': 'active',  # Default status
                'admin_notes': '',
                'last_modified_at': user.created_at,
                'last_modified_by_name': 'System'
            })
        
        return user_list
    except Exception as e:
        print(f"Error getting simple users: {e}")
        return []

# SQL: Complex queries for user statistics aggregation
# Function: Retrieves detailed user statistics and analytics for admin dashboard
@app.get("/admin/users/statistics", response_model=schemas.UserStatistics)
def get_user_statistics(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Get detailed user statistics (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return crud.get_user_statistics(db)

# SQL: Multiple table joins for comprehensive dashboard data
# Function: Retrieves complete dashboard overview with all admin metrics
@app.get("/admin/dashboard/overview", response_model=schemas.DashboardOverview)
def get_dashboard_overview(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Get complete dashboard overview (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return crud.get_dashboard_overview(db)

# Updated Admin-specific endpoints that work with existing user system
# SQL: SELECT * FROM admin_statistics;
# Function: Retrieves admin statistics from dedicated admin_statistics table
@app.get("/admin/dashboard/stats", response_model=schemas.AdminStatistics)
def get_admin_dashboard_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Get admin dashboard statistics from dedicated table (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get stats from admin_statistics table
    stats = crud.get_admin_statistics_from_table(db)
    if stats:
        return stats.to_dict()
    else:
        raise HTTPException(status_code=500, detail="Failed to retrieve admin statistics")

# SQL: UPDATE admin_statistics SET ...; INSERT INTO admin_activity_log (...);
# Function: Manually refreshes admin statistics and logs the activity
@app.post("/admin/dashboard/refresh", response_model=schemas.AdminStatistics)
def refresh_admin_dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Manually refresh admin dashboard statistics (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Update statistics
    updated_stats = crud.update_admin_statistics(db)
    if updated_stats:
        # Log the refresh activity (if admin_activity_log table exists)
        try:
            crud.log_admin_activity(db, current_user.id, "dashboard_refresh", "Admin dashboard statistics refreshed")
        except:
            pass  # Ignore if activity logging fails
        return updated_stats.to_dict()
    else:
        raise HTTPException(status_code=500, detail="Failed to refresh admin statistics")

# Destination endpoints
# SQL: SELECT * FROM destinations LIMIT ? OFFSET ?;
# Function: Retrieves paginated list of all destinations
@app.get("/destinations")
def read_destinations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all destinations"""
    destinations = crud.get_destinations(db, skip=skip, limit=limit)
    # Convert to dictionary format to avoid relationship loading issues
    return [destination.to_dict() for destination in destinations]

# SQL: SELECT * FROM destinations WHERE destination_id = ?;
# Function: Retrieves specific destination by destination_id string
@app.get("/destinations/{destination_id}")
def read_destination(destination_id: str, db: Session = Depends(get_db)):
    """Get a specific destination by ID"""
    db_destination = crud.get_destination_by_id(db, destination_id=destination_id)
    if db_destination is None:
        raise HTTPException(status_code=404, detail="Destination not found")
    return db_destination.to_dict()

# SQL: INSERT INTO destinations (destination_id, name, image, rating, reviews, description, highlights, country, region) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
# Function: Creates new destination with admin/guide role validation
@app.post("/destinations", response_model=schemas.Destination, status_code=status.HTTP_201_CREATED)
def create_destination(destination: schemas.DestinationCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Create a new destination (admin/guide only)"""
    if current_user.role not in ["admin", "guide"]:
        raise HTTPException(status_code=403, detail="Admin or guide access required")
    return crud.create_destination(db=db, destination=destination)

# SQL: SELECT * FROM destinations WHERE id = ?; UPDATE destinations SET ... WHERE id = ?;
# Function: Updates destination by numeric ID with admin-only access
@app.put("/destinations/{destination_id}", response_model=schemas.Destination)
def update_destination(destination_id: int, destination: schemas.DestinationUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Update a destination (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if destination exists by numeric ID
    db_destination = db.query(models.Destination).filter(models.Destination.id == destination_id).first()
    if db_destination is None:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    # Update the destination
    updated_destination = crud.update_destination(db=db, destination_id=destination_id, destination=destination)
    if not updated_destination:
        raise HTTPException(status_code=500, detail="Failed to update destination")
    
    return updated_destination

# SQL: SELECT * FROM destinations WHERE id = ?; DELETE FROM destinations WHERE id = ?;
# Function: Deletes destination by numeric ID with admin-only access
@app.delete("/destinations/{destination_id}")
def delete_destination(destination_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Delete a destination (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if destination exists by numeric ID
    db_destination = db.query(models.Destination).filter(models.Destination.id == destination_id).first()
    if db_destination is None:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    # Delete the destination
    success = crud.delete_destination(db=db, destination_id=destination_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete destination")
    
    return {"message": "Destination deleted successfully"}

# Review endpoints
# SQL: SELECT * FROM destinations WHERE destination_id = ?; SELECT * FROM reviews WHERE destination_id = ? LIMIT ? OFFSET ?;
# Function: Retrieves paginated reviews for a specific destination
@app.get("/destinations/{destination_id}/reviews")
def read_destination_reviews(destination_id: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get reviews for a specific destination"""
    try:
        print(f"🔍 Getting reviews for destination ID: {destination_id}")
        db_destination = crud.get_destination_by_id(db, destination_id=destination_id)
        if db_destination is None:
            raise HTTPException(status_code=404, detail="Destination not found")
        
        print(f"📍 Found destination: {db_destination.name} (ID: {db_destination.id})")
        reviews = crud.get_reviews_by_destination(db, destination_id=db_destination.id, skip=skip, limit=limit)
        print(f"✅ Found {len(reviews)} reviews for destination {destination_id}")
        
        # Debug: Print first review if exists
        if reviews and len(reviews) > 0:
            print(f"📝 First review: {reviews[0]}")
        
        return reviews
    except Exception as e:
        print(f"❌ Error getting destination reviews: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to load reviews")

# SQL: SELECT * FROM destinations WHERE destination_id = ?; INSERT INTO reviews (user_id, destination_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?);
# Function: Creates new review for destination with user authentication
@app.post("/destinations/{destination_id}/reviews", response_model=schemas.Review, status_code=status.HTTP_201_CREATED)
def create_destination_review(destination_id: str, review: schemas.ReviewCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Create a new review for a destination (authenticated users only)"""
    print(f"🔄 Creating review for destination: {destination_id}")
    print(f"📝 Review data: {review.dict()}")
    print(f"👤 User ID: {current_user.id}")
    
    db_destination = crud.get_destination_by_id(db, destination_id=destination_id)
    if db_destination is None:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    print(f"📍 Destination found: {db_destination.name} (ID: {db_destination.id})")
    
    # Pass the destination_id directly to the CRUD function
    created_review = crud.create_review(db=db, review=review, user_id=current_user.id, destination_id=db_destination.id)
    print(f"✅ Review created successfully: {created_review.id}")
    
    return created_review

# Travel Buddy endpoints
# SQL: SELECT * FROM travel_buddies WHERE destination = ? AND is_active = TRUE LIMIT ? OFFSET ?; OR SELECT * FROM travel_buddies WHERE is_active = TRUE LIMIT ? OFFSET ?;
# Function: Retrieves travel buddy requests with optional destination filtering
@app.get("/travel-buddies", response_model=List[schemas.TravelBuddy])
def read_travel_buddies(destination: str = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get travel buddies, optionally filtered by destination"""
    if destination:
        buddies = crud.get_travel_buddies_by_destination(db, destination=destination, skip=skip, limit=limit)
    else:
        # Get all active travel buddies
        buddies = db.query(models.TravelBuddy).filter(models.TravelBuddy.is_active == True).offset(skip).limit(limit).all()
    return buddies

# SQL: INSERT INTO travel_buddies (user_id, destination, travel_dates, budget, interests, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?);
# Function: Creates new travel buddy request with user authentication
@app.post("/travel-buddies", response_model=schemas.TravelBuddy, status_code=status.HTTP_201_CREATED)
def create_travel_buddy(travel_buddy: schemas.TravelBuddyCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Create a new travel buddy request (authenticated users only)"""
    return crud.create_travel_buddy(db=db, travel_buddy=travel_buddy, user_id=current_user.id)

# Blog Post endpoints
# SQL: SELECT * FROM blog_posts LIMIT ? OFFSET ?;
# Function: Retrieves paginated list of all blog posts
@app.get("/blog-posts", response_model=List[schemas.BlogPost])
def read_blog_posts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all blog posts"""
    posts = crud.get_blog_posts(db, skip=skip, limit=limit)
    return posts

# SQL: SELECT * FROM blog_posts WHERE id = ?;
# Function: Retrieves specific blog post by ID
@app.get("/blog-posts/{post_id}", response_model=schemas.BlogPost)
def read_blog_post(post_id: int, db: Session = Depends(get_db)):
    """Get a specific blog post by ID"""
    db_post = crud.get_blog_post(db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return db_post

# SQL: INSERT INTO blog_posts (author_id, title, content, created_at) VALUES (?, ?, ?, ?);
# Function: Creates new blog post with user authentication
@app.post("/blog-posts", response_model=schemas.BlogPost, status_code=status.HTTP_201_CREATED)
def create_blog_post(blog_post: schemas.BlogPostCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Create a new blog post (authenticated users only)"""
    return crud.create_blog_post(db=db, blog_post=blog_post, author_id=current_user.id)

# Restaurant endpoints
# SQL: SELECT * FROM restaurants LIMIT ? OFFSET ?;
# Function: Retrieves paginated list of all restaurants
@app.get("/restaurants", response_model=List[schemas.Restaurant])
def read_restaurants(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all restaurants"""
    restaurants = crud.get_restaurants(db, skip=skip, limit=limit)
    return restaurants

# SQL: SELECT * FROM restaurants WHERE id = ?;
# Function: Retrieves specific restaurant by ID
@app.get("/restaurants/{restaurant_id}", response_model=schemas.Restaurant)
def read_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    """Get a specific restaurant by ID"""
    db_restaurant = crud.get_restaurant(db, restaurant_id=restaurant_id)
    if db_restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return db_restaurant

# SQL: INSERT INTO restaurants (owner_id, name, description, address, city, country, phone, email, website, image, rating, reviews, price_range, cuisine_type, destination_id, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
# Function: Creates new restaurant with restaurant owner role validation
@app.post("/restaurants", response_model=schemas.Restaurant, status_code=status.HTTP_201_CREATED)
def create_restaurant(restaurant: schemas.RestaurantCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Create a new restaurant (restaurant owner only)"""
    if current_user.role != "restaurant_owner":
        raise HTTPException(status_code=403, detail="Restaurant owner access required")
    return crud.create_restaurant(db=db, restaurant=restaurant, owner_id=current_user.id)

# SQL: SELECT * FROM restaurants WHERE id = ?; UPDATE restaurants SET ... WHERE id = ?;
# Function: Updates restaurant with owner/admin access control
@app.put("/restaurants/{restaurant_id}", response_model=schemas.Restaurant)
def update_restaurant(restaurant_id: int, restaurant: schemas.RestaurantUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Update a restaurant (owner only)"""
    db_restaurant = crud.get_restaurant(db, restaurant_id=restaurant_id)
    if db_restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if db_restaurant.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return crud.update_restaurant(db=db, restaurant_id=restaurant_id, restaurant=restaurant)

# SQL: SELECT * FROM restaurants WHERE id = ?; DELETE FROM restaurants WHERE id = ?;
# Function: Deletes restaurant with owner/admin access control
@app.delete("/restaurants/{restaurant_id}")
def delete_restaurant(restaurant_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Delete a restaurant (owner or admin only)"""
    db_restaurant = crud.get_restaurant_model(db, restaurant_id=restaurant_id)
    if db_restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if db_restaurant.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    success = crud.delete_restaurant(db, restaurant_id=restaurant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return {"message": "Restaurant deleted successfully"}

# Traveler endpoints for filtering restaurants by destination
# SQL: SELECT * FROM restaurants WHERE destination_id = ?;
# Function: Retrieves restaurants filtered by destination ID for travelers
@app.get("/restaurants/by-destination/{destination_id}")
def get_restaurants_by_destination(destination_id: int, db: Session = Depends(get_db)):
    """Get restaurants filtered by destination ID for travelers"""
    try:
        print(f"🔍 Getting restaurants for destination ID: {destination_id}")
        restaurants = crud.get_restaurants_by_destination(db, destination_id=destination_id)
        print(f"✅ Found {len(restaurants)} restaurants for destination {destination_id}")
        return restaurants
    except Exception as e:
        print(f"❌ Error getting restaurants by destination: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to load restaurants")

# Restaurant Owner Dashboard endpoints
# SQL: SELECT * FROM restaurants WHERE owner_id = ? AND (name LIKE ? OR description LIKE ?) AND destination_id = ? AND cuisine_type = ? AND price_range = ?;
# Function: Retrieves restaurants owned by user with search and filtering options
@app.get("/restaurant-owner/restaurants")
def get_restaurant_owner_restaurants(
    search: Optional[str] = None,
    destination_id: Optional[int] = None,
    cuisine_type: Optional[str] = None,
    price_range: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get restaurants for restaurant owner with search and filtering"""
    print(f"🔍 Restaurant Owner Endpoint: User ID: {current_user.id}, Role: {current_user.role}")
    print(f"🔍 Restaurant Owner Endpoint: Filters - search: {search}, destination_id: {destination_id}, cuisine_type: {cuisine_type}, price_range: {price_range}")
    
    if current_user.role != "restaurant_owner":
        raise HTTPException(status_code=403, detail="Restaurant owner access required")
    
    try:
        restaurants = crud.get_restaurants_by_owner_with_filters(
            db=db,
            owner_id=current_user.id,
            search=search,
            destination_id=destination_id,
            cuisine_type=cuisine_type,
            price_range=price_range
        )
        print(f"✅ Restaurant Owner Endpoint: Found {len(restaurants)} restaurants")
        print(f"📊 Restaurant Owner Endpoint: First restaurant data: {restaurants[0] if restaurants else 'None'}")
        return restaurants
    except Exception as e:
        print(f"❌ Error getting restaurant owner restaurants: {e}")
        raise HTTPException(status_code=500, detail="Failed to load restaurants")

# SQL: SELECT * FROM destinations;
# Function: Retrieves all destinations for restaurant owner selection
@app.get("/restaurant-owner/destinations")
def get_restaurant_owner_destinations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get available destinations for restaurant owners"""
    if current_user.role != "restaurant_owner":
        raise HTTPException(status_code=403, detail="Restaurant owner access required")
    
    try:
        destinations = crud.get_destinations(db)
        return destinations
    except Exception as e:
        print(f"❌ Error getting restaurant owner destinations: {e}")
        raise HTTPException(status_code=500, detail="Failed to load destinations")

# SQL: SELECT * FROM restaurants WHERE owner_id = ?;
# Function: Calculates restaurant owner dashboard statistics from owned restaurants
@app.get("/restaurant-owner/statistics")
def get_restaurant_owner_statistics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get statistics for restaurant owner dashboard"""
    if current_user.role != "restaurant_owner":
        raise HTTPException(status_code=403, detail="Restaurant owner access required")
    
    try:
        # Get restaurants owned by current user
        restaurants = db.query(models.Restaurant).filter(models.Restaurant.owner_id == current_user.id).all()
        
        # Calculate statistics
        total_restaurants = len(restaurants)
        active_restaurants = len([r for r in restaurants if r.is_active])
        
        # Calculate average rating
        total_rating = sum(r.rating for r in restaurants if r.rating)
        average_rating = total_rating / len([r for r in restaurants if r.rating]) if any(r.rating for r in restaurants) else 0.0
        
        # Calculate total reviews
        total_reviews = sum(r.reviews for r in restaurants)
        
        # Calculate estimated monthly revenue
        estimated_monthly_revenue = 0
        for restaurant in restaurants:
            if restaurant.price_range:
                price = len(restaurant.price_range)
                # Estimate based on price range: $ = $20, $$ = $40, $$$ = $80, $$$$ = $150 per meal
                avg_meal_price = price * 20 if price == 1 else price * 20 if price == 2 else price * 20 if price == 3 else price * 30
                estimated_monthly_revenue += avg_meal_price * 30 * 2  # Assume 30 days, 2 meals per day
        
        # Count unique destinations
        unique_destinations = len(set(r.destination_id for r in restaurants if r.destination_id))
        
        return {
            "total_restaurants": total_restaurants,
            "active_restaurants": active_restaurants,
            "average_rating": round(average_rating, 2),
            "total_reviews": total_reviews,
            "estimated_monthly_revenue": estimated_monthly_revenue,
            "destinations_covered": unique_destinations
        }
    except Exception as e:
        print(f"❌ Error getting restaurant owner statistics: {e}")
        raise HTTPException(status_code=500, detail="Failed to load statistics")

@app.get("/test/hotel-owner-auth")
def test_hotel_owner_auth(current_user: models.User = Depends(get_current_user)):
    """Test endpoint to verify hotel owner authentication"""
    if current_user.role != "hotel_owner":
        raise HTTPException(status_code=403, detail="Hotel owner access required")
    
    return {
        "message": "Hotel owner authentication working",
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/test/hotel-creation")
def test_hotel_creation(db: Session = Depends(get_db)):
    """Test endpoint to check if hotel creation components are working"""
    try:
        # Check if destinations exist
        destinations = db.query(models.Destination).limit(5).all()
        dest_count = len(destinations)
        
        # Check if hotels table exists and has correct structure
        from sqlalchemy import inspect
        inspector = inspect(db.bind)
        hotel_columns = inspector.get_columns('hotels') if 'hotels' in inspector.get_table_names() else []
        
        # Check if any hotels exist
        hotels = db.query(models.Hotel).limit(5).all()
        hotel_count = len(hotels)
        
        return {
            "message": "Hotel creation test",
            "destinations_count": dest_count,
            "sample_destinations": [{"id": d.id, "name": d.name} for d in destinations[:3]],
            "hotels_table_exists": 'hotels' in inspector.get_table_names(),
            "hotels_columns": [col['name'] for col in hotel_columns],
            "hotels_count": hotel_count,
            "sample_hotels": [{"id": h.id, "name": h.name, "owner_id": h.owner_id, "destination_id": h.destination_id} for h in hotels[:3]],
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return {"error": f"Test failed: {str(e)}"}

@app.get("/test/hotels-db")
def test_hotels_database(db: Session = Depends(get_db)):
    """Test endpoint to check hotels in database"""
    try:
        # Get all hotels with basic info
        hotels = db.query(models.Hotel).all()
        hotel_list = []
        
        for hotel in hotels:
            hotel_list.append({
                "id": hotel.id,
                "name": hotel.name,
                "owner_id": hotel.owner_id,
                "destination_id": hotel.destination_id,
                "created_at": hotel.created_at.isoformat() if hotel.created_at else None
            })
        
        return {
            "message": "Hotels database test",
            "total_hotels": len(hotels),
            "hotels": hotel_list
        }
    except Exception as e:
        return {"error": f"Database test failed: {str(e)}"}

# Hotel endpoints
# SQL: SELECT * FROM hotels LIMIT ? OFFSET ?;
# Function: Retrieves paginated list of all hotels
@app.get("/hotels", response_model=List[schemas.Hotel])
def read_hotels(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    hotels = crud.get_hotels(db, skip=skip, limit=limit)
    return hotels

# SQL: SELECT * FROM hotels WHERE id = ?;
# Function: Retrieves specific hotel by ID
@app.get("/hotels/{hotel_id}", response_model=schemas.Hotel)
def read_hotel(hotel_id: int, db: Session = Depends(get_db)):
    db_hotel = crud.get_hotel(db, hotel_id=hotel_id)
    if db_hotel is None:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return db_hotel

# SQL: INSERT INTO hotels (owner_id, name, description, address, city, country, phone, email, website, image, rating, reviews, price_range, amenities, room_types, destination_id, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
# Function: Creates new hotel with hotel owner role validation
@app.post("/hotels", response_model=schemas.Hotel, status_code=status.HTTP_201_CREATED)
def create_hotel(hotel: schemas.HotelCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Create a new hotel with authentication and validation"""
    print(f"🔍 Hotel creation request from user: {current_user.email} (ID: {current_user.id}, Role: {current_user.role})")
    print(f"📋 Hotel data received: {hotel.dict()}")
    
    if current_user.role != "hotel_owner":
        print(f"❌ Access denied: User role {current_user.role} is not hotel_owner")
        raise HTTPException(status_code=403, detail="Hotel owner access required")
    
    try:
        print(f"✅ User authenticated, creating hotel for owner_id: {current_user.id}")
        result = crud.create_hotel(db=db, hotel=hotel, owner_id=current_user.id)
        print(f"✅ Hotel created successfully with ID: {result.id}")
        
        # Return the hotel with destination info
        hotel_data = result.to_dict()
        print(f"📤 Returning hotel data: {hotel_data}")
        return hotel_data
        
    except Exception as e:
        print(f"❌ Error creating hotel: {str(e)}")
        print(f"❌ Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create hotel: {str(e)}")

# SQL: SELECT * FROM hotels WHERE id = ?; UPDATE hotels SET ... WHERE id = ?;
# Function: Updates hotel with owner/admin access control
@app.put("/hotels/{hotel_id}", response_model=schemas.Hotel)
def update_hotel(hotel_id: int, hotel: schemas.HotelUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_hotel = crud.get_hotel(db, hotel_id=hotel_id)
    if db_hotel is None:
        raise HTTPException(status_code=404, detail="Hotel not found")
    if db_hotel.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return crud.update_hotel(db=db, hotel_id=hotel_id, hotel=hotel)

# SQL: SELECT * FROM hotels WHERE id = ?; DELETE FROM hotels WHERE id = ?;
# Function: Deletes hotel with owner/admin access control
@app.delete("/hotels/{hotel_id}")
def delete_hotel(hotel_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_hotel = crud.get_hotel(db, hotel_id=hotel_id)
    if db_hotel is None:
        raise HTTPException(status_code=404, detail="Hotel not found")
    if db_hotel.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    crud.delete_hotel(db=db, hotel_id=hotel_id)
    return {"message": "Hotel deleted successfully"}

# Traveler endpoints for filtering hotels by destination
# SQL: SELECT * FROM hotels WHERE destination_id = ?;
# Function: Retrieves hotels filtered by destination ID for travelers
@app.get("/hotels/by-destination/{destination_id}")
def get_hotels_by_destination(destination_id: int, db: Session = Depends(get_db)):
    """Get hotels filtered by destination ID for travelers"""
    try:
        print(f"🔍 Getting hotels for destination ID: {destination_id}")
        hotels = crud.get_hotels_by_destination(db, destination_id=destination_id)
        print(f"✅ Found {len(hotels)} hotels for destination {destination_id}")
        return hotels
    except Exception as e:
        print(f"❌ Error getting hotels by destination: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to load hotels")

# Hotel Owner Dashboard endpoints
# SQL: Complex queries for hotel owner statistics aggregation
# Function: Retrieves comprehensive statistics for hotel owner dashboard
@app.get("/hotel-owner/statistics")
def get_hotel_owner_statistics(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Get comprehensive statistics for hotel owner dashboard"""
    if current_user.role != "hotel_owner":
        raise HTTPException(status_code=403, detail="Hotel owner access required")
    
    statistics = crud.get_hotel_owner_statistics(db, current_user.id)
    return statistics

# SQL: SELECT * FROM hotels WHERE owner_id = ? AND (name LIKE ? OR description LIKE ?) AND destination_id = ? AND price_range = ?; OR SELECT * FROM hotels WHERE owner_id = ? LIMIT ? OFFSET ?;
# Function: Retrieves hotels owned by user with search and filtering options
@app.get("/hotel-owner/hotels")
def get_hotel_owner_hotels(
    skip: int = 0, 
    limit: int = 100, 
    search: str = None,
    destination_id: int = None,
    price_range: str = None,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """Get hotels for hotel owner with search and filter options"""
    print(f"🔍 Loading hotels for user: {current_user.email} (ID: {current_user.id})")
    
    if current_user.role != "hotel_owner":
        print(f"❌ Access denied: User role {current_user.role} is not hotel_owner")
        raise HTTPException(status_code=403, detail="Hotel owner access required")
    
    try:
        if search or destination_id or price_range:
            # Use search function
            print(f"🔍 Using search with: search='{search}', destination_id={destination_id}, price_range='{price_range}'")
            hotels = crud.search_hotels_by_owner(
                db, 
                current_user.id, 
                search_term=search,
                destination_id=destination_id,
                price_range=price_range
            )
        else:
            # Get all hotels by owner
            print(f"📋 Getting all hotels for owner_id: {current_user.id}")
            hotels = crud.get_hotels_by_owner_with_destinations(db, current_user.id, skip, limit)
        
        print(f"✅ Found {len(hotels)} hotels")
        
        # Convert to dictionaries with destination info
        hotel_list = []
        for hotel in hotels:
            try:
                hotel_dict = hotel.to_dict()
                hotel_list.append(hotel_dict)
                print(f"🏨 Hotel {hotel.id}: {hotel.name} - Destination: {hotel_dict.get('destination_id')}")
            except Exception as e:
                print(f"❌ Error converting hotel {hotel.id}: {str(e)}")
                # Add basic hotel info if to_dict fails
                hotel_list.append({
                    "id": hotel.id,
                    "name": hotel.name,
                    "owner_id": hotel.owner_id,
                    "destination_id": hotel.destination_id,
                    "description": hotel.description,
                    "address": hotel.address,
                    "city": hotel.city,
                    "country": hotel.country,
                    "phone": hotel.phone,
                    "email": hotel.email,
                    "website": hotel.website,
                    "image": hotel.image,
                    "rating": float(hotel.rating) if hotel.rating else 0.0,
                    "reviews": hotel.reviews,
                    "price_range": hotel.price_range,
                    "amenities": hotel.amenities,
                    "room_types": hotel.room_types,
                    "is_active": hotel.is_active,
                    "created_at": hotel.created_at.isoformat() if hotel.created_at else None,
                    "updated_at": hotel.updated_at.isoformat() if hotel.updated_at else None
                })
        
        print(f"📤 Returning {len(hotel_list)} hotels")
        return hotel_list
        
    except Exception as e:
        print(f"❌ Error loading hotels: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to load hotels: {str(e)}")

# SQL: SELECT * FROM destinations;
# Function: Retrieves all destinations for hotel owner selection
@app.get("/hotel-owner/destinations")
def get_hotel_owner_destinations(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Get destinations available for hotel owner"""
    if current_user.role != "hotel_owner":
        raise HTTPException(status_code=403, detail="Hotel owner access required")
    
    try:
        destinations = crud.get_destinations(db)
        return destinations
    except Exception as e:
        print(f"❌ Error getting hotel owner destinations: {e}")
        raise HTTPException(status_code=500, detail="Failed to load destinations")

# Hotel Booking Management Endpoints
# SQL: INSERT INTO hotel_bookings (traveler_id, hotel_id, check_in_date, check_out_date, room_type, guests, total_price, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
# Function: Creates new hotel booking with traveler role validation and date validation
@app.post("/hotels/{hotel_id}/book")
def create_hotel_booking(
    hotel_id: int,
    booking: schemas.HotelBookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new hotel booking"""
    if current_user.role != "traveler":
        raise HTTPException(status_code=403, detail="Traveler access required")
    
    try:
        # Add traveler_id to booking data
        booking_data = booking.dict()
        booking_data['traveler_id'] = current_user.id
        booking_data['hotel_id'] = hotel_id
        
        # Validate dates
        from datetime import datetime
        check_in = datetime.strptime(booking_data['check_in_date'], '%Y-%m-%d').date()
        check_out = datetime.strptime(booking_data['check_out_date'], '%Y-%m-%d').date()
        
        if check_in >= check_out:
            raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")
        
        if check_in < datetime.now().date():
            raise HTTPException(status_code=400, detail="Check-in date cannot be in the past")
        
        # Create booking
        new_booking = crud.create_hotel_booking(db, booking_data)
        return {"message": "Booking created successfully", "booking": new_booking}
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"❌ Error creating hotel booking: {e}")
        raise HTTPException(status_code=500, detail="Failed to create booking")

# SQL: SELECT * FROM hotels WHERE id = ? AND owner_id = ?; SELECT * FROM hotel_bookings WHERE hotel_id = ?;
# Function: Retrieves all bookings for a specific hotel with hotel owner access control
@app.get("/hotels/{hotel_id}/bookings")
def get_hotel_bookings(
    hotel_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all bookings for a specific hotel (hotel owner only)"""
    if current_user.role != "hotel_owner":
        raise HTTPException(status_code=403, detail="Hotel owner access required")
    
    # Verify hotel ownership
    hotel = db.query(models.Hotel).filter(models.Hotel.id == hotel_id, models.Hotel.owner_id == current_user.id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found or access denied")
    
    try:
        bookings = crud.get_hotel_bookings_by_hotel(db, hotel_id)
        return bookings
    except Exception as e:
        print(f"❌ Error getting hotel bookings: {e}")
        raise HTTPException(status_code=500, detail="Failed to load bookings")

# SQL: SELECT * FROM hotel_bookings WHERE traveler_id = ?;
# Function: Retrieves all bookings for the current traveler
@app.get("/traveler/bookings")
def get_traveler_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all bookings for the current traveler"""
    if current_user.role != "traveler":
        raise HTTPException(status_code=403, detail="Traveler access required")
    
    try:
        bookings = crud.get_hotel_bookings_by_traveler(db, current_user.id)
        return bookings
    except Exception as e:
        print(f"❌ Error getting traveler bookings: {e}")
        raise HTTPException(status_code=500, detail="Failed to load bookings")

# SQL: SELECT * FROM hotel_bookings WHERE booking_id = ?; SELECT * FROM hotels WHERE id = ? AND owner_id = ?; UPDATE hotel_bookings SET ... WHERE booking_id = ?;
# Function: Updates hotel booking with traveler/hotel owner access control
@app.put("/bookings/{booking_id}")
def update_hotel_booking(
    booking_id: int,
    booking_update: schemas.HotelBookingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update a hotel booking"""
    # Get the booking
    booking = db.query(models.HotelBooking).filter(models.HotelBooking.booking_id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions
    if current_user.role == "traveler" and booking.traveler_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if current_user.role == "hotel_owner":
        hotel = db.query(models.Hotel).filter(models.Hotel.id == booking.hotel_id, models.Hotel.owner_id == current_user.id).first()
        if not hotel:
            raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        updated_booking = crud.update_hotel_booking(db, booking_id, booking_update.dict(exclude_unset=True))
        return {"message": "Booking updated successfully", "booking": updated_booking}
    except Exception as e:
        print(f"❌ Error updating hotel booking: {e}")
        raise HTTPException(status_code=500, detail="Failed to update booking")

# SQL: SELECT * FROM hotel_bookings WHERE booking_id = ?; SELECT * FROM hotels WHERE id = ? AND owner_id = ?; UPDATE hotel_bookings SET status = 'cancelled' WHERE booking_id = ?;
# Function: Cancels hotel booking with traveler/hotel owner access control
@app.post("/bookings/{booking_id}/cancel")
def cancel_hotel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Cancel a hotel booking"""
    # Get the booking
    booking = db.query(models.HotelBooking).filter(models.HotelBooking.booking_id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions
    if current_user.role == "traveler" and booking.traveler_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if current_user.role == "hotel_owner":
        hotel = db.query(models.Hotel).filter(models.Hotel.id == booking.hotel_id, models.Hotel.owner_id == current_user.id).first()
        if not hotel:
            raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        cancelled_booking = crud.cancel_hotel_booking(db, booking_id)
        return {"message": "Booking cancelled successfully", "booking": cancelled_booking}
    except Exception as e:
        print(f"❌ Error cancelling hotel booking: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel booking")

# SQL: SELECT room_types FROM hotels WHERE id = ?;
# Function: Retrieves room types for a specific hotel
@app.get("/hotels/{hotel_id}/room-types")
def get_hotel_room_types(
    hotel_id: int,
    db: Session = Depends(get_db)
):
    """Get all room types for a specific hotel"""
    try:
        room_types = crud.get_hotel_room_types(db, hotel_id)
        return room_types
    except Exception as e:
        print(f"❌ Error getting hotel room types: {e}")
        raise HTTPException(status_code=500, detail="Failed to load room types")

# SQL: SELECT * FROM hotel_bookings WHERE hotel_id = ? AND room_type = ? AND check_in_date <= ? AND check_out_date >= ?;
# Function: Checks room availability for specific hotel, room type, and date range
@app.get("/hotels/{hotel_id}/availability")
def get_hotel_availability(
    hotel_id: int,
    room_type: str,
    start_date: str,
    end_date: str,
    db: Session = Depends(get_db)
):
    """Get room availability for a specific hotel, room type, and date range"""
    try:
        availability = crud.get_room_availability(db, hotel_id, room_type, start_date, end_date)
        return availability
    except Exception as e:
        print(f"❌ Error getting hotel availability: {e}")
        raise HTTPException(status_code=500, detail="Failed to load availability")

# Guest Request Management Endpoints
# SQL: SELECT * FROM hotel_bookings WHERE booking_id = ? AND traveler_id = ?; INSERT INTO guest_requests (booking_id, request_type, description, status, created_at) VALUES (?, ?, ?, ?, ?);
# Function: Creates new guest request with traveler role validation and booking ownership check
@app.post("/bookings/{booking_id}/requests")
def create_guest_request(
    booking_id: int,
    request: schemas.GuestRequestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new guest request"""
    if current_user.role != "traveler":
        raise HTTPException(status_code=403, detail="Traveler access required")
    
    # Verify booking ownership
    booking = db.query(models.HotelBooking).filter(models.HotelBooking.booking_id == booking_id, models.HotelBooking.traveler_id == current_user.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or access denied")
    
    try:
        request_data = request.dict()
        request_data['booking_id'] = booking_id
        
        new_request = crud.create_guest_request(db, request_data)
        return {"message": "Request created successfully", "request": new_request}
    except Exception as e:
        print(f"❌ Error creating guest request: {e}")
        raise HTTPException(status_code=500, detail="Failed to create request")

# SQL: SELECT * FROM hotel_bookings WHERE booking_id = ?; SELECT * FROM hotels WHERE id = ? AND owner_id = ?; SELECT * FROM guest_requests WHERE booking_id = ?;
# Function: Retrieves guest requests for specific booking with traveler/hotel owner access control
@app.get("/bookings/{booking_id}/requests")
def get_guest_requests(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all guest requests for a specific booking"""
    # Get the booking
    booking = db.query(models.HotelBooking).filter(models.HotelBooking.booking_id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions
    if current_user.role == "traveler" and booking.traveler_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if current_user.role == "hotel_owner":
        hotel = db.query(models.Hotel).filter(models.Hotel.id == booking.hotel_id, models.Hotel.owner_id == current_user.id).first()
        if not hotel:
            raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        requests = crud.get_guest_requests_by_booking(db, booking_id)
        return requests
    except Exception as e:
        print(f"❌ Error getting guest requests: {e}")
        raise HTTPException(status_code=500, detail="Failed to load requests")

# SQL: SELECT * FROM hotels WHERE id = ? AND owner_id = ?; SELECT * FROM guest_requests WHERE booking_id IN (SELECT booking_id FROM hotel_bookings WHERE hotel_id = ?);
# Function: Retrieves all guest requests for a specific hotel with hotel owner access control
@app.get("/hotels/{hotel_id}/requests")
def get_hotel_guest_requests(
    hotel_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all guest requests for a specific hotel (hotel owner only)"""
    if current_user.role != "hotel_owner":
        raise HTTPException(status_code=403, detail="Hotel owner access required")
    
    # Verify hotel ownership
    hotel = db.query(models.Hotel).filter(models.Hotel.id == hotel_id, models.Hotel.owner_id == current_user.id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found or access denied")
    
    try:
        requests = crud.get_guest_requests_by_hotel(db, hotel_id)
        return requests
    except Exception as e:
        print(f"❌ Error getting hotel guest requests: {e}")
        raise HTTPException(status_code=500, detail="Failed to load requests")

# SQL: SELECT * FROM guest_requests WHERE request_id = ?; SELECT * FROM hotels JOIN hotel_bookings ON hotels.id = hotel_bookings.hotel_id WHERE hotel_bookings.booking_id = ? AND hotels.owner_id = ?; UPDATE guest_requests SET ... WHERE request_id = ?;
# Function: Updates guest request with hotel owner access control
@app.put("/requests/{request_id}")
def update_guest_request(
    request_id: int,
    request_update: schemas.GuestRequestUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update a guest request (hotel owner only)"""
    if current_user.role != "hotel_owner":
        raise HTTPException(status_code=403, detail="Hotel owner access required")
    
    # Get the request
    request = db.query(models.GuestRequest).filter(models.GuestRequest.request_id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Verify hotel ownership
    hotel = db.query(models.Hotel).join(models.HotelBooking).filter(
        models.HotelBooking.booking_id == request.booking_id,
        models.Hotel.id == hotel_id,
        models.Hotel.owner_id == current_user.id
    ).first()
    
    if not hotel:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        updated_request = crud.update_guest_request(db, request_id, request_update.dict(exclude_unset=True))
        return {"message": "Request updated successfully", "request": updated_request}
    except Exception as e:
        print(f"❌ Error updating guest request: {e}")
        raise HTTPException(status_code=500, detail="Failed to update request")

# SQL: SELECT * FROM hotels WHERE id = ? AND owner_id = ?; Complex queries for hotel booking statistics aggregation
# Function: Retrieves comprehensive booking statistics for a hotel with hotel owner access control
@app.get("/hotels/{hotel_id}/booking-statistics")
def get_hotel_booking_statistics(
    hotel_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get comprehensive booking statistics for a hotel (hotel owner only)"""
    if current_user.role != "hotel_owner":
        raise HTTPException(status_code=403, detail="Hotel owner access required")
    
    # Verify hotel ownership
    hotel = db.query(models.Hotel).filter(models.Hotel.id == hotel_id, models.Hotel.owner_id == current_user.id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found or access denied")
    
    try:
        statistics = crud.get_hotel_booking_statistics(db, hotel_id)
        return statistics
    except Exception as e:
        print(f"❌ Error getting hotel booking statistics: {e}")
        raise HTTPException(status_code=500, detail="Failed to load statistics")

# Keep original Item endpoints for compatibility
# SQL: SELECT * FROM items LIMIT ? OFFSET ?;
# Function: Retrieves paginated list of all items
@app.get("/items", response_model=List[schemas.Item])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all items from the database"""
    items = crud.get_items(db, skip=skip, limit=limit)
    return items

# SQL: INSERT INTO items (name, description, price, created_at) VALUES (?, ?, ?, ?);
# Function: Creates new item
@app.post("/items", response_model=schemas.Item, status_code=status.HTTP_201_CREATED)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    """Create a new item"""
    return crud.create_item(db=db, item=item)

# SQL: SELECT * FROM items WHERE id = ?;
# Function: Retrieves specific item by ID
@app.get("/items/{item_id}", response_model=schemas.Item)
def read_item(item_id: int, db: Session = Depends(get_db)):
    """Get a specific item by ID"""
    db_item = crud.get_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

# SQL: UPDATE items SET ... WHERE id = ?;
# Function: Updates existing item
@app.put("/items/{item_id}", response_model=schemas.Item)
def update_item(item_id: int, item: schemas.ItemUpdate, db: Session = Depends(get_db)):
    """Update an existing item"""
    db_item = crud.update_item(db, item_id=item_id, item=item)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

# SQL: DELETE FROM items WHERE id = ?;
# Function: Deletes item
@app.delete("/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    """Delete an item"""
    success = crud.delete_item(db, item_id=item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}

# Seed data endpoint for development
# SQL: SELECT * FROM destinations LIMIT 1; INSERT INTO destinations (...); INSERT INTO users (...);
# Function: Seeds database with sample data for development
@app.post("/seed-data", status_code=status.HTTP_201_CREATED)
def seed_data(db: Session = Depends(get_db)):
    """Seed the database with sample data for development"""
    try:
        # Check if destinations already exist
        existing_destinations = crud.get_destinations(db, limit=1)
        if existing_destinations:
            return {"message": "Data already seeded"}
        
        # Sample destinations data
        sample_destinations = [
            {
                "destination_id": "bali",
                "name": "Bali, Indonesia",
                "image": "https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg?auto=compress&cs=tinysrgb&w=800",
                "rating": 4.9,
                "reviews": 12847,
                "description": "Tropical paradise with stunning temples, beaches, and rice terraces",
                "highlights": "Beaches, Culture, Adventure",
                "country": "Indonesia",
                "region": "Asia"
            },
            {
                "destination_id": "tokyo",
                "name": "Tokyo, Japan",
                "image": "https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=800",
                "rating": 4.8,
                "reviews": 18932,
                "description": "Modern metropolis blending cutting-edge technology with traditional culture",
                "highlights": "Culture, Food, Technology",
                "country": "Japan",
                "region": "Asia"
            },
            {
                "destination_id": "santorini",
                "name": "Santorini, Greece",
                "image": "https://images.pexels.com/photos/161901/santorini-greece-island-sunset-161901.jpeg?auto=compress&cs=tinysrgb&w=800",
                "rating": 4.7,
                "reviews": 9654,
                "description": "Iconic white-washed buildings overlooking crystal-clear Aegean waters",
                "highlights": "Romance, Beaches, History",
                "country": "Greece",
                "region": "Europe"
            }
        ]
        
        # Create destinations
        for dest_data in sample_destinations:
            destination = schemas.DestinationCreate(**dest_data)
            crud.create_destination(db=db, destination=destination)
        
        # Create a sample user (admin)
        sample_user = schemas.UserSignUp(
            email="admin@example.com",
            password="admin123",
            name="Admin User",
            role="admin"
        )
        crud.create_user(db=db, user=sample_user)
        
        return {"message": "Sample data seeded successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error seeding data: {str(e)}")

# SQL: Complex queries for user management data aggregation with joins across multiple tables
# Function: Retrieves comprehensive user management data for admin dashboard
@app.get("/admin/users/management", response_model=List[schemas.UserManagementData])
async def get_user_management_data(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all user management data (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return crud.get_user_management_data(db)

# SQL: SELECT * FROM users WHERE id = ?; UPDATE users SET status = ?, updated_at = ? WHERE id = ?;
# Function: Updates user status with admin-only access and self-deletion prevention
@app.put("/admin/users/{user_id}/status")
async def update_user_status(
    user_id: int,
    status_update: schemas.UpdateUserStatusRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user status (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Validate status
    valid_statuses = ['active', 'suspended', 'deleted']
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    # Prevent admin from deleting themselves
    if user_id == current_user.id and status_update.status == 'deleted':
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    
    try:
        result = crud.update_user_status(
            db, 
            user_id, 
            status_update.status, 
            current_user.id, 
            status_update.admin_notes
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Guide Profile Endpoints
# SQL: SELECT * FROM guides WHERE id = ?;
# Function: Retrieves guide profile by ID
@app.get("/guides/{guide_id}")
def get_guide_profile(guide_id: int, db: Session = Depends(get_db)):
    """Get guide profile by ID"""
    guide = crud.get_guide(db, guide_id=guide_id)
    if guide is None:
        raise HTTPException(status_code=404, detail="Guide not found")
    return guide

# SQL: SELECT * FROM guides WHERE user_id = ?;
# Function: Retrieves guide profile by user ID
@app.get("/guides/user/{user_id}")
def get_guide_by_user(user_id: int, db: Session = Depends(get_db)):
    """Get guide profile by user ID"""
    guide = crud.get_guide_by_user_id(db, user_id=user_id)
    if guide is None:
        raise HTTPException(status_code=404, detail="Guide profile not found")
    return guide

# SQL: SELECT * FROM guides WHERE user_id = ?; INSERT INTO guides (user_id, name, bio, specialties, languages, experience_years, hourly_rate, availability, destination_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
# Function: Creates new guide profile with guide role validation and duplicate check
@app.post("/guides")
def create_guide_profile(guide: schemas.GuideBase, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    """Create new guide profile"""
    try:
        print(f"🔍 === GUIDE PROFILE CREATION START ===")
        print(f"🔍 Current user: ID={current_user.id}, Email={current_user.email}, Role={current_user.role}")
        
        if current_user.role != "guide":
            print(f"❌ User role {current_user.role} is not 'guide'")
            raise HTTPException(status_code=403, detail="Only guides can create profiles")
        
        # Check if profile already exists
        existing_guide = crud.get_guide_by_user_id(db, user_id=current_user.id)
        if existing_guide:
            print(f"❌ Guide profile already exists for user {current_user.id}")
            raise HTTPException(status_code=400, detail="Guide profile already exists")
        
        # Debug logging
        print(f"🔍 Received guide data: {guide.dict()}")
        print(f"🔍 Guide data types: {[(k, type(v)) for k, v in guide.dict().items()]}")
        
        # Create guide profile with user_id added
        guide_data = guide.dict()
        guide_data["user_id"] = current_user.id
        print(f"🔍 Final guide data with user_id: {guide_data}")
        
        # Create the GuideCreate object with all required fields
        print(f"🔍 Creating GuideCreate schema object...")
        guide_create = schemas.GuideCreate(**guide_data)
        print(f"🔍 GuideCreate object created successfully: {guide_create.dict()}")
        
        # Call CRUD function
        print(f"🔍 Calling crud.create_guide...")
        result = crud.create_guide(db, guide=guide_create)
        print(f"🔍 Guide created successfully with ID: {result.id}")
        
        return result
        
    except Exception as e:
        print(f"❌ ERROR in create_guide_profile: {str(e)}")
        print(f"❌ Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# SQL: SELECT * FROM guides WHERE id = ?; UPDATE guides SET ... WHERE id = ?;
# Function: Updates guide profile with guide/admin access control
@app.put("/guides/{guide_id}")
def update_guide_profile(guide_id: int, guide_update: schemas.GuideUpdate, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    """Update guide profile"""
    guide = crud.get_guide(db, guide_id=guide_id)
    if guide is None:
        raise HTTPException(status_code=404, detail="Guide not found")
    
    # Check authorization - guide is now a dictionary, so use bracket notation
    if guide["user_id"] != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this profile")
    
    updated_guide = crud.update_guide(db, guide_id=guide_id, guide_update=guide_update)
    if updated_guide is None:
        raise HTTPException(status_code=500, detail="Failed to update guide profile")
    
    return updated_guide

# SQL: SELECT * FROM guides WHERE id = ?; DELETE FROM guides WHERE id = ?;
# Function: Deletes guide profile with guide/admin access control
@app.delete("/guides/{guide_id}")
def delete_guide_profile(guide_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    """Delete guide profile"""
    guide = crud.get_guide(db, guide_id=guide_id)
    if guide is None:
        raise HTTPException(status_code=404, detail="Guide not found")
    
    # Check authorization - guide is now a dictionary, so use bracket notation
    if guide["user_id"] != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this profile")
    
    success = crud.delete_guide(db, guide_id=guide_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete guide profile")
    
    return {"message": "Guide profile deleted successfully"}

# Traveler endpoints for filtering guides by destination
# SQL: SELECT * FROM guides WHERE destination_id = ?;
# Function: Retrieves guides filtered by destination ID for travelers
@app.get("/guides/by-destination/{destination_id}")
def get_guides_by_destination(destination_id: int, db: Session = Depends(get_db)):
    """Get guides filtered by destination ID for travelers"""
    try:
        print(f"🔍 Getting guides for destination ID: {destination_id}")
        guides = crud.get_guides_by_destination(db, destination_id=destination_id)
        print(f"✅ Found {len(guides)} guides for destination {destination_id}")
        return guides
    except Exception as e:
        print(f"❌ Error getting guides by destination: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to load guides")

# Guide Reviews Endpoints
# SQL: SELECT * FROM guides WHERE id = ?; SELECT * FROM guide_reviews WHERE guide_id = ? LIMIT ? OFFSET ?;
# Function: Retrieves paginated reviews for a specific guide with guide existence validation
@app.get("/guides/{guide_id}/reviews")
def get_guide_reviews(guide_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get reviews for a guide"""
    guide = crud.get_guide(db, guide_id=guide_id)
    if guide is None:
        raise HTTPException(status_code=404, detail="Guide not found")
    
    return crud.get_guide_reviews(db, guide_id=guide_id, skip=skip, limit=limit)

# SQL: SELECT * FROM guides WHERE id = ?; SELECT * FROM guide_reviews WHERE guide_id = ? AND traveler_id = ?; INSERT INTO guide_reviews (guide_id, traveler_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?);
# Function: Creates new guide review with traveler role validation and duplicate review prevention
@app.post("/guides/{guide_id}/reviews")
def create_guide_review(guide_id: int, review: schemas.GuideReviewCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    """Create new guide review"""
    if current_user.role != "traveler":
        raise HTTPException(status_code=403, detail="Only travelers can review guides")
    
    guide = crud.get_guide(db, guide_id=guide_id)
    if guide is None:
        raise HTTPException(status_code=404, detail="Guide not found")
    
    # Check if user already reviewed this guide
    existing_review = db.query(models.GuideReview).filter(
        models.GuideReview.guide_id == guide_id,
        models.GuideReview.traveler_id == current_user.id
    ).first()
    
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this guide")
    
    # Create review
    review_data = review.dict()
    review_data["guide_id"] = guide_id
    review_data["traveler_id"] = current_user.id
    
    return crud.create_guide_review(db, review=schemas.GuideReviewCreate(**review_data))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
