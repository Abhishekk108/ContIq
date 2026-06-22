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

  const formatMessageText = (text) => {
    if (!text) return '';
    const formatted = text
      .replace(/([.!?])\s+(?=[A-Z0-9"“”'`])/g, '$1\n\n')
      .replace(/\n{2,}/g, '\n\n')
      .trim();
    return formatted;
  };

  const renderMessageText = (text, role) => {
    const content = role === 'assistant' ? formatMessageText(text) : text;
    return content.split(/\n{2,}/g).map((paragraph, index) => (
      <p key={index}>{paragraph.trim()}</p>
    ));
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
                <div className="chat-page__message-content">
                  {renderMessageText(msg.content, msg.role)}
                </div>
                <button
                  className="chat-page__copy-button"
                  onClick={() => navigator.clipboard.writeText(msg.content)}
                  title="Copy message"
                  aria-label="Copy message"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                </button>
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
