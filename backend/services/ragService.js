const Groq = require('groq-sdk');
const embeddingService = require('./embeddingService');
const vectorService = require('./vectorService');
const { getTopK } = require('../utils/similarity');

// Initialize Groq only if API key is provided
let groq = null;
if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'placeholder_key') {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });
}

/**
 * Generate answer using RAG pipeline
 * @param {string} query - User question
 * @returns {Promise<{answer: string, sources: Array}>}
 */
async function generateAnswer(query) {
  try {
    if (!groq) {
      throw new Error('Groq API key not configured');
    }

    console.log('Starting RAG pipeline for query:', query);

    // Step 1: Embed the query
    console.log('Embedding query...');
    const queryEmbedding = await embeddingService.getEmbedding(query);

    // Step 2: Load stored vectors
    console.log('Loading stored vectors...');
    const storedVectors = await vectorService.loadVectors();
    
    if (storedVectors.length === 0) {
      throw new Error('No documents have been uploaded yet. Please upload a PDF first.');
    }

    // Step 3: Find top K similar chunks
    console.log('Finding similar chunks...');
    const topChunks = getTopK(queryEmbedding, storedVectors, 3);
    
    // Step 4: Build prompt with context
    const context = topChunks.map(chunk => chunk.text).join('\n\n---\n\n');
    
    const prompt = `You are an AI placement assistant helping students prepare for technical interviews.

Use ONLY the context below to answer the question. Do not use outside knowledge.
If the answer cannot be found in the context, say "I cannot find this information in the uploaded material."

Context:
${context}

Instructions:
- Provide clear, detailed explanations with examples when possible
- If asked to generate interview questions, create relevant questions based on the context
- Stay focused on placement preparation and technical concepts
- Be encouraging and supportive in your tone

User Question: ${query}

Answer:`;

    // Step 5: Call Groq LLM with latest model
    console.log('Calling Groq LLM...');
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Latest Groq model
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1024
    });

    const answer = response.choices[0]?.message?.content || 'No answer generated';

    // Step 6: Return answer and sources
    const sources = topChunks.map(chunk => ({
      text: chunk.text.substring(0, 200) + (chunk.text.length > 200 ? '...' : ''),
      score: chunk.score
    }));

    console.log('RAG pipeline completed successfully');

    return {
      answer,
      sources
    };
  } catch (error) {
    console.error('RAG generation error:', error);
    throw new Error(`RAG generation failed: ${error.message}`);
  }
}

module.exports = {
  generateAnswer
};
