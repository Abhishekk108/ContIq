// List all unique files in Qdrant collection
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

async function listAllFiles() {
  try {
    console.log('=== ALL FILES IN QDRANT ===\n');
    
    const collectionInfo = await qdrantClient.getCollection(COLLECTION_NAME);
    console.log('Total Points:', collectionInfo.points_count);
    
    // Scroll through ALL points
    let allPoints = [];
    let offset = null;
    
    do {
      const scrollResult = await qdrantClient.scroll(COLLECTION_NAME, {
        limit: 100,
        with_payload: true,
        with_vector: false,
        offset: offset
      });
      
      allPoints = allPoints.concat(scrollResult.points);
      offset = scrollResult.next_page_offset;
      
    } while (offset);
    
    console.log('Retrieved all', allPoints.length, 'points\n');
    
    // Group by fileId
    const fileMap = {};
    allPoints.forEach(point => {
      const fileId = point.payload.fileId;
      const filename = point.payload.filename;
      
      if (!fileMap[fileId]) {
        fileMap[fileId] = {
          filename,
          chunkCount: 0
        };
      }
      fileMap[fileId].chunkCount++;
    });
    
    console.log('=== FILES BREAKDOWN ===\n');
    Object.entries(fileMap).forEach(([fileId, data]) => {
      console.log(`File: ${data.filename}`);
      console.log(`  FileID: ${fileId}`);
      console.log(`  Chunks: ${data.chunkCount}`);
      console.log('');
    });
    
    console.log(`Total unique files: ${Object.keys(fileMap).length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listAllFiles();
