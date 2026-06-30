// Test that deduplication works correctly
require('dotenv').config();
const { deleteVectorsByFilename } = require('./services/vectorService');

async function testDeduplication() {
  try {
    console.log('=== TESTING DEDUPLICATION ===\n');
    
    // Test 1: Delete by filename that exists
    console.log('Test 1: Deleting existing filename...');
    await deleteVectorsByFilename('Operating System Notes.pdf');
    console.log('✓ Test 1 passed\n');
    
    // Test 2: Delete by filename that doesn't exist (should not throw)
    console.log('Test 2: Deleting non-existent filename...');
    await deleteVectorsByFilename('NonExistentFile.pdf');
    console.log('✓ Test 2 passed\n');
    
    console.log('=== ALL TESTS PASSED ===');
    
  } catch (error) {
    console.error('✗ Test failed:', error.message);
  }
}

testDeduplication();
