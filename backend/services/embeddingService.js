const { pipeline } = require('@xenova/transformers');

// Global extractor instance
let extractor = null;

/**
 * Initialize the embedding model (call once on server start)
 * Downloads the model on first run (~50MB), then caches locally
 */
async function initEmbedding() {
  if (extractor) {
    console.log('[Embedding] Model already initialized');
    return;
  }

  console.log('[Embedding] Initializing local embedding model...');
  console.log('[Embedding] Downloading Xenova/all-MiniLM-L6-v2 (first time only)...');
  
  try {
    extractor = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
    
    console.log('[Embedding] Model initialized successfully');
    console.log('[Embedding] Model is cached locally - future starts will be instant');
  } catch (error) {
    console.error('[Embedding] Failed to initialize model:', error.message);
    throw error;
  }
}

/**
 * Generate embedding vector for text using local model
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector (384 dimensions)
 */
async function getEmbedding(text) {
  try {
    if (!extractor) {
      throw new Error('Embedding model not initialized. Call initEmbedding() first.');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    // Generate embedding with mean pooling and normalization
    const output = await extractor(text, {
      pooling: 'mean',
      normalize: true,
    });

    // Convert tensor to regular array
    const embedding = Array.from(output.data);

    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error('Invalid embedding generated');
    }

    return embedding;
    
  } catch (error) {
    console.error('[Embedding] Generation error:', error.message);
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
}

/**
 * Generate embeddings for multiple texts
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
async function getEmbeddings(texts) {
  const embeddings = [];
  
  console.log(`[Embedding] Generating ${texts.length} embeddings locally...`);
  
  for (let i = 0; i < texts.length; i++) {
    console.log(`[Embedding] Processing chunk ${i + 1}/${texts.length}...`);
    
    try {
      const embedding = await getEmbedding(texts[i]);
      embeddings.push(embedding);
    } catch (error) {
      console.error(`[Embedding] Failed to generate embedding for chunk ${i + 1}`);
      throw error;
    }
  }
  
  console.log(`[Embedding] Successfully generated all ${embeddings.length} embeddings`);
  return embeddings;
}

module.exports = {
  initEmbedding,
  getEmbedding,
  getEmbeddings,
};
