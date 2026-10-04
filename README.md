# ContIQ

ContIQ is a full-stack Retrieval-Augmented Generation (RAG) application for turning uploaded PDFs into a searchable, source-grounded knowledge assistant. The current version includes a secure user auth flow, MongoDB-backed metadata storage, protected API routes, and a React front end for uploading documents and chatting with the system.


---

## Product overview

Users can:

- sign up and sign in with their own account
- upload PDF files for indexing
- ask questions about the uploaded content
- receive grounded answers using retrieved document chunks
- continue conversations with chat context
- keep their own documents and chats isolated behind authenticated access

The application combines local embedding generation, vector similarity search, and an LLM for answer generation while keeping the response anchored to the retrieved content.

---

## Core features

- PDF upload and document ingestion
- Local embedding generation using Xenova/All-MiniLM-L6-v2
- Vector search via Qdrant Cloud
- MongoDB storage for users, chats, and metadata
- JWT-based authentication with `bcryptjs` password hashing
- Protected API routes and private frontend pages
- Streaming answer generation from Groq
- Multi-turn conversation context
- Source-based retrieval and grounded responses

---

## Architecture

```text
React Frontend
   │
   ▼
Express API
   │
   ├── MongoDB Atlas / Mongoose
   │   └── users, chats, document metadata
   │
   ├── Qdrant Cloud
   │   └── vector embeddings / similarity search
   │
   └── Groq LLM
       └── grounded answer generation
```

The app flow is:

```text
PDF upload
  → text extraction
  → chunking
  → embedding
  → vector storage
  → question embedding
  → retrieval
  → grounded prompt + history
  → streamed LLM response
```

---

## Tech stack

- Frontend: React, React Router, Axios
- Backend: Node.js, Express
- Auth: JWT + `bcryptjs`
- Database: MongoDB + Mongoose
- PDF parsing: `pdf-parse`
- Embeddings: `@xenova/transformers`
- Vector store: Qdrant
- LLM: Groq SDK
- File uploads: `multer`

---

## Repository structure

```text
contiq/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── build/
├── README.md
├── MONGODB_INTEGRATION.md
├── package.json
└── LICENSE
```

---

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection string
- Qdrant URL and API key
- Groq API key
- Optional: Hugging Face token for model downloads if needed

---

## Environment setup

Create environment variables for the backend before starting the app.

### Backend example

```bash
cd backend
cp .env.example .env
```

Sample configuration:

```env
PORT=5555
GROQ_API_KEY=your_groq_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
QDRANT_URL=https://your-cluster-url.qdrant.io
QDRANT_API_KEY=your_api_key_here
QDRANT_COLLECTION=contiq_vectors
MONGO_URI=mongodb://localhost:27017/contiq
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES=7d
```

Notes:

- The app defaults to port `5555` in the backend server.
- `JWT_SECRET` is required for protected routes.
- `MONGO_URI` is required for MongoDB-backed auth and metadata features.

---

## Running the app

### 1) Start the backend

```bash
cd backend
npm install
npm run dev
```

The backend will:

- connect to MongoDB
- initialize the local embedding model
- start the API on `http://localhost:5555`

### 2) Start the frontend

```bash
cd frontend
npm install
npm start
```

The frontend should open in the browser on the React dev server, typically at:

```text
http://localhost:3000
```

---

## Authentication and routes

The backend exposes the following key routes:

### Public auth routes

```http
POST /auth/register
POST /auth/login
```

Register a new user or log in with email/password. Successful login returns a JWT token.

### Protected routes

```http
POST /upload
POST /query
POST /query/stream
GET /user
GET /chat
```

These routes require a valid JWT in the Authorization header:

```http
Authorization: Bearer <token>
```

The frontend uses a guarded route system so unauthenticated users are redirected to the login page.

---

## API flow

### Registration

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "StrongPass123"
}
```

### Login

```json
{
  "email": "jane@example.com",
  "password": "StrongPass123"
}
```

Successful login returns a token and user object.

### Upload

Upload a PDF file as `multipart/form-data` with the authenticated session token.

### Query

```json
{
  "question": "Summarize this document",
  "chatId": "optional-chat-id",
  "conversationHistory": []
}
```

The backend retrieves relevant chunks, checks similarity, builds a grounded prompt, and returns an answer with source context.

---

## How the RAG pipeline works

1. A PDF is uploaded.
2. The backend extracts text from the document.
3. The content is split into manageable chunks.
4. Chunks are embedded with a local transformer model.
5. The embeddings are stored in Qdrant.
6. A user question is embedded and matched against stored vectors.
7. Relevant chunks are retrieved and used to ground the prompt.
8. The LLM generates a response based on the retrieved context.
9. The answer is returned with source-backed references.

---

## Notes and troubleshooting

- If MongoDB fails to connect, verify `MONGO_URI` and that the database service is running.
- If authentication fails, confirm that the JWT secret is set and the token is being sent on protected requests.
- If Qdrant calls fail, confirm the cluster URL and API key are valid.
- The first app run may download the embedding model locally, which can take a few minutes depending on environment and internet access.

---

## Related docs

- [MONGODB_INTEGRATION.md](MONGODB_INTEGRATION.md)
- [backend/AUTH_MIDDLEWARE.md](backend/AUTH_MIDDLEWARE.md)
- [backend/AUTH_ROUTES_SETUP.md](backend/AUTH_ROUTES_SETUP.md)
- [backend/REGISTER_IMPLEMENTATION.md](backend/REGISTER_IMPLEMENTATION.md)
- [backend/LOGIN_IMPLEMENTATION.md](backend/LOGIN_IMPLEMENTATION.md)

---

## License

This project is provided under the repository license included in the root of this workspace.

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
