const mongoose = require('mongoose');

/**
 * Document Schema
 * Tracks every PDF uploaded by a user, including its Qdrant metadata
 */
const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    filename: {
      type: String,
      required: [true, 'Filename is required'],
      trim: true
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    qdrantCollection: {
      type: String,
      required: [true, 'Qdrant collection name is required'],
      trim: true
    },
    chunkCount: {
      type: Number,
      required: [true, 'Chunk count is required'],
      min: [1, 'Chunk count must be at least 1']
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt automatically
  }
);

// Index for fast lookups by user
documentSchema.index({ user: 1 });

// Index for fast lookups by user + filename combination
documentSchema.index({ user: 1, filename: 1 });

module.exports = mongoose.model('Document', documentSchema);
