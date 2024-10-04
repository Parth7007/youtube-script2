from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from genai_model import YouTubeSummary
from fastapi.middleware.cors import CORSMiddleware
from chatbot import VideoChatService
from typing import List, Optional
app = FastAPI()
youtube_summarizer = YouTubeSummary()

# CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to restrict allowed origins if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define a Pydantic model for the POST request body
class VideoUrlRequest(BaseModel):
    video_url: str

class VideoQuestionRequest(BaseModel):
    url: Optional[str] = None
    question: Optional[str] = None
    # subject: Optional[str] = None
    chat_history: Optional[List[dict]] = None 

@app.post("/api/summarize/")
async def summarize_video(request: VideoUrlRequest):
    try:
        # Extract transcript and generate summary
        transcript_text = youtube_summarizer.extract_transcript_details(request.video_url)
        if transcript_text:
            summary = youtube_summarizer.generate_gemini_content(transcript_text)
            return {"summary": summary}
        else:
            raise HTTPException(status_code=404, detail="Transcript not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


# Initialize the video chat service
video_chat_service = VideoChatService()


# FastAPI route to handle video chat requests
@app.post("/video-chat/")
async def video_chat(request: VideoQuestionRequest):
    return await video_chat_service.chat_with_video(request)