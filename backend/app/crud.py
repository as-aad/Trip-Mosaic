from sqlalchemy.orm import Session
from . import models, schemas
from typing import List, Optional, Dict
import json
from datetime import datetime
from sqlalchemy import text, func, or_
import re

# User CRUD operations with authentication
# Get user by ID
def get_user(db: Session, user_id: int) -> Optional[models.User]:
    # SQL: SELECT * FROM users WHERE id = ? LIMIT 1
    return db.query(models.User).filter(models.User.id == user_id).first()

# Get user by email
def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    # SQL: SELECT * FROM users WHERE email = ? LIMIT 1
    return db.query(models.User).filter(models.User.email == email).first()

# Get all users
def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    # SQL: SELECT * FROM users LIMIT ? OFFSET ?
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """Create a new user"""
    # Check if user already exists
    # SQL: SELECT * FROM users WHERE email = ? LIMIT 1
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise ValueError("User with this email already exists")
    
    # Create new user
    db_user = models.User(
        email=user.email,
        name=user.name,
        role=user.role,
        phone=user.phone
    )
    # Hash password securely
    db_user.set_password(user.password)
    
    # Add user to database
    # SQL: INSERT INTO users (email, name, role, phone, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Update admin statistics after creating user
    try:
        update_admin_statistics(db)
        print(f"✅ Admin statistics updated after creating user: {user.email}")
    except Exception as e:
        print(f"⚠️ Warning: Failed to update admin statistics: {e}")
    
    return db_user

# Authenticate user with email and password
def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    """Authenticate user with email and password"""
    # SQL: SELECT * FROM users WHERE email = ? LIMIT 1
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not user.verify_password(password):
        return None
    return user

# Update user
def update_user(db: Session, user_id: int, user: schemas.UserUpdate) -> Optional[models.User]:
    # SQL: SELECT * FROM users WHERE id = ? LIMIT 1
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        update_data = user.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)
        # SQL: UPDATE users SET field1 = ?, field2 = ?, ... WHERE id = ?
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> bool:
    print(f"🗑️ CRUD: Attempting to delete user {user_id}")
    
    # SQL: SELECT * FROM users WHERE id = ? LIMIT 1
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        print(f"✅ CRUD: User {user_id} found, proceeding with deletion")
        print(f"   User details: {db_user.name} ({db_user.email}) - {db_user.role}")
        
        try:
            # First, manually delete related records to avoid constraint issues
            print(f"   🔧 Cleaning up related records...")
            
            # Delete from user_management table first (this is causing the constraint issue)
            try:
                # SQL: SELECT * FROM user_management WHERE user_id = ?
                user_management_records = db.query(models.UserManagement).filter(
                    models.UserManagement.user_id == user_id
                ).all()
                for record in user_management_records:
                    # SQL: DELETE FROM user_management WHERE id = ?
                    db.delete(record)
                    print(f"      ✅ Deleted user_management record {record.id}")
            except Exception as e:
                print(f"      ⚠️ Could not delete user_management records: {e}")
                # Try to handle this differently
            
            # Delete from admin_activity_log if this user was an admin
            try:
                if db_user.role == 'admin':
                    # SQL: SELECT * FROM admin_activity_log WHERE admin_id = ?
                    admin_logs = db.query(models.AdminActivityLog).filter(
                        models.AdminActivityLog.admin_id == user_id
                    ).all()
                    for log in admin_logs:
                        # SQL: DELETE FROM admin_activity_log WHERE id = ?
                        db.delete(log)
                        print(f"      ✅ Deleted admin activity log {log.id}")
            except Exception as e:
                print(f"      ⚠️ Could not delete admin activity logs: {e}")
            
            # Now try to delete the user
            print(f"   🗑️ Attempting to delete user...")
            # SQL: DELETE FROM users WHERE id = ?
            db.delete(db_user)
            db.commit()
            print(f"✅ CRUD: User {user_id} deleted successfully from database")
            return True
            
        except Exception as e:
            print(f"❌ CRUD: Error deleting user {user_id}: {e}")
            db.rollback()
            
            # If there are still constraint issues, try a different approach
            try:
                print(f"   🔧 Trying alternative deletion method...")
                
                # Set user as inactive instead of deleting (soft delete)
                # SQL: UPDATE users SET status = 'deleted', email = ?, name = ?, phone = NULL WHERE id = ?
                db_user.status = 'deleted'
                db_user.email = f"deleted_{user_id}_{db_user.email}"
                db_user.name = f"Deleted User {user_id}"
                db_user.phone = None
                
                db.commit()
                print(f"✅ CRUD: User {user_id} marked as deleted (soft delete)")
                return True
                
            except Exception as soft_delete_error:
                print(f"❌ CRUD: Soft delete also failed: {soft_delete_error}")
                db.rollback()
                return False
    else:
        print(f"❌ CRUD: User {user_id} not found in database")
        return False

# Admin Statistics CRUD operations
def get_user_statistics(db: Session) -> dict:
    """Get detailed user statistics for admin dashboard"""
    # TEMPORARY: Use old method until user management system is fully set up
    try:
        # SQL: SELECT COUNT(*) FROM users
        total_users = db.query(models.User).count()
        # SQL: SELECT COUNT(*) FROM users WHERE role = 'traveler'
        travelers = db.query(models.User).filter(models.User.role == "traveler").count()
        # SQL: SELECT COUNT(*) FROM users WHERE role = 'guide'
        guides = db.query(models.User).filter(models.User.role == "guide").count()
        # SQL: SELECT COUNT(*) FROM users WHERE role = 'restaurant_owner'
        restaurant_owners = db.query(models.User).filter(models.User.role == "restaurant_owner").count()
        # SQL: SELECT COUNT(*) FROM users WHERE role = 'hotel_owner'
        hotel_owners = db.query(models.User).filter(models.User.role == "hotel_owner").count()
        # SQL: SELECT COUNT(*) FROM users WHERE role = 'admin'
        admins = db.query(models.User).filter(models.User.role == "admin").count()
        
        return {
            "total_users": total_users,
            "travelers": travelers,
            "guides": guides,
            "restaurant_owners": restaurant_owners,
            "hotel_owners": hotel_owners,
            "admins": admins
        }
    except Exception as e:
        print(f"Error getting user statistics: {e}")
        return {
            "total_users": 0,
            "travelers": 0,
            "guides": 0,
            "restaurant_owners": 0,
            "hotel_owners": 0,
            "admins": 0
        }

def get_admin_statistics(db: Session) -> dict:
    """Get comprehensive admin statistics"""
    user_stats = get_user_statistics(db)
    
    # Get destination statistics
    # SQL: SELECT COUNT(*) FROM destinations
    destinations = db.query(models.Destination).count()
    
    # Get blog post statistics
    # SQL: SELECT COUNT(*) FROM blog_posts
    blog_posts = db.query(models.BlogPost).count()
    
    # Get rating statistics
    # SQL: SELECT rating FROM destinations
    destination_ratings = db.query(models.Destination.rating).all()
    # SQL: SELECT COUNT(*) FROM reviews
    total_reviews = db.query(models.Review).count()
    
    if destination_ratings:
        average_rating = sum([rating[0] for rating in destination_ratings if rating[0] is not None]) / len(destination_ratings)
    else:
        average_rating = 0.0
    
    return {
        "users": user_stats,
        "destinations": destinations,
        "blog_posts": blog_posts,
        "average_rating": round(average_rating, 1),
        "total_reviews": total_reviews
    }

