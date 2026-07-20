import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatPage.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import api from '../api/axios';

function ChatPage() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Sidebar state
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [deletingChatId, setDeletingChatId] = useState(null);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const streamingMessageRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ─── Sidebar: load chat list ───────────────────────────────────────────────
  const fetchChats = useCallback(async () => {
    setSidebarLoading(true);
    try {
      const { data } = await api.get('/chat');
      setChats(data.chats || []);
    } catch (err) {
      console.error('Failed to load chats:', err);
    } finally {
      setSidebarLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // ─── Sidebar: create new chat ──────────────────────────────────────────────
  const handleNewChat = async () => {
    try {
      const { data } = await api.post('/chat', { title: 'New Chat' });
      const newChat = data.chat;
      setChats(prev => [newChat, ...prev]);
      setActiveChatId(newChat._id);
      setMessages([]);
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
  };

  // ─── Sidebar: load a chat's messages ──────────────────────────────────────
  const handleSelectChat = async (chatId) => {
    if (chatId === activeChatId) return;
    setActiveChatId(chatId);
    setMessages([]);
    try {
      const { data } = await api.get(`/chat/${chatId}`);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    }
  };

  // ─── Sidebar: delete a chat ────────────────────────────────────────────────
  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation(); // don't trigger handleSelectChat
    setDeletingChatId(chatId);
    try {
      await api.delete(`/chat/${chatId}`);
      setChats(prev => prev.filter(c => c._id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    } finally {
      setDeletingChatId(null);
    }
  };

  // ─── Handle uploaded file from navigation state ────────────────────────────
  useEffect(() => {
    if (location.state?.uploadedFile) {
      const { fileId, filename } = location.state.uploadedFile;
      setUploadedFiles(prev => {
        if (prev.some(f => f.fileId === fileId)) return prev;
        return [...prev, { fileId, filename }];
      });
      setSelectedFileId(fileId);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.uploadedFiles) {
      const newFiles = location.state.uploadedFiles;
      setUploadedFiles(prev => {
        const existingIds = new Set(prev.map(f => f.fileId));
        const filesToAdd = newFiles.filter(f => !existingIds.has(f.fileId));
        return [...prev, ...filesToAdd];
      });
      if (newFiles.length > 0) setSelectedFileId(newFiles[0].fileId);
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

  const renderMessageText = (text, role) => {
    if (role === 'user') {
      return <p>{text}</p>;
    }
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 style={{fontSize: '1.5em', fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
          h2: ({node, ...props}) => <h2 style={{fontSize: '1.3em', fontWeight: 'bold', marginTop: '0.8em', marginBottom: '0.5em'}} {...props} />,
          h3: ({node, ...props}) => <h3 style={{fontSize: '1.1em', fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.4em'}} {...props} />,
          code: ({node, inline, children, ...props}) => {
            if (inline) {
              return <code style={{backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.9em'}} {...props}>{children}</code>;
            }
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
                    position: 'absolute', top: '8px', right: '8px',
                    background: isCopied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    border: isCopied ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px', padding: '6px 10px', cursor: 'pointer',
                    color: isCopied ? '#10b981' : '#e5e7eb', fontSize: '12px',
                    display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { if (!isCopied) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
                  onMouseLeave={(e) => { if (!isCopied) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                  title={isCopied ? 'Copied!' : 'Copy code'}
                >
                  {isCopied ? (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>Copied!</>
                  ) : (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>Copy</>
                  )}
                </button>
                <code style={{display: 'block', backgroundColor: '#1f2937', color: '#e5e7eb', padding: '12px', paddingTop: '40px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.9em', overflowX: 'auto'}} {...props}>
                  {children}
                </code>
              </div>
            );
          },
          table: ({node, ...props}) => <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
          th: ({node, ...props}) => <th style={{border: '1px solid #d1d5db', padding: '8px', backgroundColor: '#f3f4f6', textAlign: 'left', fontWeight: 'bold'}} {...props} />,
          td: ({node, ...props}) => <td style={{border: '1px solid #d1d5db', padding: '8px'}} {...props} />,
          ul: ({node, ...props}) => <ul style={{marginLeft: '1.5em', marginTop: '0.3em', marginBottom: '0.3em'}} {...props} />,
          ol: ({node, ...props}) => <ol style={{marginLeft: '1.5em', marginTop: '0.3em', marginBottom: '0.3em'}} {...props} />,
          li: ({node, ...props}) => <li style={{marginTop: '0.2em', marginBottom: '0.2em'}} {...props} />,
          p: ({node, ...props}) => <p style={{marginTop: '0.5em', marginBottom: '0.5em', lineHeight: '1.6'}} {...props} />,
          strong: ({node, ...props}) => <strong style={{fontWeight: '600', color: '#1f2937'}} {...props} />,
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

  // ─── Submit question ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    // If no active chat, create one first
    let chatId = activeChatId;
    if (!chatId) {
      try {
        const { data } = await api.post('/chat', { title: 'New Chat' });
        chatId = data.chat._id;
        setActiveChatId(chatId);
        setChats(prev => [data.chat, ...prev]);
      } catch (err) {
        console.error('Failed to create chat:', err);
        return;
      }
    }

    const currentQuestion = question;
    const userMessage = { role: 'user', content: currentQuestion };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);
    setIsStreaming(true);

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
          fileId: selectedFileId,
          chatId
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
      let isFirstToken = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value);
        const lines = raw.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          const json = JSON.parse(line.replace('data: ', ''));

          if (json.token) {
            answerSoFar += json.token;
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[assistantMessageIndex] = {
                role: 'assistant',
                content: answerSoFar,
                sources: []
              };
              return newMessages;
            });

            // After first token arrives, the backend has auto-titled —
            // refresh sidebar titles once (non-blocking)
            if (isFirstToken) {
              isFirstToken = false;
              setTimeout(() => fetchChats(), 1500);
            }
          }

          if (json.done) {
            sources = json.sources || [];
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[assistantMessageIndex] = {
                role: 'assistant',
                content: answerSoFar || 'No answer received',
                sources
              };
              return newMessages;
            });
          }

          if (json.error) {
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
      streamingMessageRef.current = null;
    }
  };

  const suggestedQuestions = [
    "Explain the main concepts covered in this material",
    "Generate 5 interview questions based on this content",
    "What are the key topics I should focus on?",
    "Summarize the most important points"
  ];

  return (
    <div className="chat-layout">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="chat-sidebar">
        <div className="chat-sidebar__header">
          <button
            className="chat-sidebar__new-btn"
            onClick={handleNewChat}
            title="New Chat"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Chat
          </button>
        </div>

        <div className="chat-sidebar__list">
          {sidebarLoading && chats.length === 0 ? (
            <div className="chat-sidebar__loading">
              <div className="chat-sidebar__spinner" />
            </div>
          ) : chats.length === 0 ? (
            <p className="chat-sidebar__empty">No chats yet</p>
          ) : (
            chats.map(chat => (
              <div
                key={chat._id}
                className={`chat-sidebar__item ${activeChatId === chat._id ? 'chat-sidebar__item--active' : ''}`}
                onClick={() => handleSelectChat(chat._id)}
                title={chat.title}
              >
                <svg className="chat-sidebar__chat-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span className="chat-sidebar__item-title">{chat.title}</span>
                <button
                  className="chat-sidebar__delete-btn"
                  onClick={(e) => handleDeleteChat(e, chat._id)}
                  disabled={deletingChatId === chat._id}
                  title="Delete chat"
                  aria-label="Delete chat"
                >
                  {deletingChatId === chat._id ? (
                    <div className="chat-sidebar__delete-spinner" />
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                      <path d="M10 11v6"></path>
                      <path d="M14 11v6"></path>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                    </svg>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ── Main chat area ───────────────────────────────────────────────────── */}
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
                      onClick={() => setQuestion(suggestion)}
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
                className={`chat-page__message-wrapper ${
                  msg.role === 'user'
                    ? 'chat-page__message-wrapper--user'
                    : msg.isError
                      ? 'chat-page__message-wrapper--error'
                      : 'chat-page__message-wrapper--assistant'
                }`}
                ref={
                  msg.role === 'assistant' && isStreaming && idx === messages.length - 1
                    ? (el) => {
                        if (el && streamingMessageRef.current !== el) {
                          streamingMessageRef.current = el;
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }
                    : undefined
                }
              >
                <div
                  className={`chat-page__message ${
                    msg.role === 'user'
                      ? 'chat-page__message--user'
                      : msg.isError
                        ? 'chat-page__message--error'
                        : 'chat-page__message--assistant'
                  }`}
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
          <div className="chat-page__file-selector">
            <button
              onClick={() => setSelectedFileId(null)}
              className={`chat-page__file-button ${selectedFileId === null ? 'chat-page__file-button--active' : ''}`}
            >
              All PDFs
            </button>
            {uploadedFiles.map((file) => (
              <button
                key={file.fileId}
                onClick={() => setSelectedFileId(file.fileId)}
                className={`chat-page__file-button ${selectedFileId === file.fileId ? 'chat-page__file-button--active' : ''}`}
                title={file.filename}
              >
                📄 {file.filename.length > 20 ? file.filename.substring(0, 17) + '...' : file.filename}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="chat-page__form"
          style={{
            borderTopLeftRadius: uploadedFiles.length > 0 ? '0' : '16px',
            borderTopRightRadius: uploadedFiles.length > 0 ? '0' : '16px'
          }}
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (question.trim() && !loading) handleSubmit(e);
              }
            }}
            placeholder="Type your question here..."
            disabled={loading}
            className="chat-page__input"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="chat-page__button send-btn"
          >
            <FontAwesomeIcon icon={faArrowUp} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatPage;
