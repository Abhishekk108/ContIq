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
    // Collection not found, create it with payload indexes
    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 384,         // IMPORTANT: use 384, NOT 1536
                          // because the project uses Xenova/all-MiniLM-L6-v2
                          // which outputs 384-dimensional vectors
        distance: 'Cosine'
      }
    });
    
    // Create indexes for fileId and filename to enable filtering
    await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
      field_name: 'fileId',
      field_schema: 'keyword'
    });
    
    await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
      field_name: 'filename',
      field_schema: 'keyword'
    });
    
    console.log('Collection created with payload indexes for fileId and filename');
  }
}

async function saveVectors(chunks) {
  if (!Array.isArray(chunks)) {
    throw new Error('saveVectors expects an array of { text, embedding, fileId, filename } objects');
  }

  await ensureCollection();

  const points = chunks.map((chunk) => ({
    id: randomUUID(),
    vector: chunk.embedding,
    payload: {
      text: chunk.text,
      fileId: chunk.fileId,
      filename: chunk.filename
    }
  }));

  await qdrantClient.upsert(COLLECTION_NAME, { points });
}

async function searchVectors(queryEmbedding, topK = 3, fileId = null) {
  if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
    throw new Error('searchVectors requires a non-empty queryEmbedding array');
  }

  await ensureCollection();

  const searchParams = {
    vector: queryEmbedding,
    limit: topK,
    with_payload: true
  };

  // Add filter if fileId is provided
  if (fileId) {
    searchParams.filter = {
      must: [
        { key: 'fileId', match: { value: fileId } }
      ]
    };
  }

  const results = await qdrantClient.search(COLLECTION_NAME, searchParams);

  return results.map((r) => ({
    text: r.payload.text,
    score: r.score,
    fileId: r.payload.fileId,
    filename: r.payload.filename
  }));
}

async function deleteVectorsByFileId(fileId) {
  if (!fileId) {
    throw new Error('fileId is required for deletion');
  }

  await ensureCollection();

  await qdrantClient.delete(COLLECTION_NAME, {
    filter: {
      must: [
        { key: 'fileId', match: { value: fileId } }
      ]
    }
  });

  console.log(`Deleted all vectors for fileId: ${fileId}`);
}

async function deleteVectorsByFilename(filename) {
  if (!filename) {
    throw new Error('filename is required for deletion');
  }

  await ensureCollection();

  try {
    // Count points before deletion
    const scrollBefore = await qdrantClient.scroll(COLLECTION_NAME, {
      filter: {
        must: [
          { key: 'filename', match: { value: filename } }
        ]
      },
      limit: 1,
      with_payload: false,
      with_vector: false
    });

    await qdrantClient.delete(COLLECTION_NAME, {
      filter: {
        must: [
          { key: 'filename', match: { value: filename } }
        ]
      }
    });

    console.log(`Deleted all existing vectors for filename: ${filename}`);
  } catch (error) {
    console.log(`No existing vectors found for filename: ${filename} (or deletion failed)`);
  }
}

async function clearAllVectors() {
  try {
    // Delete the entire collection
    await qdrantClient.deleteCollection(COLLECTION_NAME);
    console.log('Collection deleted');
    
    // Recreate it
    await ensureCollection();
    console.log('Collection recreated');
  } catch (error) {
    console.error('Error clearing vectors:', error);
    throw error;
  }
}

module.exports = {
  saveVectors,
  searchVectors,
  deleteVectorsByFileId,
  deleteVectorsByFilename,
  clearAllVectors
};