def get_dashboard_overview(db: Session) -> dict:
    """Get complete dashboard overview with recent data"""
    statistics = get_admin_statistics(db)
    
    # TEMPORARY: Use old method until user management system is fully set up
    try:
        # Get recent users (last 5)
        # SQL: SELECT * FROM users ORDER BY created_at DESC LIMIT 5
        recent_users = db.query(models.User).order_by(models.User.created_at.desc()).limit(5).all()
    except Exception as e:
        print(f"Error getting recent users: {e}")
        recent_users = []
    
    # Get recent destinations (last 5)
    # SQL: SELECT * FROM destinations ORDER BY id DESC LIMIT 5
    recent_destinations = db.query(models.Destination).order_by(models.Destination.id.desc()).limit(5).all()
    
    # Get recent blog posts (last 5)
    # SQL: SELECT * FROM blog_posts ORDER BY created_at DESC LIMIT 5
    recent_blog_posts = db.query(models.BlogPost).order_by(models.BlogPost.created_at.desc()).limit(5).all()
    
    # System health check
    system_health = {
        "database_connected": True,
        "total_tables": len(models.Base.metadata.tables),
        "last_update": datetime.utcnow().isoformat()
    }
    
    return {
        "statistics": statistics,
        "recent_users": [user.to_dict() for user in recent_users],
        "recent_destinations": recent_destinations,
        "recent_blog_posts": recent_blog_posts,
        "system_health": system_health
    }

# New Admin-specific CRUD operations
def get_admin_user_by_email(db: Session, email: str):
    """Get admin user by email from regular users table"""
    # SQL: SELECT * FROM users WHERE email = ? AND role = 'admin' LIMIT 1
    return db.query(models.User).filter(models.User.email == email, models.User.role == "admin").first()

def authenticate_admin_user(db: Session, email: str, password: str):
    """Authenticate admin user from regular users table"""
    admin_user = get_admin_user_by_email(db, email)
    if not admin_user:
        return None
    if not admin_user.verify_password(password):
        return None
    return admin_user

def get_admin_statistics_from_table(db: Session):
    """Get admin statistics directly from admin_statistics table"""
    try:
        # SQL: SELECT * FROM admin_statistics LIMIT 1
        stats = db.query(models.AdminStatistics).first()
        if not stats:
            # Create default stats if none exist
            # SQL: INSERT INTO admin_statistics (default_values) VALUES (?)
            stats = models.AdminStatistics()
            db.add(stats)
            db.commit()
            db.refresh(stats)
        return stats
    except Exception as e:
        print(f"Admin statistics table not available: {e}")
        # Fallback to calculated stats
        return None

def update_admin_statistics(db: Session):
    """Update admin statistics table with current data"""
    try:
        # Get current counts
        user_stats = get_user_statistics(db)
        # SQL: SELECT COUNT(*) FROM destinations
        destinations = db.query(models.Destination).count()
        # SQL: SELECT COUNT(*) FROM blog_posts
        blog_posts = db.query(models.BlogPost).count()
        
        # Calculate average rating
        # SQL: SELECT rating FROM destinations
        destination_ratings = db.query(models.Destination.rating).all()
        if destination_ratings:
            average_rating = sum([rating[0] for rating in destination_ratings if rating[0] is not None]) / len(destination_ratings)
        else:
            average_rating = 0.0
        
        # SQL: SELECT COUNT(*) FROM reviews
        total_reviews = db.query(models.Review).count()
        
        # Try to update admin_statistics table if it exists
        try:
            # SQL: SELECT * FROM admin_statistics LIMIT 1
            admin_stats = db.query(models.AdminStatistics).first()
            if not admin_stats:
                # SQL: INSERT INTO admin_statistics (default_values) VALUES (?)
                admin_stats = models.AdminStatistics()
                db.add(admin_stats)
            
            # Update the statistics
            # SQL: UPDATE admin_statistics SET total_users = ?, travelers = ?, guides = ?, restaurant_owners = ?, hotel_owners = ?, admins = ?, total_destinations = ?, total_blog_posts = ?, average_rating = ?, total_reviews = ? WHERE id = ?
            admin_stats.total_users = user_stats["total_users"]
            admin_stats.travelers = user_stats["travelers"]
            admin_stats.guides = user_stats["guides"]
            admin_stats.restaurant_owners = user_stats["restaurant_owners"]
            admin_stats.hotel_owners = user_stats["hotel_owners"]
            admin_stats.admins = user_stats["admins"]
            admin_stats.total_destinations = destinations
            admin_stats.total_blog_posts = blog_posts
            admin_stats.average_rating = average_rating
            admin_stats.total_reviews = total_reviews
            
            db.commit()
            db.refresh(admin_stats)
            return admin_stats
            
        except Exception as e:
            print(f"Admin statistics table update failed: {e}")
            # Return calculated stats instead
            return {
                "total_users": user_stats["total_users"],
                "travelers": user_stats["travelers"],
                "guides": user_stats["guides"],
                "restaurant_owners": user_stats["restaurant_owners"],
                "hotel_owners": user_stats["hotel_owners"],
                "admins": user_stats["admins"],
                "total_destinations": destinations,
                "total_blog_posts": blog_posts,
                "average_rating": average_rating,
                "total_reviews": total_reviews,
                "last_updated": datetime.utcnow().isoformat()
            }
        
    except Exception as e:
        print(f"Error updating admin statistics: {e}")
        return None

def log_admin_activity(db: Session, admin_id: int, action: str, details: str = None):
    """Log admin activity (optional - won't fail if table doesn't exist)"""
    try:
        # SQL: INSERT INTO admin_activity_log (admin_id, action, details, created_at) VALUES (?, ?, ?, ?)
        activity_log = models.AdminActivityLog(
            admin_id=admin_id,
            action=action,
            details=details
        )
        db.add(activity_log)
        db.commit()
        db.refresh(activity_log)
        return activity_log
    except Exception as e:
        print(f"Admin activity logging not available: {e}")
        return None

# Destination CRUD operations
def get_destination(db: Session, destination_id: int) -> Optional[models.Destination]:
    # SQL: SELECT * FROM destinations WHERE id = ? LIMIT 1
    return db.query(models.Destination).filter(models.Destination.id == destination_id).first()

def get_destination_by_id(db: Session, destination_id: str) -> Optional[models.Destination]:
    # SQL: SELECT * FROM destinations WHERE destination_id = ? LIMIT 1
    return db.query(models.Destination).filter(models.Destination.destination_id == destination_id).first()

def get_destinations(db: Session, skip: int = 0, limit: int = 100) -> List[models.Destination]:
    # SQL: SELECT * FROM destinations LIMIT ? OFFSET ?
    return db.query(models.Destination).offset(skip).limit(limit).all()

def create_destination(db: Session, destination: schemas.DestinationCreate) -> models.Destination:
    # SQL: INSERT INTO destinations (name, description, location, rating, image, created_at) VALUES (?, ?, ?, ?, ?, ?)
    db_destination = models.Destination(**destination.dict())
    db.add(db_destination)
    db.commit()
    db.refresh(db_destination)
    return db_destination

def update_destination(db: Session, destination_id: int, destination: schemas.DestinationUpdate) -> Optional[models.Destination]:
    # SQL: SELECT * FROM destinations WHERE id = ? LIMIT 1
    db_destination = db.query(models.Destination).filter(models.Destination.id == destination_id).first()
    if db_destination:
        update_data = destination.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_destination, field, value)
        # SQL: UPDATE destinations SET field1 = ?, field2 = ?, ... WHERE id = ?
        db.commit()
        db.refresh(db_destination)
    return db_destination

def delete_destination(db: Session, destination_id: int) -> bool:
    # SQL: SELECT * FROM destinations WHERE id = ? LIMIT 1
    db_destination = db.query(models.Destination).filter(models.Destination.id == destination_id).first()
    if db_destination:
        # SQL: DELETE FROM destinations WHERE id = ?
        db.delete(db_destination)
        db.commit()
        return True
    return False

# Review CRUD operations
def get_review(db: Session, review_id: int) -> Optional[models.Review]:
    # SQL: SELECT * FROM reviews WHERE id = ? LIMIT 1
    return db.query(models.Review).filter(models.Review.id == review_id).first()

