#!/usr/bin/env python3
"""
Admin Database Setup Script
Run this script to set up the admin database structure and initial data
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_admin_database():
    """Set up admin database tables and initial data"""
    
    # Database connection
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL not found in .env file")
        return False
    
    try:
        # Create engine
        engine = create_engine(database_url)
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Database connection successful")
        
        # Read and execute admin setup SQL
        admin_sql_file = "admin_database_setup.sql"
        if not os.path.exists(admin_sql_file):
            print(f"❌ {admin_sql_file} not found")
            return False
        
        with open(admin_sql_file, 'r') as f:
            sql_content = f.read()
        
        # Split SQL by semicolon and execute each statement
        statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
        
        with engine.connect() as conn:
            for statement in statements:
                if statement and not statement.startswith('--'):
                    try:
                        conn.execute(text(statement))
                        print(f"✅ Executed: {statement[:50]}...")
                    except Exception as e:
                        print(f"⚠️ Warning executing: {statement[:50]}... - {e}")
            
            conn.commit()
        
        print("✅ Admin database setup completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error setting up admin database: {e}")
        return False

def verify_admin_setup():
    """Verify that admin tables were created successfully"""
    
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL not found in .env file")
        return False
    
    try:
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            # Check if admin tables exist
            result = conn.execute(text("SHOW TABLES LIKE 'admin_%'"))
            admin_tables = [row[0] for row in result]
            
            print(f"📊 Admin tables found: {admin_tables}")
            
            # Check admin users
            result = conn.execute(text("SELECT COUNT(*) FROM admin_users"))
            admin_count = result.fetchone()[0]
            print(f"👥 Admin users: {admin_count}")
            
            # Check admin statistics
            result = conn.execute(text("SELECT * FROM admin_statistics"))
            stats = result.fetchone()
            if stats:
                print(f"📈 Admin statistics initialized: {stats}")
            
            return True
            
    except Exception as e:
        print(f"❌ Error verifying admin setup: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Setting up Admin Database...")
    
    if setup_admin_database():
        print("\n🔍 Verifying setup...")
        verify_admin_setup()
        print("\n🎉 Admin database setup completed!")
        print("\n📋 Next steps:")
        print("1. Restart your FastAPI server")
        print("2. Test admin endpoints")
        print("3. Sign in with admin@example.com / admin123")
    else:
        print("\n❌ Admin database setup failed!")
        sys.exit(1)
