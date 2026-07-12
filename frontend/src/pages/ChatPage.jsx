import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatPage.css';

function ChatPage() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle uploaded file from navigation state
  useEffect(() => {
    if (location.state?.uploadedFile) {
      // Single file upload (backward compatibility)
      const { fileId, filename } = location.state.uploadedFile;
      setUploadedFiles(prev => {
        if (prev.some(f => f.fileId === fileId)) {
          return prev;
        }
        return [...prev, { fileId, filename }];
      });
      // Auto-select the newly uploaded file
      setSelectedFileId(fileId);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.uploadedFiles) {
      // Multiple files upload
      const newFiles = location.state.uploadedFiles;
      setUploadedFiles(prev => {
        const existingIds = new Set(prev.map(f => f.fileId));
        const filesToAdd = newFiles.filter(f => !existingIds.has(f.fileId));
        return [...prev, ...filesToAdd];
      });
      // Auto-select the first newly uploaded file
      if (newFiles.length > 0) {
        setSelectedFileId(newFiles[0].fileId);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = (e) => {
    const element = e.target;
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    setShowScrollButton(!isNearBottom);
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
    if (role === 'user') {
      // User messages - simple text rendering
      return <p>{text}</p>;
    }
    
    // Assistant messages - render as Markdown
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize heading styles
          h1: ({node, ...props}) => <h1 style={{fontSize: '1.5em', fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
          h2: ({node, ...props}) => <h2 style={{fontSize: '1.3em', fontWeight: 'bold', marginTop: '0.8em', marginBottom: '0.5em'}} {...props} />,
          h3: ({node, ...props}) => <h3 style={{fontSize: '1.1em', fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.4em'}} {...props} />,
          // Customize code blocks with copy button
          code: ({node, inline, children, ...props}) => {
            if (inline) {
              return <code style={{backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.9em'}} {...props}>{children}</code>;
            }
            
            // Block code with copy button
            const codeContent = String(children).replace(/\n$/, '');
            const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
            const isCopied = copiedCode === codeId;
            
            return (
              <div style={{position: 'relative', marginTop: '0.5em', marginBottom: '0.5em'}}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeContent);
                    setCopiedCode(codeId);
                    setTimeout(() => setCopiedCode(null), 2000);
                  }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: isCopied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    border: isCopied ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    color: isCopied ? '#10b981' : '#e5e7eb',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCopied) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCopied) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  title={isCopied ? "Copied!" : "Copy code"}
                >
                  {isCopied ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                      </svg>
                      Copy
                    </>
                  )}
                </button>
                <code style={{
                  display: 'block',
                  backgroundColor: '#1f2937',
                  color: '#e5e7eb',
                  padding: '12px',
                  paddingTop: '40px',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.9em',
                  overflowX: 'auto'
                }} {...props}>
                  {children}
                </code>
              </div>
            );
          },
          // Customize tables
          table: ({node, ...props}) => <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
          th: ({node, ...props}) => <th style={{border: '1px solid #d1d5db', padding: '8px', backgroundColor: '#f3f4f6', textAlign: 'left', fontWeight: 'bold'}} {...props} />,
          td: ({node, ...props}) => <td style={{border: '1px solid #d1d5db', padding: '8px'}} {...props} />,
          // Customize lists
          ul: ({node, ...props}) => <ul style={{marginLeft: '1.5em', marginTop: '0.3em', marginBottom: '0.3em'}} {...props} />,
          ol: ({node, ...props}) => <ol style={{marginLeft: '1.5em', marginTop: '0.3em', marginBottom: '0.3em'}} {...props} />,
          li: ({node, ...props}) => <li style={{marginTop: '0.2em', marginBottom: '0.2em'}} {...props} />,
          // Customize paragraphs
          p: ({node, ...props}) => <p style={{marginTop: '0.5em', marginBottom: '0.5em', lineHeight: '1.6'}} {...props} />,
          // Customize strong/bold
          strong: ({node, ...props}) => <strong style={{fontWeight: '600', color: '#1f2937'}} {...props} />,
        }}
      >
        {text}
      </ReactMarkdown>
    );
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
    setIsStreaming(true);

    // Create a placeholder assistant message for streaming
    const assistantMessageIndex = messages.length + 1;
    setMessages(prev => [...prev, { role: 'assistant', content: '', sources: [] }]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5555/query/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          question: currentQuestion,
          conversationHistory: [...messages, userMessage],
          fileId: selectedFileId
        })
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answerSoFar = '';
      let sources = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value);
        const lines = raw.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          const json = JSON.parse(line.replace('data: ', ''));
          
          if (json.token) {
            answerSoFar += json.token;
            // Update the assistant message with accumulated tokens
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[assistantMessageIndex] = {
                role: 'assistant',
                content: answerSoFar,
                sources: []
              };
              return newMessages;
            });
          }
          
          if (json.done) {
            sources = json.sources || [];
            // Update with final sources
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[assistantMessageIndex] = {
                role: 'assistant',
                content: answerSoFar || 'No answer received',
                sources: sources
              };
              return newMessages;
            });
          }

          if (json.error) {
            // Handle streaming error
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[assistantMessageIndex] = {
                role: 'assistant',
                content: `Error: ${json.error}`,
                isError: true
              };
              return newMessages;
            });
          }
        }
      }

    } catch (error) {
      const errorMsg = error.message || 'Failed to connect to server';
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[assistantMessageIndex] = {
          role: 'assistant',
          content: `Error: ${errorMsg}`,
          isError: true
        };
        return newMessages;
      });
    } finally {
      setLoading(false);
      setIsStreaming(false);
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
      <div 
        className="chat-page__messages"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
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
                  {msg.role === 'assistant' && isStreaming && idx === messages.length - 1 && (
                    <span className="chat-page__cursor">▊</span>
                  )}
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
        {loading && !isStreaming && (
          <div className="chat-page__loading">
            <div className="chat-page__loading-indicator" />
            <span className="chat-page__loading-text">Generating response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="chat-page__scroll-button"
          title="Scroll to bottom"
          aria-label="Scroll to bottom"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      )}

      {/* File Selector */}
      {uploadedFiles.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '10px',
          padding: '16px 20px',
          background: '#FFFFFF',
          borderRadius: '12px 12px 0 0',
          border: '1px solid #E2E8F0',
          borderBottom: 'none',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setSelectedFileId(null)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              background: selectedFileId === null ? '#7C3AED' : '#FFFFFF',
              color: selectedFileId === null ? '#FFFFFF' : '#64748B',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontWeight: selectedFileId === null ? '600' : '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (selectedFileId !== null) {
                e.currentTarget.style.background = '#F8FAFC';
                e.currentTarget.style.borderColor = '#7C3AED';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedFileId !== null) {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }
            }}
          >
            All PDFs
          </button>
          {uploadedFiles.map((file) => (
            <button
              key={file.fileId}
              onClick={() => setSelectedFileId(file.fileId)}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                background: selectedFileId === file.fileId ? '#7C3AED' : '#FFFFFF',
                color: selectedFileId === file.fileId ? '#FFFFFF' : '#64748B',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: selectedFileId === file.fileId ? '600' : '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (selectedFileId !== file.fileId) {
                  e.currentTarget.style.background = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#7C3AED';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedFileId !== file.fileId) {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }
              }}
              title={file.filename}
            >
              📄 {file.filename.length > 20 ? file.filename.substring(0, 17) + '...' : file.filename}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="chat-page__form" style={{
        borderTopLeftRadius: uploadedFiles.length > 0 ? '0' : '16px',
        borderTopRightRadius: uploadedFiles.length > 0 ? '0' : '16px'
      }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (question.trim() && !loading) {
                handleSubmit(e);
              }
            }
          }}
          placeholder="Type your question here..."
          disabled={loading}
          className="chat-page__input"
        />
        <button onClick={handleNewUpload} className="chat-page__upload-button">
          Upload 
        </button>
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
