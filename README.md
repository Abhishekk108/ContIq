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
                    ▼
       Qdrant Cloud Vector Store
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
- Ask a question → the query is embedded, top-matching chunks are retrieved via cosine similarity, and the LLM generates a grounded answer with cited sources.
- Multi-user platform — documents and query results are isolated per account.

Core goals: accuracy (grounded answers), transparency (source attribution), and fast interactive retrieval.

---

## Features

- PDF ingestion and semantic indexing
- Local embedding generation (no external embedding API dependency)
- Vector search using Qdrant Cloud
- Source-grounded answer generation
- Retrieval-Augmented Generation pipeline to prevent hallucinations
- Multi-user document isolation
- JWT authentication with bcrypt password hashing

---

## Tech Stack

- Frontend: React 18, React Router, Axios
- Backend: Node.js, Express, Multer
- PDF parsing: `pdf-parse`
- Embeddings: `@xenova/transformers` (local) — Xenova/all-MiniLM-L6-v2 model (384-dimensional vectors)
- LLM: Groq (via `groq-sdk`) — using llama-3.3-70b-versatile
- Vector store: Qdrant Cloud (production-ready vector database)
- Database: MongoDB Atlas with Mongoose (users and document metadata)
- Authentication: JWT (`jsonwebtoken`) and `bcryptjs`

---

## System Architecture

**Application Architecture**

```
React Frontend
       │
       ▼
Express Backend
       │
       ├────────► MongoDB Atlas
       │            Users
       │            Document Metadata
       │
       ├────────► Qdrant Cloud
       │            Vector Embeddings
       │
       └────────► Groq LLM
                    Answer Generation
```

**RAG Data Flow**

```
Ingestion:  PDF → Text Extraction → Chunking → Embedding → Qdrant

Retrieval:  Question → Query Embedding → Cosine Similarity Search
            → Top-K Chunks → Prompt Construction → Groq LLM → Answer
```

Together these two views show how requests move through the system (application layer) and how documents flow through the retrieval pipeline (RAG layer).

---

## Project Structure

See the main folders:

- `frontend/` — React app with `UploadPage.jsx` and `ChatPage.jsx`
- `backend/` — Express API, organized as:
  - `routes/` — `auth.js`, `upload.js`, `query.js`
  - `controllers/` — request handlers for auth, upload, and query logic
  - `models/` — Mongoose schemas (User, Document metadata)
  - `middleware/` — JWT authentication middleware
  - `config/` — database and environment configuration
  - `services/` — `pdfService.js`, `chunkService.js`, `embeddingService.js`, `vectorService.js`, `ragService.js` (the core RAG pipeline)
- Vector storage — Qdrant Cloud cluster with `contiq_vectors` collection
- Metadata storage — MongoDB Atlas stores user accounts and document metadata

Refer to `backend/services` for the RAG pipeline implementation and `frontend/src/pages` for UI flows.

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

# create uploads folder
mkdir -p uploads

# start the dev server
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

- `QDRANT_URL` — Qdrant Cloud cluster URL (required)
- `QDRANT_API_KEY` — Qdrant Cloud API key (required)
- `QDRANT_COLLECTION` — Collection name in Qdrant (default: `contiq_vectors`)
- `GROQ_API_KEY` — required for LLM generation (Groq API)
- `HUGGINGFACE_API_KEY` — for local embedding model downloads (optional)
- `MONGO_URI` — MongoDB Atlas connection string (required)
- `JWT_SECRET` — secret key used to sign JWTs (required)
- `JWT_EXPIRES` — JWT expiration duration (e.g., `1d`)

Copy `.env.example` to `.env` and add required keys.

---

## API Reference

POST /upload 🔒 *(authenticated)*

- Description: Upload a PDF for ingestion and indexing.
- Request: `multipart/form-data` with a `file` field (PDF) and `Authorization: Bearer <token>` header
- Response: `{ message: "PDF processed successfully", chunks: <number> }`

POST /query 🔒 *(authenticated)*

