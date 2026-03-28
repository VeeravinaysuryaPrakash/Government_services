<<<<<<< HEAD
# Government Services Portal

A comprehensive government services portal for managing citizen complaints with automatic department routing using machine learning classification.

## Features

### User Features
- **User Registration & Login**: Secure authentication for citizens
- **Report Complaints**: 
  - Upload photos of problems
  - Auto-detect location using GPS
  - Describe issues in detail
  - Automatic routing to appropriate departments via ML classification
- **View My Complaints**: Track all submitted complaints
- **Local Complaints**: View complaints in your local area (5km radius)
- **Action Tracking**: See actions taken by departments on your complaints

### Department Features
- **Department Login**: Separate login for different departments (Municipal, Medical, Water, Electricity, Sanitation, Traffic)
- **Complaint Management**: View all complaints assigned to your department
- **Status Updates**: Update complaint status (Pending, In Progress, Resolved, Rejected)
- **Action Logging**: Add actions taken with optional images
- **Resolution Upload**: Upload images when problems are resolved

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB Atlas** for database
- **Cloudinary** for image storage
- **JWT** for authentication
- **Machine Learning** service for complaint classification

### Frontend
- **React** with React Router
- **Axios** for API calls
- **Responsive Design** for mobile and desktop

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Running Both Servers

From the root directory:
```bash
npm run dev
```

This will start both the backend (port 5000) and frontend (port 3000) servers concurrently.

## Default Department Passwords

- **Municipal**: `municipal123`
- **Medical**: `medical123`
- **Water**: `water123`
- **Electricity**: `electricity123`
- **Sanitation**: `sanitation123`
- **Traffic**: `traffic123`

**Note**: Change these default passwords in production!

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/department-login` - Department login
- `GET /api/auth/me` - Get current user

### Complaints
- `POST /api/complaints/report` - Report a complaint
- `GET /api/complaints/my-complaints` - Get user's complaints
- `GET /api/complaints/local` - Get local complaints
- `GET /api/complaints/:id` - Get single complaint

### Departments
- `GET /api/departments/complaints` - Get department complaints
- `PATCH /api/departments/complaints/:id/status` - Update complaint status
- `POST /api/departments/complaints/:id/action` - Add action to complaint
- `POST /api/departments/complaints/:id/resolve` - Resolve complaint

## Machine Learning Classification

The system uses ML classification to automatically route complaints to the appropriate department based on:
- **Image Analysis**: Classifies the uploaded image
- **Description Analysis**: Analyzes the complaint description
- **Combined Classification**: Merges both analyses for accurate routing

Currently, a simplified keyword-based classification is implemented. For production, integrate with:
- TensorFlow.js for client-side ML
- Pre-trained image classification models
- NLP models for description analysis
- Cloud ML APIs (Google Cloud Vision, AWS Rekognition, etc.)

## Project Structure

```
government_services/
├── server/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── services/        # ML and Cloudinary services
│   └── index.js         # Server entry point
├── client/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   └── App.js       # Main app component
│   └── public/          # Static files
└── README.md
```

## Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Environment variables for sensitive data
- Input validation on both client and server
- File upload size limits (5MB)

## Future Enhancements

- Real-time notifications
- Email/SMS notifications
- Advanced ML models for better classification
- Geospatial queries for better location-based filtering
- Admin dashboard
- Analytics and reporting
- Multi-language support
- Mobile app (React Native)

## License

ISC

=======
# Government_services
The Government Services Portal is a web app that helps citizens report and track complaints easily. Users upload images, add details, and share location. The system uses ML to send issues to the correct department. Authorities update status and actions, ensuring faster resolution, transparency, and efficient public service management.
>>>>>>> 7657e05fd18ee27d7738938ad51e139de6df8b3d
