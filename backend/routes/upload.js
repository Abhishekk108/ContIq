const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
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

    // Generate unique file ID and capture filename
    const fileId = uuidv4();
    const filename = req.file.originalname;

    filePath = req.file.path;
    console.log('PDF uploaded:', filePath);
    console.log('File ID:', fileId);
    console.log('Filename:', filename);

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

    // Step 4: Delete old versions of this file (by filename) before storing new one
    console.log('Checking for existing versions of this file...');
    await vectorService.deleteVectorsByFilename(filename);
    console.log('Old versions deleted (if any)');
    
    // Step 5: Store vectors with metadata
    console.log('Storing vectors...');
    const chunksWithMeta = chunks.map((text, i) => ({
      text,
      fileId,
      filename
    }));
    
    const vectors = chunksWithMeta.map((chunk, index) => ({
      text: chunk.text,
      embedding: embeddings[index],
      fileId: chunk.fileId,
      filename: chunk.filename
    }));
    
    await vectorService.saveVectors(vectors);
    console.log('Vectors saved successfully with metadata');

    // Clean up uploaded file
    await fs.unlink(filePath);

    res.json({ 
      success: true,
      fileId,
      filename,
      chunkCount: chunks.length,
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
