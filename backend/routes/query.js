const express = require('express');
const router = express.Router();
const { generateAnswer, streamAnswer } = require('../services/ragService');
const auth = require('../middleware/auth');
const Document = require('../models/Document');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

// POST /query - Handle user questions
router.post('/', auth, async (req, res) => {
  try {
    const { question, conversationHistory = [], fileId = null, chatId = null } = req.body;
    
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log('Received question:', question);

    // Verify chat ownership when chatId is provided
    if (chatId) {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found', status: 'failed' });
      }
      if (chat.user.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Access denied. You do not own this chat', status: 'failed' });
      }
    }

    // Resolve the set of fileIds this user is allowed to search
    const allowedFileIds = await getUserFileIds(req.user.id, fileId);

    if (allowedFileIds.length === 0) {
      return res.status(404).json({
        error: 'No documents found. Please upload a PDF first.',
        status: 'failed'
      });
    }

    console.log(`Searching across ${allowedFileIds.length} document(s) for user ${req.user.id}`);

    // Save user message before generating answer
    if (chatId) {
      await Message.create({
        chat: chatId,
        role: 'user',
        content: question.trim()
      });
    }

    // Execute full RAG pipeline with user-scoped fileIds
    const result = await generateAnswer(question, conversationHistory, allowedFileIds);

    // Save assistant response after generation
    if (chatId) {
      await Message.create({
        chat: chatId,
        role: 'assistant',
        content: result.answer,
        sources: result.sources
      });
    }

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
router.post('/stream', auth, async (req, res) => {
  try {
    const { question, conversationHistory = [], fileId = null, chatId = null } = req.body;
    
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log('Received streaming question:', question);

    // Verify chat ownership when chatId is provided
    if (chatId) {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found', status: 'failed' });
      }
      if (chat.user.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Access denied. You do not own this chat', status: 'failed' });
      }
    }

    // Resolve the set of fileIds this user is allowed to search
    const allowedFileIds = await getUserFileIds(req.user.id, fileId);

    if (allowedFileIds.length === 0) {
      return res.status(404).json({
        error: 'No documents found. Please upload a PDF first.',
        status: 'failed'
      });
    }

    console.log(`Streaming across ${allowedFileIds.length} document(s) for user ${req.user.id}`);

    // Save user message before streaming begins
    if (chatId) {
      await Message.create({
        chat: chatId,
        role: 'user',
        content: question.trim()
      });
    }

    // Execute RAG pipeline with streaming and user-scoped fileIds
    // streamAnswer returns { answer, sources } after the stream closes
    const result = await streamAnswer(question, res, conversationHistory, allowedFileIds);

    // Save assistant response after streaming completes
    if (chatId && result) {
      await Message.create({
        chat: chatId,
        role: 'assistant',
        content: result.answer,
        sources: result.sources
      });
    }

  } catch (error) {
    console.error('Streaming query error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: error.message,
        status: 'failed'
      });
    } else {
      res.end();
    }
  }
});

/**
 * Resolve which Qdrant fileIds the user is allowed to search.
 *
 * - If the client selected a specific fileId, verify it is owned by
 *   this user before allowing it — prevents cross-user data leakage.
 * - Otherwise return all fileIds from this user's uploaded documents.
 *
 * @param {string} userId            - Authenticated user's MongoDB _id
 * @param {string|null} requestedFileId - Optional fileId from request body
 * @returns {Promise<string[]>} Array of allowed Qdrant fileIds
 */
async function getUserFileIds(userId, requestedFileId) {
  if (requestedFileId) {
    // Verify the requested fileId actually belongs to this user
    const doc = await Document.findOne({ user: userId, fileId: requestedFileId }).select('fileId');
    if (!doc) {
      // File doesn't exist or belongs to another user — return empty to
      // trigger a 404 rather than silently searching all user docs
      return [];
    }
    return [requestedFileId];
  }

  // No specific file selected — search across all of the user's documents
  const docs = await Document.find({ user: userId }).select('fileId');
  return docs.map(d => d.fileId);
}

module.exports = router;
