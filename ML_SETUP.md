# Hybrid ML Classification Setup Guide

This system uses a hybrid approach combining image and text classification to route complaints to the appropriate departments.

## How It Works

1. **Image Classification**: Analyzes uploaded images using ML APIs
2. **Text Classification**: Analyzes complaint descriptions using NLP APIs
3. **Dataset Matching**: Uses the `complaints.csv` dataset for similarity matching
4. **Hybrid Combination**: Combines both results with weighted confidence scores

## Classification Methods (Priority Order)

### Image Classification

1. **Google Cloud Vision API** (if `GOOGLE_VISION_API_KEY` is set)
   - Detects labels and objects in images
   - Maps them to departments using keyword matching
   - High accuracy for visual complaints

2. **Hugging Face API** (if `HUGGING_FACE_API_KEY` is set)
   - Free alternative for image classification
   - Uses pre-trained vision models

3. **Fallback**: Keyword-based classification from image URL/description

### Text Classification

1. **Google Cloud Natural Language API** (if `GOOGLE_NLP_API_KEY` is set)
   - Advanced NLP for text classification
   - High accuracy for understanding context

2. **OpenAI API** (if `OPENAI_API_KEY` is set)
   - Uses GPT-3.5-turbo for intelligent classification
   - Excellent at understanding context and intent

3. **Hugging Face Text Classification** (if `HUGGING_FACE_API_KEY` is set)
   - Free alternative for text classification

4. **Dataset-Based Classification** (Default - Always Available)
   - Uses `complaints.csv` dataset for similarity matching
   - Finds similar complaints and determines department
   - Works without any API keys

## Setup Instructions

### Option 1: Use Dataset-Based Classification (No API Keys Required)

The system will automatically use the dataset-based classification if no API keys are provided. This uses the `complaints.csv` file to find similar complaints and route them accordingly.

**No setup required** - it works out of the box!

### Option 2: Add Google Cloud Vision API (For Better Image Classification)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Vision API
3. Create credentials (API Key)
4. Add to `.env`:
   ```
   GOOGLE_VISION_API_KEY=your_api_key_here
   ```

### Option 3: Add Google Cloud Natural Language API (For Better Text Classification)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Natural Language API
3. Create credentials (API Key)
4. Add to `.env`:
   ```
   GOOGLE_NLP_API_KEY=your_api_key_here
   ```

### Option 4: Add OpenAI API (Alternative Text Classification)

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Add to `.env`:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

### Option 5: Add Hugging Face API (Free Alternative)

1. Go to [Hugging Face](https://huggingface.co/)
2. Create an account and get an API token
3. Add to `.env`:
   ```
   HUGGING_FACE_API_KEY=your_token_here
   ```

## Hybrid Classification Logic

The system combines image and text classifications:

- **If both agree**: High confidence (weighted average: 60% image, 40% text)
- **If they disagree**: 
  - Uses the one with significantly higher confidence
  - If similar confidence, prefers image classification (60% weight)
  - Minimum confidence: 50%

## Dataset Structure

The `complaints.csv` file contains:
- `text`: Complaint description
- `department`: Target department (Municipal, Medical, Electricity, Roads, Water, Sanitation, Police)

The system automatically maps these to internal department codes:
- Municipal, Roads → `municipal`
- Medical → `medical`
- Electricity → `electricity`
- Water → `water`
- Sanitation → `sanitation`
- Police, Traffic → `traffic`

## Testing

1. **Without API Keys**: System uses dataset-based classification
2. **With API Keys**: System uses APIs for better accuracy, falls back to dataset if APIs fail

## Performance

- **Dataset-based**: Fast, works offline, good accuracy for similar complaints
- **API-based**: Slower (network calls), requires internet, higher accuracy
- **Hybrid**: Best of both worlds - uses APIs when available, falls back gracefully

## Cost Considerations

- **Dataset-based**: Free, unlimited
- **Google Cloud APIs**: Pay-per-use (free tier available)
- **OpenAI API**: Pay-per-use (check pricing)
- **Hugging Face**: Free tier available

## Recommendations

1. **Start with dataset-based**: Works immediately, no setup needed
2. **Add Hugging Face API**: Free, improves both image and text classification
3. **Add Google Cloud APIs**: For production, better accuracy
4. **Add OpenAI**: For complex text understanding

