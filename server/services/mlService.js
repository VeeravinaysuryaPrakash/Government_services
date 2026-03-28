// Hybrid ML Service for classifying images and descriptions using APIs
const axios = require('axios');
const { findSimilarComplaints, departmentMapping } = require('./datasetLoader');

// Department keywords extracted from dataset
const departmentKeywords = {
  municipal: ['road', 'pothole', 'street', 'drainage', 'rainwater', 'sewage', 'manhole', 'crack', 'construction', 'damaged'],
  medical: ['hospital', 'ambulance', 'medical', 'health', 'doctor', 'emergency', 'waiting', 'treatment', 'injury'],
  electricity: ['electric', 'power', 'transformer', 'pole', 'spark', 'light', 'outage', 'cut', 'wire'],
  water: ['water', 'leak', 'pipe', 'supply', 'burst', 'drainage'],
  sanitation: ['garbage', 'waste', 'trash', 'dustbin', 'dumped', 'smell', 'sanitation', 'clean'],
  traffic: ['traffic', 'signal', 'parking', 'vehicle', 'accident', 'violation', 'police', 'theft', 'noise', 'suspicious']
};

// Classify image using Google Cloud Vision API or Hugging Face
const classifyImage = async (imageUrl) => {
  try {
    // Option 1: Use Google Cloud Vision API (if API key is provided)
    if (process.env.GOOGLE_VISION_API_KEY) {
      return await classifyImageWithGoogleVision(imageUrl);
    }
    
    // Option 2: Use Hugging Face API (free alternative)
    if (process.env.HUGGING_FACE_API_KEY) {
      return await classifyImageWithHuggingFace(imageUrl);
    }

    // Fallback: Use keyword-based classification from image URL/description
    return await classifyImageFallback(imageUrl);
  } catch (error) {
    console.error('Image classification error:', error);
    return await classifyImageFallback(imageUrl);
  }
};

// Google Cloud Vision API classification
const classifyImageWithGoogleVision = async (imageUrl) => {
  try {
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        requests: [{
          image: {
            source: { imageUri: imageUrl }
          },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 10 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
          ]
        }]
      }
    );

    const labels = response.data.responses[0].labelAnnotations || [];
    const objects = response.data.responses[0].localizedObjectAnnotations || [];

    // Map labels to departments
    const labelTexts = labels.map(l => l.description.toLowerCase());
    const objectNames = objects.map(o => o.name.toLowerCase());

    return mapLabelsToDepartment([...labelTexts, ...objectNames]);
  } catch (error) {
    console.error('Google Vision API error:', error.response?.data || error.message);
    throw error;
  }
};

// Hugging Face API classification (using image classification model)
const classifyImageWithHuggingFace = async (imageUrl) => {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/google/vit-base-patch16-224',
      { inputs: imageUrl },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`
        }
      }
    );

    const predictions = response.data || [];
    const labels = predictions.map(p => p.label.toLowerCase());

    return mapLabelsToDepartment(labels);
  } catch (error) {
    console.error('Hugging Face API error:', error.response?.data || error.message);
    throw error;
  }
};

// Fallback image classification
const classifyImageFallback = async (imageUrl) => {
  // Extract potential keywords from URL or use default
  const urlLower = imageUrl.toLowerCase();
  
  const imageCategories = {
    'pothole': ['municipal'],
    'garbage': ['sanitation'],
    'water': ['water'],
    'electric': ['electricity'],
    'medical': ['medical'],
    'traffic': ['traffic'],
    'road': ['municipal'],
    'drainage': ['municipal', 'sanitation']
  };

  for (const [category, departments] of Object.entries(imageCategories)) {
    if (urlLower.includes(category)) {
      return {
        category,
        department: departments[0],
        confidence: 0.65
      };
    }
  }

  // Default to municipal
  return {
    category: 'general',
    department: 'municipal',
    confidence: 0.5
  };
};

// Map detected labels to departments
const mapLabelsToDepartment = (labels) => {
  const departmentScores = {
    municipal: 0,
    medical: 0,
    electricity: 0,
    water: 0,
    sanitation: 0,
    traffic: 0
  };

  labels.forEach(label => {
    Object.entries(departmentKeywords).forEach(([dept, keywords]) => {
      if (keywords.some(keyword => label.includes(keyword))) {
        departmentScores[dept] += 1;
      }
    });
  });

  // Find department with highest score
  const maxScore = Math.max(...Object.values(departmentScores));
  const topDepartment = Object.keys(departmentScores).find(
    dept => departmentScores[dept] === maxScore
  ) || 'municipal';

  const confidence = maxScore > 0 ? Math.min(0.5 + (maxScore * 0.1), 0.95) : 0.5;

  return {
    category: labels[0] || 'general',
    department: topDepartment,
    confidence
  };
};

// Classify description using NLP API or dataset-based classification
const classifyDescription = async (description) => {
  try {
    // Option 1: Use Google Cloud Natural Language API
    if (process.env.GOOGLE_NLP_API_KEY) {
      return await classifyDescriptionWithGoogleNLP(description);
    }

    // Option 2: Use OpenAI API
    if (process.env.OPENAI_API_KEY) {
      return await classifyDescriptionWithOpenAI(description);
    }

    // Option 3: Use Hugging Face Text Classification
    if (process.env.HUGGING_FACE_API_KEY) {
      return await classifyDescriptionWithHuggingFace(description);
    }

    // Fallback: Use dataset-based classification
    return await classifyDescriptionWithDataset(description);
  } catch (error) {
    console.error('Description classification error:', error);
    return await classifyDescriptionWithDataset(description);
  }
};

// Google Cloud Natural Language API
const classifyDescriptionWithGoogleNLP = async (description) => {
  try {
    const response = await axios.post(
      `https://language.googleapis.com/v1/documents:classifyText?key=${process.env.GOOGLE_NLP_API_KEY}`,
      {
        document: {
          type: 'PLAIN_TEXT',
          content: description
        }
      }
    );

    const categories = response.data.categories || [];
    // Map categories to departments (simplified mapping)
    return mapCategoriesToDepartment(categories, description);
  } catch (error) {
    console.error('Google NLP API error:', error.response?.data || error.message);
    throw error;
  }
};

