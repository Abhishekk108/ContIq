require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { initEmbedding } = require('./services/embeddingService');

const app = express();
const PORT = process.env.PORT || 5555;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const uploadRoute = require('./routes/upload');
const queryRoute = require('./routes/query');
const authRoute = require('./routes/auth');

app.use('/upload', uploadRoute);
app.use('/query', queryRoute);
app.use('/auth', authRoute);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Contiq Backend API is running',
    port: PORT,
    status: 'healthy',
    embeddingModel: 'Xenova/all-MiniLM-L6-v2 (local)'
  });
});

// Initialize services and start server
async function startServer() {
  try {
    console.log('[Server] Starting Contiq Backend...');
    
    // Connect to MongoDB
    await connectDB();
    
    // Initialize local embedding model
    await initEmbedding();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`[Server] Running on port ${PORT}`);
      console.log(`[Server] API URL: http://localhost:${PORT}`);
      console.log(`[Server] Embedding: Local model (no API calls needed)`);
      console.log(`[Server] Ready to accept requests`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error.message);
    process.exit(1);
  }
}

startServer();
