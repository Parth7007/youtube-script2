from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi, VideoUnavailable, NoTranscriptFound, TranscriptsDisabled
import google.generativeai as genai
from dotenv import load_dotenv
from langchain.schema import AIMessage, HumanMessage, SystemMessage
from typing import List, Optional
import os
import re

load_dotenv()

class VideoQuestionRequest(BaseModel):
    url: Optional[str] = None
    question: Optional[str] = None
    subject: Optional[str] = None
    chat_history: Optional[List[dict]] = None  # Accepting chat history as a list of message dicts

class VideoChatService:
    def __init__(self):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.api_client = genai.GenerativeModel("gemini-pro")
        self.chat = self.api_client.start_chat()  # Initialize chat for sending messages
        self.default_system_prompt = "You are an assistant specialized in answering questions about YouTube videos."
        self.default_user_prompt = "Question: {question}"

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
    
    def get_genai_response(self, chat_history, question, subject):
        try:
            system_prompt = self.default_system_prompt
            user_prompt = self.default_user_prompt

            if not chat_history:
                raise HTTPException(status_code=400, detail="No chat history or transcript available to refer to.")

            # Add the new question to the chat history
            chat_history.append(HumanMessage(content=user_prompt.format(question=question)))

            # Prepare messages for the GenAI API based on the chat history
            conversation = [{"role": "system", "content": system_prompt}] + [
                {"role": "user" if isinstance(message, HumanMessage) else "assistant" if isinstance(message, AIMessage) else "system",
                 "content": message.content} for message in chat_history
            ]

            # Generate the response using the GenAI client
            response = self.chat.send_messages(messages=conversation)

            # Extract the response content
            response_content = response.messages[-1]["content"]
            chat_history.append(AIMessage(content=response_content))

            return response_content, chat_history

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error from GenAI: {str(e)}")

    async def chat_with_video(self, request: VideoQuestionRequest):
        try:
            # If chat history is not provided, we need a URL to extract the transcript
            if not request.chat_history and not request.url:
                raise HTTPException(status_code=400, detail="Either chat history or video URL must be provided.")

            # Extract the transcript only if URL is provided and chat history is empty
            if request.url and not request.chat_history:
                transcript = self.extract_transcript(request.url)
                chat_history = [SystemMessage(content=self.default_system_prompt),
                                HumanMessage(content=f"Transcript: {transcript}"),
                                AIMessage(content=f"Hello👋🏻, How can I assist with this video?")]
                return {"response": "Hello👋🏻, How can I assist with this video?", "chat_history": chat_history}
            else:
                # If chat history is provided, use it directly
                chat_history = [SystemMessage(content=msg['content']) if msg['type'] == 'system' else
                                HumanMessage(content=msg['content']) if msg['type'] == 'user' else
                                AIMessage(content=msg['content']) for msg in request.chat_history]

            # Get the GenAI response
            response, updated_chat_history = self.get_genai_response(chat_history, request.question, request.subject)

            # Return both the response and the updated chat history
            return {"response": response, "chat_history": updated_chat_history}
        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
