const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  department: {
    type: String,
    enum: ['municipal', 'medical', 'water', 'electricity', 'sanitation', 'traffic'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  classification: {
    imageCategory: {
      type: String,
      required: true
    },
    descriptionCategory: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      default: 0
    }
  },
  actions: [{
    action: {
      type: String,
      required: true
    },
    image: {
      type: String
    },
    takenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  resolvedImage: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);

