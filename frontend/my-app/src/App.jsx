import React, { useState } from 'react';

const App = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event) => {
    setVideoUrl(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
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

  const formatSummary = (text) => {
    const formatted = text
      // Format sections
      .replace(/(\*\*Challenges:\*\*)/g, '\n\n**Challenges:**\n')
      .replace(/(\*\*Final Challenge:\*\*)/g, '\n\n**Final Challenge:**\n')
      .replace(/(\*\*Key Points:\*\*)/g, '\n\n**Key Points:**\n')
      // Format bullet points
      .replace(/\*(.*?)\*/g, '• $1\n')
      // Remove any bold syntax and replace with normal text
      .replace(/(\*\*(.*?)\*\*)/g, '$2');

    return formatted;
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
        {summary && (
          <div style={styles.summaryBox}>
            <h2 style={styles.summaryTitle}>Summary:</h2>
            <pre style={styles.summaryText}>{summary}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    background: 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
    padding: '20px',
    overflowY: 'auto', // Allows scrolling for the entire pages
  },
  container: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '500px',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem',
    color: '#333',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '30px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '15px',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    marginBottom: '20px',
    outline: 'none',
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',
  },
  button: {
    width: '100%',
    padding: '15px',
    fontSize: '1rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#6B73FF',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 5px 15px rgba(0, 109, 255, 0.3)',
    transition: 'background-color 0.3s ease',
  },
  summaryBox: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    marginTop: '30px',
    borderRadius: '8px',
    textAlign: 'left',
    maxHeight: '300px', // Set max height for the summary box
    overflowY: 'auto',  // Allows scrolling if the summary exceeds max height
  },
  summaryTitle: {
    fontSize: '1.5rem',
    color: '#333',
    marginBottom: '10px',
  },
  summaryText: {
    fontSize: '1rem',
    color: '#444',
    whiteSpace: 'pre-wrap', // ensures that line breaks and formatting are preserved
  },
};

export default App;
