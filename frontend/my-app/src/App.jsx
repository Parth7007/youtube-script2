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
    setLoading(true); // Start loading
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
      setSummary(formatSummary(data.summary)); // Format the summary
    } catch (error) {
      console.error('Error:', error);
      setSummary('Failed to fetch summary.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Function to format the summary with line breaks and bullet points
  const formatSummary = (text) => {
    const formatted = text
      .replace(/(\*\*Challenges:\*\*)/g, '\n\n**Challenges:**\n') // Replace bold with a section heading
      .replace(/(\*\*Final Challenge:\*\*)/g, '\n\n**Final Challenge:**\n') // Heading for final challenge
      .replace(/\*(.*?)\*/g, '• $1\n') // Convert asterisk bullet points to actual bullet points
      .replace(/(\*\*Key Points:\*\*)/g, '\n\n**Key Points:**\n') // Add new lines for "Key Points"
      .replace(/(\*\*(.*?)\*\*)/g, '$2'); // Handle any other bold markers

    return formatted;
  };

  return (
    <div>
      <h1>YouTube Video Summary</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={videoUrl}
          onChange={handleInputChange}
          placeholder="Enter YouTube video URL"
          required
        />
        <button type="submit">Get Summary</button>
      </form>
      {loading && <div>Loading...</div>} {/* Display loading state */}
      {summary && (
        <div>
          <h2>Summary:</h2>
          <pre>{summary}</pre> {/* Using <pre> tag to preserve formatting */}
        </div>
      )}
    </div>
  );
};

export default App;
