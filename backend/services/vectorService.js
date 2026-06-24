const { randomUUID } = require('crypto');
const { QdrantClient } = require('@qdrant/js-client-rest');

const {
  QDRANT_URL,
  QDRANT_API_KEY,
  QDRANT_COLLECTION
} = process.env;

if (!QDRANT_URL || !QDRANT_API_KEY || !QDRANT_COLLECTION) {
  throw new Error(
    'Missing Qdrant configuration. Set QDRANT_URL, QDRANT_API_KEY, and QDRANT_COLLECTION in your environment.'
  );
}

const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY
});

const COLLECTION_NAME = QDRANT_COLLECTION;

async function ensureCollection() {
  try {
    await qdrantClient.getCollection(COLLECTION_NAME);
    // Collection exists, do nothing
  } catch (error) {
    // Collection not found, create it
    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 384,         // IMPORTANT: use 384, NOT 1536
                          // because the project uses Xenova/all-MiniLM-L6-v2
                          // which outputs 384-dimensional vectors
        distance: 'Cosine'
      }
    });
  }
}

async function saveVectors(chunks) {
  if (!Array.isArray(chunks)) {
    throw new Error('saveVectors expects an array of { text, embedding } objects');
  }

  await ensureCollection();

  const points = chunks.map((chunk) => ({
    id: randomUUID(),
    vector: chunk.embedding,
    payload: {
      text: chunk.text
    }
  }));

  await qdrantClient.upsert(COLLECTION_NAME, { points });
}

async function searchVectors(queryEmbedding, topK = 3) {
  if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
    throw new Error('searchVectors requires a non-empty queryEmbedding array');
  }

  await ensureCollection();

  const results = await qdrantClient.search(COLLECTION_NAME, {
    vector: queryEmbedding,
    limit: topK,
    with_payload: true
  });

  return results
    .map((result) => ({
      text: result.payload?.text || '',
      score: result.score
    }))
    .filter((item) => item.text && item.text.length > 0);
}

module.exports = {
  saveVectors,
  searchVectors
};
