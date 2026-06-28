/**
 * Script to clear all vectors from Qdrant collection
 * Run this to remove old/stale data from previous uploads
 * 
 * Usage: node clearQdrant.js
 */

require('dotenv').config();
const { clearAllVectors } = require('./services/vectorService');

async function main() {
  try {
    console.log('🗑️  Clearing all vectors from Qdrant...');
    console.log('Collection:', process.env.QDRANT_COLLECTION);
    console.log('');
    
    await clearAllVectors();
    
    console.log('✅ Successfully cleared all vectors!');
    console.log('📝 The collection has been recreated and is ready for new uploads.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Upload your resume or documents again');
    console.log('2. The system will now only use the newly uploaded content');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing Qdrant:', error.message);
    process.exit(1);
  }
}

main();
