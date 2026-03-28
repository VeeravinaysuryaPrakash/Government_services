// Quick test script to verify ML classification is working
const { classifyComplaint } = require('./server/services/mlService');
const { loadDataset } = require('./server/services/datasetLoader');

async function testClassification() {
  console.log('Testing ML Classification System...\n');
  
  // Load dataset
  const dataset = loadDataset();
  console.log(`✓ Dataset loaded: ${dataset.length} complaints\n`);
  
  // Test cases
  const testCases = [
    {
      description: 'Pothole on road near residential colony',
      imageUrl: 'https://example.com/pothole.jpg',
      expected: 'municipal'
    },
    {
      description: 'Ambulance not responding in near bus stop',
      imageUrl: 'https://example.com/ambulance.jpg',
      expected: 'medical'
    },
    {
      description: 'Electric pole sparks near village center',
      imageUrl: 'https://example.com/electric.jpg',
      expected: 'electricity'
    },
    {
      description: 'Water leakage near bus stop',
      imageUrl: 'https://example.com/water.jpg',
      expected: 'water'
    },
    {
      description: 'Waste dumped for many days at village center',
      imageUrl: 'https://example.com/waste.jpg',
      expected: 'sanitation'
    }
  ];
  
  console.log('Running classification tests...\n');
  
  for (const testCase of testCases) {
    try {
      const result = await classifyComplaint(testCase.imageUrl, testCase.description);
      const status = result.department === testCase.expected ? '✓' : '✗';
      console.log(`${status} "${testCase.description}"`);
      console.log(`   → Classified as: ${result.department} (expected: ${testCase.expected})`);
      console.log(`   → Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`   → Image category: ${result.imageCategory}`);
      console.log(`   → Description category: ${result.descriptionCategory}\n`);
    } catch (error) {
      console.error(`✗ Error classifying: ${testCase.description}`);
      console.error(`   Error: ${error.message}\n`);
    }
  }
  
  console.log('Test completed!');
}

// Run test
testClassification().catch(console.error);

