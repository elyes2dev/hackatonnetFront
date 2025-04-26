from flask import Flask, request, jsonify
from flask_cors import CORS
from course_feedback_analyzer import CourseFeedbackAnalyzer
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the analyzer
analyzer = CourseFeedbackAnalyzer()

@app.route('/analyze-feedback', methods=['POST'])
def analyze_feedback():
    try:
        data = request.get_json()
        if not data or 'feedback' not in data:
            return jsonify({'error': 'No feedback provided'}), 400

        feedback = data['feedback']
        if not feedback.strip():
            return jsonify({'error': 'Feedback cannot be empty'}), 400

        print(f"Processing feedback: {feedback[:100]}...")  # Print first 100 chars for debugging
        
        try:
            # Analyze the feedback
            analysis = analyzer.analyze_feedback(feedback)
            print("Feedback analyzed successfully")
            
            # Format the response
            response = {
                'success': True,
                'sentiment': analysis['emotion'],  # Using emotion as sentiment
                'rating': analysis['rating'],
                'confidence': analysis['confidence'],
                'key_points': [analysis['summary']]  # Using summary as key points
            }
            
            return jsonify(response)
            
        except Exception as e:
            print(f"Error during analysis: {str(e)}")
            print(traceback.format_exc())
            return jsonify({
                'error': str(e),
                'message': 'Failed to analyze feedback',
                'traceback': traceback.format_exc()
            }), 500

    except Exception as e:
        print(f"Outer error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'error': str(e),
            'message': 'Failed to process request',
            'traceback': traceback.format_exc()
        }), 500

if __name__ == '__main__':
    print("Starting Feedback Analysis Server on http://localhost:5050")
    app.run(host='0.0.0.0', port=5050, debug=True) 