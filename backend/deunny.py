from fastapi import FastAPI, HTTPException
import re
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from youtube_transcript_api import YouTubeTranscriptApi, VideoUnavailable, NoTranscriptFound, TranscriptsDisabled
from dotenv import load_dotenv
import google.generativeai as genai

class YouTubeTranscriptConverter:
    def __init__(self):
        load_dotenv()
        api_key = os.getenv("GOOGLE_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
        else:
            raise Exception("API key not found. Please check your environment variables.")
        self.embedding_model = 'models/embedding-001'
        self.transcripts = {}  # In-memory storage for transcripts

    def extract_youtube_key(self, url):
        try:
            patterns = [
                r'(?:https?://)?(?:www\.)?youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})',
                r'(?:https?://)?(?:www\.)?youtube\.com/live/([a-zA-Z0-9_-]{11})',
                r'(?:https?://)?youtu\.be/([a-zA-Z0-9_-]{11})'
            ]
            for pattern in patterns:
                match = re.match(pattern, url)
                if match:
                    return match.group(1)
            raise ValueError("Invalid YouTube URL")
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    def extract_transcript(self, url):
        try:
            video_id = self.extract_youtube_key(url)
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
            transcript = ' '.join([t['text'] for t in transcript_list])
            return transcript
        except (VideoUnavailable, NoTranscriptFound, TranscriptsDisabled) as e:
            raise HTTPException(status_code=404, detail=f"Error fetching transcript: {str(e)}")

    def get_conversion_chain(self):
        prompt_template = """
        Answer the question as detailed as possible from the provided context. If the answer is not in the provided context, 
        just say, "Answer is not available in the context," and do not provide a wrong answer.

        Context:\n {context}?\n
        Question:\n {question}\n

        Answer:
        """
        
        model = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.3)
        prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
        chain = load_qa_chain(model, chain_type="stuff", prompt=prompt)

        return chain

    def get_response(self, user_question, url):
        # Fetch the transcript for the provided URL
        context = self.extract_transcript(url)  # Get the full transcript

        chain = self.get_conversion_chain()

        print(context, user_question)

        try:
            response = chain.invoke({
                "context": context,  
                "question": user_question,
                "input_documents":  context
            })
        
        except Exception as e:
            print(f"Error occurred: {e}")
            response = "An error occurred while processing your 