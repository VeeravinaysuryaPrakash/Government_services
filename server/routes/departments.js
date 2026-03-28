const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const auth = require('../middleware/auth');
const { uploadImage } = require('../services/cloudinary');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get department complaints
router.get('/complaints', auth, async (req, res) => {
  try {
    if (req.user.role !== 'department' || !req.user.department) {
      return res.status(403).json({ message: 'Access denied. Department login required.' });
    }

    const complaints = await Complaint.find({ department: req.user.department })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone address')
      .populate('actions.takenBy', 'name');

    res.json(complaints);
  } catch (error) {
    console.error('Get department complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update complaint status
router.patch('/complaints/:id/status', auth, [
  body('status').isIn(['pending', 'in_progress', 'resolved', 'rejected']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'department' || !req.user.department) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.department !== req.user.department) {
      return res.status(403).json({ message: 'This complaint does not belong to your department' });
    }

    complaint.status = req.body.status;
    await complaint.save();

    res.json({ message: 'Status updated successfully', complaint });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add action to complaint
router.post('/complaints/:id/action', auth, upload.single('image'), [
  body('action').trim().notEmpty().withMessage('Action description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'department' || !req.user.department) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.department !== req.user.department) {
      return res.status(403).json({ message: 'This complaint does not belong to your department' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadImage(req.file);
    }

    complaint.actions.push({
      action: req.body.action,
      image: imageUrl,
      takenBy: req.user._id
    });

    // Update status to in_progress if it was pending
    if (complaint.status === 'pending') {
      complaint.status = 'in_progress';
    }

    await complaint.save();
    await complaint.populate('actions.takenBy', 'name');

    res.json({ message: 'Action added successfully', complaint });
  } catch (error) {
    console.error('Add action error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload resolved image
router.post('/complaints/:id/resolve', auth, upload.single('image'), [
  body('action').trim().notEmpty().withMessage('Resolution description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'department' || !req.user.department) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Resolution image is required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.department !== req.user.department) {
      return res.status(403).json({ message: 'This complaint does not belong to your department' });
    }

    // Upload resolved image
    const resolvedImageUrl = await uploadImage(req.file);

    // Add action
    complaint.actions.push({
      action: req.body.action,
      image: resolvedImageUrl,
      takenBy: req.user._id
    });

    // Update status and resolved image
    complaint.status = 'resolved';
    complaint.resolvedImage = resolvedImageUrl;

    await complaint.save();
    await complaint.populate('actions.takenBy', 'name');

    res.json({ message: 'Complaint resolved successfully', complaint });
  } catch (error) {
    console.error('Resolve complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

