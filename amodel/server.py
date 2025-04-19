from flask import Flask, request, jsonify
from flask_cors import CORS
from work import PDFQuestionGenerator
import os
import tempfile
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the quiz generator
generator = PDFQuestionGenerator()

@app.route('/api/generate-quiz', methods=['POST'])
def generate_quiz():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'File must be a PDF'}), 400

        # Create a temporary file to store the uploaded PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            try:
                file.save(temp_file.name)
                print(f"Processing PDF file: {temp_file.name}")
                
                # Process the PDF and generate questions
                vectorstore = generator.process_pdf(temp_file.name)
                print("PDF processed successfully, generating questions...")
                
                qa_pairs = generator.generate_qa_pairs(vectorstore)
                print(f"Generated {len(qa_pairs)} questions")
                
                # Transform the questions to match the expected format
                questions = [{
                    'questionText': qa['question'],
                    'answers': qa['answers'],
                    'correctAnswerIndex': qa['correct_answer_index']
                } for qa in qa_pairs]
                
                return jsonify({
                    'success': True,
                    'questions': questions
                })
            except Exception as e:
                print(f"Error during processing: {str(e)}")
                print(traceback.format_exc())
                return jsonify({
                    'error': str(e),
                    'message': 'Failed to generate quiz',
                    'traceback': traceback.format_exc()
                }), 500
            finally:
                # Clean up the temporary file
                try:
                    os.unlink(temp_file.name)
                except Exception as e:
                    print(f"Error deleting temporary file: {str(e)}")

    except Exception as e:
        print(f"Outer error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'error': str(e),
            'message': 'Failed to generate quiz',
            'traceback': traceback.format_exc()
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True) 