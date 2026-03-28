# Quick Setup Guide

## Step 1: Install Dependencies

From the root directory, run:
```bash
npm run install-all
```

Or manually:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

## Step 2: Configure Backend

1. Create a `.env` file in the `server` directory
2. Copy the contents from `server/env.example`
3. Fill in your credentials:

### MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Replace `<password>` with your database password
5. Add it to `MONGODB_URI` in `.env`

### Cloudinary Setup
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Get your Cloud Name, API Key, and API Secret from the dashboard
4. Add them to your `.env` file

### JWT Secret
Generate a random string for `JWT_SECRET` (you can use any random string)

## Step 3: Start the Application

### Option 1: Run Both Servers Together
From the root directory:
```bash
npm run dev
```

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

## Step 4: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Step 5: Test the Application

1. **Register a new user** at `/register`
2. **Login** with your credentials
3. **Report a complaint** with a photo and description
4. **Login as a department** at `/department-login`
   - Department: Choose any (e.g., municipal)
   - Password: `municipal123` (or corresponding department password)

## Default Department Passwords

- Municipal: `municipal123`
- Medical: `medical123`
- Water: `water123`
- Electricity: `electricity123`
- Sanitation: `sanitation123`
- Traffic: `traffic123`

## Troubleshooting

### Port Already in Use
If port 5000 or 3000 is already in use:
- Backend: Change `PORT` in `server/.env`
- Frontend: React will prompt to use a different port

### MongoDB Connection Error
- Check your MongoDB Atlas connection string
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify your database password is correct

### Cloudinary Upload Error
- Verify your Cloudinary credentials
- Check that your API key and secret are correct
- Ensure your Cloudinary account is active

### CORS Errors
- Make sure the backend is running on port 5000
- Check that the frontend is making requests to `http://localhost:5000`

## Next Steps

1. **Enhance ML Classification**: Replace the simple keyword-based classification with a trained ML model
2. **Add Real-time Updates**: Implement WebSockets for real-time complaint updates
3. **Improve Security**: Change default department passwords
4. **Add Email Notifications**: Send emails when complaints are resolved
5. **Deploy**: Deploy to production (Heroku, AWS, etc.)

