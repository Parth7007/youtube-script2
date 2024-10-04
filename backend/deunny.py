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

# FastAPI application
app = FastAPI()

class YouTubeTranscriptConverter:
    def __init__(self):
        load_dotenv()
        api_key = os.getenv("GOOGLE_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
        else:
            raise Exception("API key not found. Please check your environment variables.")
        self.model = genai.GenerativeModel("gemini-pro")
        self.transcripts = {}  # In-memory storage for transcripts
        self.chat = self.model.start_chat()
        system_prompt = "You are a transcript expert. Based on the provided transcript, give the answer to the given prompt."
        self.chat.send_message(system_prompt)
        self.chat_history = [f'System: {system_prompt}']

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
    
    def ask_question(self, prompt, transcript):
        # Send the question and transcript to the generative AI model
        response = self.chat.send_message(f"Transcript: {transcript}\nQuestion: {prompt}")
        answer = response.text
        self.chat_history.append(f'User: {prompt}')
        self.chat_history.append(f'AI: {answer}')
        return answer