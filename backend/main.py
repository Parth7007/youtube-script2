from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from genai_model import YouTubeSummary
from fastapi.middleware.cors import CORSMiddleware

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
