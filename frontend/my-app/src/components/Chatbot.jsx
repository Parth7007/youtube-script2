import React, { useState } from 'react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (event) => {
    setChatInput(event.target.value);
  };

  const handleChatSubmit = (event) => {
    event.preventDefault();
    if (chatInput.trim()) {
      setChatHistory([...chatHistory, { sender: 'user', text: chatInput }]);
      // Simulate chatbot response
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: 'chatbot', text: `You asked: "${chatInput}". Here is your answer!` },
      ]);
      setChatInput(''); // Clear input after sending
    }
  };

  return (
    <div>
      {/* Circular button */}
      <button onClick={toggleChat} style={styles.chatButton}>
        💬
      </button>

      {/* Popup Chat Window */}
      {isOpen && (
        <div style={styles.chatPopup}>
          <div style={styles.chatHeader}>
            <h2>Chatbot</h2>
            <button onClick={toggleChat} style={styles.closeButton}>×</button>
          </div>

          <div style={styles.chatBody}>
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                style={msg.sender === 'user' ? styles.userMessage : styles.chatbotMessage}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleChatSubmit} style={styles.chatForm}>
            <input
              type="text"
              value={chatInput}
              onChange={handleInputChange}
              placeholder="Ask about YouTube video..."
              style={styles.chatInput}
            />
            <button type="submit" style={styles.chatSubmitButton}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

const styles = {
  chatButton: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#6B73FF',
    color: '#fff',
    fontSize: '24px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease',
  },
  chatPopup: {
    position: 'fixed',
    bottom: '100px',
    right: '20px',
    width: '300px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    backgroundColor: '#6B73FF',
    color: '#fff',
    padding: '10px',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
  },
  chatBody: {
    padding: '10px',
    maxHeight: '200px',
    overflowY: 'auto',
    flex: 1,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    padding: '8px',
    borderRadius: '8px',
    marginBottom: '10px',
    maxWidth: '70%',
  },
  chatbotMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#eee',
    padding: '8px',
    borderRadius: '8px',
    marginBottom: '10px',
    maxWidth: '70%',
  },
  chatForm: {
    display: 'flex',
    borderTop: '1px solid #ddd',
    padding: '10px',
  },
  chatInput: {
    flex: 1,
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    marginRight: '10px',
  },
  chatSubmitButton: {
    padding: '8px 12px',
    backgroundColor: '#6B73FF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Chatbot;
