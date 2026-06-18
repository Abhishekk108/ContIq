const express = require('express');
const router = express.Router();
const ragService = require('../services/ragService');

// POST /query - Handle user questions
router.post('/', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log('Received question:', question);

    // Execute full RAG pipeline
    const result = await ragService.generateAnswer(question);

    res.json({
      answer: result.answer,
      sources: result.sources,
      status: 'success'
    });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ 
      error: error.message,
      status: 'failed'
    });
  }
});

module.exports = router;
