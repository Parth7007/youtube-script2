import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [userMessage, setUserMessage] = useState('');

  const handleInputChange = (event) => {
    setVideoUrl(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const id = extractVideoId(videoUrl);
      if (!id) {
        throw new Error('Invalid YouTube URL');
      }
      setVideoId(id);

      const response = await fetch('http://localhost:8000/api/summarize/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ video_url: videoUrl }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setSummary(formatSummary(data.summary));
    } catch (error) {
      console.error('Error:', error);
      setSummary('Failed to fetch summary.');
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu\.be\/|v\/|\/u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const formatSummary = (text) => {
    return text
      .replace(/(\*\*Challenges:\*\*)/g, '\n\n**Challenges:**\n')
      .replace(/(\*\*Final Challenge:\*\*)/g, '\n\n**Final Challenge:**\n')
      .replace(/(\*\*Key Points:\*\*)/g, '\n\n**Key Points:**\n')
      .replace(/\*(.*?)\*/g, '• $1\n')
      .replace(/(\*\*(.*?)\*\*)/g, '$2');
  };

  // Chatbot toggle function
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Chatbot send message function
  const sendMessage = async () => {
    if (!userMessage) return;

    const newChatHistory = [...chatHistory, { type: 'user', content: userMessage }];
    setChatHistory(newChatHistory);

    try {
      const response = await fetch('http://localhost:8000/api/chatbot/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          youtube_url: videoUrl, // Ensure this key matches the model
          question: userMessage, // 'question' matches the expected model field
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const answer = data.answer;
        setChatHistory([...newChatHistory, { type: 'bot', content: answer }]);
      } else {
        throw new Error('Failed to get response from the chatbot');
      }
    } catch (error) {
      console.error('Error:', error);
      setChatHistory([...newChatHistory, { type: 'bot', content: 'Error: Unable to get a response from the chatbot.' }]);
    }

    setUserMessage(''); // Clear input after sending
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>YouTube Video Summarizer</h1>
        <p style={styles.subtitle}>Get concise summaries of your favorite YouTube videos instantly</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            value={videoUrl}
            onChange={handleInputChange}
            placeholder="Enter YouTube video URL"
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            {loading ? 'Summarizing...' : 'Get Summary'}
          </button>
        </form>

        {videoId && (
          <div style={styles.videoWrapper}>
            <iframe
              width="100%"
              height="400"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={styles.video}
            />
          </div>
        )}

        {summary && (
          <div style={styles.summaryBox}>
            <h2 style={styles.summaryTitle}>Summary:</h2>
            <pre style={styles.summaryText}>{summary}</pre>
          </div>
        )}

        {/* Chatbot functionality */}
        <div style={isChatOpen ? styles.chatOpen : styles.chatClosed}>
          <div style={styles.chatHeader} onClick={toggleChat}>
            {isChatOpen ? 'Chatbot (Click to Close)' : 'Chatbot (Click to Open)'}
          </div>

          {isChatOpen && (
            <div style={styles.chatBody}>
              <div style={styles.chatMessages}>
                {chatHistory.map((message, index) => (
                  <div
                    key={index}
                    style={message.type === 'user' ? styles.userMessage : styles.botMessage}
                  >
                    {message.content}
                  </div>
                ))}
              </div>
              <div style={styles.chatInputBox}>
                <input
                  style={styles.chatInput}
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Type your message..."
                />
                <button style={styles.chatSendButton} onClick={sendMessage}>
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const styles = {
  
  pageWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#F5F5FA', // Modern soft grayish background
    padding: '20px',
    boxSizing: 'border-box',
  },
  container: {
    width: '100%',
    maxWidth: '800px',
    backgroundColor: '#fff',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    textAlign: 'center',
    fontFamily: "'Inter', sans-serif", // Modern, clean font
    color: '#333',
  },
  title: {
    fontSize: '2.8rem',
    color: '#222',
    marginBottom: '10px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#555',
    marginBottom: '30px',
    fontWeight: '300',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    maxWidth: '620px',
    padding: '15px',
    fontSize: '1.1rem',
    borderRadius: '10px',
    border: '1px solid #ddd',
    marginBottom: '20px',
    outline: 'none',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  },
  button: {
    width: '100%',
    maxWidth: '620px',
    padding: '12px',
    fontSize: '1.2rem',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#6C63FF',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 5px 15px rgba(108, 99, 255, 0.4)',
  },
  videoWrapper: {
    marginTop: '30px',
    width: '100%',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.15)',
  },
  summaryBox: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    marginTop: '40px',
    borderRadius: '12px',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'left',
    lineHeight: '1.6',
  },
  summaryTitle: {
    fontSize: '1.6rem',
    color: '#444',
    marginBottom: '10px',
    fontWeight: '600',
  },
  summaryText: {
    fontSize: '1.1rem',
    color: '#333',
    whiteSpace: 'pre-wrap',
  },
  chatOpen: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '300px',
    height: '600px',
    borderRadius: '12px',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.2)',
    backgroundColor: '#FFF',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chatClosed: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '200px',
    height: '50px',
    borderRadius: '12px',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.2)',
    // backgroundColor: '#FFF',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeader: {
    backgroundColor: '#6C63FF',
    color: '#FFF',
    padding: '10px',
    textAlign: 'center',
    fontWeight: '600',
    cursor: 'pointer',
  },
  chatBody: {
    padding: '10px',
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    maxHeight: '100%' , // Restrict the height for better scrolling experience
  },
  chatMessages: {
    flex: '1',
    overflowY: 'auto', // Enable vertical scrolling
    maxHeight: '500px', // Set maximum height for the chat messages area
    paddingRight: '10px', // Add padding for a cleaner scroll experience
    marginBottom: '10px',
    scrollBehavior: 'smooth', // Smooth scrolling when new messages are added
  },
  userMessage: {
    backgroundColor: '#6C63FF',
    color: '#FFF',
    padding: '8px',
    borderRadius: '8px',
    marginBottom: '10px',
    alignSelf: 'flex-end',
    maxWidth: '80%',
    wordWrap: 'break-word',
  },
  botMessage: {
    backgroundColor: '#f1f1f1',
    color: '#333',
    padding: '8px',
    borderRadius: '8px',
    marginBottom: '10px',
    alignSelf: 'flex-start',
    maxWidth: '80%',
    wordWrap: 'break-word',
  },
  chatInputBox: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
  },
  chatInput: {
    flex: '1',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
  },
  chatSendButton: {
    padding: '10px 15px',
    backgroundColor: '#6C63FF',
    color: '#FFF',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
  },
};



export default App;
