/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} a - First vector
 * @param {number[]} b - Second vector
 * @returns {number} - Similarity score (0-1)
 */
function cosineSimilarity(a, b) {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  
  return dot / (magA * magB);
}

/**
 * Get top K most similar vectors
 * @param {number[]} queryVector - Query embedding
 * @param {Array<{text: string, embedding: number[]}>} storedVectors - Stored vectors
 * @param {number} k - Number of results to return
 * @returns {Array<{text: string, embedding: number[], score: number}>}
 */
function getTopK(queryVector, storedVectors, k = 3) {
  return storedVectors
    .map(item => ({
      ...item,
      score: cosineSimilarity(queryVector, item.embedding)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

module.exports = {
  cosineSimilarity,
  getTopK
};
