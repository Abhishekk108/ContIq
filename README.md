# ContIq — Context + IQ

An AI-powered Retrieval-Augmented Generation (RAG) system for document-grounded Q&A. Upload study PDFs, index the content, and ask focused questions — Contiq retrieves the most relevant passages and produces source-backed answers using an LLM.

---

## Quick Overview

- Upload a PDF → text is extracted, chunked, embedded, and stored as vectors.
- Ask a question → the query is embedded, top-matching chunks are retrieved via cosine similarity, and the LLM generates a grounded answer with cited sources.

Core goals: accuracy (grounded answers), transparency (source attribution), and fast interactive responses.

---

## Features

- Document ingestion and semantic indexing (PDF → embeddings)
- Local embedding support via `@xenova/transformers` (optional remote providers supported)
- Cosine-similarity retrieval over stored chunks
- RAG prompt engineering to prevent hallucinations
- Simple React frontend: upload UI + chat interface with source panel

---

## Tech Stack

- Frontend: React 18, React Router, Axios
- Backend: Node.js, Express, Multer
- PDF parsing: `pdf-parse`
- Embeddings: `@xenova/transformers` (local) — Xenova/all-MiniLM-L6-v2 model (384-dimensional vectors)
- LLM: Groq (via `groq-sdk`) — using llama-3.3-70b-versatile
- Vector store: Qdrant Cloud (production-ready vector database)

---

## Project Structure

See the main folders:

- `frontend/` — React app with `UploadPage.jsx` and `ChatPage.jsx`
- `backend/` — Express API, routes (`upload.js`, `query.js`) and services (`pdfService.js`, `chunkService.js`, `embeddingService.js`, `vectorService.js`, `ragService.js`)
- Vector storage — Qdrant Cloud cluster with `contiq_vectors` collection

Refer to `backend/` for pipeline details and `frontend/src/pages` for UI flows.

---

## Getting Started (Local Development)

Prerequisites

- Node.js v18+
- (Optional) A Groq API key for LLM generation

Backend

```bash
cd backend
npm install

# copy and edit environment variables
cp .env.example .env
# set GROQ_API_KEY (if using Groq)

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

- `GROQ_API_KEY` — required for LLM generation (Groq API)
- `QDRANT_URL` — Qdrant Cloud cluster URL (required)
- `QDRANT_API_KEY` — Qdrant Cloud API key (required)
- `QDRANT_COLLECTION` — Collection name in Qdrant (default: `contiq_vectors`)
- `HUGGINGFACE_API_KEY` — for local embedding model downloads (optional)

Copy `.env.example` to `.env` and add required keys.

---

## API Reference

POST /upload

- Description: Upload a PDF for ingestion and indexing.
- Request: `multipart/form-data` with a `file` field (PDF)
- Response: `{ message: "PDF processed successfully", chunks: <number> }`

POST /query

- Description: Submit a user question to retrieve context and generate an answer.
- Request: `{ "question": "Your question here" }`
- Response: `{ "answer": "...", "sources": [{ "text": "...", "score": 0.9 }, ...] }`

GET /

- Health check and model status endpoint.

---

## How It Works (Short)

1. Upload: PDF → `pdfService` extracts text.
2. Chunk: `chunkService` splits into overlapping chunks (default: 800 chars, 100 overlap).
3. Embed: `embeddingService` converts chunks → 384-dimensional vectors using Xenova/all-MiniLM-L6-v2.
4. Store: `vectorService` upserts vectors to Qdrant Cloud collection with automatic collection creation.
5. Query: Query is embedded, Qdrant performs cosine similarity search, top-K chunks form the LLM prompt.
6. Generate: `ragService` sends the prompt to Groq (llama-3.3-70b-versatile) and returns `answer` + `sources`.

---

## Production Recommendations

-  Vector store: Already using Qdrant Cloud (production-ready, scalable)
- Consider GPU-backed embedding for faster processing at scale (currently using local CPU model)
- Add authentication, rate-limiting, and request size limits to the backend
- Move uploaded files to durable storage (S3) and stream processing for large PDFs
- Implement document metadata tracking (filename, upload date, user ID)

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
