import React, { useState } from 'react';

const App = () => {
  const [inputData, setInputData] = useState('');
  const [result, setResult] = useState('');

  const handleInputChange = (event) => {
    setInputData(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/predict/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: inputData }),
      });
      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1>FastAPI and React Integration</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputData}
          onChange={handleInputChange}
          placeholder="Enter data"
          required
        />
        <button type="submit">Submit</button>
      </form>
      {result && <div><strong>Result:</strong> {result}</div>}
    </div>
  );
};

export default App;