def get_reviews_by_destination(db: Session, destination_id: int, skip: int = 0, limit: int = 100) -> List[Dict]:
    """Get reviews for a specific destination"""
    try:
        print(f"🔍 CRUD: Getting reviews for destination {destination_id}")
        
        # First, let's check if the destination exists
        # SQL: SELECT * FROM destinations WHERE id = ? LIMIT 1
        destination = db.query(models.Destination).filter(models.Destination.id == destination_id).first()
        if destination:
            print(f"📍 CRUD: Destination found: {destination.name} (ID: {destination.id})")
        else:
            print(f"⚠️ CRUD: Destination not found with ID: {destination_id}")
        
        # SQL: SELECT * FROM reviews WHERE destination_id = ? LIMIT ? OFFSET ?
        reviews = db.query(models.Review).filter(models.Review.destination_id == destination_id).offset(skip).limit(limit).all()
        print(f"✅ CRUD: Found {len(reviews)} reviews for destination {destination_id}")
        
        # Debug: Print raw review objects
        for i, review in enumerate(reviews):
            print(f"🔍 CRUD: Review {i+1}: ID={review.id}, Rating={review.rating}, Comment='{review.comment}'")
        
        # Convert to dictionary format for API response
        review_list = []
        for review in reviews:
            try:
                review_dict = review.to_dict()
                review_list.append(review_dict)
                print(f"✅ CRUD: Successfully converted review {review.id} to dict")
            except Exception as e:
                print(f"⚠️ CRUD: Error processing review {review.id}: {e}")
                # Add basic review info if to_dict fails
                review_list.append({
                    "id": review.id,  # Frontend expects 'id'
                    "review_id": review.id,  # Keep original field too
                    "destination_id": review.destination_id,
                    "user_id": review.user_id,
                    "rating": float(review.rating) if review.rating else 0.0,
                    "comment": review.comment,
                    "created_at": review.created_at.isoformat() if review.created_at else None,
                    "user": {
                        "id": review.user.id if review.user else None,
                        "name": review.user.name if review.user else "Anonymous",
                        "email": review.user.email if review.user else ""
                    } if review.user else None
                })
        
        print(f"📊 CRUD: Returning {len(review_list)} reviews")
        return review_list
        
    except Exception as e:
        print(f"❌ CRUD: Error getting reviews by destination: {e}")
        import traceback
        traceback.print_exc()
        return []

def create_review(db: Session, review: schemas.ReviewCreate, user_id: int, destination_id: int) -> models.Review:
    print(f"🔧 CRUD: Creating review with data: {review.dict()}")
    print(f"🔧 CRUD: User ID: {user_id}, Destination ID: {destination_id}")
    
    # SQL: INSERT INTO reviews (rating, comment, user_id, destination_id, created_at) VALUES (?, ?, ?, ?, ?)
    db_review = models.Review(**review.dict(), user_id=user_id, destination_id=destination_id)
    print(f"🔧 CRUD: Review object created: {db_review.id}")
    
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    print(f"🔧 CRUD: Review saved to database with ID: {db_review.id}")
    return db_review

def update_review(db: Session, review_id: int, review: schemas.ReviewUpdate) -> Optional[models.Review]:
    # SQL: SELECT * FROM reviews WHERE id = ? LIMIT 1
    db_review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if db_review:
        update_data = review.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_review, field, value)
        # SQL: UPDATE reviews SET field1 = ?, field2 = ?, ... WHERE id = ?
        db.commit()
        db.refresh(db_review)
    return db_review

def delete_review(db: Session, review_id: int) -> bool:
    # SQL: SELECT * FROM reviews WHERE id = ? LIMIT 1
    db_review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if db_review:
        # SQL: DELETE FROM reviews WHERE id = ?
        db.delete(db_review)
        db.commit()
        return True
    return False

# Travel Buddy CRUD operations
def get_travel_buddy(db: Session, buddy_id: int) -> Optional[models.TravelBuddy]:
    # SQL: SELECT * FROM travel_buddies WHERE id = ? LIMIT 1
    return db.query(models.TravelBuddy).filter(models.TravelBuddy.id == buddy_id).first()

def get_travel_buddies_by_destination(db: Session, destination: str, skip: int = 0, limit: int = 100) -> List[models.TravelBuddy]:
    # SQL: SELECT * FROM travel_buddies WHERE destination = ? AND is_active = 1 LIMIT ? OFFSET ?
    return db.query(models.TravelBuddy).filter(
        models.TravelBuddy.destination == destination,
        models.TravelBuddy.is_active == True
    ).offset(skip).limit(limit).all()

def create_travel_buddy(db: Session, travel_buddy: schemas.TravelBuddyCreate, user_id: int) -> models.TravelBuddy:
    # SQL: INSERT INTO travel_buddies (destination, start_date, end_date, budget, interests, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)
    db_travel_buddy = models.TravelBuddy(**travel_buddy.dict(), user_id=user_id)
    db.add(db_travel_buddy)
    db.commit()
    db.refresh(db_travel_buddy)
    return db_travel_buddy

def update_travel_buddy(db: Session, buddy_id: int, travel_buddy: schemas.TravelBuddyUpdate) -> Optional[models.TravelBuddy]:
    # SQL: SELECT * FROM travel_buddies WHERE id = ? LIMIT 1
    db_travel_buddy = db.query(models.TravelBuddy).filter(models.TravelBuddy.id == buddy_id).first()
    if db_travel_buddy:
        update_data = travel_buddy.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_travel_buddy, field, value)
        # SQL: UPDATE travel_buddies SET field1 = ?, field2 = ?, ... WHERE id = ?
        db.commit()
        db.refresh(db_travel_buddy)
    return db_travel_buddy

def delete_travel_buddy(db: Session, buddy_id: int) -> bool:
    # SQL: SELECT * FROM travel_buddies WHERE id = ? LIMIT 1
    db_travel_buddy = db.query(models.TravelBuddy).filter(models.TravelBuddy.id == buddy_id).first()
    if db_travel_buddy:
        # SQL: DELETE FROM travel_buddies WHERE id = ?
        db.delete(db_travel_buddy)
        db.commit()
        return True
    return False

# Blog Post CRUD operations
def get_blog_post(db: Session, post_id: int) -> Optional[models.BlogPost]:
    # SQL: SELECT * FROM blog_posts WHERE id = ? LIMIT 1
    return db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()

def get_blog_posts(db: Session, skip: int = 0, limit: int = 100) -> List[models.BlogPost]:
    # SQL: SELECT * FROM blog_posts ORDER BY created_at DESC LIMIT ? OFFSET ?
    return db.query(models.BlogPost).order_by(models.BlogPost.created_at.desc()).offset(skip).limit(limit).all()

def create_blog_post(db: Session, blog_post: schemas.BlogPostCreate, author_id: int) -> models.BlogPost:
    # SQL: INSERT INTO blog_posts (title, content, author_id, created_at) VALUES (?, ?, ?, ?)
    db_blog_post = models.BlogPost(**blog_post.dict(), author_id=author_id)
    db.add(db_blog_post)
    db.commit()
    db.refresh(db_blog_post)
    return db_blog_post

def update_blog_post(db: Session, post_id: int, blog_post: schemas.BlogPostUpdate) -> Optional[models.BlogPost]:
    # SQL: SELECT * FROM blog_posts WHERE id = ? LIMIT 1
    db_blog_post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    if db_blog_post:
        update_data = blog_post.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_blog_post, field, value)
        # SQL: UPDATE blog_posts SET field1 = ?, field2 = ?, ... WHERE id = ?
        db.commit()
        db.refresh(db_blog_post)
    return db_blog_post

def delete_blog_post(db: Session, post_id: int) -> bool:
    # SQL: SELECT * FROM blog_posts WHERE id = ? LIMIT 1
    db_blog_post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    if db_blog_post:
        # SQL: DELETE FROM blog_posts WHERE id = ?
        db.delete(db_blog_post)
        db.commit()
        return True
    return False

