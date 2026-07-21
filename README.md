# ContIq — Context + IQ

ContIQ is a full-stack **Retrieval-Augmented Generation (RAG)** application that turns static PDFs into an interactive, source-grounded knowledge base. It extracts text from uploaded documents, generates local embeddings, stores them as vectors in Qdrant, retrieves the most relevant chunks for a given question using semantic search, and generates grounded responses using the Groq LLM — minimizing hallucinations by ensuring every answer is backed by retrieved context.

---

## RAG Pipeline

```
               PDF Upload
                    │
                    ▼
             Text Extraction
               (pdf-parse)
                    │
                    ▼
            Chunk Generation
         (800 chars, 100 overlap)
                    │
                    ▼
         Xenova/all-MiniLM-L6-v2
         Local Embedding Model
                    │
                    ▼
          384-D Vector Embeddings
                    │
    ────────────────────────────────────
            User Question
                   │
                   ▼
            Generate Query Embedding
                   │
                   ▼
            Cosine Similarity Search
                   │
                   ▼
            Top-K Relevant Chunks
                   │
                   ▼
            Prompt Construction
                   │
                   ▼
            Groq Llama-3.3-70B
                   │
                   ▼
            Grounded Answer + Sources
```

---

## Quick Overview

- Upload a PDF → text is extracted, chunked, embedded, and stored as vectors.
- Ask a question → the query is embedded, top-matching chunks are retrieved via cosine similarity, and the LLM streams back a grounded answer with cited sources.
- Multi-user platform — documents, chats, and query results are isolated per account.
- Follow-up questions are understood in the context of the ongoing conversation.

Core goals: accuracy (grounded answers), transparency (source attribution), and fast interactive retrieval.

---

## Features

- PDF ingestion and semantic indexing
- Local embedding generation (no external embedding API dependency)
- Vector search using Qdrant Cloud
- JWT authentication with bcrypt password hashing, and multi-user document isolation
- Token-by-token streaming responses (SSE)
- Multi-turn conversation support (last 10 messages used as context)
- Low-confidence retrieval rejection via a similarity threshold
- Adaptive retrieval depth: Top-15 chunks for document summaries, Top-5 for targeted questions
- Source-grounded responses with per-source similarity scores

---

## Tech Stack

- Frontend: React 18, React Router, Axios
- Backend: Node.js, Express, Multer
- PDF parsing: `pdf-parse`
- Embeddings: `@xenova/transformers` (local) — Xenova/all-MiniLM-L6-v2 model (384-dimensional vectors)
- LLM: Groq (via `groq-sdk`) — llama-3.3-70b-versatile, with streaming via Server-Sent Events
- Vector store: Qdrant Cloud (production-ready vector database)
- Database: MongoDB Atlas with Mongoose (users, chats, messages, document metadata)
- Authentication: JWT (`jsonwebtoken`) and `bcryptjs`

---

## System Architecture

```
React Frontend
       │
       ▼
Express Backend
       │
       ├────────► MongoDB Atlas (Users, Chats, Document Metadata)
       ├────────► Qdrant Cloud (Vector Embeddings)
       └────────► Groq LLM (Streaming Answer Generation)
```

**Updated RAG Flow** — retrieval now runs through a grounding check and history injection before the LLM call, and the response streams back token-by-token:

```
Query → Embedding → Qdrant Search → Similarity Threshold Check
      → Prompt + Conversation History → Groq LLM (Streaming) → Answer + Sources
```

---

## Project Structure

- `frontend/` — React app with `UploadPage.jsx` and `ChatPage.jsx`
- `backend/` — Express API:
  - `routes/` — `auth.js`, `upload.js`, `query.js`
  - `controllers/` — request handlers for auth, upload, and query logic
  - `models/` — Mongoose schemas (User, Chat, Message, Document metadata)
  - `middleware/` — JWT authentication middleware
  - `config/` — database and environment configuration
  - `services/` — `pdfService.js`, `chunkService.js`, `embeddingService.js`, `vectorService.js`, `ragService.js` (grounding, streaming, and history logic live here)
- Vector storage — Qdrant Cloud cluster, `contiq_vectors` collection
- Metadata storage — MongoDB Atlas stores user accounts, chats, and document metadata

---

## Getting Started (Local Development)

Prerequisites

- Node.js v18+
- A MongoDB Atlas connection string
- (Optional) A Groq API key for LLM generation

Backend

```bash
cd backend
npm install

# copy and edit environment variables
cp .env.example .env
# set MONGO_URI, JWT_SECRET, GROQ_API_KEY, etc.

mkdir -p uploads
npm run dev
```

Notes: On first run, the local embedding model (Xenova) may download and cache model files.

Frontend

```bash
cd frontend
npm install
npm start
```

Open the frontend at `http://localhost:3000`. The backend defaults to `http://localhost:5000`.

---

