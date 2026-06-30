// Remove duplicate PDFs keeping only the latest upload of each filename
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

async function removeDuplicates() {
  try {
    console.log('=== REMOVING DUPLICATE FILES ===\n');
    
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
    
    console.log('Total points:', allPoints.length);
    
    // Group by filename to find duplicates
    const filenameMap = {};
    allPoints.forEach(point => {
      const filename = point.payload.filename;
      const fileId = point.payload.fileId;
      
      if (!filenameMap[filename]) {
        filenameMap[filename] = [];
      }
      
      if (!filenameMap[filename].some(f => f.fileId === fileId)) {
        filenameMap[filename].push({
          fileId,
          pointIds: []
        });
      }
      
      const fileEntry = filenameMap[filename].find(f => f.fileId === fileId);
      fileEntry.pointIds.push(point.id);
    });
    
    // Identify and remove duplicates (keep only the last fileId for each filename)
    console.log('\n=== FILES ANALYSIS ===\n');
    
    for (const [filename, files] of Object.entries(filenameMap)) {
      console.log(`\nFilename: ${filename}`);
      console.log(`Versions found: ${files.length}`);
      
      if (files.length > 1) {
        console.log('⚠️  DUPLICATE DETECTED');
        
        files.forEach((file, idx) => {
          console.log(`  Version ${idx + 1}: ${file.fileId} (${file.pointIds.length} chunks)`);
        });
        
        // Keep the last version (assuming it's the most recent)
        // Delete all but the last one
        const filesToDelete = files.slice(0, -1);
        const fileToKeep = files[files.length - 1];
        
        console.log(`\n  ✓ KEEPING: ${fileToKeep.fileId} (${fileToKeep.pointIds.length} chunks)`);
        
        for (const fileToDelete of filesToDelete) {
          console.log(`  ✗ DELETING: ${fileToDelete.fileId} (${fileToDelete.pointIds.length} chunks)`);
          
          // Delete by fileId filter
          await qdrantClient.delete(COLLECTION_NAME, {
            filter: {
              must: [
                { key: 'fileId', match: { value: fileToDelete.fileId } }
              ]
            }
          });
          
          console.log(`    Deleted ${fileToDelete.pointIds.length} points`);
        }
      } else {
        console.log(`  Single version: ${files[0].fileId} (${files[0].pointIds.length} chunks)`);
      }
    }
    
    console.log('\n=== CLEANUP COMPLETE ===');
    
    // Show final count
    const finalInfo = await qdrantClient.getCollection(COLLECTION_NAME);
    console.log(`\nFinal point count: ${finalInfo.points_count}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

removeDuplicates();