# Keep original Item CRUD operations for compatibility
def get_item(db: Session, item_id: int) -> Optional[models.Item]:
    # SQL: SELECT * FROM items WHERE id = ? LIMIT 1
    return db.query(models.Item).filter(models.Item.id == item_id).first()

def get_items(db: Session, skip: int = 0, limit: int = 100) -> List[models.Item]:
    # SQL: SELECT * FROM items LIMIT ? OFFSET ?
    return db.query(models.Item).offset(skip).limit(limit).all()

def create_item(db: Session, item: schemas.ItemCreate) -> models.Item:
    # SQL: INSERT INTO items (name, description, price, created_at) VALUES (?, ?, ?, ?)
    db_item = models.Item(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_item(db: Session, item_id: int, item: schemas.ItemUpdate) -> Optional[models.Item]:
    # SQL: SELECT * FROM items WHERE id = ? LIMIT 1
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item:
        update_data = item.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_item, field, value)
        # SQL: UPDATE items SET field1 = ?, field2 = ?, ... WHERE id = ?
        db.commit()
        db.refresh(db_item)
    return db_item

def delete_item(db: Session, item_id: int) -> bool:
    # SQL: SELECT * FROM items WHERE id = ? LIMIT 1
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item:
        # SQL: DELETE FROM items WHERE id = ?
        db.delete(db_item)
        db.commit()
        return True
    return False

# Restaurant CRUD operations
def get_restaurant(db: Session, restaurant_id: int) -> Optional[dict]:
    # SQL: SELECT * FROM restaurants WHERE id = ? LIMIT 1
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    return restaurant.to_dict() if restaurant else None

def get_restaurant_model(db: Session, restaurant_id: int) -> Optional[models.Restaurant]:
    """Get restaurant model object for authorization checks"""
    # SQL: SELECT * FROM restaurants WHERE id = ? LIMIT 1
    return db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()

def get_restaurants(db: Session, skip: int = 0, limit: int = 100) -> List[dict]:
    # SQL: SELECT * FROM restaurants LIMIT ? OFFSET ?
    restaurants = db.query(models.Restaurant).offset(skip).limit(limit).all()
    return [restaurant.to_dict() for restaurant in restaurants]

def get_restaurants_by_owner(db: Session, owner_id: int, skip: int = 0, limit: int = 100) -> List[dict]:
    # SQL: SELECT * FROM restaurants WHERE owner_id = ? LIMIT ? OFFSET ?
    restaurants = db.query(models.Restaurant).filter(models.Restaurant.owner_id == owner_id).offset(skip).limit(limit).all()
    return [restaurant.to_dict() for restaurant in restaurants]

def get_restaurants_by_owner_with_filters(
    db: Session, 
    owner_id: int, 
    search: Optional[str] = None,
    destination_id: Optional[int] = None,
    cuisine_type: Optional[str] = None,
    price_range: Optional[str] = None
) -> List[dict]:
    """Get restaurants by owner with search and filtering"""
    print(f"🔍 CRUD: Getting restaurants for owner_id: {owner_id}")
    print(f"🔍 CRUD: Filters - search: {search}, destination_id: {destination_id}, cuisine_type: {cuisine_type}, price_range: {price_range}")
    
    # SQL: SELECT * FROM restaurants WHERE owner_id = ? [AND additional filters]
    query = db.query(models.Restaurant).filter(models.Restaurant.owner_id == owner_id)
    
    # Apply search filter
    if search:
        search_term = f"%{search}%"
        # SQL: AND (name ILIKE ? OR cuisine_type ILIKE ? OR description ILIKE ?)
        query = query.filter(
            or_(
                models.Restaurant.name.ilike(search_term),
                models.Restaurant.cuisine_type.ilike(search_term),
                models.Restaurant.description.ilike(search_term)
            )
        )
    
    # Apply destination filter
    if destination_id:
        # SQL: AND destination_id = ?
        query = query.filter(models.Restaurant.destination_id == destination_id)
    
    # Apply cuisine type filter
    if cuisine_type:
        # SQL: AND cuisine_type = ?
        query = query.filter(models.Restaurant.cuisine_type == cuisine_type)
    
    # Apply price range filter
    if price_range:
        # SQL: AND price_range = ?
        query = query.filter(models.Restaurant.price_range == price_range)
    
    restaurants = query.all()
    print(f"✅ CRUD: Found {len(restaurants)} restaurants before to_dict conversion")
    
    # Convert to dictionaries
    restaurant_dicts = [restaurant.to_dict() for restaurant in restaurants]
    print(f"✅ CRUD: Converted {len(restaurant_dicts)} restaurants to dictionaries")
    print(f"📊 CRUD: First restaurant dict: {restaurant_dicts[0] if restaurant_dicts else 'None'}")
    
    return restaurant_dicts

def create_restaurant(db: Session, restaurant: schemas.RestaurantCreate, owner_id: int) -> dict:
    # SQL: INSERT INTO restaurants (name, description, cuisine_type, address, phone, website, image, menu_image, rating, reviews, price_range, owner_id, destination_id, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    db_restaurant = models.Restaurant(**restaurant.dict(), owner_id=owner_id)
    db.add(db_restaurant)
    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant.to_dict()

def update_restaurant(db: Session, restaurant_id: int, restaurant: schemas.RestaurantUpdate) -> Optional[dict]:
    # SQL: SELECT * FROM restaurants WHERE id = ? LIMIT 1
    db_restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if db_restaurant:
        update_data = restaurant.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_restaurant, field, value)
        # SQL: UPDATE restaurants SET field1 = ?, field2 = ?, ... WHERE id = ?
        db.commit()
        db.refresh(db_restaurant)
        return db_restaurant.to_dict()
    return None

def delete_restaurant(db: Session, restaurant_id: int) -> bool:
    # SQL: SELECT * FROM restaurants WHERE id = ? LIMIT 1
    db_restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if db_restaurant:
        # SQL: DELETE FROM restaurants WHERE id = ?
        db.delete(db_restaurant)
        db.commit()
        return True
    return False

# Hotel CRUD operations
def get_hotel(db: Session, hotel_id: int) -> Optional[models.Hotel]:
    # SQL: SELECT * FROM hotels WHERE id = ? LIMIT 1
    return db.query(models.Hotel).filter(models.Hotel.id == hotel_id).first()

def get_hotels(db: Session, skip: int = 0, limit: int = 100) -> List[models.Hotel]:
    # SQL: SELECT * FROM hotels LIMIT ? OFFSET ?
    return db.query(models.Hotel).offset(skip).limit(limit).all()

def get_hotels_by_owner(db: Session, owner_id: int, skip: int = 0, limit: int = 100) -> List[models.Hotel]:
    # SQL: SELECT * FROM hotels WHERE owner_id = ? LIMIT ? OFFSET ?
    return db.query(models.Hotel).filter(models.Hotel.owner_id == owner_id).offset(skip).limit(limit).all()

def create_hotel(db: Session, hotel: schemas.HotelCreate, owner_id: int) -> models.Hotel:
    """Create a new hotel with detailed logging"""
    print(f"🏗️ CRUD: Creating hotel for owner_id: {owner_id}")
    print(f"📋 Hotel data: {hotel.dict()}")
    
    try:
        # Validate destination_id exists
        if hotel.destination_id:
            # SQL: SELECT * FROM destinations WHERE id = ? LIMIT 1
            destination = db.query(models.Destination).filter(models.Destination.id == hotel.destination_id).first()
            if not destination:
                print(f"❌ CRUD: Destination ID {hotel.destination_id} not found")
                raise ValueError(f"Destination ID {hotel.destination_id} not found")
            print(f"✅ CRUD: Destination found: {destination.name}")
        
        # Create hotel object
        hotel_data = hotel.dict()
        print(f"🏨 CRUD: Creating hotel with data: {hotel_data}")
        
        # SQL: INSERT INTO hotels (name, description, address, city, country, phone, email, website, image, rating, reviews, price_range, amenities, room_types, owner_id, destination_id, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        db_hotel = models.Hotel(**hotel_data, owner_id=owner_id)
        print(f"🏨 CRUD: Hotel object created: {db_hotel.name}")
        
        # Add to database
        db.add(db_hotel)
        print("💾 CRUD: Hotel added to session")
        
        # Commit changes
        db.commit()
        print("✅ CRUD: Database commit successful")
        
        # Refresh to get the ID
        db.refresh(db_hotel)
        print(f"🔄 CRUD: Hotel refreshed, ID: {db_hotel.id}")
        
        return db_hotel
        
    except Exception as e:
        print(f"❌ CRUD: Error in create_hotel: {str(e)}")
        print(f"❌ CRUD: Error type: {type(e)}")
        db.rollback()
        print("🔄 CRUD: Database rollback performed")
        raise e

