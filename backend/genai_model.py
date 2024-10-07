import os
import re
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
from youtube_transcript_api import YouTubeTranscriptApi

load_dotenv()  # Load environment variables



class YouTubeSummary:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        genai.configure(api_key=self.api_key)
        self.prompt = """You are a YouTube video summarizer. Your task is to take the transcript of a YouTube video and create a concise summary of its content for display on a web application. The summary should:
        1. Be properly formatted and suitable for rendering on the web.
        2. Present key points in bullet points.
        3. If mathematical formulas are present in the video, format them in LaTeX.

        Please summarize the following transcript text accordingly: """


    def extract_youtube_key(self, url):
        try:
            patterns = [
                r'(?:https?://)?(?:www\.)?youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})',
                r'(?:https?://)?(?:www\.)?youtube\.com/live/([a-zA-Z0-9_-]{11})',
                r'(?:https?://)?(?:www\.)?youtu\.be/([a-zA-Z0-9_-]{11})'
            ]

            for pattern in patterns:
                match = re.match(pattern, url)
                if match:
                    return match.group(1)
            
            raise ValueError("Invalid YouTube URL")
        
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    

    def extract_transcript_details(self, youtube_video_url):
        try:
            video_id = youtube_video_url.split("v=")[-1]
            transcript_text = YouTubeTranscriptApi.get_transcript(video_id)
            
            transcript = ""
            for i in transcript_text:
                transcript += " " + i["text"]

            return transcript

        except Exception as e:
            raise e

    def generate_gemini_content(self, transcript_text):
        try:
            model = genai.GenerativeModel("gemini-pro")
            response = model.generate_content(self.prompt + transcript_text)
            return response.text
        except Exception as e:
            raise e
