# Portfolio AI Assistant

An AI-powered chatbot that allows users to query a software engineer's project portfolio using natural language. Built with a RAG (Retrieval Augmented Generation) pipeline, containerized with Docker, orchestrated with Kubernetes, and deployed via a CI/CD pipeline using GitHub Actions.

---

## Architecture

The system consists of three services:

- **Frontend** – React/Vite chat interface where users interact with the AI assistant
- **Backend** – FastAPI service that processes queries using a RAG pipeline (LangChain + ChromaDB + OpenAI)
- **Database** – MongoDB stores project data and chunks; ChromaDB runs alongside the backend for vector-based semantic search

### Data Flow

```
User asks question
    → Frontend sends request to Backend
    → Backend queries ChromaDB for relevant chunks
    → Backend sends chunks + question to OpenAI
    → Answer returned to user

User adds a project
    → Backend saves project to MongoDB
    → OpenAI generates structured chunks (Purpose, Architecture, Tech Stack, etc.)
    → Chunks are embedded and stored in ChromaDB
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | FastAPI, Python 3.11, LangChain, ChromaDB, OpenAI API |
| Database | MongoDB, ChromaDB |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions, DockerHub |
| Orchestration | Kubernetes (Minikube) |

---

## Project Structure

```
project-chatbot-ci-cd/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app & CORS
│   │   ├── api.py             # API endpoints
│   │   ├── schemas.py         # Pydantic models
│   │   ├── vector_store.py    # ChromaDB integration
│   │   ├── llm.py             # OpenAI LangChain integration
│   │   └── project_service.py # MongoDB + chunk generation logic
│   ├── data/
│   │   └── chroma_db/         # Vector database
│   ├── scripts/
│   │   ├── ingest.py          # Data ingestion script
│   │   └── query.py           # Test query script
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom React hooks
│   │   └── lib/               # API client
│   ├── Dockerfile
│   └── package.json
├── kubernetes/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── mongo-statefulset.yaml
│   ├── mongo-service.yaml
│   └── ingress.yaml
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions pipeline
├── docker-compose.yml
├── .env.example
└── .gitignore
```

---

## Getting Started

### Prerequisites

- Docker Desktop
- Node.js 18+
- Python 3.11+
- OpenAI API key

### Running with Docker Compose

1. Clone the repository:
```bash
git clone https://github.com/rizovamagdalena/project-chatbot-ci-cd.git
cd project-chatbot-ci-cd
```

2. Create a `.env` file in the root:
```env
OPENAI_API_KEY=your-api-key-here
```

3. Start all services:
```bash
docker compose up --build
```

4. Access the app:
   - Frontend: http://localhost:8080
   - Backend API docs: http://localhost:8000/docs

---

### Running Locally (without Docker)

**Backend:**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check and DB status |
| POST | `/api/query` | Query projects with natural language |
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Add a new project |
| PUT | `/api/projects/{id}` | Update a project |
| DELETE | `/api/projects/{id}` | Delete a project |

### Example Query Request
```json
POST /api/query
{
  "query": "Which projects use AI?",
  "top_k": 3
}
```

---

## CI/CD Pipeline

The GitHub Actions pipeline (`.github/workflows/ci-cd.yml`) triggers on every push to `main` and:

1. Builds the backend Docker image
2. Builds the frontend Docker image
3. Pushes both images to DockerHub

DockerHub images:
- `rizovamagdalena/portfolio-backend:latest`
- `rizovamagdalena/portfolio-frontend:latest`

---

## Kubernetes Deployment

All manifests are in the `kubernetes/` folder and deploy to the `portfolio` namespace.

### Resources

| Manifest | Description |
|---|---|
| `namespace.yaml` | Creates the `portfolio` namespace |
| `configmap.yaml` | Non-sensitive config (MongoDB URI, DB name, model settings) |
| `secret.yaml` | Sensitive config (OpenAI API key) |
| `backend-deployment.yaml` | Backend Deployment with ConfigMap and Secret references |
| `backend-service.yaml` | ClusterIP Service for the backend |
| `frontend-deployment.yaml` | Frontend Deployment |
| `frontend-service.yaml` | ClusterIP Service for the frontend |
| `mongo-statefulset.yaml` | MongoDB StatefulSet with persistent storage (1Gi PVC) |
| `mongo-service.yaml` | Headless Service for MongoDB |
| `ingress.yaml` | Nginx Ingress routing `/` to frontend and `/api` to backend |

### Deploy to Minikube

```bash
minikube start --driver=docker
minikube addons enable ingress
kubectl apply -f kubernetes/
kubectl get all -n portfolio
```

Access via:
```bash
minikube service portfolio-frontend -n portfolio --url
```
