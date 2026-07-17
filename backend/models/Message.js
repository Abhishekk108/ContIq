const mongoose = require('mongoose');

/**
 * Message Schema
 * Represents a single message within a chat session
 */
const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: [true, 'Chat is required']
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: [true, 'Role is required']
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    sources: {
      type: Array,
      default: []
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
);

// Export the Message model
module.exports = mongoose.model('Message', messageSchema);
