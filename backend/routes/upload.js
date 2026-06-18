const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdfService = require('../services/pdfService');
const chunkService = require('../services/chunkService');
const embeddingService = require('../services/embeddingService');
const vectorService = require('../services/vectorService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// POST /upload - Handle PDF upload
router.post('/', upload.single('pdf'), async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    filePath = req.file.path;
    console.log('PDF uploaded:', filePath);

    // Step 1: Extract text from PDF
    console.log('Extracting text from PDF...');
    const text = await pdfService.extractText(filePath);
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text could be extracted from the PDF');
    }
    
    console.log(`Extracted ${text.length} characters`);

    // Step 2: Chunk the text
    console.log('Chunking text...');
    const chunks = chunkService.chunkText(text, 800, 100);
    console.log(`Created ${chunks.length} chunks`);

    if (chunks.length === 0) {
      throw new Error('No valid chunks created from the text');
    }

    // Step 3: Generate embeddings
    console.log('Generating embeddings...');
    const embeddings = await embeddingService.getEmbeddings(chunks);
    console.log(`Generated ${embeddings.length} embeddings`);

    // Step 4: Store vectors
    console.log('Storing vectors...');
    const vectors = chunks.map((text, index) => ({
      text,
      embedding: embeddings[index]
    }));
    
    await vectorService.saveVectors(vectors);
    console.log('Vectors saved successfully');

    // Clean up uploaded file
    await fs.unlink(filePath);

    res.json({ 
      message: 'PDF processed successfully',
      chunksCreated: chunks.length,
      status: 'success'
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if it exists
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      error: error.message,
      status: 'failed'
    });
  }
});

module.exports = router;
