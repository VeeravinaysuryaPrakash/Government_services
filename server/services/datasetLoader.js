const fs = require('fs');
const path = require('path');

// Load and parse the CSV dataset
let dataset = null;
let departmentMapping = {
  'Municipal': 'municipal',
  'Medical': 'medical',
  'Electricity': 'electricity',
  'Roads': 'municipal', // Roads fall under municipal
  'Water': 'water',
  'Sanitation': 'sanitation',
  'Police': 'traffic', // Police issues mapped to traffic
  'Traffic': 'traffic'
};

const loadDataset = () => {
  if (dataset) return dataset;

  try {
    const csvPath = path.join(__dirname, '../models/complaints.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Skip header
    const data = lines.slice(1).map(line => {
      const [text, department] = line.split(',').map(s => s.trim());
      return {
        text: text.toLowerCase(),
        department: departmentMapping[department] || 'municipal',
        originalDepartment: department
      };
    });

    dataset = data;
    console.log(`Loaded ${dataset.length} complaint records from dataset`);
    return dataset;
  } catch (error) {
    console.error('Error loading dataset:', error);
    return [];
  }
};

// Build keyword dictionary from dataset
const buildKeywordDictionary = () => {
  const dataset = loadDataset();
  const keywords = {
    municipal: [],
    medical: [],
    electricity: [],
    water: [],
    sanitation: [],
    traffic: []
  };

  dataset.forEach(item => {
    const words = item.text.split(/\s+/);
    words.forEach(word => {
      if (word.length > 3) { // Only meaningful words
        if (!keywords[item.department].includes(word)) {
          keywords[item.department].push(word);
        }
      }
    });
  });

  return keywords;
};

// Find similar complaints in dataset
const findSimilarComplaints = (description, limit = 5) => {
  const dataset = loadDataset();
  const lowerDesc = description.toLowerCase();
  const descWords = lowerDesc.split(/\s+/);

  const similarities = dataset.map(item => {
    const itemWords = item.text.split(/\s+/);
    const commonWords = descWords.filter(word => itemWords.includes(word));
    const similarity = commonWords.length / Math.max(descWords.length, itemWords.length);
    
    return {
      ...item,
      similarity
    };
  });

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .filter(item => item.similarity > 0);
};

module.exports = {
  loadDataset,
  buildKeywordDictionary,
  findSimilarComplaints,
  departmentMapping
};

