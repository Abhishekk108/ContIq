import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import ChatPage from './pages/ChatPage';
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App" style={{ minHeight: '100vh', background: '#F8FAFC', margin: "0px" }}>
        <header style={{ 
            height: '80px',
            padding: '0 32px',
            margin: "0px", 
            background: '#FFFFFF', 
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}>
            <img 
              src="/logo.png" 
              alt="ContIQ Logo" 
              style={{ 
                height: '80px',
                width: 'auto',
                objectFit: 'contain'
              }} 
            />
          </header>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
