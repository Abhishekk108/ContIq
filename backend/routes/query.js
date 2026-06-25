const express = require('express');
const router = express.Router();
const { generateAnswer, streamAnswer } = require('../services/ragService');

// POST /query - Handle user questions
router.post('/', async (req, res) => {
  try {
    const { question, conversationHistory = [] } = req.body;
    
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log('Received question:', question);

    // Execute full RAG pipeline with conversation history
    const result = await generateAnswer(question, conversationHistory);

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

// POST /query/stream - Handle user questions with streaming response
router.post('/stream', async (req, res) => {
  try {
    const { question, conversationHistory = [] } = req.body;
    
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log('Received streaming question:', question);

    // Execute RAG pipeline with streaming
    // streamAnswer handles setting SSE headers and writing to res
    await streamAnswer(question, res, conversationHistory);
    
  } catch (error) {
    console.error('Streaming query error:', error);
    
    // Only send JSON error if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({ 
        error: error.message,
        status: 'failed'
      });
    } else {
      // Headers already sent, just end the stream
      res.end();
    }
  }
});

module.exports = router;