## Environment Variables

- `QDRANT_URL`, `QDRANT_API_KEY` — Qdrant Cloud cluster URL and key (required)
- `QDRANT_COLLECTION` — collection name in Qdrant (default: `contiq_vectors`)
- `GROQ_API_KEY` — required for LLM generation
- `HUGGINGFACE_API_KEY` — for local embedding model downloads (optional)
- `MONGO_URI` — MongoDB Atlas connection string (required)
- `JWT_SECRET`, `JWT_EXPIRES` — JWT signing secret and expiry (e.g. `1d`)

Copy `.env.example` to `.env` and add required keys.

---

## API Reference

POST /upload 🔒 *(authenticated)*
Upload a PDF for ingestion and indexing.
Request: `multipart/form-data` with a `file` field + `Authorization: Bearer <token>`
Response: `{ message: "PDF processed successfully", chunks: <number> }`

POST /query 🔒 *(authenticated)*
Submit a question and get a grounded answer.
Request: `{ "question": "...", "conversationHistory": [...], "chatId": "..." }`
Response: `{ "answer": "...", "sources": [{ "text": "...", "score": 0.9 }, ...] }`

POST /query/stream 🔒 *(authenticated)*
Same as `/query`, but streams the answer token-by-token over SSE.
Request: same body as `/query`
Response: `text/event-stream` — `data: { "token": "..." }` events, then a final `data: { "sources": [...], "done": true }` event

POST /auth/register
Register a new user.
Request: `{ "name": "...", "email": "...", "password": "..." }`

POST /auth/login
Authenticate and return a JWT.
Request: `{ "email": "...", "password": "..." }`
Response: `{ "token": "...", "user": { "id": "...", "name": "...", "email": "..." } }`

GET /
Health check and model status endpoint.

---

## How It Works

**Ingestion** — A PDF is uploaded, text extracted via `pdf-parse`, then split into overlapping chunks (800 chars, 100-char overlap) by `chunkService` so context isn't lost at chunk boundaries. Each chunk is embedded locally into a 384-dimensional vector (Xenova/all-MiniLM-L6-v2, no external API call) and upserted into a Qdrant Cloud collection via `vectorService`, which auto-creates the collection on first use.

**Retrieval** — The user's question is embedded with the same model, and Qdrant performs a cosine similarity search. Most questions retrieve the top 5 chunks; document-wide summary or overview queries (e.g. "summarize this document") retrieve the top 15 instead, since a broad question needs more surrounding context than a narrowly-targeted one.

**Grounding & Hallucination Prevention** — Before calling the LLM, the top retrieval score is checked against a cosine similarity threshold (0.45). If the best match falls below it, ContIQ skips the LLM call and returns a fixed "not found in the document" response rather than letting the model guess. Summary queries are exempt, since they score lower by nature without being irrelevant.

**Conversation History** — The last 10 messages for the active chat are pulled from MongoDB and included alongside the current question, so the LLM can resolve follow-ups like "explain that more simply" using the prior exchange.

**Generation** — Retrieved chunks and history are assembled into a prompt that strictly grounds the model in retrieved context. `ragService` sends this to Groq (llama-3.3-70b-versatile) and streams the response back token-by-token over SSE, so the answer appears incrementally. Each response includes the source chunks used, with similarity scores, for transparency.

**Auth & Isolation** — Users register/log in via JWT (bcrypt-hashed passwords). Upload and query routes are protected by JWT middleware, and each user's documents, chats, and retrieved chunks are scoped to their own account.

---

## Key Design Decisions

- **Local embeddings over external APIs** — removes per-request cost and latency, and keeps the pipeline usable offline once the model is cached.
- **Qdrant Cloud as the vector store** — managed infrastructure, fast cosine search, no self-hosted index to maintain.
- **MongoDB Atlas for accounts, chats, and metadata** — a flexible document store fits user records and document metadata that don't need relational structure.
- **JWT authentication** — stateless, scoped data access per user without server-side sessions.
- **Similarity threshold rejection** — refusing to answer below a 0.45 score prevents the LLM from fabricating answers to questions the document doesn't actually cover.
- **Streaming over blocking responses** — SSE gives immediate feedback on longer answers instead of one long wait.

---

## Production Recommendations

- GPU-backed embedding for faster processing at scale (currently local CPU)
- Refresh tokens for longer-lived, more secure sessions
- AWS S3 (or similar) for uploaded PDFs instead of local disk
- Rate limiting and request size limits on the backend
- Role-based access control (admin vs. standard user)
- Automatic cleanup of deleted document vectors from Qdrant

---

## Future Improvements

- Hybrid search (BM25 + vector search)
- Cross-encoder re-ranking
- OCR support for scanned PDFs
- Multi-document conversations

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit and push
4. Open a Pull Request

Please include tests or a short demo for non-trivial changes.

---

## License

MIT