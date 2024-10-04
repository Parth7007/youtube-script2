from dotenv import load_dotenv
import os
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel("gemini-pro")

chat = model.start_chat()
system_prompt = "You are an expert in speech theory, providing clear, concise, and insightful explanations. Always deliver responses in a friendly tone, using simple language to ensure understanding."
chat.send_message(system_prompt)
chat_history = []
chat_history = [f'System: {system_prompt}']

