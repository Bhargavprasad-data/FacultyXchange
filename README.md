# Faculty Class Exchange System

A full-stack web application that enables faculty members to manage class exchanges, track compensation, and maintain timetables efficiently.

## Project Overview

The Faculty Class Exchange System is designed to streamline the process of faculty members exchanging teaching responsibilities, managing compensation hours, and maintaining organized timetables. It provides role-based access control with separate interfaces for regular faculty and administrators.

## Tech Stack

### Backend
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB with Mongoose 9.3.0
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs
- **Server**: Node.js (ES Module)
- **Development**: Nodemon for hot reloading
- **CORS**: Enabled for cross-origin requests

### Frontend
- **Framework**: React 19.2.4
- **Build Tool**: Vite 8.0.0
- **Routing**: React Router DOM 7.13.1
- **HTTP Client**: Axios 1.13.6
- **UI Libraries**: 
  - Framer Motion (animations)
  - Lucide React (icons)
  - React Hot Toast (notifications)
- **Data Export**: XLSX (Excel support)
- **Linting**: ESLint

## Project Structure

```
faculty-class-exchange/
├── backend/                          # Express.js server
│   ├── config/                       # Database configuration
│   ├── controllers/                  # Business logic
│   │   ├── authController.js
│   │   ├── compensationController.js
│   │   ├── facultyController.js
│   │   ├── notificationController.js
│   │   ├── substituteController.js
│   │   └── timetableController.js
│   ├── middleware/                   # Custom middleware
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/                       # MongoDB schemas
│   │   ├── CompensationClass.js
│   │   ├── Faculty.js
│   │   ├── Notification.js
│   │   ├── SubstituteClass.js
│   │   └── Timetable.js
│   ├── routes/                       # API routes
│   │   ├── authRoutes.js
│   │   ├── balanceRoutes.js
│   │   ├── compensationRoutes.js
│   │   ├── facultyRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── substituteRoutes.js
│   │   └── timetableRoutes.js
│   ├── utils/                        # Utility functions
│   │   └── generateToken.js
│   ├── server.js                     # Express server setup
│   ├── seeder.js                     # Database seeding script
│   └── package.json
│
├── frontend/                         # React application
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── TopNav.jsx
│   │   ├── context/                  # React context
│   │   │   └── AuthContext.jsx
│   │   ├── pages/                    # Page components
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── AdminTimetables.jsx
│   │   │   ├── AssignSubstitute.jsx
│   │   │   ├── Compensate.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Timetable.jsx
│   │   ├── services/                 # API services
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── App.css
│   ├── public/                       # Static assets
│   │   ├── manifest.json
│   │   └── sw.js
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── package.json
│
└── README.md
```

## Features

- **Authentication**: Secure JWT-based login system
- **Role-Based Access Control**: Separate functionality for faculty and administrators
- **Class Exchange Management**: Faculty can propose and accept class exchanges
- **Compensation Tracking**: Track teaching hours and compensation balance
- **Substitute Assignment**: Assign substitute teachers for class exchanges
- **Timetable Management**: View and manage class schedules
- **Notifications**: Real-time notifications for class exchanges and updates
- **Admin Panel**: Administrative interface for managing faculty and approvals
- **Data Export**: Export data to Excel for reporting

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd faculty-class-exchange
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

1. **Backend Setup**
   - Navigate to the `backend` folder
   - Create a `.env` file with the following variables:
     ```
     MONGODB_URI=<your-mongodb-connection-string>
     JWT_SECRET=<your-jwt-secret>
     PORT=5000
     ```
   - Update `config/db.js` with your MongoDB connection details if needed

2. **Frontend Setup**
   - Update API endpoint in `src/services/api.js` to point to your backend server

### Running the Application

**Development Mode**

1. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   # or with nodemon for auto-reload
   npx nodemon server.js
   ```
   The backend will run on `http://localhost:5000`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

**Production Build**

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Run Backend in Production**
   ```bash
   cd backend
   NODE_ENV=production npm start
   ```

### Database Seeding

To seed the database with initial data:
```bash
cd backend
node seeder.js
```

## API Endpoints

The backend provides the following main endpoint groups:

- **Authentication**: `/api/auth/*` - Login, registration, token management
- **Faculty**: `/api/faculty/*` - Faculty profile and information
- **Compensation**: `/api/compensation/*` - Class compensation management
- **Substitute**: `/api/substitute/*` - Substitute assignment
- **Timetable**: `/api/timetable/*` - Timetable operations
- **Notification**: `/api/notification/*` - Notifications management
- **Balance**: `/api/balance/*` - Compensation balance tracking

For detailed API documentation, refer to the individual route files in `backend/routes/`.

## Development

### Code Quality

Run ESLint in the frontend directory:
```bash
cd frontend
npm run lint
```

### Project Commands

**Backend**
- Development: `npx nodemon server.js`
- Database Seed: `node seeder.js`

**Frontend**
- Development: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Preview Build: `npm run preview`

## File Locations

- **Environment Variables**: Backend root (`.env`)
- **Database Config**: `backend/config/db.js`
- **API Endpoint Config**: `frontend/src/services/api.js`

## Troubleshooting

### Backend Connection Issues
- Verify MongoDB connection string in `.env`
- Ensure MongoDB service is running
- Check if port 5000 is available

### Frontend API Errors
- Verify backend is running on the correct port
- Check API endpoint configuration in `frontend/src/services/api.js`
- Ensure CORS is properly configured in Express

### Module Issues
- Delete `node_modules` and run `npm install` again
- Clear npm cache: `npm cache clean --force`

## Contributing

When contributing to this project:
1. Follow the existing code structure and naming conventions
2. Ensure frontend code passes ESLint
3. Test features both in frontend and backend
4. Update relevant documentation

## License

ISC

## Support

For issues or questions, please refer to the project documentation or contact the development team.
