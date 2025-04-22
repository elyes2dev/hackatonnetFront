from course_feedback_analyzer import CourseFeedbackAnalyzer
import sys

def run_interactive_analyzer():
    # Initialize the analyzer
    print("Initializing Course Feedback Analyzer...")
    analyzer = CourseFeedbackAnalyzer()
    print("\n✨ Welcome to the Course Feedback Analyzer! ✨")
    print("Enter your feedback below. Type 'quit' or 'exit' to end the program.\n")
    
    while True:
        # Get user input
        print("-" * 70)
        feedback = input("Please enter your course feedback:\n> ")
        
        # Check for exit command
        if feedback.lower() in ['quit', 'exit']:
            print("\nThank you for using the Course Feedback Analyzer! Goodbye! 👋")
            sys.exit(0)
            
        # Skip empty input
        if not feedback.strip():
            print("\nPlease enter some feedback text!")
            continue
            
        try:
            # Analyze the feedback
            print("\nAnalyzing feedback... 🔍\n")
            results = analyzer.analyze_feedback(feedback)
            
            # Print results in a formatted way
            print("📊 Analysis Results:")
            print("=" * 50)
            print(f"⭐ Rating: {results['rating']}/5")
            print(f"🎯 Confidence: {results['confidence']}%")
            print(f"😊 Emotion: {results['emotion']}")
            print(f"📝 Summary: {results['summary']}")
            print("=" * 50)
            print("\nReady for next feedback! (Type 'quit' or 'exit' to end)")
            
        except Exception as e:
            print(f"\n❌ Error analyzing feedback: {str(e)}")
            print("Please try again with different text.")

if __name__ == "__main__":
    run_interactive_analyzer() 