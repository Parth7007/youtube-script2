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
        // Fetch chatbot response from the FastAPI server
        const response = await fetch('http://localhost:8000/api/chatbot/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userMessage }),
        });

        if (response.ok) {
          const data = await response.json();
          // Update chat history with bot's response
          setChatHistory([...newChatHistory, { type: 'bot', content: data.response }]);
        } else {
          throw new Error('Failed to get response from the chatbot');
        }
      } catch (error) {
        console.error('Error:', error);
        setChatHistory([...newChatHistory, { type: 'bot', content: 'Error: Unable to get a response from the chatbot.' }]);
      }

      setUserMessage('');
    };

    return (
      <div style={styles.pageWrapper}>
        <div style={styles.container}>
          <h1 style={styles.title}>YouTube Video Summarizer</h1>
          <p style={styles.subtitle}>
            Get concise summaries of your favorite YouTube videos instantly
          </p>
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

  // (The styles object remains unchanged)




  const styles = {
    pageWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#f0f0f0',
      padding: '10px',
      boxSizing: 'border-box',
    },
    container: {
      width: '100%',
      maxWidth: '800px',
      backgroundColor: '#fff',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      padding: '20px',
      textAlign: 'center',
    },
    title: {
      fontSize: '2.5rem',
      color: '#333',
      marginBottom: '10px',
      fontWeight: 'bold',
    },
    subtitle: {
      fontSize: '1.25rem',
      color: '#666',
      marginBottom: '20px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    input: {
      width: '100%',
      maxWidth: '600px',
      padding: '12px',
      fontSize: '1.1rem',
      borderRadius: '8px',
      border: '1px solid #ddd',
      marginBottom: '20px',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    },
    button: {
      width: '100%',
      maxWidth: '600px',
      padding: '12px',
      fontSize: '1.2rem',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#6B73FF',
      color: '#fff',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      boxShadow: '0 5px 15px rgba(0, 109, 255, 0.3)',
    },
    videoWrapper: {
      marginTop: '20px',
      width: '100%',
    },
    video: {
      borderRadius: '8px',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
    },
    summaryBox: {
      backgroundColor: '#f9f9f9',
      padding: '20px',
      marginTop: '20px',
      borderRadius: '8px',
      textAlign: 'left',
      maxWidth: '100%',
      boxSizing: 'border-box',
    },
    summaryTitle: {
      fontSize: '1.5rem',
      color: '#333',
      marginBottom: '10px',
    },
    summaryText: {
      fontSize: '1rem',
      color: '#444',
      whiteSpace: 'pre-wrap',
    },
    // Chat styles
    chatClosed: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '300px',
      height: '50px',
      backgroundColor: '#6B73FF',
      borderRadius: '10px',
      textAlign: 'center',
      color: '#fff',
      cursor: 'pointer',
      padding: '10px',
    },
    chatOpen: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '300px',
      height: '400px',
      backgroundColor: '#fff',
      border: '1px solid #ddd',
      borderRadius: '10px',
      textAlign: 'center',
      color: '#333',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    },
    chatHeader: {
      backgroundColor: '#6B73FF',
      borderRadius: '10px 10px 0 0',
      padding: '10px',
      color: '#fff',
      cursor: 'pointer',
    },
    chatBody: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: 'calc(100% - 50px)',
      padding: '10px',
    },
    chatMessages: {
      overflowY: 'scroll',
      flex: '1',
    },
    userMessage: {
      textAlign: 'right',
      marginBottom: '10px',
    },
    botMessage: {
      textAlign: 'left',
      marginBottom: '10px',
    },
    chatInputBox: {
      display: 'flex',
    },
    chatInput: {
      flex: '1',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '5px',
    },
    chatSendButton: {
      padding: '10px',
      backgroundColor: '#6B73FF',
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
      borderRadius: '5px',
      marginLeft: '5px',
    },
  };

  export default App;
