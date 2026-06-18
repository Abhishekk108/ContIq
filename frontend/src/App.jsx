import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import ChatPage from './pages/ChatPage';
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App" style={{ minHeight: '100vh', background: '#f8fafc' ,margin:"0px"}}>
        <header style={{ 
            height: '90px',
            width:"",
            padding: '0',
            margin:"0px", 
            background: '#FEFDFD', 
            borderBottom: '0px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            
              <img 
                src="/logo.png" 
                alt="Contiq Logo" 
                style={{ 
                  height: '90%',
                  width: 'auto',
                  marginLeft:"20px",
                  objectFit: 'contain',
                  transform: 'scale(1.12)' 
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