// OpenAI API classification
const classifyDescriptionWithOpenAI = async (description) => {
  try {
    const prompt = `Classify this government complaint into one of these departments: municipal, medical, electricity, water, sanitation, traffic. 
    Complaint: "${description}"
    Respond with only the department name in lowercase.`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a government complaint classification system.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 10,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const department = response.data.choices[0].message.content.trim().toLowerCase();
    const validDepartments = ['municipal', 'medical', 'electricity', 'water', 'sanitation', 'traffic'];
    const finalDept = validDepartments.includes(department) ? department : 'municipal';

    return {
      category: finalDept,
      confidence: 0.85
    };
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    throw error;
  }
};

// Hugging Face Text Classification
const classifyDescriptionWithHuggingFace = async (description) => {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english',
      { inputs: description },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`
        }
      }
    );

    // Use dataset-based classification as Hugging Face model needs fine-tuning
    return await classifyDescriptionWithDataset(description);
  } catch (error) {
    console.error('Hugging Face text classification error:', error);
    return await classifyDescriptionWithDataset(description);
  }
};

// Dataset-based classification using similarity matching
const classifyDescriptionWithDataset = async (description) => {
  const similarComplaints = findSimilarComplaints(description, 10);
  
  if (similarComplaints.length === 0) {
    // Fallback to keyword matching
    return classifyDescriptionWithKeywords(description);
  }

  // Count department occurrences in similar complaints
  const departmentCounts = {};
  let totalSimilarity = 0;

  similarComplaints.forEach(complaint => {
    const dept = complaint.department;
    departmentCounts[dept] = (departmentCounts[dept] || 0) + complaint.similarity;
    totalSimilarity += complaint.similarity;
  });

  // Find department with highest weighted score
  const topDepartment = Object.keys(departmentCounts).reduce((a, b) =>
    departmentCounts[a] > departmentCounts[b] ? a : b
  );

  const confidence = Math.min(
    0.6 + (departmentCounts[topDepartment] / totalSimilarity) * 0.3,
    0.95
  );

  return {
    category: topDepartment,
    confidence
  };
};

// Keyword-based classification (fallback)
const classifyDescriptionWithKeywords = (description) => {
  const lowerDesc = description.toLowerCase();
  
  const departmentScores = {};
  Object.keys(departmentKeywords).forEach(dept => {
    departmentScores[dept] = 0;
    departmentKeywords[dept].forEach(keyword => {
      if (lowerDesc.includes(keyword)) {
        departmentScores[dept] += 1;
      }
    });
  });

  const maxScore = Math.max(...Object.values(departmentScores));
  const topDepartment = Object.keys(departmentScores).find(
    dept => departmentScores[dept] === maxScore
  ) || 'municipal';

  const confidence = maxScore > 0 ? Math.min(0.5 + (maxScore * 0.1), 0.85) : 0.5;

  return {
    category: topDepartment,
    confidence
  };
};

// Map categories to departments
const mapCategoriesToDepartment = (categories, description) => {
  // Use dataset-based classification as primary method
  return classifyDescriptionWithDataset(description);
};

// Hybrid classification combining image and description
const classifyComplaint = async (imageUrl, description) => {
  try {
    // Run both classifications in parallel
    const [imageClassification, descriptionClassification] = await Promise.all([
      classifyImage(imageUrl),
      classifyDescription(description)
    ]);

    // Combine results with weighted confidence
    let finalDepartment;
    let confidence;

    if (imageClassification.department === descriptionClassification.category) {
      // Both agree - high confidence
      finalDepartment = imageClassification.department;
      confidence = Math.min(
        (imageClassification.confidence * 0.6 + descriptionClassification.confidence * 0.4),
        0.95
      );
    } else {
      // They disagree - use weighted average favoring image (60%) and description (40%)
      const imageWeight = imageClassification.confidence;
      const descWeight = descriptionClassification.confidence;

      if (imageWeight > descWeight * 1.2) {
        // Image confidence is significantly higher
        finalDepartment = imageClassification.department;
        confidence = imageClassification.confidence * 0.7;
      } else if (descWeight > imageWeight * 1.2) {
        // Description confidence is significantly higher
        finalDepartment = descriptionClassification.category;
        confidence = descriptionClassification.confidence * 0.7;
      } else {
        // Similar confidence - prefer image for visual complaints
        finalDepartment = imageClassification.department;
        confidence = (imageClassification.confidence + descriptionClassification.confidence) / 2 * 0.8;
      }
    }

    return {
      department: finalDepartment,
      imageCategory: imageClassification.category,
      descriptionCategory: descriptionClassification.category,
      imageConfidence: imageClassification.confidence,
      descriptionConfidence: descriptionClassification.confidence,
      confidence: Math.max(confidence, 0.5) // Minimum 50% confidence
    };
  } catch (error) {
    console.error('Hybrid classification error:', error);
    // Fallback to description-only classification
    const descClass = await classifyDescription(description);
    return {
      department: descClass.category,
      imageCategory: 'unknown',
      descriptionCategory: descClass.category,
      confidence: descClass.confidence * 0.7
    };
  }
};

module.exports = {
  classifyImage,
  classifyDescription,
  classifyComplaint
};

