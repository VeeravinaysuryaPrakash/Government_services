# Hybrid ML Classification Implementation

## Overview

A hybrid machine learning system has been implemented to automatically classify and route complaints to the appropriate departments based on both **image analysis** and **text description analysis**.

## Key Features

### 1. **Multi-Source Classification**
   - **Image Classification**: Analyzes uploaded photos using ML APIs
   - **Text Classification**: Analyzes complaint descriptions using NLP
   - **Dataset Matching**: Uses historical complaint data for similarity matching

### 2. **API Integration Support**
   The system supports multiple ML APIs (all optional):
   - **Google Cloud Vision API** - For image classification
   - **Google Cloud Natural Language API** - For text classification
   - **OpenAI API** - Alternative text classification
   - **Hugging Face API** - Free alternative for both image and text

### 3. **Dataset-Based Classification (Default)**
   - Uses `complaints.csv` dataset (1000+ records)
   - Finds similar complaints using word similarity matching
   - Routes based on historical department assignments
   - **Works without any API keys** - fully functional out of the box

### 4. **Hybrid Combination Logic**
   - Combines image and text classification results
   - Weighted confidence scoring (60% image, 40% text when both agree)
   - Intelligent conflict resolution when classifications disagree
   - Minimum 50% confidence threshold

## Files Created/Modified

### New Files:
1. **`server/services/datasetLoader.js`**
   - Loads and parses `complaints.csv`
   - Implements similarity matching algorithm
   - Maps department names to internal codes

2. **`server/services/mlService.js`** (Completely Rewritten)
   - Hybrid classification system
   - Multiple API integrations
   - Fallback mechanisms
   - Dataset-based classification

3. **`ML_SETUP.md`**
   - Complete setup guide for ML APIs
   - Configuration instructions
   - Cost considerations

### Modified Files:
1. **`server/index.js`**
   - Preloads dataset on server startup

2. **`server/package.json`**
   - Added `csv-parser` dependency

3. **`server/env.example`**
   - Added ML API key configuration options

## How It Works

### Classification Flow:

```
1. User submits complaint (image + description)
   ↓
2. Image Classification:
   - Try Google Vision API (if available)
   - Try Hugging Face API (if available)
   - Fallback to keyword-based classification
   ↓
3. Text Classification:
   - Try Google NLP API (if available)
   - Try OpenAI API (if available)
   - Try Hugging Face API (if available)
   - Use dataset-based similarity matching (default)
   ↓
4. Hybrid Combination:
   - If both agree → High confidence (weighted average)
   - If disagree → Use higher confidence or weighted preference
   - Minimum 50% confidence
   ↓
5. Route to Department
```

### Dataset Matching Algorithm:

1. Tokenizes complaint description
2. Finds similar complaints in dataset using word overlap
3. Calculates similarity scores
4. Aggregates department assignments from similar complaints
5. Returns department with highest weighted score

## Department Mapping

The system maps CSV departments to internal codes:
- `Municipal`, `Roads` → `municipal`
- `Medical` → `medical`
- `Electricity` → `electricity`
- `Water` → `water`
- `Sanitation` → `sanitation`
- `Police`, `Traffic` → `traffic`

## Usage

### Without API Keys (Default):
The system automatically uses dataset-based classification. No setup required!

### With API Keys:
Add to `server/.env`:
```env
GOOGLE_VISION_API_KEY=your_key
GOOGLE_NLP_API_KEY=your_key
# OR
OPENAI_API_KEY=your_key
# OR
HUGGING_FACE_API_KEY=your_token
```

## Benefits

1. **Works Immediately**: Dataset-based classification requires no setup
2. **Scalable**: Can add API keys for better accuracy
3. **Resilient**: Multiple fallback mechanisms
4. **Cost-Effective**: Free dataset-based option, optional paid APIs
5. **Accurate**: Hybrid approach combines multiple signals
6. **Data-Driven**: Uses real historical complaint data

## Testing

Test the classification by submitting complaints:
- The system will automatically classify and route
- Check the `classification` field in the complaint response
- View confidence scores and category assignments

## Next Steps

1. **Monitor Performance**: Track classification accuracy
2. **Add API Keys**: Improve accuracy with ML APIs (optional)
3. **Fine-tune**: Adjust weights and thresholds based on results
4. **Expand Dataset**: Add more complaint examples to CSV for better matching

## Performance Notes

- **Dataset-based**: ~10-50ms per classification (fast)
- **API-based**: ~200-1000ms per classification (network latency)
- **Hybrid**: Combines both for optimal accuracy and speed

