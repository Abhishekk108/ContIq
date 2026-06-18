import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setMessage('');
    
    if (selectedFile) {
      const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
      setMessage(`Selected: ${selectedFile.name} (${fileSizeMB} MB)`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a PDF file');
      return;
    }

    if (file.type !== 'application/pdf') {
      setMessage('Please select a valid PDF file');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);

    setUploading(true);
    setProgress('Uploading PDF...');
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5555/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(`Uploading: ${percentCompleted}%`);
        }
      });
      
      setProgress('Processing complete');
      setMessage(`Success! Created ${response.data.chunksCreated} knowledge chunks. Redirecting to chat...`);
      
      setTimeout(() => navigate('/chat'), 2500);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setMessage(`Upload failed: ${errorMsg}`);
      setProgress('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 80px)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '60px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header Section */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '50px',
          color: 'white'
        }}>
          <h1 style={{ 
            fontSize: '42px',
            fontWeight: '700',
            marginBottom: '16px',
            letterSpacing: '-1px'
          }}>
            Upload Your Study Material
          </h1>
          <p style={{ 
            fontSize: '18px',
            lineHeight: '1.6',
            maxWidth: '700px',
            margin: '0 auto',
            opacity: '0.95'
          }}>
            Transform your PDFs into an intelligent knowledge base. Upload your placement preparation notes, DSA concepts, or interview materials to get started.
          </p>
        </div>

        {/* Main Upload Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          padding: '60px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {/* Upload Area */}
          <div style={{ 
            border: '3px dashed #667eea', 
            borderRadius: '12px', 
            padding: '60px 40px',
            textAlign: 'center',
            background: '#f8f9ff',
            transition: 'all 0.3s',
            marginBottom: '40px'
          }}>
            <div style={{ marginBottom: '30px' }}>
              <svg 
                width="64" 
                height="64" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#667eea" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ margin: '0 auto', display: 'block' }}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>

            <label htmlFor="file-upload" style={{
              display: 'inline-block',
              padding: '16px 40px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'transform 0.2s, box-shadow 0.2s',
              border: 'none',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
            >
              Choose PDF File
            </label>
            <input 
              id="file-upload"
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <p style={{
              marginTop: '20px',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              or drag and drop your file here
            </p>
          </div>
          
          {/* Selected File Display */}
          {file && (
            <div style={{ 
              marginBottom: '30px',
              padding: '20px',
              background: '#f8f9ff',
              borderRadius: '8px',
              border: '1px solid #e0e7ff',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#667eea" 
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <div style={{ flex: 1 }}>
                <p style={{ 
                  color: '#1a1a1a', 
                  fontWeight: '600',
                  margin: 0,
                  fontSize: '15px'
                }}>
                  {file.name}
                </p>
                <p style={{
                  color: '#6b7280',
                  fontSize: '13px',
                  margin: '4px 0 0 0'
                }}>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}
          
          {/* Upload Button */}
          <button 
            onClick={handleUpload} 
            disabled={uploading || !file}
            style={{ 
              width: '100%',
              padding: '16px', 
              fontSize: '17px',
              fontWeight: '600',
              background: uploading || !file 
                ? '#e5e7eb' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: uploading || !file ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: uploading || !file 
                ? 'none' 
                : '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
            onMouseOver={(e) => {
              if (!uploading && file) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
              }
            }}
            onMouseOut={(e) => {
              if (!uploading && file) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }
            }}
          >
            {uploading ? 'Processing...' : 'Upload & Process'}
          </button>
          
          {/* Progress Message */}
          {progress && (
            <div style={{ 
              marginTop: '24px', 
              padding: '16px',
              background: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              textAlign: 'center'
            }}>
              <p style={{ 
                color: '#1e40af', 
                fontWeight: '600', 
                fontSize: '15px',
                margin: 0
              }}>
                {progress}
              </p>
            </div>
          )}
          
          {/* Status Message */}
          {message && (
            <div style={{ 
              marginTop: '24px', 
              padding: '16px',
              borderRadius: '8px',
              background: message.includes('failed') ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${message.includes('failed') ? '#fecaca' : '#bbf7d0'}`,
              textAlign: 'center'
            }}>
              <p style={{
                color: message.includes('failed') ? '#991b1b' : '#166534',
                fontWeight: '600',
                fontSize: '14px',
                margin: 0
              }}>
                {message}
              </p>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginTop: '50px',
          maxWidth: '1000px',
          margin: '50px auto 0'
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
              </svg>
            </div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#1a1a1a',
              marginBottom: '8px'
            }}>
              Fast Processing
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              lineHeight: '1.6',
              margin: 0
            }}>
              Local embeddings ensure quick processing without network delays
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#1a1a1a',
              marginBottom: '8px'
            }}>
              Secure & Private
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              lineHeight: '1.6',
              margin: 0
            }}>
              Your documents are processed locally and never leave your machine
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#1a1a1a',
              marginBottom: '8px'
            }}>
              Smart Analysis
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              lineHeight: '1.6',
              margin: 0
            }}>
              AI-powered understanding of your content for accurate answers
            </p>
          </div>
        </div>

        {/* Guidelines */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: '30px',
          marginTop: '40px',
          maxWidth: '800px',
          margin: '40px auto 0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            color: '#1a1a1a', 
            marginBottom: '20px',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Guidelines
          </h3>
          <ul style={{ 
            color: '#4b5563', 
            lineHeight: '2', 
            margin: 0,
            paddingLeft: '24px',
            fontSize: '15px'
          }}>
            <li>Upload PDFs with clear, readable text (not scanned images)</li>
            <li>Maximum file size: 10 MB</li>
            <li>The system will create a searchable knowledge base from your content</li>
            <li>Processing typically takes 5-15 seconds depending on file size</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default UploadPage;
