const Groq = require('groq-sdk');
const embeddingService = require('./embeddingService');
const { searchVectors } = require('./vectorService');

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
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @returns {Promise<{answer: string, sources: Array}>}
 */
async function generateAnswer(query, conversationHistory = []) {
  try {
    if (!groq) {
      throw new Error('Groq API key not configured');
    }

    console.log('Starting RAG pipeline for query:', query);

    // Step 1: Embed the query
    console.log('Embedding query...');
    const queryEmbedding = await embeddingService.getEmbedding(query);

    // Step 2: Search stored vectors in Qdrant
    console.log('Searching stored vectors...');
    const topChunks = await searchVectors(queryEmbedding, 3);

    if (topChunks.length === 0) {
      throw new Error('No documents have been uploaded yet. Please upload a PDF first.');
    }
    
    // Step 4: Build prompt with context and conversation history
    const context = topChunks.map(chunk => chunk.text).join('\n\n---\n\n');
    
    // Build conversation history string from previous messages
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = '\n\nPrevious conversation:\n';
      conversationHistory.forEach(msg => {
        if (msg.role === 'user') {
          conversationContext += `User: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          conversationContext += `Assistant: ${msg.content}\n`;
        }
      });
      conversationContext += '\n---\n';
    }
    
    const prompt = `You are ContIQ, an AI placement assistant designed to help students prepare for technical interviews.

# Your Identity
**ContIQ** = Context + IQ — an intelligent document-based Q&A system that helps students master technical concepts from their uploaded study materials.

# Core Guidelines

## Response Formatting (CRITICAL)
- **Always use Markdown formatting** for professional, structured responses
- Use ## and ### for section headings
- **Bold important concepts, keywords, and definitions**
- Use bullet points for lists (avoid long paragraphs)
- Use numbered lists for steps, algorithms, and processes
- Use tables for comparisons, complexities, or side-by-side explanations
- Use \`code blocks\` for code examples, syntax, or commands
- **End every response with a "## 📌 Quick Summary" section** (2-3 key takeaways)

## Content Rules
- Use **ONLY** the provided document context — never use outside knowledge
- If the answer isn't in the context, clearly state: "I cannot find this information in the uploaded material."
- Summarize and paraphrase context — don't copy chunks verbatim
- Keep responses concise, accurate, and placement-focused
- Break complex topics into digestible sections
- Provide examples when possible

## Response Structure
For concept explanations:
1. Start with a brief definition (1-2 sentences)
2. Break down into subsections with headings
3. Use bullet points for key characteristics
4. Provide examples or use cases
5. End with Quick Summary

For interview questions:
1. Use numbered lists for questions
2. Provide hints or expected concepts for each
3. Categorize by difficulty if possible

## Tone
- Professional yet approachable
- Encouraging and supportive
- Technical but clear
- Focused on placement preparation success

---

# Document Context (Retrieved from uploaded material)
${context}
${conversationContext}

---

# User Question
${query}

---

# Your Response
Generate a well-structured, Markdown-formatted response following all guidelines above.`;

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

/**
 * Stream answer using RAG pipeline with SSE (Server-Sent Events)
 * @param {string} query - User question
 * @param {object} res - Express response object for streaming
 * @param {Array} conversationHistory - Previous messages in the conversation
 */
async function streamAnswer(query, res, conversationHistory = []) {
  try {
    if (!groq) {
      throw new Error('Groq API key not configured');
    }

    console.log('Starting RAG streaming pipeline for query:', query);

    // Step 1: Embed the query
    console.log('Embedding query...');
    const queryEmbedding = await embeddingService.getEmbedding(query);

    // Step 2: Search stored vectors in Qdrant
    console.log('Searching stored vectors...');
    const topChunks = await searchVectors(queryEmbedding, 3);

    if (topChunks.length === 0) {
      throw new Error('No documents have been uploaded yet. Please upload a PDF first.');
    }
    
    // Step 3: Build prompt with context and conversation history
    const context = topChunks.map(chunk => chunk.text).join('\n\n---\n\n');
    
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = '\n\nPrevious conversation:\n';
      conversationHistory.forEach(msg => {
        if (msg.role === 'user') {
          conversationContext += `User: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          conversationContext += `Assistant: ${msg.content}\n`;
        }
      });
      conversationContext += '\n---\n';
    }
    
    const prompt = `You are ContIQ, an AI placement assistant designed to help students prepare for technical interviews.

# Your Identity
**ContIQ** = Context + IQ — an intelligent document-based Q&A system that helps students master technical concepts from their uploaded study materials.

# Core Guidelines

## Response Formatting (CRITICAL)
- **Always use Markdown formatting** for professional, structured responses
- Use ## and ### for section headings
- **Bold important concepts, keywords, and definitions**
- Use bullet points for lists (avoid long paragraphs)
- Use numbered lists for steps, algorithms, and processes
- Use tables for comparisons, complexities, or side-by-side explanations
- Use \`code blocks\` for code examples, syntax, or commands
- **End every response with a "## 📌 Quick Summary" section** (2-3 key takeaways)

## Content Rules
- Use **ONLY** the provided document context — never use outside knowledge
- If the answer isn't in the context, clearly state: "I cannot find this information in the uploaded material."
- Summarize and paraphrase context — don't copy chunks verbatim
- Keep responses concise, accurate, and placement-focused
- Break complex topics into digestible sections
- Provide examples when possible

## Response Structure
For concept explanations:
1. Start with a brief definition (1-2 sentences)
2. Break down into subsections with headings
3. Use bullet points for key characteristics
4. Provide examples or use cases
5. End with Quick Summary

For interview questions:
1. Use numbered lists for questions
2. Provide hints or expected concepts for each
3. Categorize by difficulty if possible

## Tone
- Professional yet approachable
- Encouraging and supportive
- Technical but clear
- Focused on placement preparation success

---

# Document Context (Retrieved from uploaded material)
${context}
${conversationContext}

---

# User Question
${query}

---

# Your Response
Generate a well-structured, Markdown-formatted response following all guidelines above.`;

    // Step 4: Set SSE headers BEFORE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    console.log('Starting Groq streaming...');

    // Step 5: Call Groq LLM with streaming enabled
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1024,
      stream: true
    });

    // Step 6: Loop through the stream and pipe each token
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      if (token) {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    }

    // Step 7: Send sources as final SSE event and close
    const sources = topChunks.map(chunk => ({
      text: chunk.text.substring(0, 200) + (chunk.text.length > 200 ? '...' : ''),
      score: chunk.score
    }));

    res.write(`data: ${JSON.stringify({ sources, done: true })}\n\n`);
    res.end();

    console.log('RAG streaming pipeline completed successfully');

  } catch (error) {
    console.error('RAG streaming error:', error);
    
    // Send error as SSE event
    res.write(`data: ${JSON.stringify({ error: error.message, done: true })}\n\n`);
    res.end();
  }
}

module.exports = {
  generateAnswer,
  streamAnswer
};
