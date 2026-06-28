/**
 * Script to add payload indexes to existing Qdrant collection
 * Run this to add indexes for fileId and filename filtering
 * 
 * Usage: node addIndexes.js
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
    console.log('🔧 Adding payload indexes to Qdrant collection...');
    console.log('Collection:', QDRANT_COLLECTION);
    console.log('');
    
    // Check if collection exists
    try {
      await qdrantClient.getCollection(QDRANT_COLLECTION);
      console.log('✅ Collection found');
    } catch (error) {
      console.log('❌ Collection does not exist. Please upload a document first.');
      process.exit(1);
    }
    
    // Add index for fileId
    console.log('📝 Creating index for "fileId"...');
    try {
      await qdrantClient.createPayloadIndex(QDRANT_COLLECTION, {
        field_name: 'fileId',
        field_schema: 'keyword'
      });
      console.log('✅ Index created for "fileId"');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Index for "fileId" already exists');
      } else {
        throw error;
      }
    }
    
    // Add index for filename
    console.log('📝 Creating index for "filename"...');
    try {
      await qdrantClient.createPayloadIndex(QDRANT_COLLECTION, {
        field_name: 'filename',
        field_schema: 'keyword'
      });
      console.log('✅ Index created for "filename"');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Index for "filename" already exists');
      } else {
        throw error;
      }
    }
    
    console.log('');
    console.log('✅ All indexes added successfully!');
    console.log('📝 You can now filter by fileId and filename.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Upload a PDF');
    console.log('2. The system will automatically filter to that PDF');
    console.log('3. Use the file selector to switch between PDFs');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding indexes:', error.message);
    console.error('');
    console.error('If you see "collection not found", run clearQdrant.js first:');
    console.error('  node clearQdrant.js');
    process.exit(1);
  }
}

main();
