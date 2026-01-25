from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
from urllib.parse import quote_plus

password = quote_plus("Asadchow@01")  

# Load environment variables
load_dotenv()

# Get database URL from environment or use default for XAMPP
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:[password]@db.ctoehvdmgavbundpjowo.supabase.co:5432/postgres")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
