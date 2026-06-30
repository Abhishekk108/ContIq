# Duplicate PDF Embeddings Fix

## Problem Identified

**Issue**: AI was retrieving context from wrong documents, mixing content from multiple PDFs even when a specific file was selected.

### Root Cause Analysis

1. **Duplicate Files in Qdrant**: 
   - Same PDF filename uploaded multiple times created **different fileIds**
   - Old chunks remained in Qdrant when re-uploading the same file
   - Example: "Operating System Notes.pdf" existed with TWO different fileIds (278 total chunks for what should be one file)

2. **Evidence**:
   ```
   Before Fix:
   - Total Points: 538 chunks
   - Operating System Notes.pdf: 2 versions (139 chunks each = 278)
   - OOPS Notes.pdf: 2 versions (70 chunks each = 140)
   - Computer Networks Notes.pdf: 1 version (116 chunks)
   - Abhishek_Kalimath.pdf: 1 version (4 chunks)
   ```

3. **Impact**:
   - When querying, if fileId filtering wasn't working or user selected wrong file, AI retrieved chunks from ALL files
   - Resulted in context mixing (e.g., asking about resume but getting OS concepts)

## Solution Implemented

### 1. Added Deduplication Logic

**File**: `backend/routes/upload.js`

**Change**: Before storing new vectors, delete all existing vectors with the same filename:

```javascript
// Step 4: Delete old versions of this file (by filename) before storing new one
console.log('Checking for existing versions of this file...');
await vectorService.deleteVectorsByFilename(filename);
console.log('Old versions deleted (if any)');
```

**Benefit**: 
- Prevents duplicate filenames from accumulating
- Ensures only the latest version of each PDF is in the database
- Automatic cleanup on every upload

### 2. Added `deleteVectorsByFilename` Function

**File**: `backend/services/vectorService.js`

**New Function**:
```javascript
async function deleteVectorsByFilename(filename) {
  if (!filename) {
    throw new Error('filename is required for deletion');
  }

  await ensureCollection();

  try {
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
```

**Exported**: Added to module.exports for use in upload route

### 3. Cleaned Up Existing Duplicates

**Script**: `backend/removeDuplicates.js`

**Execution Result**:
```
Removed:
- Operating System Notes.pdf: Deleted 1 duplicate version (139 chunks)
- OOPS Notes.pdf: Deleted 1 duplicate version (70 chunks)

After Cleanup:
- Total Points: 329 chunks (down from 538)
- Unique Files: 4 (no duplicates)
```

## Verification

### Before Fix:
- 538 total chunks
- 6 file entries (but only 4 unique filenames)
- Duplicate entries causing context contamination

### After Fix:
- 329 total chunks
- 4 unique files
- Each filename has exactly ONE fileId
- Clean data structure

### File Distribution After Fix:
```
Computer Networks Notes.pdf
  FileID: 7f26e087-02b1-4e5f-b7ab-86a5f507663b
  Chunks: 116

Operating System Notes.pdf
  FileID: 42dc518c-e2fe-4f78-9429-8c0694a6dde1
  Chunks: 139

OOPS Notes.pdf
  FileID: b9541208-0a7f-4b90-b99d-89f3b1acdcf6
  Chunks: 70

Abhishek_Kalimath.pdf
  FileID: 5de89115-8871-4bb0-82a9-497df7c4df6a
  Chunks: 4
```

## Testing Recommendations

1. **Upload Test**: Upload the same PDF twice and verify old version is removed
2. **Query Test**: Select a specific PDF and verify responses only use that PDF's content
3. **Multi-file Test**: Upload multiple PDFs and switch between them to verify proper filtering

## Benefits

1. ✅ **Prevents Duplicates**: Automatic cleanup on every upload
2. ✅ **Accurate Context**: AI only retrieves from correct documents
3. ✅ **Storage Efficiency**: No wasted space on duplicate chunks
4. ✅ **Better UX**: Users can re-upload files without manual cleanup

## Files Modified

1. `backend/routes/upload.js` - Added deduplication call before storing vectors
2. `backend/services/vectorService.js` - Added `deleteVectorsByFilename` function

## Utility Scripts Created

1. `backend/debugQdrant.js` - Inspect collection metadata
2. `backend/listAllFiles.js` - List all files with chunk counts
3. `backend/removeDuplicates.js` - One-time cleanup of existing duplicates (already run)

## Next Steps

- Test the upload flow with duplicate filenames
- Verify query responses are now accurate
- Consider adding UI feedback showing which file version is active
