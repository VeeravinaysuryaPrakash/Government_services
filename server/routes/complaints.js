const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const auth = require('../middleware/auth');
const { uploadImage } = require('../services/cloudinary');
const { classifyComplaint } = require('../services/mlService');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Report a complaint
router.post('/report', auth, upload.single('image'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('latitude').isNumeric().withMessage('Valid latitude is required'),
  body('longitude').isNumeric().withMessage('Valid longitude is required'),
  body('address').trim().notEmpty().withMessage('Address is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Only users can report complaints' });
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadImage(req.file);

    // Classify complaint using ML
    const classification = await classifyComplaint(imageUrl, req.body.description);

    // Create complaint
    const complaint = new Complaint({
      userId: req.user._id,
      title: req.body.title,
      description: req.body.description,
      image: imageUrl,
      location: {
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
        address: req.body.address
      },
      department: classification.department,
      classification: {
        imageCategory: classification.imageCategory,
        descriptionCategory: classification.descriptionCategory,
        confidence: classification.confidence
      }
    });

    await complaint.save();
    await complaint.populate('userId', 'name email');

    res.status(201).json({
      message: 'Complaint reported successfully',
      complaint
    });
  } catch (error) {
    console.error('Report complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's complaints
router.get('/my-complaints', auth, async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const complaints = await Complaint.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('actions.takenBy', 'name');

    res.json(complaints);
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get local complaints (within radius)
router.get('/local', auth, [
  body('latitude').isNumeric().withMessage('Valid latitude is required'),
  body('longitude').isNumeric().withMessage('Valid longitude is required')
], async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query; // radius in km, default 5km

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const rad = parseFloat(radius);

    // Simple distance calculation (Haversine formula approximation)
    // In production, use MongoDB geospatial queries
    const complaints = await Complaint.find({
      'location.latitude': {
        $gte: lat - (rad / 111), // 1 degree ≈ 111 km
        $lte: lat + (rad / 111)
      },
      'location.longitude': {
        $gte: lon - (rad / 111),
        $lte: lon + (rad / 111)
      }
    })
    .sort({ createdAt: -1 })
    .populate('userId', 'name email')
    .populate('actions.takenBy', 'name');

    // Filter by actual distance (simplified)
    const filteredComplaints = complaints.filter(complaint => {
      const distance = Math.sqrt(
        Math.pow(complaint.location.latitude - lat, 2) +
        Math.pow(complaint.location.longitude - lon, 2)
      ) * 111; // Convert to km
      return distance <= rad;
    });

    res.json(filteredComplaints);
  } catch (error) {
    console.error('Get local complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single complaint
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('actions.takenBy', 'name');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(complaint);
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

