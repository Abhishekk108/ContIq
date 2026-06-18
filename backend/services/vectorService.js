const fs = require('fs').promises;
const path = require('path');

const VECTOR_FILE = path.join(__dirname, '../data/vectors.json');

/**
 * Save vectors to JSON file
 * @param {Array<{text: string, embedding: number[]}>} vectors
 */
async function saveVectors(vectors) {
  try {
    await fs.writeFile(VECTOR_FILE, JSON.stringify(vectors, null, 2));
  } catch (error) {
    throw new Error(`Failed to save vectors: ${error.message}`);
  }
}

/**
 * Load vectors from JSON file
 * @returns {Promise<Array<{text: string, embedding: number[]}>>}
 */
async function loadVectors() {
  try {
    const data = await fs.readFile(VECTOR_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw new Error(`Failed to load vectors: ${error.message}`);
  }
}

module.exports = {
  saveVectors,
  loadVectors
};
