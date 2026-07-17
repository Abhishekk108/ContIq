const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createChat,
  getChats,
  getChatById,
  deleteChat
} = require('../controllers/chatController');

/**
 * Chat Routes
 * All routes are protected by JWT auth middleware
 */

// @route   POST /chat
// @desc    Create a new chat
// @access  Private
router.post('/', auth, createChat);

// @route   GET /chat
// @desc    Get all chats for authenticated user (newest first)
// @access  Private
router.get('/', auth, getChats);

// @route   GET /chat/:id
// @desc    Get chat details and all messages
// @access  Private
router.get('/:id', auth, getChatById);

// @route   DELETE /chat/:id
// @desc    Delete chat and associated messages
// @access  Private
router.delete('/:id', auth, deleteChat);

module.exports = router;