- Description: Submit a question to retrieve context and generate a grounded answer.
- Request: `{ "question": "Your question here" }` with `Authorization: Bearer <token>` header
- Response: `{ "answer": "...", "sources": [{ "text": "...", "score": 0.9 }, ...] }`

POST /auth/register

- Description: Register a new user.
- Request: `{ "name": "...", "email": "...", "password": "..." }`
- Response: `{ message: "User registered successfully" }`

POST /auth/login

- Description: Authenticate a user and return a JWT.
- Request: `{ "email": "...", "password": "..." }`
- Response: `{ "token": "...", "user": { "id": "...", "name": "...", "email": "..." } }`

GET /

- Health check and model status endpoint.

---

## How It Works

**Document Ingestion**
A PDF is uploaded and its raw text is extracted using `pdf-parse`, forming the base content for indexing.

**Chunking Strategy**
Extracted text is split into overlapping chunks (default: 800 characters, 100-character overlap) via `chunkService`. Overlap preserves context across chunk boundaries so relevant information isn't cut off mid-thought.

**Embedding Generation**
Each chunk is converted into a 384-dimensional vector using the local Xenova/all-MiniLM-L6-v2 model, run entirely on-device without calling an external embedding API.

**Vector Storage**
Embeddings are upserted into a Qdrant Cloud collection (`contiq_vectors`) via `vectorService`, with automatic collection creation on first use.

**Semantic Retrieval**
A user's question is embedded using the same model, and Qdrant performs a cosine similarity search to find the top-K most relevant chunks.

**Prompt Construction**
Retrieved chunks are assembled into a structured prompt that grounds the LLM's response strictly in the retrieved context, reducing hallucinations.

**Answer Generation**
`ragService` sends the prompt to Groq (llama-3.3-70b-versatile), which returns a natural-language answer along with the source chunks used, for full transparency.

**Authentication & User Isolation**
Users register and log in via JWT-based authentication (passwords hashed with bcrypt). The upload and query routes are protected by JWT middleware, and each user's documents and retrieved chunks are scoped to their own account in MongoDB.

---

## Key Design Decisions

- **Local embeddings over external APIs** — Running Xenova/all-MiniLM-L6-v2 locally removes per-request embedding costs and external API latency, and keeps the pipeline functional offline once the model is cached.
- **Qdrant Cloud as the vector database** — Chosen for its production-ready managed infrastructure, fast cosine similarity search, and straightforward collection management, avoiding the need to self-host a vector index.
- **MongoDB Atlas for accounts and metadata** — A flexible document store is a natural fit for user records and document metadata (filenames, ownership, timestamps) that don't need relational structure.
- **JWT authentication** — A stateless, industry-standard approach to securing routes and scoping data access per user without maintaining server-side session state.
- **Retrieval-Augmented Generation** — Grounding LLM responses in retrieved chunks (rather than relying on the model's parametric knowledge) keeps answers accurate, source-attributed, and resistant to hallucination.

---

## Technical Highlights

- 384-dimensional embeddings generated entirely on-device
- Cosine similarity retrieval for fast, relevant chunk matching
- Modular RAG pipeline with clearly separated services (chunking, embedding, vector storage, generation)
- Source-backed responses for full answer transparency
- Production-ready vector storage via Qdrant Cloud
- Local embedding generation with no external embedding API dependency
- User-level document isolation for secure multi-tenant usage

---

## Production Recommendations

- Consider GPU-backed embedding for faster processing at scale (currently using local CPU model)
- Refresh token implementation for longer-lived, more secure sessions
- AWS S3 or other cloud storage for uploaded PDFs
- Chat history persistence
- Rate limiting and request size limits on the backend
- Role-based access control (e.g., admin vs. standard user)
- Automatic cleanup of deleted document vectors from Qdrant

---

## Future Improvements

- Hybrid Search (BM25 + Vector Search)
- Cross-Encoder Re-ranking
- Streaming LLM responses
- OCR support for scanned PDFs
- Multi-document conversations
- Chat history persistence
- AWS S3 integration
- Conversation memory

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