def update_hotel(db: Session, hotel_id: int, hotel: schemas.HotelUpdate) -> Optional[models.Hotel]:
    # SQL: SELECT * FROM hotels WHERE id = ? LIMIT 1
    db_hotel = db.query(models.Hotel).filter(models.Hotel.id == hotel_id).first()
    if db_hotel:
        update_data = hotel.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_hotel, field, value)
        # SQL: UPDATE hotels SET field1 = ?, field2 = ?, ... WHERE id = ?
        db.commit()
        db.refresh(db_hotel)
    return db_hotel

def delete_hotel(db: Session, hotel_id: int) -> bool:
    # SQL: SELECT * FROM hotels WHERE id = ? LIMIT 1
    db_hotel = db.query(models.Hotel).filter(models.Hotel.id == hotel_id).first()
    if db_hotel:
        # SQL: DELETE FROM hotels WHERE id = ?
        db.delete(db_hotel)
        db.commit()
        return True
    return False

# New destination-wise hotel operations
def get_hotels_by_destination(db: Session, destination_id: int, skip: int = 0, limit: int = 100) -> List[Dict]:
    """Get hotels by specific destination"""
    try:
        print(f"🔍 CRUD: Getting hotels for destination {destination_id}")
        
        # First check if the hotels table has destination_id field
        from sqlalchemy import inspect
        inspector = inspect(db.bind)
        
        if 'hotels' not in inspector.get_table_names():
            print("❌ CRUD: Hotels table does not exist")
            return []
        
        hotel_columns = inspector.get_columns('hotels')
        column_names = [col['name'] for col in hotel_columns]
        print(f"🔍 CRUD: Hotels table columns: {column_names}")
        
        if 'destination_id' not in column_names:
            print("❌ CRUD: destination_id field not found in hotels table")
            # Try to get all hotels if destination_id doesn't exist
            # SQL: SELECT * FROM hotels LIMIT ? OFFSET ?
            hotels = db.query(models.Hotel).offset(skip).limit(limit).all()
        else:
            # SQL: SELECT * FROM hotels WHERE destination_id = ? LIMIT ? OFFSET ?
            hotels = db.query(models.Hotel).filter(models.Hotel.destination_id == destination_id).offset(skip).limit(limit).all()
        
        print(f"✅ CRUD: Found {len(hotels)} hotels for destination {destination_id}")
        
        # Convert to dictionary format for API response
        hotel_list = []
        for hotel in hotels:
            try:
                hotel_dict = hotel.to_dict()
                hotel_list.append(hotel_dict)
            except Exception as e:
                print(f"⚠️ CRUD: Error processing hotel {hotel.id}: {e}")
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
        
        return hotel_list
        
    except Exception as e:
        print(f"❌ CRUD: Error getting hotels by destination: {e}")
        import traceback
        traceback.print_exc()
        return []

def get_restaurants_by_destination(db: Session, destination_id: int, skip: int = 0, limit: int = 100) -> List[Dict]:
    """Get restaurants by specific destination"""
    try:
        print(f"🔍 CRUD: Getting restaurants for destination {destination_id}")
        
        # First check if the restaurants table has destination_id field
        from sqlalchemy import inspect
        inspector = inspect(db.bind)
        
        if 'restaurants' not in inspector.get_table_names():
            print("❌ CRUD: Restaurants table does not exist")
            return []
        
        restaurant_columns = inspector.get_columns('restaurants')
        column_names = [col['name'] for col in restaurant_columns]
        print(f"🔍 CRUD: Restaurants table columns: {column_names}")
        
        if 'destination_id' not in column_names:
            print("❌ CRUD: destination_id field not found in restaurants table")
            # Try to get all restaurants if destination_id doesn't exist
            # SQL: SELECT * FROM restaurants LIMIT ? OFFSET ?
            restaurants = db.query(models.Restaurant).offset(skip).limit(limit).all()
        else:
            # SQL: SELECT * FROM restaurants WHERE destination_id = ? LIMIT ? OFFSET ?
            restaurants = db.query(models.Restaurant).filter(models.Restaurant.destination_id == destination_id).offset(skip).limit(limit).all()
        
        print(f"✅ CRUD: Found {len(restaurants)} restaurants for destination {destination_id}")
        
        # Convert to dictionary format for API response
        restaurant_list = []
        for restaurant in restaurants:
            try:
                restaurant_dict = restaurant.to_dict()
                restaurant_list.append(restaurant_dict)
            except Exception as e:
                print(f"⚠️ CRUD: Error processing restaurant {restaurant.id}: {e}")
                # Add basic restaurant info if to_dict fails
                restaurant_list.append({
                    "id": restaurant.id,
                    "name": restaurant.name,
                    "owner_id": restaurant.owner_id,
                    "destination_id": restaurant.destination_id,
                    "description": restaurant.description,
                    "cuisine_type": restaurant.cuisine_type,
                    "address": restaurant.address,
                    "phone": restaurant.phone,
                    "website": restaurant.website,
                    "image": restaurant.image,
                    "menu_image": restaurant.menu_image,
                    "rating": float(restaurant.rating) if restaurant.rating else 0.0,
                    "reviews": restaurant.reviews,
                    "price_range": restaurant.price_range,
                    "is_active": restaurant.is_active,
                    "created_at": restaurant.created_at.isoformat() if restaurant.created_at else None,
                    "updated_at": restaurant.updated_at.isoformat() if restaurant.updated_at else None
                })
        
        return restaurant_list
        
    except Exception as e:
        print(f"❌ CRUD: Error getting restaurants by destination: {e}")
        import traceback
        traceback.print_exc()
        return []

def get_guides_by_destination(db: Session, destination_id: int, skip: int = 0, limit: int = 100) -> List[Dict]:
    """Get guides by specific destination"""
    try:
        print(f"🔍 CRUD: Getting guides for destination {destination_id}")
        
        # First check if the guides table has destination_id field
        from sqlalchemy import inspect
        inspector = inspect(db.bind)
        
        if 'guides' not in inspector.get_table_names():
            print("❌ CRUD: Guides table does not exist")
            return []
        
        guide_columns = inspector.get_columns('guides')
        column_names = [col['name'] for col in guide_columns]
        print(f"🔍 CRUD: Guides table columns: {column_names}")
        
        if 'destination_id' not in column_names:
            print("❌ CRUD: destination_id field not found in guides table")
            # Try to get all guides if destination_id doesn't exist
            # SQL: SELECT * FROM guides LIMIT ? OFFSET ?
            guides = db.query(models.Guide).offset(skip).limit(limit).all()
        else:
            # SQL: SELECT * FROM guides WHERE destination_id = ? LIMIT ? OFFSET ?
            guides = db.query(models.Guide).filter(models.Guide.destination_id == destination_id).offset(skip).limit(limit).all()
        
        print(f"✅ CRUD: Found {len(guides)} guides for destination {destination_id}")
        
        # Convert to dictionary format for API response
        guide_list = []
        for guide in guides:
            try:
                guide_dict = {
                    "id": guide.id,
                    "name": getattr(guide.user, 'name', None) if guide.user else "Unknown",
                    "specialty": getattr(guide, 'specialties', None) or "Local Tours",
                    "experience": f"{getattr(guide, 'experience_years', 0)} years" if getattr(guide, 'experience_years', None) else "Experience not specified",
                    "rating": float(getattr(guide, 'rating', 0)) if getattr(guide, 'rating', None) else 0.0,
                    "user": {
                        "name": getattr(guide.user, 'name', None) if guide.user else "Unknown",
                        "email": getattr(guide.user, 'email', None) if guide.user else ""
                    }
                }
                guide_list.append(guide_dict)
            except Exception as e:
                print(f"⚠️ CRUD: Error processing guide {guide.id}: {e}")
                # Add basic guide info if processing fails
                guide_list.append({
                    "id": guide.id,
                    "name": "Guide",
                    "specialty": "Local Tours",
                    "experience": "Experience not specified",
                    "rating": 0.0,
                    "user": {
                        "name": "Guide",
                        "email": ""
                    }
                })
        
        return guide_list
        
    except Exception as e:
        print(f"❌ CRUD: Error getting guides by destination: {e}")
        import traceback
        traceback.print_exc()
        return []

