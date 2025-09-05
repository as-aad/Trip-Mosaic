#!/usr/bin/env python3
"""
Create Admin User
This script creates a new admin user with proper password hashing.
"""

import mysql.connector
import hashlib
import os
from datetime import datetime

def hash_password(password: str) -> str:
    """Hash password using bcrypt-like method"""
    # Simple hash for demo - in production use bcrypt
    salt = os.urandom(16).hex()
    hash_obj = hashlib.sha256((password + salt).encode())
    return f"{salt}${hash_obj.hexdigest()}"

def create_admin_user():
    """Create a new admin user"""
    
    print("👑 Creating New Admin User...")
    
    # Get admin details
    name = input("Enter admin name: ").strip()
    email = input("Enter admin email: ").strip()
    password = input("Enter admin password: ").strip()
    
    if not name or not email or not password:
        print("❌ All fields are required!")
        return
    
    # Database connection parameters
    db_config = {
        'host': 'localhost',
        'user': 'root',
        'password': '',  # XAMPP default has no password
        'database': 'travel_db'
    }
    
    try:
        # Connect to MySQL
        print("🔌 Connecting to MySQL database...")
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        
        print("✅ Connected to MySQL successfully!")
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        existing_user = cursor.fetchone()
        
        if existing_user:
            print(f"❌ User with email '{email}' already exists!")
            return
        
        # Hash the password
        hashed_password = hash_password(password)
        
        # Create the admin user
        insert_query = """
        INSERT INTO users (name, email, password_hash, role, phone, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        
        current_time = datetime.now()
        user_data = (name, email, hashed_password, 'admin', '', current_time, current_time)
        
        cursor.execute(insert_query, user_data)
        connection.commit()
        
        user_id = cursor.lastrowid
        print(f"✅ Admin user created successfully!")
        print(f"   • ID: {user_id}")
        print(f"   • Name: {name}")
        print(f"   • Email: {email}")
        print(f"   • Role: admin")
        print(f"   • Created: {current_time}")
        
        # Verify the user was created
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
        admin_count = cursor.fetchone()[0]
        print(f"\n📊 Total admin users: {admin_count}")
        
        print("\n🎉 You can now sign in with:")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        
    except mysql.connector.Error as err:
        print(f"❌ MySQL Error: {err}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("\n🔌 Database connection closed")

if __name__ == "__main__":
    create_admin_user()
    print("\n✨ Admin creation completed!")
