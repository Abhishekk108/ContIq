import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './UploadPage.css';

function UploadPage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setMessage('');
    
    if (selectedFiles.length > 0) {
      const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);
      const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      setMessage(`Selected ${selectedFiles.length} file(s) - Total: ${totalSizeMB} MB`);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage('Please select at least one PDF file');
      return;
    }

    // Check all files are PDFs
    const nonPdfFiles = files.filter(f => f.type !== 'application/pdf');
    if (nonPdfFiles.length > 0) {
      setMessage(`Please select only PDF files. Found: ${nonPdfFiles.map(f => f.name).join(', ')}`);
      return;
    }

    setUploading(true);
    setProgress('Starting upload...');
    setMessage('');
    const uploaded = [];

    try {
      // Upload each file sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(`Uploading ${i + 1}/${files.length}: ${file.name}`);
        
        const formData = new FormData();
        formData.append('pdf', file);

        const response = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(`Uploading ${i + 1}/${files.length}: ${file.name} (${percentCompleted}%)`);
          }
        });
        
        uploaded.push({
          fileId: response.data.fileId,
          filename: response.data.filename
        });
      }
      
      setProgress('All files processed successfully!');
      setMessage(`Success! Uploaded ${uploaded.length} PDF(s). Redirecting to chat...`);
      
      setTimeout(() => {
        navigate('/chat', { 
          state: { 
            uploadedFiles: uploaded
          }
        });
      }, 2500);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setMessage(`Upload failed: ${errorMsg}`);
      setProgress('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-page__container">
        {/* Header Section */}
        <div className="upload-page__header">
          <h1 className="upload-page__title">Upload Your Study Material</h1>
          <p className="upload-page__subtitle">
            Transform your PDFs into an intelligent knowledge base. Upload your placement preparation notes, DSA concepts, or interview materials to get started.
          </p>
        </div>

        {/* Main Upload Card */}
        <div className="upload-page__card">
          <div className="upload-page__dropzone">
            <div className="upload-page__dropzone-icon-wrapper">
              <svg
                className="upload-page__dropzone-icon"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#115CF9"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>

            <label htmlFor="file-upload" className="upload-page__upload-label">
              Choose PDF Files
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileChange}
              className="upload-page__hidden-input"
            />

            <p className="upload-page__file-note">or drag and drop your files here (multiple selection supported)</p>
          </div>

          {files.length > 0 && (
            <div className="upload-page__file-info">
              {files.map((file, index) => (
                <div key={index} style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px'}}>
                  <svg
                    className="upload-page__file-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#115CF9"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <div className="upload-page__file-details">
                    <p className="upload-page__file-name">{file.name}</p>
                    <p className="upload-page__file-message">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="upload-page__button"
          >
            {uploading ? 'Processing...' : `Upload & Process ${files.length > 0 ? `(${files.length} file${files.length > 1 ? 's' : ''})` : ''}`}
          </button>

          {progress && (
            <div className="upload-page__status upload-page__status--progress">
              <p>{progress}</p>
            </div>
          )}

          {message && (
            <div className={`upload-page__status ${message.includes('failed') ? 'upload-page__status--error' : 'upload-page__status--success'}`}>
              <p>{message}</p>
            </div>
          )}
        </div>

        <div className="upload-page__info-grid">
          <div className="upload-page__info-card">
            <div className="upload-page__info-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
              </svg>
            </div>
            <h3 className="upload-page__info-title">Fast Processing</h3>
            <p className="upload-page__info-text">Local embeddings ensure quick processing without network delays</p>
          </div>

          <div className="upload-page__info-card">
            <div className="upload-page__info-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3 className="upload-page__info-title">Secure & Private</h3>
            <p className="upload-page__info-text">Your documents are processed locally and never leave your machine</p>
          </div>

          <div className="upload-page__info-card">
            <div className="upload-page__info-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3 className="upload-page__info-title">Smart Analysis</h3>
            <p className="upload-page__info-text">AI-powered understanding of your content for accurate answers</p>
          </div>
        </div>

        <div className="upload-page__guidelines">
          <h3 className="upload-page__guidelines-title">Guidelines</h3>
          <ul className="upload-page__guidelines-list">
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