def get_hotels_by_owner_with_destinations(db: Session, owner_id: int, skip: int = 0, limit: int = 100) -> List[models.Hotel]:
    """Get hotels by owner with destination information"""
    # SQL: SELECT * FROM hotels WHERE owner_id = ? LIMIT ? OFFSET ?
    return db.query(models.Hotel).filter(models.Hotel.owner_id == owner_id).offset(skip).limit(limit).all()

def search_hotels_by_owner(db: Session, owner_id: int, search_term: str = None, destination_id: int = None, price_range: str = None) -> List[models.Hotel]:
    """Search hotels by owner with filters"""
    # SQL: SELECT * FROM hotels WHERE owner_id = ? [AND additional filters]
    query = db.query(models.Hotel).filter(models.Hotel.owner_id == owner_id)
    
    if search_term:
        # SQL: AND (name ILIKE ? OR description ILIKE ?)
        query = query.filter(
            or_(
                models.Hotel.name.ilike(f"%{search_term}%"),
                models.Hotel.description.ilike(f"%{search_term}%")
            )
        )
    
    if destination_id:
        # SQL: AND destination_id = ?
        query = query.filter(models.Hotel.destination_id == destination_id)
    
    if price_range:
        # SQL: AND price_range = ?
        query = query.filter(models.Hotel.price_range == price_range)
    
    return query.all()

def get_hotel_owner_statistics(db: Session, owner_id: int) -> Dict:
    """Get comprehensive statistics for a hotel owner"""
    # SQL: SELECT * FROM hotels WHERE owner_id = ?
    hotels = db.query(models.Hotel).filter(models.Hotel.owner_id == owner_id).all()
    
    if not hotels:
        return {
            "total_hotels": 0,
            "active_hotels": 0,
            "average_rating": 0.0,
            "total_reviews": 0,
            "destinations_covered": 0,
            "estimated_monthly_revenue": 0
        }
    
    # Calculate statistics
    total_hotels = len(hotels)
    active_hotels = len([h for h in hotels if h.is_active])
    total_rating = sum(float(h.rating) for h in hotels if h.rating)
    average_rating = total_rating / total_hotels if total_hotels > 0 else 0.0
    total_reviews = sum(h.reviews for h in hotels if h.reviews)
    destinations_covered = len(set(h.destination_id for h in hotels if h.destination_id))
    
    # Calculate estimated monthly revenue from room types
    estimated_revenue = 0
    for hotel in hotels:
        if hotel.room_types:
            try:
                rooms = hotel.room_types.split(',')
                for room in rooms:
                    parts = room.strip().split(':')
                    if len(parts) > 1:
                        price_str = parts[1].strip()
                        price_match = re.search(r'\$(\d+)', price_str)
                        if price_match:
                            estimated_revenue += int(price_match.group(1)) * 30  # Assume 30 days
            except:
                continue
    
    return {
        "total_hotels": total_hotels,
        "active_hotels": active_hotels,
        "average_rating": round(average_rating, 1),
        "total_reviews": total_reviews,
        "destinations_covered": destinations_covered,
        "estimated_monthly_revenue": estimated_revenue
    }

def get_user_management_data(db: Session) -> List[Dict]:
    """Get all user management data with user details"""
    # TEMPORARY: Use simple fallback until user management system is fully set up
    try:
        # Try to use the stored procedure first
        # SQL: CALL GetUserManagementData()
        result = db.execute(text("CALL GetUserManagementData()"))
        data = result.fetchall()
        
        # Convert to list of dictionaries
        users = []
        for row in data:
            users.append({
                'id': row[0],
                'name': row[1],
                'email': row[2],
                'phone': row[3],
                'role': row[4],
                'registration_date': row[5],
                'status': row[6],
                'admin_notes': row[7],
                'last_modified_at': row[8],
                'last_modified_by_name': row[9]
            })
        
        return users
    except Exception as e:
        print(f"User management system not ready, using fallback: {e}")
        # Fallback: Get basic user data directly
        try:
            # SQL: SELECT * FROM users
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
        except Exception as fallback_error:
            print(f"Fallback method also failed: {fallback_error}")
            return []

def update_user_status(db: Session, user_id: int, status: str, admin_id: int, admin_notes: str = None) -> Dict:
    """Update user status using stored procedure"""
    try:
        # Use the stored procedure
        # SQL: CALL UpdateUserStatus(?, ?, ?, ?)
        result = db.execute(
            text("CALL UpdateUserStatus(:user_id, :status, :admin_id, :admin_notes)"),
            {"user_id": user_id, "status": status, "admin_id": admin_id, "admin_notes": admin_notes}
        )
        db.commit()
        
        return {"message": "User status updated successfully", "status": status}
    except Exception as e:
        db.rollback()
        print(f"Error updating user status: {e}")
        raise ValueError(f"Failed to update user status: {str(e)}")

def get_user_management_by_user_id(db: Session, user_id: int):
    """Get user management record by user ID"""
    # SQL: SELECT * FROM user_management WHERE user_id = ? LIMIT 1
    return db.query(models.UserManagement).filter(models.UserManagement.user_id == user_id).first()

# Guide CRUD operations
def get_guide(db: Session, guide_id: int) -> Optional[dict]:
    """Get guide by ID"""
    # SQL: SELECT * FROM guides WHERE id = ? LIMIT 1
    guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if guide:
        return guide.to_dict()
    return None

def get_guide_by_user_id(db: Session, user_id: int) -> Optional[dict]:
    """Get guide by user ID"""
    # SQL: SELECT * FROM guides WHERE user_id = ? LIMIT 1
    guide = db.query(models.Guide).filter(models.Guide.user_id == user_id).first()
    if guide:
        return guide.to_dict()
    return None

def get_guides(db: Session, skip: int = 0, limit: int = 100) -> List[dict]:
    """Get all guides with pagination"""
    # SQL: SELECT * FROM guides LIMIT ? OFFSET ?
    guides = db.query(models.Guide).offset(skip).limit(limit).all()
    return [guide.to_dict() for guide in guides]

def create_guide(db: Session, guide: schemas.GuideCreate) -> dict:
    """Create new guide profile"""
    # SQL: INSERT INTO guides (user_id, specialties, experience_years, rating, total_reviews, destination_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)
    db_guide = models.Guide(**guide.dict())
    db.add(db_guide)
    db.commit()
    db.refresh(db_guide)
    return db_guide.to_dict()

def update_guide(db: Session, guide_id: int, guide_update: schemas.GuideUpdate) -> Optional[dict]:
    """Update guide profile"""
    # SQL: SELECT * FROM guides WHERE id = ? LIMIT 1
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if db_guide:
        for field, value in guide_update.dict(exclude_unset=True).items():
            setattr(db_guide, field, value)
        # SQL: UPDATE guides SET field1 = ?, field2 = ?, ... WHERE id = ?
        db.commit()
        db.refresh(db_guide)
        return db_guide.to_dict()
    return None

