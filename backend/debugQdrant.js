// Debug script to inspect Qdrant collection data
require('dotenv').config();
const { QdrantClient } = require('@qdrant/js-client-rest');

const {
  QDRANT_URL,
  QDRANT_API_KEY,
  QDRANT_COLLECTION
} = process.env;

const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY
});

const COLLECTION_NAME = QDRANT_COLLECTION;

async function debugCollection() {
  try {
    console.log('=== QDRANT DEBUG INFO ===\n');
    
    // Get collection info
    console.log('Collection Name:', COLLECTION_NAME);
    const collectionInfo = await qdrantClient.getCollection(COLLECTION_NAME);
    console.log('Total Points:', collectionInfo.points_count);
    console.log('Vector Size:', collectionInfo.config.params.vectors.size);
    console.log('Distance:', collectionInfo.config.params.vectors.distance);
    
    // Get payload indexes
    console.log('\n=== PAYLOAD INDEXES ===');
    if (collectionInfo.payload_schema) {
      console.log(JSON.stringify(collectionInfo.payload_schema, null, 2));
    } else {
      console.log('No payload schema found');
    }
    
    // Scroll through all points to see their metadata
    console.log('\n=== SAMPLE POINTS (First 10) ===');
    const scrollResult = await qdrantClient.scroll(COLLECTION_NAME, {
      limit: 10,
      with_payload: true,
      with_vector: false
    });
    
    if (scrollResult.points && scrollResult.points.length > 0) {
      scrollResult.points.forEach((point, idx) => {
        console.log(`\n--- Point ${idx + 1} ---`);
        console.log('ID:', point.id);
        console.log('Payload:');
        console.log('  fileId:', point.payload.fileId);
        console.log('  filename:', point.payload.filename);
        console.log('  text (first 100 chars):', point.payload.text?.substring(0, 100) + '...');
      });
      
      // Group by fileId to see distribution
      console.log('\n=== DISTRIBUTION BY FILE ===');
      const fileIdCounts = {};
      scrollResult.points.forEach(point => {
        const fileId = point.payload.fileId;
        const filename = point.payload.filename;
        if (!fileIdCounts[fileId]) {
          fileIdCounts[fileId] = { count: 0, filename };
        }
        fileIdCounts[fileId].count++;
      });
      
      Object.entries(fileIdCounts).forEach(([fileId, data]) => {
        console.log(`${data.filename} (${fileId}): ${data.count} chunks (in first 10)`);
      });
      
    } else {
      console.log('No points found in collection');
    }
    
  } catch (error) {
    console.error('Debug error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

debugCollection();
