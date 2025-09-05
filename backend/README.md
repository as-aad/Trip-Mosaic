# FastAPI Backend with MySQL

A clean architecture FastAPI backend application with MySQL database, SQLAlchemy ORM, and Alembic migrations. This backend is designed to work with the React frontend travel application.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI application and routes
│   ├── database.py      # SQLAlchemy connection setup
│   ├── models.py        # Database models
│   ├── schemas.py       # Pydantic request/response models
│   └── crud.py          # Database operations
├── alembic/             # Database migrations
├── requirements.txt      # Python dependencies
├── .env                 # Environment variables
├── alembic.ini         # Alembic configuration
├── setup.py            # Database setup and seeding script
├── start.bat           # Windows startup script
└── start.ps1           # PowerShell startup script
```

## Features

- **Travel Application Backend**: Complete API for destinations, users, reviews, travel buddies, and blog posts
- **Clean Architecture**: Separated concerns with models, schemas, CRUD operations, and API endpoints
- **MySQL Database**: Robust database with SQLAlchemy ORM
- **Database Migrations**: Alembic for schema management
- **CORS Support**: Configured for frontend integration
- **Sample Data**: Built-in seeding for development
- **Type Safety**: Full Pydantic validation

## Setup Instructions

### 1. Create and Activate Python Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure Database

1. Update the `.env` file with your MySQL database credentials:
   ```
   DATABASE_URL=mysql+mysqlconnector://username:password@localhost:3306/travel_db
   ```

2. Create the MySQL database:
   ```sql
   CREATE DATABASE travel_db;
   ```

### 4. Run Database Migrations

```bash
# Generate initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

### 5. Start the Server

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### 6. Seed the Database (Optional)

```bash
# Run the setup script to seed initial data
python setup.py
```

Or manually seed via API:
```bash
curl -X POST http://localhost:8000/seed-data
```

## API Endpoints

### Core Endpoints
- `GET /health` - Health check
- `GET /destinations` - Get all destinations
- `GET /destinations/{id}` - Get specific destination
- `POST /destinations` - Create new destination
- `GET /users` - Get all users
- `POST /users` - Create new user
- `GET /blog-posts` - Get all blog posts
- `POST /blog-posts` - Create new blog post

### Travel Features
- `GET /travel-buddies` - Find travel companions
- `POST /travel-buddies` - Create travel buddy request
- `GET /destinations/{id}/reviews` - Get destination reviews
- `POST /destinations/{id}/reviews` - Submit destination review

### Development
- `POST /seed-data` - Seed database with sample data
- `GET /items` - Legacy items endpoint (for compatibility)

## Frontend Integration

The backend is configured with CORS to work with the React frontend:

- **Frontend URL**: `http://localhost:5173` (Vite default)
- **API Base URL**: `http://localhost:8000`
- **CORS**: Enabled for frontend domains

### Frontend API Service

The frontend includes a complete API service (`src/services/api.ts`) that provides:
- Type-safe API calls
- Error handling
- Data transformation utilities
- All backend endpoints

## Database Models

- **User**: User accounts with roles (traveler, guide, admin)
- **Destination**: Travel destinations with ratings and reviews
- **Review**: User reviews for destinations
- **TravelBuddy**: Travel companion matching system
- **BlogPost**: Travel blog posts and articles

## API Documentation

- **Interactive API docs**: `http://localhost:8000/docs`
- **ReDoc documentation**: `http://localhost:8000/redoc`

## Development Workflow

1. **Start Backend**: `uvicorn app.main:app --reload`
2. **Start Frontend**: `npm run dev` (in project directory)
3. **Database Changes**: Use Alembic migrations
4. **API Testing**: Use the interactive docs at `/docs`

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure MySQL is running and credentials are correct
2. **CORS Errors**: Check that frontend URL is in CORS allowlist
3. **Migration Errors**: Ensure database exists and user has proper permissions
4. **Port Conflicts**: Ensure port 8000 is available for the backend

### Reset Database

```bash
# Drop and recreate database
DROP DATABASE travel_db;
CREATE DATABASE travel_db;

# Run migrations
alembic upgrade head

# Seed data
python setup.py
```

## Production Considerations

- Use environment variables for sensitive data
- Implement proper authentication and authorization
- Add rate limiting and security headers
- Use production-grade database and server
- Implement logging and monitoring
- Add health checks and metrics