def delete_guide(db: Session, guide_id: int) -> bool:
    """Delete guide profile"""
    # SQL: SELECT * FROM guides WHERE id = ? LIMIT 1
    db_guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if db_guide:
        # SQL: DELETE FROM guides WHERE id = ?
        db.delete(db_guide)
        db.commit()
        return True
    return False



# Guide Review CRUD operations
def get_guide_reviews(db: Session, guide_id: int, skip: int = 0, limit: int = 100) -> List[dict]:
    """Get reviews for a guide"""
    # SQL: SELECT * FROM guide_reviews WHERE guide_id = ? LIMIT ? OFFSET ?
    reviews = db.query(models.GuideReview).filter(
        models.GuideReview.guide_id == guide_id
    ).offset(skip).limit(limit).all()
    return [review.to_dict() for review in reviews]

def create_guide_review(db: Session, review: schemas.GuideReviewCreate) -> dict:
    """Create new guide review"""
    # SQL: INSERT INTO guide_reviews (guide_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?)
    db_review = models.GuideReview(**review.dict())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    # Update guide's average rating and total reviews
    update_guide_rating(db, review.guide_id)
    
    return db_review.to_dict()

def update_guide_rating(db: Session, guide_id: int):
    """Update guide's average rating and total reviews count"""
    # SQL: SELECT * FROM guides WHERE id = ? LIMIT 1
    guide = db.query(models.Guide).filter(models.Guide.id == guide_id).first()
    if guide:
        # SQL: SELECT * FROM guide_reviews WHERE guide_id = ?
        reviews = db.query(models.GuideReview).filter(models.GuideReview.guide_id == guide_id).all()
        if reviews:
            total_rating = sum(review.rating for review in reviews)
            guide.rating = total_rating / len(reviews)
            guide.total_reviews = len(reviews)
            # SQL: UPDATE guides SET rating = ?, total_reviews = ? WHERE id = ?
            db.commit()

# Hotel Booking CRUD Operations
def create_hotel_room_type(db: Session, room_type_data: dict) -> Dict:
    """Create a new hotel room type"""
    try:
        # SQL: INSERT INTO hotel_room_types (hotel_id, room_type_name, description, base_price_per_night, max_occupancy, amenities, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        room_type = models.HotelRoomType(**room_type_data)
        db.add(room_type)
        db.commit()
        db.refresh(room_type)
        return room_type.to_dict()
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating hotel room type: {e}")
        raise

def get_hotel_room_types(db: Session, hotel_id: int) -> List[Dict]:
    """Get all room types for a specific hotel"""
    try:
        # SQL: SELECT * FROM hotel_room_types WHERE hotel_id = ? AND is_active = 1
        room_types = db.query(models.HotelRoomType).filter(
            models.HotelRoomType.hotel_id == hotel_id,
            models.HotelRoomType.is_active == True
        ).all()
        return [room_type.to_dict() for room_type in room_types]
    except Exception as e:
        print(f"❌ Error getting hotel room types: {e}")
        return []

def update_hotel_room_type(db: Session, room_type_id: int, update_data: dict) -> Dict:
    """Update a hotel room type"""
    try:
        # SQL: SELECT * FROM hotel_room_types WHERE room_type_id = ? LIMIT 1
        room_type = db.query(models.HotelRoomType).filter(models.HotelRoomType.room_type_id == room_type_id).first()
        if not room_type:
            return None
        
        for key, value in update_data.items():
            if hasattr(room_type, key):
                setattr(room_type, key, value)
        
        # SQL: UPDATE hotel_room_types SET field1 = ?, field2 = ?, ... WHERE room_type_id = ?
        db.commit()
        db.refresh(room_type)
        return room_type.to_dict()
    except Exception as e:
        db.rollback()
        print(f"❌ Error updating hotel room type: {e}")
        raise

def create_room_availability(db: Session, availability_data: dict) -> Dict:
    """Create room availability for a specific date and room type"""
    try:
        # SQL: INSERT INTO room_availability (hotel_id, room_type, date, available_rooms, total_rooms, created_at) VALUES (?, ?, ?, ?, ?, ?)
        availability = models.RoomAvailability(**availability_data)
        db.add(availability)
        db.commit()
        db.refresh(availability)
        return availability.to_dict()
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating room availability: {e}")
        raise

def get_room_availability(db: Session, hotel_id: int, room_type: str, start_date: str, end_date: str) -> List[Dict]:
    """Get room availability for a specific hotel, room type, and date range"""
    try:
        # SQL: SELECT * FROM room_availability WHERE hotel_id = ? AND room_type = ? AND date >= ? AND date <= ?
        availability = db.query(models.RoomAvailability).filter(
            models.RoomAvailability.hotel_id == hotel_id,
            models.RoomAvailability.room_type == room_type,
            models.RoomAvailability.date >= start_date,
            models.RoomAvailability.date <= end_date
        ).all()
        return [avail.to_dict() for avail in availability]
    except Exception as e:
        print(f"❌ Error getting room availability: {e}")
        return []

def update_room_availability(db: Session, availability_id: int, update_data: dict) -> Dict:
    """Update room availability"""
    try:
        # SQL: SELECT * FROM room_availability WHERE availability_id = ? LIMIT 1
        availability = db.query(models.RoomAvailability).filter(models.RoomAvailability.availability_id == availability_id).first()
        if not availability:
            return None
        
        for key, value in update_data.items():
            if hasattr(availability, key):
                setattr(availability, key, value)
        
        # SQL: UPDATE room_availability SET field1 = ?, field2 = ?, ... WHERE availability_id = ?
        db.commit()
        db.refresh(availability)
        return availability.to_dict()
    except Exception as e:
        db.rollback()
        print(f"❌ Error updating room availability: {e}")
        raise

def create_hotel_booking(db: Session, booking_data: dict) -> Dict:
    """Create a new hotel booking"""
    try:
        # Calculate total price based on dates and room type
        from datetime import datetime, timedelta
        check_in = datetime.strptime(booking_data['check_in_date'], '%Y-%m-%d').date()
        check_out = datetime.strptime(booking_data['check_out_date'], '%Y-%m-%d').date()
        
        # Get room type price
        # SQL: SELECT * FROM hotel_room_types WHERE hotel_id = ? AND room_type_name = ? LIMIT 1
        room_type = db.query(models.HotelRoomType).filter(
            models.HotelRoomType.hotel_id == booking_data['hotel_id'],
            models.HotelRoomType.room_type_name == booking_data['room_type']
        ).first()
        
        if not room_type:
            raise ValueError("Room type not found")
        
        # Calculate number of nights
        nights = (check_out - check_in).days
        total_price = room_type.base_price_per_night * nights
        
        # Add total price to booking data
        booking_data['total_price'] = total_price
        
        # Create booking
        # SQL: INSERT INTO hotel_bookings (hotel_id, traveler_id, room_type, check_in_date, check_out_date, total_price, booking_status, guest_name, guest_email, guest_phone, special_requests, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        booking = models.HotelBooking(**booking_data)
        db.add(booking)
        db.commit()
        db.refresh(booking)
        
        # Update room availability
        current_date = check_in
        while current_date < check_out:
            # SQL: SELECT * FROM room_availability WHERE hotel_id = ? AND room_type = ? AND date = ? LIMIT 1
            availability = db.query(models.RoomAvailability).filter(
                models.RoomAvailability.hotel_id == booking_data['hotel_id'],
                models.RoomAvailability.room_type == booking_data['room_type'],
                models.RoomAvailability.date == current_date
            ).first()
            
            if availability and availability.available_rooms > 0:
                # SQL: UPDATE room_availability SET available_rooms = available_rooms - 1 WHERE availability_id = ?
                availability.available_rooms -= 1
                db.commit()
            
            current_date += timedelta(days=1)
        
        return booking.to_dict()
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating hotel booking: {e}")
        raise

