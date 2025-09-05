#!/usr/bin/env python3
"""
Reset Admin Password
This script resets the password for an existing admin user.
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

def reset_admin_password():
    """Reset password for existing admin user"""
    
    print("🔐 Resetting Admin Password...")
    
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
        
        # Step 1: List all admin users
        print("\n📋 Step 1: Available Admin Users...")
        cursor.execute("SELECT id, name, email, role, created_at FROM users WHERE role = 'admin'")
        admin_users = cursor.fetchall()
        
        if not admin_users:
            print("❌ No admin users found!")
            print("   Solution: Create a new admin user using create_admin.py")
            return
        
        print(f"👑 Found {len(admin_users)} admin user(s):")
        for i, user in enumerate(admin_users, 1):
            print(f"   {i}. ID: {user[0]}, Name: {user[1]}, Email: {user[2]}, Created: {user[3]}")
        
        # Step 2: Select which admin to reset
        print("\n🔍 Step 2: Select Admin User...")
        if len(admin_users) == 1:
            selected_user = admin_users[0]
            print(f"✅ Auto-selected: {selected_user[1]} ({selected_user[2]})")
        else:
            try:
                choice = int(input(f"Enter number (1-{len(admin_users)}): ")) - 1
                if 0 <= choice < len(admin_users):
                    selected_user = admin_users[choice]
                else:
                    print("❌ Invalid choice!")
                    return
            except ValueError:
                print("❌ Please enter a valid number!")
                return
        
        user_id, user_name, user_email, user_role, user_created = selected_user
        print(f"✅ Selected: {user_name} ({user_email})")
        
        # Step 3: Get new password
        print("\n🔑 Step 3: Set New Password...")
        new_password = input("Enter new password: ").strip()
        confirm_password = input("Confirm new password: ").strip()
        
        if not new_password:
            print("❌ Password cannot be empty!")
            return
        
        if new_password != confirm_password:
            print("❌ Passwords don't match!")
            return
        
        # Step 4: Hash new password and update
        print("\n🔄 Step 4: Updating Password...")
        hashed_password = hash_password(new_password)
        
        update_query = """
        UPDATE users 
        SET password_hash = %s, updated_at = %s
        WHERE id = %s
        """
        
        current_time = datetime.now()
        cursor.execute(update_query, (hashed_password, current_time, user_id))
        connection.commit()
        
        # Step 5: Verify update
        print("\n✅ Step 5: Verifying Update...")
        cursor.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
        updated_user = cursor.fetchone()
        
        if updated_user and updated_user[0]:
            print("✅ Password updated successfully!")
            print(f"   • User: {user_name}")
            print(f"   • Email: {user_email}")
            print(f"   • Updated: {current_time}")
            print(f"   • New password hash: {updated_user[0][:20]}...")
            
            print("\n🎉 You can now sign in with:")
            print(f"   Email: {user_email}")
            print(f"   Password: {new_password}")
        else:
            print("❌ Password update failed!")
        
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
    reset_admin_password()
    print("\n✨ Password reset completed!")
