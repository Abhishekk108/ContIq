const mongoose = require('mongoose');

/**
 * Chat Schema
 * Represents a conversation session belonging to a user
 */
const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    title: {
      type: String,
      default: 'New Chat'
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
);

// Export the Chat model
module.exports = mongoose.model('Chat', chatSchema);
