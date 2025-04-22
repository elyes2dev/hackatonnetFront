from transformers import pipeline
from textblob import TextBlob
import numpy as np
import re

class CourseFeedbackAnalyzer:
    def __init__(self):
        # Initialize the sentiment analysis pipeline with a more suitable model
        self.sentiment_pipeline = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")
        
        # Define negative and positive keyword patterns
        self.negative_patterns = [
            r'not good', r'bad', r'poor', r'waste', r'difficult', r'confusing',
            r'slow', r'boring', r'outdated', r'unprepared', r'disappointed',
            r'unclear', r"didn't understand", r'hard to follow', r'not helpful',
            r'expected more', r'too basic', r'too advanced'
        ]
        
        self.positive_patterns = [
            r'great', r'excellent', r'amazing', r'fantastic', r'helpful',
            r'insightful', r'clear', r'well explained', r'enjoyed',
            r'learned', r'interesting', r'engaging', r'practical'
        ]
        
    def analyze_feedback(self, description):
        """
        Analyze course feedback and return sentiment metrics
        
        Args:
            description (str): The course feedback text
            
        Returns:
            dict: Dictionary containing sentiment analysis results
        """
        # Get sentiment using transformers (returns 1-5 star rating)
        sentiment_result = self.sentiment_pipeline(description)[0]
        model_rating = float(sentiment_result['label'].split()[0])
        
        # Get additional sentiment metrics using TextBlob
        blob = TextBlob(description)
        
        # Count negative and positive patterns
        neg_count = sum(1 for pattern in self.negative_patterns if re.search(pattern, description.lower()))
        pos_count = sum(1 for pattern in self.positive_patterns if re.search(pattern, description.lower()))
        
        # Calculate adjusted polarity based on keyword matches
        keyword_score = (pos_count - neg_count) / max(pos_count + neg_count, 1)
        
        # Combine different signals for final rating
        textblob_rating = 1 + (blob.sentiment.polarity + 1) * 2
        keyword_rating = 1 + (keyword_score + 1) * 2
        
        # Weight the different signals (giving more weight to negative indicators)
        if neg_count > pos_count:
            final_rating = 0.5 * model_rating + 0.2 * textblob_rating + 0.3 * keyword_rating
        else:
            final_rating = 0.4 * model_rating + 0.3 * textblob_rating + 0.3 * keyword_rating
            
        # Ensure rating stays within 1-5 range
        final_rating = max(1.0, min(5.0, final_rating))
        
        # Determine emotion with enhanced logic
        emotion = self._determine_emotion(blob.sentiment.polarity, blob.sentiment.subjectivity, neg_count, pos_count)
        
        # Calculate confidence score (0-100)
        confidence = sentiment_result['score'] * 100
        
        # Generate a detailed summary
        summary = self._generate_summary(description, blob.sentiment.polarity, 
                                      blob.sentiment.subjectivity, neg_count, pos_count)
        
        return {
            'rating': round(final_rating, 1),
            'confidence': round(confidence, 1),
            'emotion': emotion,
            'summary': summary
        }
    
    def _determine_emotion(self, polarity, subjectivity, neg_count, pos_count):
        """Determine the emotional state based on multiple factors."""
        if neg_count > pos_count:
            if neg_count >= 3:
                return 'very frustrated'
            elif neg_count >= 2:
                return 'disappointed'
            else:
                return 'unsatisfied'
        
        if polarity >= 0.5 and pos_count > 0:
            return 'very happy' if subjectivity > 0.5 else 'satisfied'
        elif polarity > 0:
            return 'content' if pos_count > 0 else 'neutral'
        elif polarity > -0.5:
            return 'slightly disappointed' if subjectivity > 0.5 else 'unsatisfied'
        else:
            return 'very frustrated' if subjectivity > 0.5 else 'angry'
    
    def _generate_summary(self, text, polarity, subjectivity, neg_count, pos_count):
        """Generate a detailed summary based on the analysis."""
        if neg_count > pos_count:
            sentiment_level = "very negative" if neg_count >= 3 else \
                            "negative" if neg_count >= 2 else "somewhat negative"
        else:
            sentiment_level = "very positive" if polarity > 0.5 else \
                            "positive" if polarity > 0 else \
                            "mixed" if polarity > -0.3 else "negative"
        
        engagement_level = "highly engaged" if subjectivity > 0.7 else \
                          "engaged" if subjectivity > 0.3 else "objective"
        
        feedback_type = "critical" if neg_count > pos_count else \
                       "balanced" if neg_count == pos_count else "appreciative"
        
        return f"The feedback is {sentiment_level} and {feedback_type}. The participant appears {engagement_level} with the course content." 