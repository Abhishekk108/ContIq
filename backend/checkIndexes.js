/**
 * Script to check if payload indexes exist in Qdrant collection
 * Usage: node checkIndexes.js
 */

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

async function main() {
  try {
    console.log('🔍 Checking Qdrant collection indexes...');
    console.log('Collection:', QDRANT_COLLECTION);
    console.log('');
    
    const collectionInfo = await qdrantClient.getCollection(QDRANT_COLLECTION);
    
    console.log('📊 Collection Info:');
    console.log('- Vectors count:', collectionInfo.points_count);
    console.log('- Vector size:', collectionInfo.config.params.vectors.size);
    console.log('');
    
    console.log('📑 Payload Schema:');
    if (collectionInfo.payload_schema) {
      console.log(JSON.stringify(collectionInfo.payload_schema, null, 2));
    } else {
      console.log('⚠️  No payload schema found');
    }
    
    console.log('');
    
    // Check if indexes exist
    const hasFileIdIndex = collectionInfo.payload_schema?.fileId?.index === true || 
                          collectionInfo.payload_schema?.fileId?.data_type === 'keyword';
    const hasFilenameIndex = collectionInfo.payload_schema?.filename?.index === true ||
                            collectionInfo.payload_schema?.filename?.data_type === 'keyword';
    
    if (hasFileIdIndex) {
      console.log('✅ fileId index: FOUND');
    } else {
      console.log('❌ fileId index: NOT FOUND');
    }
    
    if (hasFilenameIndex) {
      console.log('✅ filename index: FOUND');
    } else {
      console.log('❌ filename index: NOT FOUND');
    }
    
    console.log('');
    
    if (hasFileIdIndex && hasFilenameIndex) {
      console.log('✅ All required indexes are present!');
      console.log('📝 Filtering by fileId and filename will work.');
    } else {
      console.log('❌ Some indexes are missing!');
      console.log('🔧 Run: node addIndexes.js');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
