# Course Feedback Sentiment Analyzer

This project implements an advanced sentiment analysis model specifically designed for analyzing course and workshop feedback. It provides detailed insights including ratings, emotional states, confidence scores, and summaries.

## Features

- Advanced sentiment analysis using BERT model
- Rating generation (1-5 scale)
- Emotion detection (very happy, satisfied, content, neutral, disappointed, frustrated, etc.)
- Confidence scoring
- Detailed summary generation
- Interactive terminal interface

## Installation

1. Create a virtual environment (recommended):
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Interactive Mode
Run the interactive analyzer:
```bash
python3 interactive_analyzer.py
```

### Programmatic Usage
```python
from course_feedback_analyzer import CourseFeedbackAnalyzer

# Initialize the analyzer
analyzer = CourseFeedbackAnalyzer()

# Analyze some feedback
feedback = "The workshop was absolutely amazing! I learned so much and the instructor was very knowledgeable."
results = analyzer.analyze_feedback(feedback)

# Access the results
print(f"Rating: {results['rating']}/5")
print(f"Confidence: {results['confidence']}%")
print(f"Emotion: {results['emotion']}")
print(f"Summary: {results['summary']}")
```

## Testing

To run the test script with sample feedback:
```bash
python test_analyzer.py
```

## Model Details

The analyzer uses a combination of:
- BERT-based sentiment analysis (nlptown/bert-base-multilingual-uncased-sentiment)
- TextBlob for additional sentiment metrics
- Custom keyword-based analysis
- Advanced emotion detection logic

The model provides:
- Ratings on a 1-5 scale
- Confidence scores (0-100%)
- Emotional state detection
- Contextual summaries
- Feedback type classification (critical, balanced, appreciative) 