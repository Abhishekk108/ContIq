import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ChatPage.css';

function ChatPage() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) return;

    const currentQuestion = question;
    const userMessage = { role: 'user', content: currentQuestion };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5555/query', {
        question: currentQuestion,
        conversationHistory: [...messages, userMessage]
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.answer || 'No answer received',
        sources: response.data.sources || []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      const errorMessage = {
        role: 'assistant',
        content: `Error: ${errorMsg}`,
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewUpload = () => {
    navigate('/');
  };

  const suggestedQuestions = [
    "Explain the main concepts covered in this material",
    "Generate 5 interview questions based on this content",
    "What are the key topics I should focus on?",
    "Summarize the most important points"
  ];

  const handleSuggestionClick = (suggestion) => {
    setQuestion(suggestion);
  };

  return (
    <div className="chat-page">
      <div className="chat-page__header">
        <div>
          <h2 className="chat-page__title">Chat with Your Material</h2>
          <p className="chat-page__subtitle">Ask questions about your uploaded content</p>
        </div>
        <button onClick={handleNewUpload} className="chat-page__upload-button">
          Upload New PDF
        </button>
      </div>

      <div className="chat-page__messages">
        {messages.length === 0 ? (
          <div>
            <p className="chat-page__empty-state">Start asking questions about your uploaded PDF</p>
            <div className="chat-page__suggestions">
              <p className="chat-page__suggestions-title">Suggested Questions:</p>
              <div className="chat-page__suggestion-list">
                {suggestedQuestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="chat-page__suggestion-button"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-page__message-wrapper ${msg.role === 'user'
                ? 'chat-page__message-wrapper--user'
                : msg.isError
                  ? 'chat-page__message-wrapper--error'
                  : 'chat-page__message-wrapper--assistant'}`}
            >
              <div
                className={`chat-page__message ${msg.role === 'user'
                  ? 'chat-page__message--user'
                  : msg.isError
                    ? 'chat-page__message--error'
                    : 'chat-page__message--assistant'}`}
              >
                <div className="chat-page__message-content">{msg.content}</div>
                {msg.sources && msg.sources.length > 0 && (
                  <details className="chat-page__sources">
                    <summary>View Sources ({msg.sources.length})</summary>
                    {msg.sources.map((src, i) => (
                      <div key={i} className="chat-page__source-item">
                        <div className="chat-page__source-meta">
                          Relevance Score: {(src.score * 100).toFixed(1)}%
                        </div>
                        <div className="chat-page__source-text">{src.text}</div>
                      </div>
                    ))}
                  </details>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="chat-page__loading">
            <div className="chat-page__loading-indicator" />
            <span className="chat-page__loading-text">Generating response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-page__form">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question here..."
          disabled={loading}
          className="chat-page__input"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="chat-page__button"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatPage;
