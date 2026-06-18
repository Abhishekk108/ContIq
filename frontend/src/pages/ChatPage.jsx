import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
        question: currentQuestion
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
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 120px)', 
      maxWidth: '1100px', 
      margin: '0 auto',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div>
          <h2 style={{ 
            margin: '0 0 8px 0', 
            color: '#1a1a1a',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            Chat with Your Material
          </h2>
          <p style={{ 
            margin: 0, 
            color: '#6b7280', 
            fontSize: '14px' 
          }}>
            Ask questions about your uploaded content
          </p>
        </div>
        <button 
          onClick={handleNewUpload}
          style={{
            padding: '10px 20px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#059669'}
          onMouseOut={(e) => e.target.style.background = '#10b981'}
        >
          Upload New PDF
        </button>
      </div>
      
      <div style={{ 
        flex: 1,
        border: '1px solid #e5e7eb', 
        borderRadius: '12px', 
        padding: '24px', 
        overflowY: 'auto',
        marginBottom: '20px',
        background: '#ffffff'
      }}>
        {messages.length === 0 ? (
          <div>
            <p style={{ 
              color: '#9ca3af', 
              textAlign: 'center', 
              marginBottom: '40px',
              fontSize: '15px'
            }}>
              Start asking questions about your uploaded PDF
            </p>
            <div style={{ marginTop: '20px' }}>
              <p style={{ 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                Suggested Questions:
              </p>
              <div style={{ display: 'grid', gap: '12px' }}>
                {suggestedQuestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{
                      padding: '14px 16px',
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '14px',
                      color: '#374151',
                      transition: 'all 0.2s',
                      fontWeight: '400'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#f9fafb';
                      e.target.style.borderColor = '#2563eb';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'white';
                      e.target.style.borderColor = '#e5e7eb';
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{ 
              marginBottom: '24px',
              padding: '18px',
              background: msg.role === 'user' ? '#eff6ff' : (msg.isError ? '#fef2f2' : '#f9fafb'),
              borderRadius: '10px',
              border: `1px solid ${msg.role === 'user' ? '#dbeafe' : (msg.isError ? '#fecaca' : '#e5e7eb')}`,
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '10px',
                fontWeight: '600',
                fontSize: '14px',
                color: msg.role === 'user' ? '#1e40af' : (msg.isError ? '#991b1b' : '#374151')
              }}>
                <span style={{ 
                  marginRight: '8px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: msg.role === 'user' ? '#2563eb' : (msg.isError ? '#dc2626' : '#10b981'),
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {msg.role === 'user' ? 'U' : 'A'}
                </span>
                {msg.role === 'user' ? 'You' : 'Contiq AI'}
              </div>
              <div style={{ 
                color: '#1f2937', 
                lineHeight: '1.7',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                fontSize: '14px'
              }}>
                {msg.content}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <details style={{ 
                  marginTop: '16px', 
                  padding: '12px',
                  background: 'white',
                  borderRadius: '6px',
                  fontSize: '13px',
                  border: '1px solid #e5e7eb'
                }}>
                  <summary style={{ 
                    cursor: 'pointer', 
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '12px'
                  }}>
                    View Sources ({msg.sources.length})
                  </summary>
                  {msg.sources.map((src, i) => (
                    <div key={i} style={{ 
                      marginTop: '12px', 
                      padding: '12px', 
                      background: '#f9fafb',
                      borderLeft: '3px solid #2563eb',
                      borderRadius: '4px'
                    }}>
                      <div style={{ 
                        color: '#6b7280', 
                        fontSize: '12px', 
                        marginBottom: '6px',
                        fontWeight: '500'
                      }}>
                        Relevance Score: {(src.score * 100).toFixed(1)}%
                      </div>
                      <div style={{ color: '#374151', lineHeight: '1.6' }}>
                        {src.text}
                      </div>
                    </div>
                  ))}
                </details>
              )}
            </div>
          ))
        )}
        {loading && (
          <div style={{ 
            padding: '18px',
            background: '#f9fafb',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '18px',
              height: '18px',
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>Generating response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ 
        display: 'flex', 
        gap: '12px',
        padding: '16px',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question here..."
          disabled={loading}
          style={{ 
            flex: 1, 
            padding: '12px 16px', 
            fontSize: '15px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            outline: 'none',
            transition: 'border-color 0.2s',
            fontFamily: 'inherit'
          }}
          onFocus={(e) => e.target.style.borderColor = '#2563eb'}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        />
        <button 
          type="submit" 
          disabled={loading || !question.trim()}
          style={{ 
            padding: '12px 28px', 
            fontSize: '15px',
            fontWeight: '500',
            background: (loading || !question.trim()) ? '#d1d5db' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: (loading || !question.trim()) ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => {
            if (!loading && question.trim()) e.target.style.background = '#1d4ed8';
          }}
          onMouseOut={(e) => {
            if (!loading && question.trim()) e.target.style.background = '#2563eb';
          }}
        >
          Send
        </button>
      </form>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default ChatPage;
