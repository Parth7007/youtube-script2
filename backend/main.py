from fastapi import FastAPI, HTTPException
from genai_model import YouTubeSummary

app = FastAPI()
youtube_summarizer = YouTubeSummary()

@app.get("/summary/")
async def get_summary(youtube_video_url: str):
    try:
        transcript_text = youtube_summarizer.extract_transcript_details(youtube_video_url)
        if transcript_text:
            summary = youtube_summarizer.generate_gemini_content(transcript_text)
            return {"summary": summary}
        else:
            raise HTTPException(status_code=404, detail="Transcript not found")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



print("hello World")
