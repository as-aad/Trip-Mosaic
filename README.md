# 🌍 Travel Application - Full Stack CSE370 Project

A comprehensive travel application built with React frontend and FastAPI backend, featuring destination exploration, destination wise Hotel , Guide , Restaurent booking all in one place ,role-based user management and local famous product finding etc.

![Travel App](https://img.shields.io/badge/React-18.3.1-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue) ![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)


## ✨ **Features**

### 🎯 **Core Features**
- **Destination Explorer** - Browse and discover travel destinations
- **Carbon Footprint Calculator** - Track your environmental impact
- **Travel Blog** - Share and read travel experiences
- **Emergency Tools** - Safety information and emergency contacts
- **User Reviews & Ratings** - Rate destinations and read reviews

### 👥 **User Roles**
- **Traveler** - Browse destinations, Find hotel,restaurent,guide, write reviews,make booking 
- **Guide** - Manage guided tours and local experiences
- **Restaurant Owner** - Manage restaurant listings and bookings
- **Hotel Owner** - Manage hotel listings and reservations
- **Admin** - Complete system management and user administration

### 🔧 **Technical Features**
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Real-time Updates** - Live data synchronization
- **Role-based Authentication** - JWT-based security
- **Database Migrations** - Alembic for schema management
- **API Documentation** - Interactive Swagger/OpenAPI docs
- **Type Safety** - Full TypeScript implementation

## 🏗️ **Project Structure**

```
📁 backend/                 # FastAPI Backend
│   ├── 📁 app/                # Main application code
│   │   ├── main.py           # FastAPI app and routes
│   │   ├── models.py         # SQLAlchemy database models
│   │   ├── schemas.py        # Pydantic request/response models
│   │   ├── crud.py           # Database operations
│   │   └── database.py       # Database connection
│   ├── 📁 alembic/           # Database migrations
│   ├── requirements.txt      # Python dependencies
│   ├── alembic.ini          # Migration configuration
│   └── README.md            # Backend documentation
📁 project/               # React Frontend
│   ├── 📁 src/              # Source code
│   │   ├── 📁 components/   # React components
│   │   ├── 📁 services/     # API services
│   │   └── App.tsx          # Main application
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.ts       # Vite configuration
│   └── tailwind.config.js   # Tailwind CSS config
└── 📄 README.md             # This file
```

## 🛠️ **Tech Stack**

### **Frontend**
- **React 18.3.1** - UI library
- **TypeScript 5.5.3** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing
- **Lucide React** - Icon library

### **Backend**
- **FastAPI 0.104.1** - Web framework
- **SQLAlchemy 2.0.23** - ORM
- **MySQL 8.0** - Database
- **Alembic** - Database migrations
- **Pydantic** - Data validation
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.8+
- MySQL 8.0+

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/project-bolt.git
cd project-bolt
```

### **2. Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create .env file with your database credentials:
# DATABASE_URL=mysql+mysqlconnector://username:password@localhost:3306/travel_db
# SECRET_KEY=your-secret-key-here

# Create MySQL database
mysql -u root -p
CREATE DATABASE travel_db;

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload
```

### **3. Frontend Setup**
```bash
# Navigate to project directory (in a new terminal)
cd project

# Install dependencies
npm install

# Start the development server
npm run dev
```

### **4. Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📚 **API Documentation**

### **Authentication Endpoints**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

### **Destination Endpoints**
- `GET /destinations` - Get all destinations
- `GET /destinations/{id}` - Get specific destination
- `POST /destinations` - Create destination (Admin/Guide)
- `PUT /destinations/{id}` - Update destination
- `DELETE /destinations/{id}` - Delete destination

### **User Management**
- `GET /users` - Get all users (Admin)
- `GET /users/{id}` - Get user profile
- `PUT /users/{id}` - Update user profile
- `DELETE /users/{id}` - Delete user (Admin)

### **Travel Features**
- `GET /travel-buddies` - Find travel companions
- `POST /travel-buddies` - Create travel buddy request
- `GET /destinations/{id}/reviews` - Get destination reviews
- `POST /destinations/{id}/reviews` - Submit review

## 🎨 **Screenshots**

### **Homepage**
<img width="1902" height="852" alt="Screenshot 2025-09-05 221923" src="https://github.com/user-attachments/assets/10e90f76-b0ce-422f-8760-75ccb37f36f1" />


### **Admin Dashboard**
<img width="1911" height="901" alt="Screenshot 2025-09-06 020716" src="https://github.com/user-attachments/assets/29329a1e-aefc-458c-848b-46fe11de8a0e" />


### **User Dashboard**
<img width="1905" height="900" alt="Screenshot 2025-09-06 020827" src="https://github.com/user-attachments/assets/2bead27e-8400-4640-9f5b-9bc38f50bac8" />


## 🔧 **Development**

### **Backend Development**
```bash
cd backend
# Run with auto-reload
uvicorn app.main:app --reload

# Run database migrations
alembic revision --autogenerate -m "Description"
alembic upgrade head

# Run tests
pytest
```

### **Frontend Development**
```bash
cd project
# Start dev server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

### **Database Management**
```bash
# Create new migration
alembic revision --autogenerate -m "Your migration message"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## 🧪 **Testing**

### **Backend Testing**
```bash
cd backend
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### **Frontend Testing**
```bash
cd project
# Install test dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

## 📦 **Deployment**

### **Backend Deployment**
1. Set up production database
2. Configure environment variables
3. Install dependencies: `pip install -r requirements.txt`
4. Run migrations: `alembic upgrade head`
5. Start server: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

### **Frontend Deployment**
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure API endpoints for production

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 **Authors**

- **Asad Chowdhury** -(https://github.com/as-aad)

## 🙏 **Acknowledgments**

- FastAPI team for the excellent web framework
- React team for the amazing UI library
- Tailwind CSS for the utility-first CSS framework
- All contributors who helped make this project possible

## 📞 **Support**

If you have any questions or need help:

1. Check the [Issues](https://github.com/as-aad/project-bolt/issues) page
2. Create a new issue with detailed description
3. Contact: asaadchowdhury@gmail.com

---

**Happy Traveling! 🌍✈️**

[![GitHub stars](https://img.shields.io/github/stars/as-aad/project-bolt?style=social)](https://github.com/as-aad/project-bolt)
[![GitHub forks](https://img.shields.io/github/forks/as-aad/project-bolt?style=social)](https://github.com/as-aad/project-bolt)
[![GitHub issues](https://img.shields.io/github/issues/as-aad/project-bolt)](https://github.com/as-aad/project-bolt/issues)