def get_hotel_bookings_by_traveler(db: Session, traveler_id: int) -> List[Dict]:
    """Get all bookings for a specific traveler"""
    try:
        # SQL: SELECT * FROM hotel_bookings WHERE traveler_id = ?
        bookings = db.query(models.HotelBooking).filter(models.HotelBooking.traveler_id == traveler_id).all()
        return [booking.to_dict() for booking in bookings]
    except Exception as e:
        print(f"❌ Error getting hotel bookings by traveler: {e}")
        return []

def get_hotel_bookings_by_hotel(db: Session, hotel_id: int) -> List[Dict]:
    """Get all bookings for a specific hotel"""
    try:
        # SQL: SELECT * FROM hotel_bookings WHERE hotel_id = ?
        bookings = db.query(models.HotelBooking).filter(models.HotelBooking.hotel_id == hotel_id).all()
        return [booking.to_dict() for booking in bookings]
    except Exception as e:
        print(f"❌ Error getting hotel bookings by hotel: {e}")
        return []

def update_hotel_booking(db: Session, booking_id: int, update_data: dict) -> Dict:
    """Update a hotel booking"""
    try:
        # SQL: SELECT * FROM hotel_bookings WHERE booking_id = ? LIMIT 1
        booking = db.query(models.HotelBooking).filter(models.HotelBooking.booking_id == booking_id).first()
        if not booking:
            return None
        
        for key, value in update_data.items():
            if hasattr(booking, key):
                setattr(booking, key, value)
        
        # SQL: UPDATE hotel_bookings SET field1 = ?, field2 = ?, ... WHERE booking_id = ?
        db.commit()
        db.refresh(booking)
        return booking.to_dict()
    except Exception as e:
        db.rollback()
        print(f"❌ Error updating hotel booking: {e}")
        raise

def cancel_hotel_booking(db: Session, booking_id: int) -> Dict:
    """Cancel a hotel booking and restore room availability"""
    try:
        # SQL: SELECT * FROM hotel_bookings WHERE booking_id = ? LIMIT 1
        booking = db.query(models.HotelBooking).filter(models.HotelBooking.booking_id == booking_id).first()
        if not booking:
            return None
        
        # Update booking status
        # SQL: UPDATE hotel_bookings SET booking_status = 'cancelled' WHERE booking_id = ?
        booking.booking_status = 'cancelled'
        
        # Restore room availability
        from datetime import datetime, timedelta
        check_in = datetime.strptime(booking.check_in_date, '%Y-%m-%d').date()
        check_out = datetime.strptime(booking.check_out_date, '%Y-%m-%d').date()
        
        current_date = check_in
        while current_date < check_out:
            # SQL: SELECT * FROM room_availability WHERE hotel_id = ? AND room_type = ? AND date = ? LIMIT 1
            availability = db.query(models.RoomAvailability).filter(
                models.RoomAvailability.hotel_id == booking.hotel_id,
                models.RoomAvailability.room_type == booking.room_type,
                models.RoomAvailability.date == current_date
            ).first()
            
            if availability:
                # SQL: UPDATE room_availability SET available_rooms = available_rooms + 1 WHERE availability_id = ?
                availability.available_rooms += 1
                db.commit()
            
            current_date += timedelta(days=1)
        
        db.commit()
        db.refresh(booking)
        return booking.to_dict()
    except Exception as e:
        db.rollback()
        print(f"❌ Error cancelling hotel booking: {e}")
        raise

def create_guest_request(db: Session, request_data: dict) -> Dict:
    """Create a new guest request"""
    try:
        # SQL: INSERT INTO guest_requests (booking_id, request_type, description, status, priority, created_at) VALUES (?, ?, ?, ?, ?, ?)
        request = models.GuestRequest(**request_data)
        db.add(request)
        db.commit()
        db.refresh(request)
        return request.to_dict()
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating guest request: {e}")
        raise

def get_guest_requests_by_booking(db: Session, booking_id: int) -> List[Dict]:
    """Get all guest requests for a specific booking"""
    try:
        # SQL: SELECT * FROM guest_requests WHERE booking_id = ?
        requests = db.query(models.GuestRequest).filter(models.GuestRequest.booking_id == booking_id).all()
        return [request.to_dict() for request in requests]
    except Exception as e:
        print(f"❌ Error getting guest requests by booking: {e}")
        return []

def get_guest_requests_by_hotel(db: Session, hotel_id: int) -> List[Dict]:
    """Get all guest requests for a specific hotel"""
    try:
        # SQL: SELECT gr.* FROM guest_requests gr JOIN hotel_bookings hb ON gr.booking_id = hb.booking_id WHERE hb.hotel_id = ?
        requests = db.query(models.GuestRequest).join(models.HotelBooking).filter(
            models.HotelBooking.hotel_id == hotel_id
        ).all()
        return [request.to_dict() for request in requests]
    except Exception as e:
        print(f"❌ Error getting guest requests by hotel: {e}")
        return []

def update_guest_request(db: Session, request_id: int, update_data: dict) -> Dict:
    """Update a guest request"""
    try:
        # SQL: SELECT * FROM guest_requests WHERE request_id = ? LIMIT 1
        request = db.query(models.GuestRequest).filter(models.GuestRequest.request_id == request_id).first()
        if not request:
            return None
        
        for key, value in update_data.items():
            if hasattr(request, key):
                setattr(request, key, value)
        
        # SQL: UPDATE guest_requests SET field1 = ?, field2 = ?, ... WHERE request_id = ?
        db.commit()
        db.refresh(request)
        return request.to_dict()
    except Exception as e:
        db.rollback()
        print(f"❌ Error updating guest request: {e}")
        raise

def get_hotel_booking_statistics(db: Session, hotel_id: int) -> Dict:
    """Get comprehensive statistics for a hotel"""
    try:
        # Total bookings
        # SQL: SELECT COUNT(*) FROM hotel_bookings WHERE hotel_id = ?
        total_bookings = db.query(models.HotelBooking).filter(models.HotelBooking.hotel_id == hotel_id).count()
        
        # Confirmed bookings
        # SQL: SELECT COUNT(*) FROM hotel_bookings WHERE hotel_id = ? AND booking_status = 'confirmed'
        confirmed_bookings = db.query(models.HotelBooking).filter(
            models.HotelBooking.hotel_id == hotel_id,
            models.HotelBooking.booking_status == 'confirmed'
        ).count()
        
        # Pending bookings
        # SQL: SELECT COUNT(*) FROM hotel_bookings WHERE hotel_id = ? AND booking_status = 'pending'
        pending_bookings = db.query(models.HotelBooking).filter(
            models.HotelBooking.hotel_id == hotel_id,
            models.HotelBooking.booking_status == 'pending'
        ).count()
        
        # Total revenue
        # SQL: SELECT SUM(total_price) FROM hotel_bookings WHERE hotel_id = ? AND booking_status IN ('confirmed', 'checked_in', 'checked_out')
        total_revenue = db.query(func.sum(models.HotelBooking.total_price)).filter(
            models.HotelBooking.hotel_id == hotel_id,
            models.HotelBooking.booking_status.in_(['confirmed', 'checked_in', 'checked_out'])
        ).scalar() or 0
        
        # Average rating (if reviews exist)
        # This would need to be implemented when hotel reviews are added
        
        return {
            "total_bookings": total_bookings,
            "confirmed_bookings": confirmed_bookings,
            "pending_bookings": pending_bookings,
            "total_revenue": float(total_revenue),
            "occupancy_rate": (confirmed_bookings / total_bookings * 100) if total_bookings > 0 else 0
        }
    except Exception as e:
        print(f"❌ Error getting hotel booking statistics: {e}")
        return {}
