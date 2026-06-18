/**
 * Split text into overlapping chunks
 * @param {string} text - Raw text to chunk
 * @param {number} size - Chunk size in characters
 * @param {number} overlap - Overlap size in characters
 * @returns {string[]} - Array of text chunks
 */
function chunkText(text, size = 800, overlap = 100) {
  const chunks = [];
  let start = 0;
  
  while (start < text.length) {
    chunks.push(text.slice(start, start + size));
    start += size - overlap;
  }
  
  return chunks.filter(chunk => chunk.trim().length > 0);
}

module.exports = {
  chunkText
};
