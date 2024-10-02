import os
from dotenv import load_dotenv
import google.generativeai as genai
from youtube_transcript_api import YouTubeTranscriptApi

load_dotenv()  # Load environment variables

class YouTubeSummary:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        genai.configure(api_key=self.api_key)
        self.prompt = """You are a YouTube video summarizer. You will be taking the transcript text
        and summarizing the entire video and providing the important summary in points
        within 250 words. Please provide the summary of the text given here:  """

    def extract_transcript_details(self, youtube_video_url):
        try:
            video_id = youtube_video_url.split("=")[1]
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
