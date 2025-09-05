#!/usr/bin/env python3
"""
Fix Password Hashes
This script fixes corrupted password hashes in the database.
"""

import sys
import os

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(__file__))

def fix_password_hashes():
    """Fix corrupted password hashes in the database"""
    
    print("🔧 Fixing Corrupted Password Hashes...")
    
    try:
        # Import required modules
        from app.database import SessionLocal
        from app.models import User
        import bcrypt
        
        print("✅ All modules imported successfully!")
        
        # Connect to database
        db = SessionLocal()
        try:
            # Check all users
            users = db.query(User).all()
            print(f"📊 Found {len(users)} users in database")
            
            fixed_count = 0
            for user in users:
                try:
                    # Test if password hash is valid
                    test_result = bcrypt.checkpw("test".encode('utf-8'), user.password_hash.encode('utf-8'))
                    print(f"   ✅ User {user.email} ({user.role}): Password hash is valid")
                except (ValueError, TypeError) as e:
                    print(f"   ❌ User {user.email} ({user.role}): Password hash is corrupted - {e}")
                    
                    # Fix the password hash
                    if user.role == "admin":
                        # Set admin password to "admin123"
                        new_password = "admin123"
                        print(f"      🔧 Setting admin password to: {new_password}")
                    else:
                        # Set other users to "password123"
                        new_password = "password123"
                        print(f"      🔧 Setting user password to: {new_password}")
                    
                    # Create new hash
                    new_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                    user.password_hash = new_hash
                    fixed_count += 1
                    print(f"      ✅ Password hash fixed for {user.email}")
            
            # Commit changes
            if fixed_count > 0:
                db.commit()
                print(f"\n🎉 Fixed {fixed_count} corrupted password hash(es)!")
                print("\n📋 New passwords:")
                print("   • Admin users: admin123")
                print("   • Other users: password123")
            else:
                print("\n✅ No corrupted password hashes found!")
            
            # Verify fixes
            print("\n🔍 Verifying fixes...")
            for user in users:
                try:
                    if user.role == "admin":
                        test_password = "admin123"
                    else:
                        test_password = "password123"
                    
                    is_valid = bcrypt.checkpw(test_password.encode('utf-8'), user.password_hash.encode('utf-8'))
                    print(f"   ✅ {user.email} ({user.role}): Password verification {'PASSED' if is_valid else 'FAILED'}")
                    
                except Exception as e:
                    print(f"   ❌ {user.email} ({user.role}): Still has issues - {e}")
            
        finally:
            db.close()
        
        print("\n🎉 Password hash fix completed!")
        return True
        
    except Exception as e:
        print(f"❌ Password hash fix failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = fix_password_hashes()
    print(f"\n✨ Fix completed with {'success' if success else 'failures'}!")
