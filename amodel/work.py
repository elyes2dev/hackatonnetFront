import os
from typing import List, Tuple
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
import chromadb
import shutil

class PDFQuestionGenerator:
    def __init__(self):
        """Initialize the PDF Question Generator with OpenAI."""
        # Load environment variables
        load_dotenv()
        
        # Get API key from environment
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        
        try:
            # Initialize OpenAI embeddings and model
            self.embeddings = OpenAIEmbeddings(api_key=api_key)
            self.llm = ChatOpenAI(
                model_name="gpt-3.5-turbo",  # Using a valid model name
                temperature=0.7,
                api_key=api_key
            )
            
            # Clean up any existing ChromaDB data
            if os.path.exists("./chroma_db"):
                shutil.rmtree("./chroma_db")
                
        except Exception as e:
            raise ValueError(f"Failed to initialize OpenAI: {str(e)}")
        
    def process_pdf(self, pdf_path: str) -> Chroma:
        """Process PDF and store embeddings in ChromaDB."""
        try:
            # Check if file exists
            if not os.path.exists(pdf_path):
                raise FileNotFoundError(f"PDF file not found: {pdf_path}")
            
            # Load PDF
            loader = PyPDFLoader(pdf_path)
            documents = loader.load()
            
            if not documents:
                raise ValueError("No content found in PDF")
            
            # Split text into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len
            )
            splits = text_splitter.split_documents(documents)
            
            if not splits:
                raise ValueError("Failed to split PDF content")
            
            # Create ChromaDB client with default settings
            client = chromadb.PersistentClient(path="./chroma_db")
            
            # Create and store embeddings
            vectorstore = Chroma.from_documents(
                documents=splits,
                embedding=self.embeddings,
                client=client,
                collection_name="pdf_content"
            )
            return vectorstore
            
        except Exception as e:
            raise Exception(f"Error processing PDF: {str(e)}")
    
    def generate_qa_pairs(self, vectorstore: Chroma, num_pairs: int = 5) -> List[dict]:
        """Generate question-answer pairs with justifications."""
        try:
            # Create QA chain
            qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=vectorstore.as_retriever(),
                return_source_documents=True
            )
            
            # Get sample context for question generation
            sample_docs = vectorstore.similarity_search("", k=3)
            if not sample_docs:
                raise ValueError("No relevant content found in the document")
                
            context = "\n".join([doc.page_content for doc in sample_docs])
            
            # Prompt for generating questions
            question_gen_prompt = """
            Based on the following context, generate {num_pairs} important and concise questions that test key concepts from the text.
            The questions should be clear, specific, and have definitive answers that can be found in the text.
            Each question should focus on different aspects of the content.
            
            Context: {context}
            
            Format your response as a numbered list of questions.
            """
            
            # Generate questions
            questions_response = self.llm.invoke(
                question_gen_prompt.format(num_pairs=num_pairs, context=context)
            )
            
            # Extract questions from the response
            questions = [
                line.strip().split(". ", 1)[1]
                for line in questions_response.content.strip().split("\n")
                if line.strip() and line[0].isdigit()
            ]
            
            if not questions:
                raise ValueError("Failed to generate questions from the content")
            
            qa_pairs = []
            for question in questions:
                try:
                    # Get the correct answer
                    result = qa_chain.invoke({"query": question})
                    correct_answer = result['result']
                    
                    # Generate alternative answers
                    alternatives_prompt = f"""
                    Given this question: "{question}"
                    And the correct answer: "{correct_answer}"
                    
                    Generate exactly 3 incorrect but plausible alternative answers.
                    Each answer should be brief (maximum 15 words) and clearly different from the correct answer.
                    Make the answers concise and focused.
                    
                    Format your response as a numbered list with just the answers (no explanations).
                    """
                    
                    alternatives_response = self.llm.invoke(alternatives_prompt)
                    alternatives = [
                        line.strip().split(". ", 1)[1]
                        for line in alternatives_response.content.strip().split("\n")
                        if line.strip() and line[0].isdigit()
                    ]
                    
                    if len(alternatives) < 3:
                        raise ValueError(f"Failed to generate enough alternative answers for question: {question}")
                    
                    # Create justification prompt
                    justification_prompt = f"""
                    For this question: "{question}"
                    And the correct answer: "{correct_answer}"
                    
                    Provide a brief justification (maximum 2 sentences) explaining why this is the correct answer.
                    Reference specific evidence from the text.
                    """
                    
                    justification_response = self.llm.invoke(justification_prompt)
                    
                    # Combine all answers and randomize their order
                    import random
                    all_answers = alternatives + [correct_answer]
                    random.shuffle(all_answers)
                    correct_index = all_answers.index(correct_answer)
                    
                    qa_pairs.append({
                        "question": question,
                        "answers": all_answers,
                        "correct_answer_index": correct_index,
                        "justification": justification_response.content.strip()
                    })
                except Exception as e:
                    print(f"Warning: Failed to process question '{question}': {str(e)}")
                    continue
            
            if not qa_pairs:
                raise ValueError("Failed to generate any valid question-answer pairs")
            
            return qa_pairs
        except Exception as e:
            raise Exception(f"Error generating questions: {str(e)}")

def main():
    try:
        # Initialize generator
        generator = PDFQuestionGenerator()
        
        # Process PDF
        pdf_path = os.path.join(os.path.dirname(__file__), "6-GraphQL.pdf")
        print("\n📚 Processing PDF:", pdf_path)
        print(f"File exists: {os.path.exists(pdf_path)}")
        
        vectorstore = generator.process_pdf(pdf_path)
        print("✅ PDF processed successfully")
        
        # Generate QA pairs
        print("\n🤖 Generating Q&A pairs...\n")
        qa_pairs = generator.generate_qa_pairs(vectorstore)
        
        # Print results in a clearer format
        for i, qa in enumerate(qa_pairs, 1):
            print(f"\n📝 Question {i}:")
            print("=" * 80)
            print(qa['question'])
            
            print("\n📋 Answer Choices:")
            print("-" * 40)
            for j, answer in enumerate(qa['answers'], 1):
                prefix = "✅" if j-1 == qa['correct_answer_index'] else "❌"
                print(f"{prefix} {j}. {answer}")
            
            print("\n🎯 Justification:")
            print("-" * 40)
            print(qa['justification'])
            print("\n" + "="*80)
    except Exception as e:
        print(f"❌ Error occurred: {str(e)}")
        import traceback
        print("\nTraceback:")
        print(traceback.format_exc())

if __name__ == "__main__":
    main() 