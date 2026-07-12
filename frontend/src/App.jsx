import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import UploadPage from './pages/UploadPage';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const showNewChatButton = isAuthenticated && (location.pathname === '/chat' || location.pathname.startsWith('/chat/'));

  return (
    <header style={{
      height: '80px',
      padding: '0 32px',
      margin: '0px',
      background: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    }}>
      {/* Logo */}
      <Link to={isAuthenticated ? '/' : '/login'} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <img
          src="/logo.png"
          alt="ContIQ Logo" 
          style={{ height: '78px', width: 'auto', objectFit: 'contain' }}
        />
      </Link>

      {/* Right side — only shown when logged in */}
      {isAuthenticated && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* New Chat button */}
          {showNewChatButton && (
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '8px 18px',
                fontSize: '14px',
                fontWeight: '600',
                background: '#115CF9',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#136AFB';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(17, 92, 249, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#115CF9';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              + New Chat
            </button>
          )}

          {/* User name */}
          <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
            {user?.name}
          </span>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 18px',
              fontSize: '14px',
              fontWeight: '600',
              background: 'transparent',
              color: '#64748B',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FEF2F2';
              e.currentTarget.style.borderColor = '#FECACA';
              e.currentTarget.style.color = '#EF4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.color = '#64748B';
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App" style={{ minHeight: '100vh', background: '#F8FAFC', margin: '0px' }}>
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route path="/" element={
              <PrivateRoute><UploadPage /></PrivateRoute>
            } />
            <Route path="/chat" element={
              <PrivateRoute><ChatPage /></PrivateRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={
              <PrivateRoute><UploadPage /></PrivateRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
