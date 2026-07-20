/**
 * Chat Controller
 * Handles CRUD operations for chat sessions and their messages
 */

const Chat = require('../models/Chat');
const Message = require('../models/Message');

/**
 * @desc    Create a new chat for the authenticated user
 * @route   POST /chat
 * @access  Private
 */
const createChat = async (req, res) => {
  try {
    const { title } = req.body;

    const chat = await Chat.create({
      user: req.user.id,
      title: title?.trim() || 'New Chat'
    });

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      chat
    });

  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating chat'
    });
  }
};

/**
 * @desc    Get all chats belonging to the authenticated user (newest first)
 * @route   GET /chat
 * @access  Private
 */
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select('_id title createdAt updatedAt');

    res.status(200).json({
      success: true,
      count: chats.length,
      chats
    });

  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chats'
    });
  }
};

/**
 * @desc    Get a single chat and all its messages
 * @route   GET /chat/:id
 * @access  Private
 */
const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify ownership
    if (chat.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this chat'
      });
    }

    // Fetch messages belonging to this chat in chronological order
    const messages = await Message.find({ chat: chat._id })
      .sort({ createdAt: 1 })
      .select('_id role content sources createdAt');

    res.status(200).json({
      success: true,
      chat,
      messages
    });

  } catch (error) {
    console.error('Get chat by id error:', error);

    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat'
    });
  }
};

/**
 * @desc    Update chat title
 * @route   PATCH /chat/:id
 * @access  Private
 */
const renameChat = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify ownership
    if (chat.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this chat'
      });
    }

    chat.title = title.trim();
    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Chat renamed successfully',
      chat
    });

  } catch (error) {
    console.error('Rename chat error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while renaming chat'
    });
  }
};

/**
 * @desc    Delete a chat and all associated messages
 * @route   DELETE /chat/:id
 * @access  Private
 */
const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify ownership
    if (chat.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this chat'
      });
    }

    // Delete all messages associated with this chat
    await Message.deleteMany({ chat: chat._id });

    // Delete the chat itself
    await chat.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Chat and associated messages deleted successfully'
    });

  } catch (error) {
    console.error('Delete chat error:', error);

    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting chat'
    });
  }
};

module.exports = {
  createChat,
  getChats,
  getChatById,
  renameChat,
  deleteChat
};
